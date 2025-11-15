import { pgTable, integer, varchar } from "drizzle-orm/pg-core";

export const app_user = pgTable("app_user", {
  id: integer("id").primaryKey().notNull(),
  username: varchar("username", { length: 32 }).notNull().unique(),
  hashed_password: varchar("hashed_password", { length: 64 }).notNull(),
});
