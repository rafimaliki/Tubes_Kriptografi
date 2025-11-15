import { Router } from "express";
import { healthCheckHandler } from "../handlers/health";

const router = Router();

router.get("/", healthCheckHandler);

export default router;
