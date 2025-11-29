import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  text,
} from "drizzle-orm/pg-core";

export const app_user = pgTable("app_user", {
  id: serial("id").primaryKey().notNull(),
  username: varchar("username", { length: 32 }).notNull().unique(),
  public_key: varchar("public_key", { length: 512 }).notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
});

export const nonce_store = pgTable("nonce_store", {
  id: serial("id").primaryKey().notNull(),
  username: varchar("username", { length: 32 }).notNull(),
  nonce: varchar("nonce", { length: 64 }).notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
});

export const chat_room = pgTable("chat_room", {
  id: serial("id").primaryKey().notNull(),
  user1_id: serial("user1_id").notNull(),
  user2_id: serial("user2_id").notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
});

export const chat = pgTable("chat", {
  id: serial("id").primaryKey().notNull(),
  room_id: integer("room_id")
    .notNull()
    .references(() => chat_room.id, {
      onDelete: "cascade",
    }),
  from_user_id: serial("from_user_id").notNull(),
  to_user_id: serial("to_user_id").notNull(),
  message: text("message").notNull(),
  message_for_sender: text("message_for_sender").notNull(),
  signature: varchar("signature", { length: 768 }).notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
});
