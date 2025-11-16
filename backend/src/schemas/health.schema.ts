import { z } from "@/lib/zod-extended";

export const HealthResponseSchema = z
  .object({
    status: z.string().openapi({
      description: "Health status",
      example: "ok",
    }),
    timestamp: z.string().openapi({
      description: "ISO timestamp",
      example: "2025-11-16T10:30:00.000Z",
    }),
  })
  .openapi({
    description: "Health check response",
  });
