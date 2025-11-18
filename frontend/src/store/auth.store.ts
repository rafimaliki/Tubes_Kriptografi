import { create } from "zustand";
import { AuthAPI } from "@/api/auth.api";
import type {
  ChallengeApiResult,
  LoginApiResult,
  RegisterApiResult,
} from "@/types/ApiResult";

export interface User {
  id: string;
  username: string;
  jwt_token: string;
}

interface AuthStore {
  currentUser: User | null;
  login: (
    username: string,
    password: string
  ) => Promise<ChallengeApiResult | LoginApiResult>;
  register: (username: string, password: string) => Promise<RegisterApiResult>;
  logout: () => void;
}

const LOCAL_STORAGE_KEY = "app_user";

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

  login: async (username: string, password: string) => {
    try {
      // 1) generate key pair dulu

      // 2) request challenge nonce
      const challenge_res = await AuthAPI.challenge(username);

      if (!challenge_res.ok) {
        return challenge_res;
      }

      const { nonce_id, nonce } = challenge_res.data;

      // 3) sign nonce
      /** TO DO (pindahin ke file lain jangan disini) */
      const signNonceWithPassword = async (pw: string, n: string) => {
        return btoa(`${n}:${pw}`);
      };

      const signed_nonce = await signNonceWithPassword(password, nonce);

      // 4) kirim login request dengan signed nonce
      const login_res = await AuthAPI.login(username, nonce_id, signed_nonce);

      if (!login_res.ok) {
        return login_res;
      }

      // 5) parse JWT token dari response
      const { jwt_token } = login_res.data;
      const payload = JSON.parse(decodeBase64(jwt_token.split(".")[1]));

      const user = {
        id: String(payload.user_id),
        username: String(payload.username),
        jwt_token: jwt_token,
      };

      // 6) save user di store + localStorage
      set({ currentUser: user });
      saveToLocalStorage(user);

      return login_res;
    } catch (err) {
      return { ok: false, error: "Unexpected error during login" };
    }
  },

  register: async (username: string, password: string) => {
    try {
      // generate public/private key pair
      /** TO DO (pindahin ke file lain jangan disini) */
      const generateKeyPairWithPassword = async (pw: string) => {
        return {
          public_key: btoa(`public-key-for-${pw}`),
          private_key: btoa(`private-key-for-${pw}`),
        };
      };

      // 1) generate key pair
      const { public_key, private_key } =
        await generateKeyPairWithPassword(password);

      // 2) kirim request register ke backend
      const register_res = await AuthAPI.register(username, public_key);

      return register_res;
    } catch (err) {
      console.error("Key generation error:", err);
      return { ok: false, error: "Unexpected error during registration" };
    }
  },

  logout: () => {
    set({ currentUser: null });
    saveToLocalStorage(null);
  },
}));
