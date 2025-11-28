import { create } from "zustand";
import { AuthAPI } from "@/api/auth.api";
import type {
  ChallengeApiResult,
  LoginApiResult,
  RegisterApiResult,
} from "@/types/ApiResult";
import { Base64 } from "@/lib/Base64";
import { LocalStorage } from "@/lib/LocalStorage";
import {
  generateKeyPair,
  signMessage
} from "@/lib/EllipticCurve"

export interface User {
  id: number;
  username: string;
  public_key: string;
  jwt_token?: string;
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
      const { publicKey, privateKey } = generateKeyPair(password);

      // 2) request challenge nonce
      const challenge_res = await AuthAPI.challenge(username);

      if (!challenge_res.ok) {
        return challenge_res;
      }

      const { nonce_id, nonce } = challenge_res.data;

      // 3) sign nonce with private key
      const signed_nonce = signMessage(privateKey, nonce);

      // 4) kirim login request dengan signed nonce
      const login_res = await AuthAPI.login(username, nonce_id, signed_nonce);

      if (!login_res.ok) {
        return login_res;
      }

      // 5) parse JWT token dari response
      const { jwt_token } = login_res.data;
      const payload = JSON.parse(Base64.decode(jwt_token.split(".")[1]));

      const user = {
        id: Number(payload.id),
        username: String(payload.username),
        public_key: String(payload.public_key),
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
      // 1) generate key pair
      const { publicKey } = generateKeyPair(password);

      // 2) kirim request register ke backend
      const register_res = await AuthAPI.register(username, publicKey);

      console.log("Public Key:", publicKey);

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
