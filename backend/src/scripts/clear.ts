import { db } from "../repo/db";
import { app_user } from "../repo/schema";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    console.log("[db-script] Clearing database...");
    await db.delete(app_user);
    console.log("[db-script] Database cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[db-script] Database clearing failed:", error);
    process.exit(1);
  }
}

main();
