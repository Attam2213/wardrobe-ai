import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

export type Tokens = {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
  refreshExpiresAt: Date;
};

export function issueTokens(params: {
  userId: string;
  accessSecret: string;
  refreshSecret: string;
  accessTtlSeconds?: number;
  refreshTtlDays?: number;
}): Tokens {
  const accessTtlSeconds = params.accessTtlSeconds ?? 15 * 60;
  const refreshTtlDays = params.refreshTtlDays ?? 30;

  const refreshTokenId = randomUUID();
  const refreshExpiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);

  const accessToken = jwt.sign(
    { sub: params.userId, typ: "access" },
    params.accessSecret,
    { expiresIn: accessTtlSeconds },
  );

  const refreshToken = jwt.sign(
    { sub: params.userId, typ: "refresh", jti: refreshTokenId },
    params.refreshSecret,
    { expiresIn: `${refreshTtlDays}d` },
  );

  return { accessToken, refreshToken, refreshTokenId, refreshExpiresAt };
}

export function verifyAccessToken(token: string, accessSecret: string): { userId: string } {
  const decoded = jwt.verify(token, accessSecret) as { sub?: string; typ?: string };
  if (decoded.typ !== "access" || !decoded.sub) {
    throw new Error("Invalid access token");
  }
  return { userId: decoded.sub };
}

export function verifyRefreshToken(
  token: string,
  refreshSecret: string,
): { userId: string; refreshTokenId: string } {
  const decoded = jwt.verify(token, refreshSecret) as { sub?: string; typ?: string; jti?: string };
  if (decoded.typ !== "refresh" || !decoded.sub || !decoded.jti) {
    throw new Error("Invalid refresh token");
  }
  return { userId: decoded.sub, refreshTokenId: decoded.jti };
}
