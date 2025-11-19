import { db } from "@/repo/db";
import { eq, and, or } from "drizzle-orm";
import { app_user, chat } from "@/repo/schema";

export const ChatRepository = {
  async create(
    from_user_id: number,
    to_user_id: number,
    message: string,
    timestamp: string
  ) {
    try {
      const [row] = await db
        .insert(chat)
        .values({
          from_user_id,
          to_user_id,
          message,
          timestamp,
        })
        .returning({
          id: chat.id,
          from_user_id: chat.from_user_id,
          to_user_id: chat.to_user_id,
          message: chat.message,
          timestamp: chat.timestamp,
        });
      return {
        id: row.id,
        from_user_id: row.from_user_id,
        to_user_id: row.to_user_id,
        message: row.message,
        timestamp: row.timestamp,
      };
    } catch (error) {
      throw new Error(
        "Failed to create chat message: " + (error as Error).message
      );
    }
  },

  async getById(id: number) {
    try {
      const result = await db.select().from(chat).where(eq(chat.id, id));
      if (result.length === 0) {
        return null;
      }
      return result[0];
    } catch (error) {
      throw new Error(
        "Failed to retrieve chat message: " + (error as Error).message
      );
    }
  },

  async getMessagesBetweenUsers(user1_id: number, user2_id: number) {
    try {
      const result = await db
        .select()
        .from(chat)
        .where(
          or(
            and(eq(chat.from_user_id, user1_id), eq(chat.to_user_id, user2_id)),
            and(eq(chat.from_user_id, user2_id), eq(chat.to_user_id, user1_id))
          )
        )
        .orderBy(chat.timestamp);
      return result;
    } catch (error) {
      throw new Error(
        "Failed to retrieve chat messages: " + (error as Error).message
      );
    }
  },
};
