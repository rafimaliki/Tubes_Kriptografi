import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import type { User } from "./auth.store";
import { UserAPI } from "@/api/user.api";
import { ChatAPI } from "@/api/chat.api";
import {
  hashMessage,
  signMessage,
  verifySignature,
  encryptMessage,
  decryptMessage
} from "@/lib/EllipticCurve";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface ClientToServerEvents {
  new_message: (
    payload: Omit<Message, "id" | "created_at">,
    callback: (response: { chat: Message }) => void
  ) => void;
  create_chat_room: (
    payload: {
      user1_id: number;
      user2_id: number;
    },
    callback: (response: { room_id: number }) => void
  ) => void;
}

export interface ServerToClientEvents {
  connected: (payload: { socketId: string }) => void;
  new_message: (payload: { chat: Message }) => void;
}

export interface Message {
  id: number;
  from_user_id: number;
  to_user_id: number;
  room_id: number;
  message: string;
  created_at: string; // timestamp
  // signature: string;
}

export interface Chat {
  room_id: number;
  participants: User[];
  messages: Message[];
  last_message?: Message;
  loaded?: boolean;
}

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type State = {
  // socket instance
  socket: ClientSocket | null;
  connected: boolean;
  socketId?: string;
  connect: (currentUser: User) => void;
  disconnect: () => void;

  // socket event dari client
  sendMessage: (room_id: number, message: string) => void;
  createChatRoom: (user1: User, user2: User) => Promise<Chat>;

  // data chat
  currentUser: User | null;
  chats: Chat[];
  getChats: () => Promise<Chat[]>;
  getOrCreateChatWith: (otherUsername: string) => Promise<Chat>;
  loadChat: (room_id: number) => Promise<void>;
};

