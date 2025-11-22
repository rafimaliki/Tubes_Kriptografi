import { db } from "@/repo/db";
import { eq, and } from "drizzle-orm";
import { nonce_store } from "@/repo/schema";
import crypto from "crypto";

export const NonceStoreRepository = {
  async generate(username: string) {
    const nonce = crypto.randomBytes(32).toString("hex");
    try {
      const [row] = await db
        .insert(nonce_store)
        .values({
          username,
          nonce,
        })
        .returning({ id: nonce_store.id, nonce: nonce_store.nonce });
      const value = { id: row.id, nonce: row.nonce };
      return value;
    } catch (error) {
      throw new Error("Failed to store nonce: " + (error as Error).message);
    }
  },

  async get(username: string, nonceId: number): Promise<string | null> {
    try {
      const result = await db
        .select()
        .from(nonce_store)
        .where(
          and(eq(nonce_store.id, nonceId), eq(nonce_store.username, username))
        );
      if (result.length === 0) {
        return null;
      }
      return result[0].nonce;
    } catch (error) {
      throw new Error("Failed to retrieve nonce: " + (error as Error).message);
    }
  },

  async delete(nonceId: number): Promise<void> {
    try {
      await db.delete(nonce_store).where(eq(nonce_store.id, nonceId));
    } catch (error) {
      throw new Error("Failed to delete nonce: " + (error as Error).message);
    }
  },

  async deleteForUsername(username: string): Promise<void> {
    try {
      await db.delete(nonce_store).where(eq(nonce_store.username, username));
    } catch (error) {
      throw new Error("Failed to delete nonces: " + (error as Error).message);
    }
  },
};
