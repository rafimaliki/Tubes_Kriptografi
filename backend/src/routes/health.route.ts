import { Router } from "express";
import { healthCheckHandler } from "@/handlers/health.handler";

const router = Router();

router.get("/", healthCheckHandler);

export default router;
