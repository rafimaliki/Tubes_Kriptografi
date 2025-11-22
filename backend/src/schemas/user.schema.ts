import { z } from "@/lib/zod-extended";

export const UserSchema = z.object({
  id: z.number().openapi({
    description: "The unique identifier of the user",
    example: 123,
  }),
  username: z.string().openapi({
    description: "The username of the user",
    example: "john_doe",
  }),
  public_key: z.string().openapi({
    description: "The public key of the user",
    example: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  }),
});

export const UserAPISchema = {
  get: {
    req: z
      .object({
        username: z.string().openapi({
          description: "The username of the user to retrieve",
          example: "john_doe",
        }),
      })
      .openapi({
        description: "Get user request payload",
      }),
    res: UserSchema.openapi({
      description: "Get user response payload",
    }),
  },
};
