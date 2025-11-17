import { Router } from "express";
import { AuthHandler } from "@/handlers/auth.handler";

const router = Router();

router.post("/challenge", AuthHandler.challenge);
router.post("/login", AuthHandler.login);
router.post("/register", AuthHandler.register);

export default router;
