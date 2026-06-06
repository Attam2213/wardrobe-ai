import { Router } from "express";
import { PrismaClient, WardrobeItemType } from "@prisma/client";
import { z } from "zod";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import { createMinioClient, uploadUserImage, type MinioConfig } from "../services/minio";

function dbDown(res: { status: (code: number) => any }) {
  return res.status(503).json({ error: { message: "Database unavailable" } });
}

const ItemCreateSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(WardrobeItemType),
  color: z.string().min(1).optional(),
  material: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  size: z.string().min(1).optional(),
  season: z.enum(["winter", "spring", "summer", "autumn", "all"]).optional(),
  warmth: z.number().int().min(1).max(5).optional(),
  style: z.enum(["casual", "sport", "office", "street", "other"]).optional(),
  photoUrl: z.string().url().optional(),
  purchaseDate: z.string().datetime().optional(),
});

const ItemUpdateSchema = ItemCreateSchema.partial();

const UploadSchema = z.object({
  contentType: z.string().min(1),
  imageBase64: z.string().min(1),
  itemId: z.string().min(1).optional(),
});

const SegmentSchema = z.object({
  contentType: z.string().min(1),
  imageBase64: z.string().min(1),
});

export function wardrobeRouter(params: { prisma: PrismaClient; minio: MinioConfig }) {
  const router = Router();
  const minioClient = createMinioClient(params.minio);

  router.get("/", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }
    let items;
    try {
      items = await params.prisma.wardrobeItem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      dbDown(res);
      return;
    }
    res.status(200).json({ items });
  });

  router.post("/", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }
    const body = ItemCreateSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }
    let item;
    try {
      item = await params.prisma.wardrobeItem.create({
        data: {
          userId,
          name: body.data.name,
          type: body.data.type,
          color: body.data.color,
          material: body.data.material,
          brand: body.data.brand,
          size: body.data.size,
          season: body.data.season,
          warmth: body.data.warmth,
          style: body.data.style,
          photoUrl: body.data.photoUrl,
          purchaseDate: body.data.purchaseDate ? new Date(body.data.purchaseDate) : undefined,
        },
      });
    } catch {
      dbDown(res);
      return;
    }
    res.status(201).json({ item });
  });

  router.put("/:id", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }
    const body = ItemUpdateSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }
    const id = req.params.id;
    let existing;
    try {
      existing = await params.prisma.wardrobeItem.findFirst({ where: { id, userId } });
    } catch {
      dbDown(res);
      return;
    }
    if (!existing) {
      res.status(404).json({ error: { message: "Item not found" } });
      return;
    }
    let item;
    try {
      item = await params.prisma.wardrobeItem.update({
        where: { id },
        data: {
          name: body.data.name,
          type: body.data.type,
          color: body.data.color,
          material: body.data.material,
          brand: body.data.brand,
          size: body.data.size,
          season: body.data.season,
          warmth: body.data.warmth,
          style: body.data.style,
          photoUrl: body.data.photoUrl,
          purchaseDate: body.data.purchaseDate ? new Date(body.data.purchaseDate) : undefined,
        },
      });
    } catch {
      dbDown(res);
      return;
    }
    res.status(200).json({ item });
  });

  router.delete("/:id", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }
    const id = req.params.id;
    let existing;
    try {
      existing = await params.prisma.wardrobeItem.findFirst({ where: { id, userId } });
    } catch {
      dbDown(res);
      return;
    }
    if (!existing) {
      res.status(404).json({ error: { message: "Item not found" } });
      return;
    }
    try {
      await params.prisma.wardrobeItem.delete({ where: { id } });
    } catch {
      dbDown(res);
      return;
    }
    res.status(204).end();
  });

  router.post("/upload", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const body = UploadSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }

    try {
      const uploaded = await uploadUserImage({
        client: minioClient,
        bucket: params.minio.bucket,
        userId,
        contentType: body.data.contentType,
        base64: body.data.imageBase64,
      });

      let item = null as unknown;
      if (body.data.itemId) {
        let existing;
        try {
          existing = await params.prisma.wardrobeItem.findFirst({
            where: { id: body.data.itemId, userId },
          });
        } catch {
          dbDown(res);
          return;
        }
        if (!existing) {
          res.status(404).json({ error: { message: "Item not found" } });
          return;
        }
        try {
          item = await params.prisma.wardrobeItem.update({
            where: { id: body.data.itemId },
            data: { photoUrl: uploaded.presignedUrl },
          });
        } catch {
          dbDown(res);
          return;
        }
      }

      res.status(200).json({
        objectKey: uploaded.objectKey,
        photoUrl: uploaded.presignedUrl,
        item,
        provider: "minio",
      });
    } catch (e) {
      const fallbackPhotoUrl = body.data.imageBase64.startsWith("data:")
        ? body.data.imageBase64
        : `data:${body.data.contentType};base64,${body.data.imageBase64}`;

      if (body.data.itemId) {
        let existing;
        try {
          existing = await params.prisma.wardrobeItem.findFirst({
            where: { id: body.data.itemId, userId },
          });
        } catch {
          dbDown(res);
          return;
        }
        if (!existing) {
          res.status(404).json({ error: { message: "Item not found" } });
          return;
        }
        try {
          const item = await params.prisma.wardrobeItem.update({
            where: { id: body.data.itemId },
            data: { photoUrl: fallbackPhotoUrl },
          });
          res.status(200).json({ objectKey: null, photoUrl: fallbackPhotoUrl, item, provider: "inline" });
          return;
        } catch {
          dbDown(res);
          return;
        }
      }

      res.status(200).json({ objectKey: null, photoUrl: fallbackPhotoUrl, item: null, provider: "inline" });
    }
  });

  router.post("/segment", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const body = SegmentSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }

    const base64 = body.data.imageBase64.includes("base64,")
      ? body.data.imageBase64.slice(body.data.imageBase64.indexOf("base64,") + 7)
      : body.data.imageBase64;

    let input: Buffer;
    try {
      input = Buffer.from(base64, "base64");
    } catch {
      res.status(400).json({ error: { message: "Invalid base64" } });
      return;
    }
    if (input.byteLength > 12 * 1024 * 1024) {
      res.status(413).json({ error: { message: "Image too large" } });
      return;
    }

    const python = process.env.SEGMENT_PYTHON || "python3";
    const scriptPath = path.join(process.cwd(), "scripts", "segment.py");
    try {
      await access(scriptPath);
    } catch {
      res.status(501).json({ error: { message: "Segmentation is not configured on this server" } });
      return;
    }

    try {
      const out = await new Promise<Buffer>((resolve, reject) => {
        const child = spawn(python, [scriptPath], { stdio: ["pipe", "pipe", "pipe"] });
        const chunks: Buffer[] = [];
        const errChunks: Buffer[] = [];

        child.stdout.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        child.stderr.on("data", (c) => errChunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        child.on("error", (e) => reject(e));
        child.on("close", (code) => {
          if (code === 0) return resolve(Buffer.concat(chunks));
          const msg = Buffer.concat(errChunks).toString("utf8").slice(0, 600) || `exit ${code ?? "?"}`;
          reject(new Error(msg));
        });

        child.stdin.write(input);
        child.stdin.end();
      });

      if (!out.byteLength) {
        res.status(502).json({ error: { message: "Segmentation failed" } });
        return;
      }

      res.status(200).json({
        contentType: "image/png",
        imageBase64: out.toString("base64"),
        provider: "rembg",
      });
    } catch (e) {
      res.status(502).json({ error: { message: e instanceof Error ? e.message : "Segmentation failed" } });
    }
  });

  return router;
}
