import { db } from "../repo/db";
import { app_user } from "../repo/schema";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

async function seedUsers() {
  const num_users = 10;

  const users = Array.from({ length: num_users }, (_, i) => {
    const password = `pass${i + 1}`;
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    return {
      id: i + 1,
      username: `user${i + 1}`,
      hashed_password: hashedPassword,
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
