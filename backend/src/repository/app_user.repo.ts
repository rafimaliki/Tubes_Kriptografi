import { db } from "@/repo/db";
import { eq } from "drizzle-orm";
import { app_user } from "@/repo/schema";

export const UserRepository = {
  async create(username: string, public_key: string) {
    try {
      const [row] = await db
        .insert(app_user)
        .values({
          username,
          public_key,
        })
        .returning({
          id: app_user.id,
          username: app_user.username,
          public_key: app_user.public_key,
        });
      return {
        id: row.id,
        username: row.username,
        public_key: row.public_key,
      };
    } catch (error) {
      throw new Error("Failed to create user: " + (error as Error).message);
    }
  },

  async getByUsername(username: string) {
    try {
      const result = await db
        .select()
        .from(app_user)
        .where(eq(app_user.username, username));
      if (result.length === 0) {
        return null;
      }
      return result[0];
    } catch (error) {
      throw new Error("Failed to retrieve user: " + (error as Error).message);
    }
  },
};
