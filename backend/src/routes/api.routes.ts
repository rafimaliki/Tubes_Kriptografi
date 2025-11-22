import { Router } from "express";
import healthRouter from "./health.route";
import authRouter from "./auth.route";
import chatRouter from "./chat.route";
import userRouter from "./user.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/chat", chatRouter);
router.use("/user", userRouter);

export default router;
