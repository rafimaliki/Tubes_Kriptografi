import axios from "axios";
const BACKEND_URL = "http://localhost:3001/api/";

import type {
  ChallengeApiResult,
  LoginApiResult,
  RegisterApiResult,
} from "@/types/ApiResult";

export const AuthAPI = {
  challenge: async (username: string): Promise<ChallengeApiResult> => {
    try {
      const res = await axios.post(BACKEND_URL + "auth/challenge", {
        username,
      });
      return { ok: true, data: res.data };
    } catch (err: any) {
      console.error("AuthAPI.challenge error:", err);
      const msg = err?.response?.data?.error ?? "Network error";
      return { ok: false, error: String(msg) };
    }
  },

  login: async (
    username: string,
    nonce_id: number,
    signed_nonce: string
  ): Promise<LoginApiResult> => {
    try {
      const res = await axios.post(BACKEND_URL + "auth/login", {
        username,
        nonce_id,
        signed_nonce,
      });
      return { ok: true, data: res.data };
    } catch (err: any) {
      console.error("AuthAPI.login error:", err);
      const msg = err?.response?.data?.error ?? "Network error";
      return { ok: false, error: String(msg) };
    }
  },

  register: async (
    username: string,
    public_key: string
  ): Promise<RegisterApiResult> => {
    try {
      const res = await axios.post(BACKEND_URL + "auth/register", {
        username,
        public_key,
      });
      return { ok: true, data: res.data };
    } catch (err: any) {
      console.error("AuthAPI.register error:", err);
      const msg = err?.response?.data?.error ?? "Network error";
      return { ok: false, error: String(msg) };
    }
  },
};
