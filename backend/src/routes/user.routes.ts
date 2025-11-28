import { Router } from "express";
import { UserHandler } from "@/handlers/user.handler";
import { JwtMiddleware } from "@/middlewares/jwt.middleware";

const router = Router();

router.get("/id/:id", JwtMiddleware, UserHandler.getUserById);
router.get("/:username", JwtMiddleware, UserHandler.getUser);

export default router;
