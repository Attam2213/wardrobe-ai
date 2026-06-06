import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

function dbDown(res: { status: (code: number) => any }) {
  return res.status(503).json({ error: { message: "Database unavailable" } });
}

export function userRouter(params: { prisma: PrismaClient }) {
  const router = Router();

  router.get("/profile", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }
    let user:
      | {
          id: string;
          email: string | null;
          username: string | null;
          avatarUrl: string | null;
          geoLatitude: number | null;
          geoLongitude: number | null;
          createdAt: Date;
        }
      | null
      | undefined;
    try {
      user = await params.prisma.user.findFirst({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          geoLatitude: true,
          geoLongitude: true,
          createdAt: true,
        },
      });
    } catch {
      dbDown(res);
      return;
    }
    if (!user) {
      res.status(404).json({ error: { message: "User not found" } });
      return;
    }
    res.status(200).json({ user });
  });

  router.put("/profile", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }
    const body = z
      .object({
        username: z.string().min(1).optional(),
        avatarUrl: z.string().url().optional(),
        geoLatitude: z.number().finite().optional(),
        geoLongitude: z.number().finite().optional(),
      })
      .safeParse(req.body);

    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }

    let user:
      | {
          id: string;
          email: string | null;
          username: string | null;
          avatarUrl: string | null;
          geoLatitude: number | null;
          geoLongitude: number | null;
          createdAt: Date;
        }
      | null
      | undefined;
    try {
      user = await params.prisma.user.update({
        where: { id: userId },
        data: body.data,
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          geoLatitude: true,
          geoLongitude: true,
          createdAt: true,
        },
      });
    } catch {
      dbDown(res);
      return;
    }

    res.status(200).json({ user });
  });

  return router;
}
