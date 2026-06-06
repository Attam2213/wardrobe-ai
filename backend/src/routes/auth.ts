import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../lib/password";
import { issueTokens, verifyRefreshToken } from "../lib/tokens";

function dbDown(res: { status: (code: number) => any }) {
  return res.status(503).json({ error: { message: "Database unavailable" } });
}

export function authRouter(params: {
  prisma: PrismaClient;
  accessSecret: string;
  refreshSecret: string;
}) {
  const router = Router();

  router.post("/register", async (req, res) => {
    const minPasswordLen = process.env.NODE_ENV === "production" ? 8 : 1;
    const body = z
      .object({
        login: z.string().min(1),
        password: z.string().min(minPasswordLen),
        username: z.string().min(1).optional(),
      })
      .safeParse(req.body);

    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }

    const login = body.data.login.trim();
    const isEmail = login.includes("@");
    const email = isEmail ? login.toLowerCase() : null;
    const username = !isEmail ? login : body.data.username?.trim() || null;

    if (!email && !username) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }

    try {
      if (email) {
        const exists = await params.prisma.user.findFirst({ where: { email } });
        if (exists) {
          res.status(409).json({ error: { message: "Email already registered" } });
          return;
        }
      } else if (username) {
        const exists = await params.prisma.user.findFirst({ where: { username } });
        if (exists) {
          res.status(409).json({ error: { message: "Username already registered" } });
          return;
        }
      }
    } catch {
      dbDown(res);
      return;
    }

    const passwordHash = await hashPassword(body.data.password);
    let user: { id: string; email: string | null; username: string | null; createdAt: Date };
    try {
      user = await params.prisma.user.create({
        data: {
          email,
          passwordHash,
          username,
        },
        select: { id: true, email: true, username: true, createdAt: true },
      });
    } catch {
      dbDown(res);
      return;
    }

    const tokens = issueTokens({
      userId: user.id,
      accessSecret: params.accessSecret,
      refreshSecret: params.refreshSecret,
    });
    try {
      await params.prisma.refreshToken.create({
        data: { id: tokens.refreshTokenId, userId: user.id, expiresAt: tokens.refreshExpiresAt },
      });
    } catch {
      dbDown(res);
      return;
    }

    res.status(201).json({ user, tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } });
  });

  router.post("/login", async (req, res) => {
    const body = z
      .object({
        login: z.string().min(1),
        password: z.string().min(1),
      })
      .safeParse(req.body);

    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }

    const login = body.data.login.trim();
    const isEmail = login.includes("@");
    let user:
      | { id: string; email: string | null; username: string | null; passwordHash: string | null; createdAt: Date }
      | null
      | undefined;
    try {
      user = await params.prisma.user.findFirst({
        where: isEmail ? { email: login.toLowerCase() } : { username: login },
        select: { id: true, email: true, username: true, passwordHash: true, createdAt: true },
      });
    } catch {
      dbDown(res);
      return;
    }
    if (!user?.passwordHash) {
      res.status(401).json({ error: { message: "Invalid credentials" } });
      return;
    }

    const ok = await verifyPassword(body.data.password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: { message: "Invalid credentials" } });
      return;
    }

    const tokens = issueTokens({
      userId: user.id,
      accessSecret: params.accessSecret,
      refreshSecret: params.refreshSecret,
    });
    try {
      await params.prisma.refreshToken.create({
        data: { id: tokens.refreshTokenId, userId: user.id, expiresAt: tokens.refreshExpiresAt },
      });
    } catch {
      dbDown(res);
      return;
    }

    res.status(200).json({
      user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
      tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    });
  });

  router.post("/refresh", async (req, res) => {
    const body = z
      .object({
        refreshToken: z.string().min(1),
      })
      .safeParse(req.body);

    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }

    let parsed;
    try {
      parsed = verifyRefreshToken(body.data.refreshToken, params.refreshSecret);
    } catch {
      res.status(401).json({ error: { message: "Invalid refresh token" } });
      return;
    }

    let record:
      | { id: string; userId: string; expiresAt: Date; revokedAt: Date | null; createdAt: Date }
      | null
      | undefined;
    try {
      record = await params.prisma.refreshToken.findFirst({
        where: { id: parsed.refreshTokenId, userId: parsed.userId },
      });
    } catch {
      dbDown(res);
      return;
    }
    if (!record || record.revokedAt || record.expiresAt.getTime() < Date.now()) {
      res.status(401).json({ error: { message: "Refresh token expired" } });
      return;
    }

    try {
      await params.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
      });
    } catch {
      dbDown(res);
      return;
    }

    const tokens = issueTokens({
      userId: parsed.userId,
      accessSecret: params.accessSecret,
      refreshSecret: params.refreshSecret,
    });
    try {
      await params.prisma.refreshToken.create({
        data: { id: tokens.refreshTokenId, userId: parsed.userId, expiresAt: tokens.refreshExpiresAt },
      });
    } catch {
      dbDown(res);
      return;
    }

    res.status(200).json({ tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } });
  });

  return router;
}
