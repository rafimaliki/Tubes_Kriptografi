import { create } from "zustand";

export interface User {
  id: string;
  username: string;
  password: string;
}

interface AuthStore {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
}

const LOCAL_STORAGE_KEY = "app_user";

const MOCK_USERS: User[] = [
  { id: "1", username: "alice", password: "password123" },
  { id: "2", username: "bob", password: "password123" },
  { id: "3", username: "charlie", password: "password123" },
  { id: "4", username: "david", password: "password123" },
  { id: "5", username: "eva", password: "password123" },
  { id: "6", username: "frank", password: "password123" },
  { id: "7", username: "grace", password: "password123" },
  { id: "8", username: "henry", password: "password123" },
  { id: "9", username: "iris", password: "password123" },
  { id: "10", username: "jack", password: "password123" },
];

const encodeBase64 = (data: string): string => {
  return btoa(data);
};

const decodeBase64 = (data: string): string => {
  return atob(data);
};

const loadFromLocalStorage = (): User | null => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    try {
      const decodedData = decodeBase64(data);
      return JSON.parse(decodedData);
    } catch {
      console.error("Failed to parse or decode localStorage data");
    }
  }
  return null;
};

const saveToLocalStorage = (user: User | null) => {
  if (user) {
    const encodedData = encodeBase64(JSON.stringify(user));
    localStorage.setItem(LOCAL_STORAGE_KEY, encodedData);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: loadFromLocalStorage(),

  users: MOCK_USERS,

  login: (username: string, password: string) => {
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      set({ currentUser: user });
      saveToLocalStorage(user);
      return true;
    }
    return false;
  },

  register: (username: string, password: string) => {
    const existingUser = MOCK_USERS.find((u) => u.username === username);
    if (existingUser) {
      return false;
    }
    const newUser: User = {
      id: String(MOCK_USERS.length + 1),
      username,
      password,
    };
    MOCK_USERS.push(newUser);
    return true;
  },

  logout: () => {
    set({ currentUser: null });
    saveToLocalStorage(null);
  },
}));
