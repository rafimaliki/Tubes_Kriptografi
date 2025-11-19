import { z } from "@/lib/zod-extended";

export const ChatAPISchema = {
  get: {
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

    res: z
      .array(
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
          timestamp: z.string().openapi({
            description: "Timestamp of when the message was sent",
            example: "2024-10-01T12:34:56Z",
          }),
        })
      )
      .openapi({
        description: "Get chat messages between two users response payload",
      }),
  },
};
