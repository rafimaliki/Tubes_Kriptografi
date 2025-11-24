import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { HealthAPISchema } from "@/schemas/health.schema";
import { AuthAPISchema } from "@/schemas/auth.schema";
import { ChatAPISchema } from "@/schemas/chat.schema";
import { UserAPISchema } from "@/schemas/user.schema";

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

registry.register("GetMessagesRequest", ChatAPISchema.getMessages.req);
registry.register("GetMessagesResponse", ChatAPISchema.getMessages.res);
registry.registerPath({
  method: "get",
  path: "/chat/messages",
  summary: "Get chat messages between users",
  description: "Retrieve chat messages exchanged between two users",
  tags: ["Chat"],
  security: [{ BearerAuth: [] }],
  parameters: [
    ...(Object.keys(ChatAPISchema.getMessages.req.shape).map((key) => ({
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
            $ref: "#/components/schemas/GetMessagesResponse",
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

registry.register("GetRecentsResponse", ChatAPISchema.getRecents.res);
registry.registerPath({
  method: "get",
  path: "/chat/recents",
  summary: "Get recent chat messages",
  description: "Retrieve recent chat messages for a user",
  tags: ["Chat"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: "Recent chat messages retrieved successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/GetRecentsResponse",
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

registry.register("GetUserRequest", UserAPISchema.get.req);
registry.register("GetUserResponse", UserAPISchema.get.res);
registry.registerPath({
  method: "get",
  path: "/user/{username}",
  summary: "Get user by username",
  description: "Retrieve user details by username",
  tags: ["Users"],
  security: [{ BearerAuth: [] }],
  parameters: [
    ...(Object.keys(UserAPISchema.get.req.shape).map((key) => ({
      name: key,
      in: "path",
      required: true,
    })) as any),
  ],
  responses: {
    200: {
      description: "User retrieved successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/GetUserResponse",
          },
        },
      },
    },
    404: {
      description: "User not found",
    },
    500: {
      description: "Internal server error",
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
      url: process.env.API_BASE_URL || "http://localhost:3001/api",
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
