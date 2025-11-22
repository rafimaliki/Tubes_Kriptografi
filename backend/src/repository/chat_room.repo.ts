import { db } from "@/repo/db";
import { eq, and, or, sql } from "drizzle-orm";
import { app_user, chat, chat_room } from "@/repo/schema";
import { UserRepository } from "./app_user.repo";

export const ChatRoomRepository = {
  async create(user1_id: number, user2_id: number) {
    try {
      const lowerId = Math.min(user1_id, user2_id);
      const higherId = Math.max(user1_id, user2_id);

      const [row] = await db
        .insert(chat_room)
        .values({
          user1_id: lowerId,
          user2_id: higherId,
        })
        .returning({
          id: chat_room.id,
        });
      return {
        id: row.id,
      };
    } catch (error) {
      throw new Error(
        "Failed to create chat room: " + (error as Error).message
      );
    }
  },

  async get(user1_id: number, user2_id: number) {
    try {
      const lowerId = Math.min(user1_id, user2_id);
      const higherId = Math.max(user1_id, user2_id);
      const result = await db
        .select()
        .from(chat_room)
        .where(
          and(eq(chat_room.user1_id, lowerId), eq(chat_room.user2_id, higherId))
        );
      return result[0].id;
    } catch (error) {
      throw new Error(
        "Failed to retrieve chat room: " + (error as Error).message
      );
    }
  },

  async getOrCreate(user1_id: number, user2_id: number) {
    try {
      let roomId = await this.get(user1_id, user2_id);
      return roomId;
    } catch (error) {
      let newRoom = await this.create(user1_id, user2_id);
      return newRoom.id;
    }
  },
};
