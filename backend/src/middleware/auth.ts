import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/tokens";

export function requireAuth(accessSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.header("authorization") ?? "";
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      res.status(401).json({ error: { message: "Missing bearer token" } });
      return;
    }
    try {
      const { userId } = verifyAccessToken(match[1], accessSecret);
      req.userId = userId;
      next();
    } catch {
      res.status(401).json({ error: { message: "Invalid token" } });
    }
  };
}
