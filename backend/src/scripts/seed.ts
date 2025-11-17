import { db } from "@/repo/db";
import { app_user } from "@/repo/schema";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

async function seedUsers() {
  const num_users = 10;

  const users = Array.from({ length: num_users }, (_, i) => {
    const random_key = crypto.randomBytes(32).toString("hex");
    return {
      id: i + 1,
      username: `user${i + 1}`,
      public_key: random_key,
    };
  });

  await db.insert(app_user).values(users).onConflictDoNothing();
  console.log(`[db-script]Seeded ${num_users} users`);
}

async function main() {
  try {
    console.log("[db-script] Starting database seeding...");
    await seedUsers();
    console.log("[db-script] Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[db-script] Database seeding failed:", error);
    process.exit(1);
  }
}

main();
