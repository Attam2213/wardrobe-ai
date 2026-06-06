import { Client } from "minio";
import { randomUUID } from "node:crypto";

export type MinioConfig = {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
};

export function createMinioClient(cfg: MinioConfig): Client {
  return new Client({
    endPoint: cfg.endPoint,
    port: cfg.port,
    useSSL: cfg.useSSL,
    accessKey: cfg.accessKey,
    secretKey: cfg.secretKey,
  });
}

export async function ensureBucket(client: Client, bucket: string): Promise<void> {
  const exists = await client.bucketExists(bucket);
  if (!exists) {
    await client.makeBucket(bucket);
  }
}

export function guessExtension(contentType: string): string {
  const ct = contentType.toLowerCase();
  if (ct === "image/jpeg") return "jpg";
  if (ct === "image/png") return "png";
  if (ct === "image/webp") return "webp";
  if (ct === "image/gif") return "gif";
  return "bin";
}

export function normalizeBase64(input: string): { data: Buffer } {
  const match = input.match(/^data:.*?;base64,(.+)$/);
  const base64 = match ? match[1] : input;
  return { data: Buffer.from(base64, "base64") };
}

export async function uploadUserImage(params: {
  client: Client;
  bucket: string;
  userId: string;
  contentType: string;
  base64: string;
}): Promise<{ objectKey: string; presignedUrl: string }> {
  const ext = guessExtension(params.contentType);
  const objectKey = `wardrobe-items/${params.userId}/${randomUUID()}.${ext}`;
  const { data } = normalizeBase64(params.base64);

  await ensureBucket(params.client, params.bucket);
  await params.client.putObject(params.bucket, objectKey, data, data.length, {
    "Content-Type": params.contentType,
  });

  const presignedUrl = await params.client.presignedGetObject(params.bucket, objectKey, 60 * 60);
  return { objectKey, presignedUrl };
}
