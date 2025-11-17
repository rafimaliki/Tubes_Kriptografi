import { z } from "@/lib/zod-extended";

export const AuthAPISchema = {
  // skema challenge request
  challenge: {
    req: z
      .object({
        username: z.string().openapi({
          description: "Username for login challenge",
          example: "john_doe",
        }),
      })
      .openapi({
        description: "Login challenge request payload",
      }),
    res: z
      .object({
        nonce_id: z.number().openapi({
          description: "ID of the generated nonce",
          example: 12345,
        }),
        nonce: z.string().openapi({
          description: "Nonce to be signed by the user",
          example: "randomly-generated-nonce-string",
        }),
      })
      .openapi({
        description: "Login challenge response payload",
      }),
  },

  // skema login (challenge response)
  login: {
    req: z
      .object({
        username: z.string().openapi({
          description: "Username for login",
          example: "john_doe",
        }),
        nonce_id: z.number().openapi({
          description: "ID of the nonce being responded to",
          example: 12345,
        }),
        signed_nonce: z.string().openapi({
          description: "Signed nonce for verification",
          example: "signed-nonce-string",
        }),
      })
      .openapi({
        description: "Login request payload",
      }),
    res: z
      .object({
        message: z.string().openapi({
          description: "Response message",
          example: "Login successful",
        }),
        token: z.string().openapi({
          description: "JWT authentication token",
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        }),
      })
      .openapi({
        description: "Login response payload",
      }),
  },

  // skema register
  register: {
    req: z
      .object({
        username: z.string().openapi({
          description: "Username for registration",
          example: "john_doe",
        }),
        public_key: z.string().openapi({
          description: "User's public key",
          example: "-----BEGIN PUBLIC KEY-----...",
        }),
      })
      .openapi({
        description: "Register request payload",
      }),
    res: z
      .object({
        message: z.string().openapi({
          description: "Response message",
          example: "Registration successful",
        }),
      })
      .openapi({
        description: "Register response payload",
      }),
  },
};
