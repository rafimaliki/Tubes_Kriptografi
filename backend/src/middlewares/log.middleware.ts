import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const now = new Date().toLocaleString();

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(`
[${now}] ${req.method} ${req.originalUrl}
- Status: ${res.statusCode}
- IP: ${req.ip}
- Authorization: ${req.headers.authorization || "None"}
- User-Id: ${(req as any).user ? (req as any).user.user_id : "None"}
- Query: ${JSON.stringify(req.query)}
- Params: ${JSON.stringify(req.params)}
- Body: ${JSON.stringify(req.body)}
- Time: ${duration}ms
    `);
  });

  next();
}
