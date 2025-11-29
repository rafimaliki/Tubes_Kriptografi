import { z } from "@/lib/zod-extended";
import { UserSchema } from "@/schemas/user.schema";
import { create } from "domain";

export const messagesSchema = z.array(
  z.object({
    id: z.number().openapi({
      description: "Chat message ID",
      example: 1001,
    }),
    from_user_id: z.number().openapi({
      description: "ID of the user who sent the message",
      example: 1,
    }),
    to_user_id: z.number().openapi({
      description: "ID of the user who received the message",
      example: 2,
    }),
    room_id: z.number().openapi({
      description: "ID of the chat room",
      example: 2001,
    }),
    message: z.string().openapi({
      description: "Content of the chat message",
      example: "Hello, how are you?",
    }),
    message_for_sender: z.string().openapi({
      description: "Content of the chat message for the sender",
      example: "Hello, how are you?",
    }),
    created_at: z.string().openapi({
      description: "Timestamp of when the message was sent",
      example: "2024-10-01T12:34:56Z",
    }),
    signature: z.string().openapi({
      description: "Digital signature of the message",
      example:
        '{"r":"5f1d7e8c9a3b4c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d","s":"1a2b3c4d5e6f7a8b9c0d5f1d7e8c9a3b4c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f"}',
    }),
    isVerified: z.boolean().openapi({
      description: "Indicates if the message signature has been verified",
      example: true,
    }),
  })
);

export const ChatAPISchema = {
  getMessages: {
    req: z
      .object({
        user1_id: z.coerce.number().openapi({
          description: "ID of the first user",
          example: 1,
        }),
        user2_id: z.coerce.number().openapi({
          description: "ID of the second user",
          example: 2,
        }),
      })
      .openapi({
        description: "Get chat messages between two users request payload",
      }),

    res: messagesSchema.openapi({
      description: "Get chat messages between two users response payload",
    }),
  },
  getRecents: {
    res: z
      .array(
        z.object({
          room_id: z.number().openapi({
            description: "Room ID",
            example: 5001,
          }),
          participants: z.array(UserSchema).openapi({
            description: "List of participants in the chat",
          }),
          last_message: messagesSchema.openapi({
            description: "The most recent message in the chat",
          }),
        })
      )
      .openapi({
        description: "Get recent chat messages response payload",
      }),
  },
};
