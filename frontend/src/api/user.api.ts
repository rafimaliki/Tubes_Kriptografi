import axios from "axios";
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api/";

import type { UserApiResult } from "@/types/ApiResult";
import { JWT } from "@/lib/Jwt";

export const UserAPI = {
  get: async (username: string): Promise<UserApiResult> => {
    try {
      const res = await axios.get(BACKEND_URL + `user/${username}`, {
        headers: {
          Authorization: `Bearer ${JWT.get()}`,
        },
      });
      return { ok: true, data: res.data };
    } catch (err: any) {
      console.error("UserAPI.get error:", err);
      const msg = err?.response?.data?.error ?? "Network error";
      return { ok: false, error: String(msg) };
    }
  },
};
