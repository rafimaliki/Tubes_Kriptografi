import axios from "axios";
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api/";

import type { MessagesApiResult, RecentsApiResult } from "@/types/ApiResult";
import { JWT } from "@/lib/Jwt";

export const ChatAPI = {
  getMessagess: async (
    user1_id: number,
    user2_id: number
  ): Promise<MessagesApiResult> => {
    try {
      const res = await axios.get(BACKEND_URL + "chat/messages", {
        headers: {
          Authorization: `Bearer ${JWT.get()}`,
        },
        params: {
          user1_id,
          user2_id,
        },
      });
      return { ok: true, data: res.data };
    } catch (err: any) {
      console.error("ChatAPI.getMessages error:", err);
      const msg = err?.response?.data?.error ?? "Network error";
      return { ok: false, error: String(msg) };
    }
  },

  getRecents: async (): Promise<RecentsApiResult> => {
    try {
      const res = await axios.get(BACKEND_URL + "chat/recents", {
        headers: {
          Authorization: `Bearer ${JWT.get()}`,
        },
      });
      return { ok: true, data: res.data };
    } catch (err: any) {
      console.error("ChatAPI.getRecents error:", err);
      const msg = err?.response?.data?.error ?? "Network error";
      return { ok: false, error: String(msg) };
    }
  },
};
