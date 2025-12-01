import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import type { User } from "./auth.store";
import { UserAPI } from "@/api/user.api";
import { ChatAPI } from "@/api/chat.api";
import { SessionStorage } from "@/lib/SessionStorage";
import { LocalStorage } from "@/lib/LocalStorage";
import {
  hashMessage,
  signMessage,
  verifySignature,
  encryptMessage,
  decryptMessage,
} from "@/lib/EllipticCurve";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface ClientToServerEvents {
  new_message: (
    payload: Omit<Message, "id" | "isVerified">,
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
  message_for_sender: string;
  created_at: string; // timestamp
  signature: string;
  isVerified: boolean;
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
  lastSentMessage?: string;
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
      // console.log("[socket] Connected to server");
      set(() => ({ connected: true, socketId: socket.id }));
    });

    socket.on("disconnect", (reason) => {
      // console.log("[socket] Disconnected:", reason);
      set(() => ({ connected: false, socketId: undefined }));
    });

    socket.on("connect_error", (error) => {
      // console.error("[socket] Connection error:", error);
      set(() => ({ connected: false, socketId: undefined }));
    });

    socket.on("connected", (payload) => {
      set(() => ({ socketId: payload.socketId }));
    });

    // event handler dari server
    socket.on("new_message", async (payload) => {
      // console.log("new_message dari server:", payload);
      const newMessage: Message = payload.chat as Message;

      // dapatkan private key
      const privateKey = LocalStorage.load("private_key");
      if (!privateKey || typeof privateKey !== "string") {
        console.error("Private key not found in localStorage");
        return;
      }

      const currentUserId = get().currentUser?.id;

      // gunakan message_for_sender jika pesan dikirim oleh user saat ini
      const messageToDecrypt =
        newMessage.from_user_id === currentUserId
          ? newMessage.message_for_sender
          : newMessage.message;

      // decrypt pesan
      const encryptedMessage = messageToDecrypt;
      try {
        const decryptedMessage = decryptMessage(privateKey, messageToDecrypt);
        newMessage.message = decryptedMessage;
      } catch (error) {
        console.error("Failed to decrypt incoming message:", error);
        newMessage.message = messageToDecrypt;
      }

      // hash pesan
      const sender = await UserAPI.getById(newMessage.from_user_id);
      const receiver = await UserAPI.getById(newMessage.to_user_id);
      const senderUsername = sender.ok ? sender.data.username : "";
      const receiverUsername = receiver.ok ? receiver.data.username : "";
      const messageHash = hashMessage(
        newMessage.message,
        newMessage.created_at,
        senderUsername,
        receiverUsername
      );
      // console.log("Incoming Message Hash:", messageHash);
      // console.log("message: ", newMessage.message);
      // console.log("senderUsername: ", senderUsername);
      // console.log("receiverUsername: ", receiverUsername);
      // console.log("timestamp: ", newMessage.created_at);

      // verifikasi signature
      const senderPublicKey = sender.ok ? sender.data.public_key : "";
      const isVerified = verifySignature(
        senderPublicKey,
        messageHash,
        newMessage.signature
      );
      newMessage.isVerified = isVerified;

      // tampilkan ciphertext jika verifikasi gagal
      if (!isVerified) {
        newMessage.message = encryptedMessage;
      }

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

    // hash pesan
    const timestamp = new Date().toISOString();
    const timestampForHash = timestamp.replace(/\.\d{3}Z$/, ".000Z");
    const senderUsername = s.currentUser?.username || "";
    const receiverUsername = receiver.data.username;
    const messageHash = hashMessage(
      message,
      timestampForHash,
      senderUsername,
      receiverUsername
    );

    // sign pesan
    const privateKey = LocalStorage.load("private_key");
    if (!privateKey || typeof privateKey !== "string") {
      console.error("Private key not found in localStorage");
      return;
    }
    const signature = signMessage(privateKey, messageHash);

    // lakukan enkripsi pesan
    // console.log("Public key:", receiver.data.public_key);
    const ciphertext = encryptMessage(receiver.data.public_key, message);

    // lakukan enkripsi pesan menggunakan public key sender (agar sender bisa baca juga)
    const senderPublicKey = LocalStorage.load("public_key");
    if (!senderPublicKey || typeof senderPublicKey !== "string") {
      console.error("Sender public key not found in localStorage");
      return;
    }
    const ciphertextForSender = encryptMessage(senderPublicKey, message);

    const chat = {
      from_user_id,
      to_user_id,
      room_id,
      message: ciphertext,
      message_for_sender: ciphertextForSender,
      created_at: timestamp,
      signature: signature,
    };
    set(() => ({ lastSentMessage: message }));

    // kirim
    s.socket.emit("new_message", chat, async (response) => {
      // console.log("Response dari server untuk new_message:", response);

      const newMessage: Message = response.chat as Message;
      newMessage.message = get().lastSentMessage || "mana"; // gunakan pesan asli yang belum dienkripsi untuk ditampilkan

      // dapatkan sender dan receiver username
      const sender = await UserAPI.getById(newMessage.from_user_id);
      const receiver = await UserAPI.getById(newMessage.to_user_id);
      const senderUsername = sender.ok ? sender.data.username : "";
      const receiverUsername = receiver.ok ? receiver.data.username : "";

      // hash pesan
      const messageHash = hashMessage(
        newMessage.message,
        newMessage.created_at,
        senderUsername,
        receiverUsername
      );

      // verifikasi signature
      const publicKey = s.currentUser?.public_key || "";
      const isVerified = verifySignature(
        publicKey,
        messageHash,
        newMessage.signature
      );
      newMessage.isVerified = isVerified;

      // tampilkan ciphertext jika verifikasi gagal
      if (!isVerified) {
        newMessage.message = newMessage.message;
      }

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
        const message = chat.last_message;
        const private_key = LocalStorage.load("private_key");
        if (private_key && typeof private_key === "string" && message) {
          const currentUserId = get().currentUser?.id;
          const messageToDecrypt =
            message.from_user_id === currentUserId
              ? message.message_for_sender
              : message.message;
          try {
            const decryptedMessage = decryptMessage(
              private_key,
              messageToDecrypt
            );
            message.message = decryptedMessage;
          } catch (error) {
            console.error("Failed to decrypt last message:", error);
            const encryptedMessage = JSON.parse(messageToDecrypt).encrypted;
            message.message = encryptedMessage;
          }
        }
        return {
          room_id: chat.room_id,
          participants: chat.participants,
          messages: [chat.last_message],
          last_message: chat.last_message,
          loaded: false,
        };
      });

      // console.log("recent_chat_list:", normalizedChats);

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
      // dekripsi semua pesan dari server
      const privateKey = LocalStorage.load("private_key");
      if (!privateKey || typeof privateKey !== "string") {
        console.error("Private key not found in localStorage");
        return;
      }

      const currentUserId = get().currentUser?.id;

      // decrypt dan verify setiap pesan
      const processedMessages = await Promise.all(
        res.data.map(async (msg) => {
          // gunakan message_for_sender jika pesan dikirim oleh user saat ini
          const messageToDecrypt =
            msg.from_user_id === currentUserId
              ? msg.message_for_sender
              : msg.message;

          try {
            // decrypt pesan
            const decryptedMessage = decryptMessage(
              privateKey,
              messageToDecrypt
            );
            const encryptedMessage = JSON.parse(messageToDecrypt).encrypted;

            // dapatkan sender dan receiver username
            const sender = await UserAPI.getById(msg.from_user_id);
            const receiver = await UserAPI.getById(msg.to_user_id);
            const senderUsername = sender.ok ? sender.data.username : "";
            const receiverUsername = receiver.ok ? receiver.data.username : "";

            // hash pesan
            const messageHash = hashMessage(
              decryptedMessage,
              msg.created_at,
              senderUsername,
              receiverUsername
            );

            // verifikasi signature
            const senderPublicKey = sender.ok ? sender.data.public_key : "";
            const isVerified = verifySignature(
              senderPublicKey,
              messageHash,
              msg.signature
            );

            // tampilkan ciphertext jika verifikasi gagal
            const messageShown = isVerified
              ? decryptedMessage
              : encryptedMessage;

            // console.log("isVerified:", isVerified);
            // console.log("Decrypted Message:", decryptedMessage);
            // console.log("message: ", decryptedMessage);
            // console.log("senderUsername: ", senderUsername);
            // console.log("receiverUsername: ", receiverUsername);
            // console.log("timestamp: ", msg.created_at);

            return {
              ...msg,
              message: messageShown,
              isVerified: isVerified,
            };
          } catch (error) {
            console.error("Failed to decrypt message:", error);
            return {
              ...msg,
              message: messageToDecrypt,
            };
          }
        })
      );

      // console.log("Loaded chat messages:", processedMessages);

      // tampilkan
      set((state) => ({
        chats: state.chats.map((c) => {
          if (c.room_id === room_id) {
            return {
              ...c,
              messages: processedMessages,
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
