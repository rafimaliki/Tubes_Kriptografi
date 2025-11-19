import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { HealthAPISchema } from "@/schemas/health.schema";
import { AuthAPISchema } from "@/schemas/auth.schema";
import { ChatAPISchema } from "@/schemas/chat.schema";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "JWT Bearer Token Authentication",
});

registry.register("HealthResponse", HealthAPISchema.check.req);
registry.registerPath({
  method: "get",
  path: "/health",
  summary: "Health check endpoint",
  description: "Returns API health status",
  tags: ["Health"],
  responses: {
    200: {
      description: "API is healthy",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/HealthResponse",
          },
        },
        "application/x-www-form-urlencoded": {
          schema: {
            $ref: "#/components/schemas/HealthResponse",
          },
        },
      },
    },
  },
});

registry.register("ChallengeRequest", AuthAPISchema.challenge.req);
registry.register("ChallengeResponse", AuthAPISchema.challenge.res);
registry.registerPath({
  method: "post",
  path: "/auth/challenge",
  summary: "Request login challenge",
  description: "Generate a nonce for user login challenge",
  tags: ["Authentication"],
  requestBody: {
    description: "Challenge request payload",
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ChallengeRequest",
        },
      },
      "application/x-www-form-urlencoded": {
        schema: {
          $ref: "#/components/schemas/ChallengeRequest",
        },
      },
    },
  },
  responses: {
    200: {
      description: "Challenge generated successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/ChallengeResponse",
          },
        },
        "application/x-www-form-urlencoded": {
          schema: {
            $ref: "#/components/schemas/ChallengeResponse",
          },
        },
      },
    },
    400: {
      description: "Invalid request",
    },
  },
});

registry.register("LoginRequest", AuthAPISchema.login.req);
registry.register("LoginResponse", AuthAPISchema.login.res);
registry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "User login",
  description: "Authenticate user and return a token",
  tags: ["Authentication"],
  requestBody: {
    description: "Login request payload",
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/LoginRequest",
        },
      },
      "application/x-www-form-urlencoded": {
        schema: {
          $ref: "#/components/schemas/LoginRequest",
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/LoginResponse",
          },
        },
        "application/x-www-form-urlencoded": {
          schema: {
            $ref: "#/components/schemas/LoginResponse",
          },
        },
      },
    },
    400: {
      description: "Invalid request",
    },
  },
});

registry.register("RegisterRequest", AuthAPISchema.register.req);
registry.register("RegisterResponse", AuthAPISchema.register.res);
registry.registerPath({
  method: "post",
  path: "/auth/register",
  summary: "User registration",
  description: "Register a new user",
  tags: ["Authentication"],
  requestBody: {
    description: "Register request payload",
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/RegisterRequest",
        },
      },
      "application/x-www-form-urlencoded": {
        schema: {
          $ref: "#/components/schemas/RegisterRequest",
        },
      },
    },
  },
  responses: {
    200: {
      description: "Registration successful",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/RegisterResponse",
          },
        },
      },
    },
    400: {
      description: "Invalid request",
    },
  },
});

registry.register("GetChatMessagesRequest", ChatAPISchema.get.req);
registry.register("GetChatMessagesResponse", ChatAPISchema.get.res);
registry.registerPath({
  method: "get",
  path: "/chat",
  summary: "Get chat messages between users",
  description: "Retrieve chat messages exchanged between two users",
  tags: ["Chat"],
  security: [{ BearerAuth: [] }],
  parameters: [
    ...(Object.keys(ChatAPISchema.get.req.shape).map((key) => ({
      name: key,
      in: "query",
      required: true,
    })) as any),
  ],
  responses: {
    200: {
      description: "Chat messages retrieved successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/GetChatMessagesResponse",
          },
        },
      },
    },
    400: {
      description: "Invalid request",
    },
    401: {
      description: "Unauthorized - Invalid or missing Bearer token",
    },
  },
});

const definitionsArray = Array.isArray((registry as any).definitions)
  ? (registry as any).definitions
  : Object.values((registry as any).definitions || {});

const generator = new OpenApiGeneratorV3(definitionsArray);

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Cryptalk App API",
    version: "1.0.0",
    description: "API documentation for the Cryptalk application",
  },
  servers: [
    {
      url: "http://localhost:3001/api",
      description: "Local server",
    },
  ],
  tags: [
    {
      name: "Health",
      description: "Health check endpoints",
    },
    {
      name: "Authentication",
      description: "User authentication endpoints",
    },
    {
      name: "Chat",
      description: "Chat and messaging endpoints",
    },
    {
      name: "Users",
      description: "User management endpoints",
    },
  ],
});
