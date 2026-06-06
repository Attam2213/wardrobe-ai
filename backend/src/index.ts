import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "./middleware/auth";
import { authRouter } from "./routes/auth";
import { userRouter } from "./routes/user";
import { wardrobeRouter } from "./routes/wardrobe";
import { outfitsRouter } from "./routes/outfits";
import { weatherRouter } from "./routes/weather";
import { hashPassword } from "./lib/password";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1).default("file:./prisma/dev.db"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  MINIO_ENDPOINT: z.string().min(1).default("localhost"),
  MINIO_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_USE_SSL: z.coerce.boolean().optional().default(false),
  MINIO_ACCESS_KEY: z.string().min(1).default("minio"),
  MINIO_SECRET_KEY: z.string().min(1).default("minio_password_please_change"),
  MINIO_BUCKET: z.string().min(1).default("wardrobe"),
  OPENWEATHER_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().optional().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().optional().default("gemma4:e2b"),
  JWT_ACCESS_SECRET: z.string().min(16).optional(),
  JWT_REFRESH_SECRET: z.string().min(16).optional(),
});

const env = EnvSchema.parse(process.env);
const accessSecret =
  env.JWT_ACCESS_SECRET ??
  (env.NODE_ENV === "production" ? (() => { throw new Error("JWT_ACCESS_SECRET is required"); })() : "dev_jwt_access_secret_please_change_1234");
const refreshSecret =
  env.JWT_REFRESH_SECRET ??
  (env.NODE_ENV === "production" ? (() => { throw new Error("JWT_REFRESH_SECRET is required"); })() : "dev_jwt_refresh_secret_please_change_1234");

const prisma = new PrismaClient({
  datasources: { db: { url: env.DATABASE_URL } },
});

async function ensureAdminUser() {
  if (process.env.SEED_ADMIN !== "1") return;
  const isProd = process.env.NODE_ENV === "production";
  const adminPassword = isProd ? process.env.ADMIN_PASSWORD : process.env.ADMIN_PASSWORD ?? "admin";
  if (!adminPassword || adminPassword.length < (isProd ? 10 : 1)) return;
  try {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.upsert({
      where: { username: "admin" },
      update: { passwordHash },
      create: { username: "admin", passwordHash },
    });
  } catch {}
}

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.use("/app", express.static(path.join(__dirname, "..", "public")));

app.get("/app", (req, res) => {
  res.redirect(302, "/app/");
});

app.get("/style.css", (req, res) => {
  res.redirect(302, "/app/style.css");
});

app.get("/app.js", (req, res) => {
  res.redirect(302, "/app/app.js");
});

app.get("/", (req, res) => {
  res.redirect(302, "/app/");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "wardrobe-ai-api",
    uptime_s: Math.floor(process.uptime()),
    time: new Date().toISOString(),
  });
});

app.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true, db: "ok" });
  } catch (e) {
    res.status(503).json({ ok: false, db: "down" });
  }
});

app.use(
  "/api/auth",
  authRouter({
    prisma,
    accessSecret,
    refreshSecret,
  }),
);

app.use("/api/user", requireAuth(accessSecret), userRouter({ prisma }));
app.use(
  "/api/wardrobe",
  requireAuth(accessSecret),
  wardrobeRouter({
    prisma,
    minio: {
      endPoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      useSSL: env.MINIO_USE_SSL,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
      bucket: env.MINIO_BUCKET,
    },
  }),
);
app.use(
  "/api/outfits",
  requireAuth(accessSecret),
  outfitsRouter({
    prisma,
    ollama: {
      baseUrl: env.OLLAMA_BASE_URL,
      model: env.OLLAMA_MODEL,
    },
  }),
);
app.use(
  "/api/weather",
  requireAuth(accessSecret),
  weatherRouter({ prisma, openWeatherApiKey: env.OPENWEATHER_API_KEY }),
);

app.use((req, res) => {
  res.status(404).json({ error: { message: "Not found" } });
});

async function start() {
  await ensureAdminUser();
  const maxRetries = process.env.NODE_ENV === "production" ? 0 : 10;
  const retryDelayMs = 400;

  const listenAttempt = (attempt: number) => {
    const server = app.listen(env.PORT, () => {
      process.stdout.write(`API listening on :${env.PORT}\n`);
    });
    server.on("error", (err: any) => {
      if (err && err.code === "EADDRINUSE" && attempt < maxRetries) {
        setTimeout(() => listenAttempt(attempt + 1), retryDelayMs);
        return;
      }
      process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
      process.exit(1);
    });
  };

  listenAttempt(0);
}

start().catch((e) => {
  process.stderr.write(`${e instanceof Error ? e.message : String(e)}\n`);
  process.exit(1);
});
