import { Request, Response } from "express";
import { verifyJwt } from "@/lib/jwt";

export function JwtMiddleware(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized - Invalid or missing Bearer token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyJwt(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
