import { create } from "zustand";

export interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  text: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
}

interface ChatStore {
  chats: Chat[];
  getChatsForUser: (username: string) => Chat[];
  getChatBetweenUsers: (user1: string, user2: string) => Chat | undefined;
  getOrCreateChat: (currentUsername: string, otherUsername: string) => Chat;
  addMessage: (
    chatId: string,
    senderId: string,
    senderUsername: string,
    text: string
  ) => void;
}

const MOCK_CHATS: Chat[] = [
  {
    id: "1",
    participants: ["alice", "bob"],
    messages: [
      {
        id: "1",
        senderId: "1",
        senderUsername: "alice",
        text: "Hey Bob! How are you?",
        timestamp: Date.now() - 3600000,
      },
      {
        id: "2",
        senderId: "2",
        senderUsername: "bob",
        text: "Hi Alice! I am doing great, thanks for asking!",
        timestamp: Date.now() - 3500000,
      },
      {
        id: "3",
        senderId: "1",
        senderUsername: "alice",
        text: "Want to grab coffee later?",
        timestamp: Date.now() - 3400000,
      },
    ],
  },
  {
    id: "2",
    participants: ["alice", "charlie"],
    messages: [
      {
        id: "1",
        senderId: "3",
        senderUsername: "charlie",
        text: "Alice! Did you see the new project?",
        timestamp: Date.now() - 7200000,
      },
      {
        id: "2",
        senderId: "1",
        senderUsername: "alice",
        text: "Not yet, what is it about?",
        timestamp: Date.now() - 7100000,
      },
      {
        id: "3",
        senderId: "3",
        senderUsername: "charlie",
        text: "It looks really interesting!",
        timestamp: Date.now() - 7000000,
      },
    ],
  },
  {
    id: "3",
    participants: ["alice", "david"],
    messages: [
      {
        id: "1",
        senderId: "1",
        senderUsername: "alice",
        text: "David, nice to meet you!",
        timestamp: Date.now() - 10800000,
      },
      {
        id: "2",
        senderId: "4",
        senderUsername: "david",
        text: "Hey Alice! Great to connect!",
        timestamp: Date.now() - 10700000,
      },
    ],
  },
  {
    id: "4",
    participants: ["bob", "eva"],
    messages: [
      {
        id: "1",
        senderId: "2",
        senderUsername: "bob",
        text: "Eva! Long time no see!",
        timestamp: Date.now() - 5400000,
      },
      {
        id: "2",
        senderId: "5",
        senderUsername: "eva",
        text: "Bob! I know, it has been forever!",
        timestamp: Date.now() - 5300000,
      },
      {
        id: "3",
        senderId: "2",
        senderUsername: "bob",
        text: "We should catch up soon",
        timestamp: Date.now() - 5200000,
      },
    ],
  },
  {
    id: "5",
    participants: ["charlie", "frank"],
    messages: [
      {
        id: "1",
        senderId: "6",
        senderUsername: "frank",
        text: "Charlie, what are you up to?",
        timestamp: Date.now() - 2700000,
      },
      {
        id: "2",
        senderId: "3",
        senderUsername: "charlie",
        text: "Just working on some new ideas!",
        timestamp: Date.now() - 2600000,
      },
    ],
  },
];

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: MOCK_CHATS,
  getChatsForUser: (username: string) => {
    return get().chats.filter((chat) => chat.participants.includes(username));
  },
  getChatBetweenUsers: (user1: string, user2: string) => {
    return get().chats.find(
      (chat) =>
        chat.participants.includes(user1) && chat.participants.includes(user2)
    );
  },
  getOrCreateChat: (currentUsername: string, otherUsername: string) => {
    let chat = get().getChatBetweenUsers(currentUsername, otherUsername);
    if (!chat) {
      const newChat: Chat = {
        id: String(Date.now()),
        participants: [currentUsername, otherUsername],
        messages: [],
      };
      set((state) => ({
        chats: [...state.chats, newChat],
      }));
      chat = newChat;
    }
    return chat;
  },
  addMessage: (
    chatId: string,
    senderId: string,
    senderUsername: string,
    text: string
  ) => {
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === chatId) {
          const newMessage: Message = {
            id: String(Date.now()),
            senderId,
            senderUsername,
            text,
            timestamp: Date.now(),
          };
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: newMessage,
          };
        }
        return chat;
      }),
    }));
  },
}));
