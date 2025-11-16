import { Request, Response } from "express";
import {
  LoginRequestSchema,
  RegisterRequestSchema,
} from "@/schemas/auth.schema";

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const parsed = LoginRequestSchema.parse(req.body);

    // auth logic
    // butuh 2 handler (2x request) rupanya:
    //    1. minta nonce dari server (butuh mekanisme untuk memastikan nonce unik per request, mencegah replay attack)
    //    2. kirim signed nonce untuk verifikasi

    res.status(200).json({ message: "Login successful", token: "dummy-token" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const parsed = RegisterRequestSchema.parse(req.body);

    // registration logic
    // simple, tinggal cek username ada/tidak, lalu simpan public keynya

    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    res.status(400).json({ error });
  }
};
