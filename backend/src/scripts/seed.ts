import { db } from "@/repo/db";
import { app_user, chat } from "@/repo/schema";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

async function seedUsers() {
  const num_users = 10;

  const users = Array.from({ length: num_users }, (_, i) => {
    const random_key = crypto.randomBytes(32).toString("hex");
    return {
      username: `user${i + 1}`,
      public_key: random_key,
    };
  });

  await db.insert(app_user).values(users).onConflictDoNothing();
  console.log(`[db-script]Seeded ${num_users} users`);
}

async function seedChats() {
  const all_users = await db.select().from(app_user);

  const chats = [];
  for (let i = 0; i < all_users.length; i++) {
    for (let j = 0; j < all_users.length; j++) {
      if (i !== j) {
        const message = `Hello from ${all_users[i].username} to ${all_users[j].username}`;
        const timestamp = new Date().toISOString();
        chats.push({
          from_user_id: all_users[i].id,
          to_user_id: all_users[j].id,
          message,
          timestamp,
        });
      }
    }
  }
  await db.insert(chat).values(chats).onConflictDoNothing();
  console.log(`[db-script]Seeded ${chats.length} chat messages`);
}

async function main() {
  try {
    console.log("[db-script] Starting database seeding...");
    await seedUsers();
    await seedChats();
    console.log("[db-script] Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[db-script] Database seeding failed:", error);
    process.exit(1);
  }
}

main();
