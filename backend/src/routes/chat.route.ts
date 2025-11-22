import { Router } from "express";
import { ChatHandler } from "@/handlers/chat.handler";
import { JwtMiddleware } from "@/middlewares/jwt.middleware";

const router = Router();

router.get("/messages", JwtMiddleware, ChatHandler.getMessages);
router.get("/recents", JwtMiddleware, ChatHandler.getRecents);

export default router;
