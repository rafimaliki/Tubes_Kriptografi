import { z } from "@/lib/zod-extended";

export const LoginRequestSchema = z
  .object({
    username: z.string().openapi({
      description: "Username for login",
      example: "john_doe",
    }),
  })
  .openapi({
    description: "Login request payload",
  });

export const LoginResponseSchema = z
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
  });

export const RegisterRequestSchema = z
  .object({
    username: z.string().openapi({
      description: "Username for registration",
      example: "jane_doe",
    }),
    publickey: z.string().openapi({
      description: "User's public key",
      example: "-----BEGIN PUBLIC KEY-----...",
    }),
  })
  .openapi({
    description: "Register request payload",
  });

export const RegisterResponseSchema = z
  .object({
    message: z.string().openapi({
      description: "Response message",
      example: "Registration successful",
    }),
  })
  .openapi({
    description: "Register response payload",
  });