export const useChatStore = create<State>((set, get) => ({
  socket: null,
  connected: false,
  socketId: undefined,
  currentUser: null,

  connect: (currentUser: User) => {
    const state = get();
    if (state.socket) {
      if (!state.connected) state.socket.connect();
      return;
    }

    set(() => ({ currentUser }));

    const socket: ClientSocket = io(SOCKET_URL, {
      autoConnect: false,
      auth: {
        token: currentUser.jwt_token || "",
      },
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
      withCredentials: true,
      forceNew: true,
    }) as ClientSocket;

    // load recent chats
    get().getChats();

    // setup koneksi
    socket.on("connect", () => {
      console.log("[socket] Connected to server");
      set(() => ({ connected: true, socketId: socket.id }));
    });

    socket.on("disconnect", (reason) => {
      console.log("[socket] Disconnected:", reason);
      set(() => ({ connected: false, socketId: undefined }));
    });

    socket.on("connect_error", (error) => {
      console.error("[socket] Connection error:", error);
      set(() => ({ connected: false, socketId: undefined }));
    });

    socket.on("connected", (payload) => {
      set(() => ({ socketId: payload.socketId }));
    });

    // event handler dari server
    socket.on("new_message", (payload) => {
      console.log("new_message dari server:", payload);
      const newMessage: Message = payload.chat as Message;

      // create decryption here

      set((state) => {
        let updatedChat: Chat | null = null;

        const remainingChats = state.chats.filter((c) => {
          if (c.room_id === newMessage.room_id) {
            updatedChat = {
              ...c,
              messages: [...c.messages, newMessage],
              last_message: newMessage,
            };
            return false;
          }
          return true;
        });

        return {
          chats: updatedChat ? [updatedChat, ...remainingChats] : state.chats,
        };
      });
    });

    set(() => ({ socket }));
    socket.connect();
  },

  disconnect: () => {
    const s = get();
    if (s.socket) {
      s.socket.disconnect();
      set(() => ({ socket: null, connected: false, socketId: undefined }));
    }
  },

  sendMessage: async (room_id: number, message: string) => {
    // cek koneksi ke socket
    const s = get();
    if (!s.socket || !s.connected) {
      console.error("Socket not connected. Cannot send message.");
      return;
    }

    // cek sender dan receiver
    const from_user_id = s.currentUser?.id;
    const to_user_id = get()
      .chats.find((chat) => chat.room_id === room_id)
      ?.participants.find((p) => p.id !== from_user_id)?.id;

    if (!from_user_id || !to_user_id) {
      console.error("Cannot send message: invalid user IDs");
      return;
    }

    // dapatkan data receiver
    const receiver = await UserAPI.getById(to_user_id);
    if (!receiver.ok) {
      console.error("Cannot send message: receiver not found");
      return;
    }

    // lakukan enkripsi pesan
    console.log("Public key:", receiver.data.public_key);
    const ciphertext = encryptMessage(receiver.data.public_key, message);

    const chat = {
      room_id,
      from_user_id,
      to_user_id,
      message: ciphertext      
    };

    s.socket.emit("new_message", chat, (response) => {
      console.log("Response dari server untuk new_message:", response);

      const newMessage: Message = response.chat as Message;

      set((state) => {
        let updatedChat: Chat | null = null;

        const remainingChats = state.chats.filter((c) => {
          if (c.room_id === room_id) {
            updatedChat = {
              ...c,
              messages: [...c.messages, newMessage],
              last_message: newMessage,
            };
            return false;
          }
          return true;
        });

        return {
          chats: updatedChat ? [updatedChat, ...remainingChats] : state.chats,
        };
      });
    });
  },

  createChatRoom: (user1: User, user2: User) => {
    const s = get();
    if (!s.socket || !s.connected) {
      console.error("Socket not connected. Cannot request room ID.");
      return Promise.reject(new Error("Socket not connected"));
    }

    return new Promise<Chat>((resolve, reject) => {
      s.socket!.emit(
        "create_chat_room",
        { user1_id: user1.id, user2_id: user2.id },
        (result: { room_id: number } | { error: string }) => {
          if ("error" in result) {
            console.error("Failed to create chat:", result.error);
            reject(new Error(result.error));
            return;
          }

          const newChat: Chat = {
            room_id: result.room_id,
            participants: [user1, user2],
            messages: [],
          };

          set((state) => ({
            chats: [...state.chats, newChat],
          }));

          resolve(newChat);
        }
      );
    });
  },

  chats: [],

  getChats: async () => {
    const res = await ChatAPI.getRecents();
    if (res.ok) {
      const normalizedChats = res.data.map((chat) => {
        return {
          room_id: chat.room_id,
          participants: chat.participants,
          messages: [chat.last_message],
          last_message: chat.last_message,
          loaded: false,
        };
      });

      console.log("recent_chat_list:", normalizedChats);

      set(() => ({ chats: normalizedChats }));
    } else {
      console.error("Failed to fetch chats:", res.error);
    }
    return get().chats;
  },

  getOrCreateChatWith: async (otherUsername: string) => {
    const currentUser = get().currentUser;

    if (!currentUser) {
      throw new Error("No current user logged in");
    }

    let chat = get().chats.find(
      (chat) =>
        chat.participants.some((p) => p.username === currentUser?.username) &&
        chat.participants.some((p) => p.username === otherUsername)
    );
    if (!chat) {
      const otherUser = await UserAPI.get(otherUsername);
      if (!otherUser.ok) {
        throw new Error("User not found");
      }

      const newChat = await get().createChatRoom(currentUser, otherUser.data);
      chat = newChat;
    }
    return chat;
  },

  loadChat: async (room_id: number) => {
    const state = get();
    const chat = state.chats.find((c) => c.room_id === room_id);

    if (chat?.loaded) {
      return;
    }

    const user_1 = chat?.participants[0].id;
    const user_2 = chat?.participants[1].id;

    if (!user_1 || !user_2) {
      console.error("Cannot load chat messages: participants not found");
      return;
    }

    const res = await ChatAPI.getMessagess(user_1, user_2);
    if (res.ok) {
      set((state) => ({
        chats: state.chats.map((c) => {
          if (c.room_id === room_id) {
            return {
              ...c,
              messages: res.data,
              loaded: true,
            };
          }
          return c;
        }),
      }));
    } else {
      console.error("Failed to load chat messages:", res.error);
    }
  },
}));
