import { create } from "zustand";
import { AuthAPI } from "@/api/auth.api";
import type {
  ChallengeApiResult,
  LoginApiResult,
  RegisterApiResult,
} from "@/types/ApiResult";
import { Base64 } from "@/lib/Base64";
import { LocalStorage } from "@/lib/LocalStorage";

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

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: LocalStorage.load(LOCAL_STORAGE_KEY) as User | null,

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
      const payload = JSON.parse(Base64.decode(jwt_token.split(".")[1]));

      const user = {
        id: String(payload.user_id),
        username: String(payload.username),
        jwt_token: jwt_token,
      };

      // 6) save user di store + localStorage
      set({ currentUser: user });
      LocalStorage.save(LOCAL_STORAGE_KEY, user);

      return login_res;
    } catch (err) {
      return { ok: false, error: "Unexpected error during login" };
    }
  },

  register: async (username: string, password: string) => {
    try {
      // fungsi public/private key pair
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
    LocalStorage.save(LOCAL_STORAGE_KEY, null);
  },
}));
