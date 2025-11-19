import { Router } from "express";
import { ChatHandler } from "@/handlers/chat.handler";
import { JwtMiddleware } from "@/middlewares/jwt.middleware";

const router = Router();

router.get("/", JwtMiddleware, ChatHandler.getMessages);

export default router;
