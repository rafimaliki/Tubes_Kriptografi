import { db } from "@/repo/db";
import { eq, and, or, sql, desc } from "drizzle-orm";
import { app_user, chat } from "@/repo/schema";
import { ChatRoomRepository } from "./chat_room.repo";
import { UserRepository } from "./app_user.repo";

export const ChatRepository = {
  async create(
    from_user_id: number,
    to_user_id: number,
    message: string,
    message_for_sender: string,
    room_id?: number
  ) {
    try {
      if (!room_id) {
        room_id = await ChatRoomRepository.getOrCreate(
          from_user_id,
          to_user_id
        );
      }
      const [row] = await db
        .insert(chat)
        .values({
          room_id,
          from_user_id,
          to_user_id,
          message,
          message_for_sender,
        })
        .returning({
          id: chat.id,
          from_user_id: chat.from_user_id,
          to_user_id: chat.to_user_id,
          room_id: chat.room_id,
          message: chat.message,
          message_for_sender: chat.message_for_sender,
          created_at: chat.created_at,
        });
      return {
        id: row.id,
        from_user_id: row.from_user_id,
        to_user_id: row.to_user_id,
        room_id: row.room_id,
        message: row.message,
        message_for_sender: row.message_for_sender,
        created_at: row.created_at,
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
        .orderBy(chat.created_at);
      return result;
    } catch (error) {
      throw new Error(
        "Failed to retrieve chat messages: " + (error as Error).message
      );
    }
  },

  async getRecentChatsForUser(user_id: number) {
    try {
      const sub = db
        .selectDistinctOn([chat.room_id], {
          id: chat.id,
          room_id: chat.room_id,
          from_user_id: chat.from_user_id,
          to_user_id: chat.to_user_id,
          message: chat.message,
          message_for_sender: chat.message_for_sender,
          created_at: chat.created_at,
        })
        .from(chat)
        .where(or(eq(chat.from_user_id, user_id), eq(chat.to_user_id, user_id)))
        .orderBy(chat.room_id, desc(chat.created_at))
        .as("sub");

      const rows = await db.select().from(sub).orderBy(desc(sub.created_at));

      const detailedRows = await Promise.all(
        rows.map(async (row) => {
          const participants = [];
          const user_1 = await UserRepository.getById(row.from_user_id);
          const user_2 = await UserRepository.getById(row.to_user_id);

          participants.push(user_1);
          participants.push(user_2);
          return {
            room_id: row.room_id,
            participants: participants,
            last_message: row,
          };
        })
      );
      return detailedRows;
    } catch (error) {
      throw new Error(
        "Failed to retrieve recent chats: " + (error as Error).message
      );
    }
  },
};
