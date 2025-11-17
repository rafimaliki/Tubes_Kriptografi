import { Router } from "express";
import { HealthHandler } from "@/handlers/health.handler";

const router = Router();

router.get("/", HealthHandler.check);

export default router;
