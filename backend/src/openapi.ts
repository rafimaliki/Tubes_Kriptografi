import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { HealthResponseSchema } from "@/schemas/health.schema";
import {
  LoginRequestSchema,
  LoginResponseSchema,
  RegisterRequestSchema,
  RegisterResponseSchema,
} from "@/schemas/auth.schema";

const registry = new OpenAPIRegistry();

registry.register("HealthResponse", HealthResponseSchema);
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
      },
    },
  },
});

registry.register("LoginRequest", LoginRequestSchema);
registry.register("LoginResponse", LoginResponseSchema);
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
      },
    },
    400: {
      description: "Invalid request",
    },
  },
});

registry.register("RegisterRequest", RegisterRequestSchema);
registry.register("RegisterResponse", RegisterResponseSchema);
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
