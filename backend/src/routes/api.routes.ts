import { Router } from "express";
import healthRouter from "./health.route";
import authRouter from "./auth.route";
import chatRoutes from "./chat.route";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/chat", chatRoutes);

export default router;
