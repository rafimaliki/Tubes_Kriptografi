import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const app_user = pgTable("app_user", {
  id: serial("id").primaryKey().notNull(),
  username: varchar("username", { length: 32 }).notNull().unique(),
  public_key: varchar("public_key", { length: 64 }).notNull(),
});

export const nonce_store = pgTable("nonce_store", {
  id: serial("id").primaryKey().notNull(),
  username: varchar("username", { length: 32 }).notNull(),
  nonce: varchar("nonce", { length: 64 }).notNull(),
  created_at: varchar("created_at", { length: 32 }).notNull(),
});

export const chat = pgTable("chat", {
  id: serial("id").primaryKey().notNull(),
  from_user_id: serial("from_user_id").notNull(),
  to_user_id: serial("to_user_id").notNull(),
  message: varchar("message", { length: 1024 }).notNull(),
  timestamp: varchar("timestamp", { length: 32 }).notNull(),
});
