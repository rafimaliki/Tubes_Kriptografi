import { db } from "@/repo/db";
import { app_user, chat, chat_room } from "@/repo/schema";
import dotenv from "dotenv";
import crypto, { sign } from "crypto";
import { ChatRoomRepository } from "@/repository/chat_room.repo";
import { generateKeyPair, encryptMessage, hashMessage, signMessage } from "@/lib/elliptic-curve";
dotenv.config();

async function seedUsers() {
  const num_users = 10;

  const users = Array.from({ length: num_users }, (_, i) => {
    const { publicKey } = generateKeyPair("password1");
    return {
      username: `user${i + 1}`,
      public_key: publicKey,
    };
  });

  await db.insert(app_user).values(users).onConflictDoNothing();
  console.log(`[db-script]Seeded ${num_users} users`);
}

async function seedChats() {
  const all_users = await db.select().from(app_user);

  const sentences = [
    "Hey! How's your day going?",
    "What's up?",
    "Did you finish the project?",
    "Let's meet later.",
    "I found something interesting today!",
    "Can you check your messages?",
    "I will get back to you soon.",
    "Don't forget our plan tomorrow.",
    "Can you help me with something?",
    "This app is getting cooler!",
    "Do you want to play a game later?",
    "Have you eaten?",
    "I'm busy right now, talk later.",
    "Nice work on that task!",
    "Good morning!",
    "Good night!",
    "I learned something new today!",
  ];

  const MESSAGE_COUNT = 10;
  const chats = [];

  const now = new Date();
  const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < all_users.length; i++) {
    for (let j = 0; j < all_users.length; j++) {
      if (i === j) continue;
      if (i > 5 || j > 5) continue;

      const from = all_users[i];
      const to = all_users[j];

      for (let k = 0; k < MESSAGE_COUNT; k++) {
        const randomSentence =
          sentences[Math.floor(Math.random() * sentences.length)];

        const room_id = await ChatRoomRepository.getOrCreate(from.id, to.id);

        const randomTime = new Date(
          startTime.getTime() +
            Math.random() * (now.getTime() - startTime.getTime())
        );

        // encrypt message for receiver
        const encryptedMessage = encryptMessage(to.public_key, randomSentence);
        
        // encrypt message for sender (so sender can read their own messages)
        const encryptedMessageForSender = encryptMessage(from.public_key, randomSentence);

        // generate signature
        const { privateKey } = generateKeyPair("password1");
        const messageHash = hashMessage(
          randomSentence,
          randomTime.toISOString().replace(/\.\d{3}Z$/, ".000Z"),
          from.username,
          to.username
        );
        const signature = signMessage(privateKey, messageHash);

        chats.push({
          from_user_id: from.id,
          to_user_id: to.id,
          room_id: room_id,
          message: encryptedMessage,
          message_for_sender: encryptedMessageForSender,
          signature: signature,
          created_at: randomTime,
        });
      }
    }
  }

  await db.insert(chat).values(chats).onConflictDoNothing();
  console.log(`[db-script] Seeded ${chats.length} varied chat messages`);
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
