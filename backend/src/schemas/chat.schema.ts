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
    message: z.string().openapi({
      description: "Content of the chat message",
      example: "Hello, how are you?",
    }),
    room_id: z.number().openapi({
      description: "ID of the chat room",
      example: 2001,
    }),
    created_at: z.string().openapi({
      description: "Timestamp of when the message was sent",
      example: "2024-10-01T12:34:56Z",
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
