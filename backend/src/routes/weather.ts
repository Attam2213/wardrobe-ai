import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

function dbDown(res: { status: (code: number) => any }) {
  return res.status(503).json({ error: { message: "Database unavailable" } });
}

const QuerySchema = z.object({
  lat: z.coerce.number().finite().optional(),
  lng: z.coerce.number().finite().optional(),
});

export function weatherRouter(params: { prisma: PrismaClient; openWeatherApiKey?: string }) {
  const router = Router();

  router.get("/", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const query = QuerySchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: { message: "Invalid query" } });
      return;
    }

    let lat = query.data.lat;
    let lng = query.data.lng;

    if (lat === undefined || lng === undefined) {
      let user;
      try {
        user = await params.prisma.user.findFirst({
          where: { id: userId },
          select: { geoLatitude: true, geoLongitude: true },
        });
      } catch {
        dbDown(res);
        return;
      }
      lat = user?.geoLatitude ?? undefined;
      lng = user?.geoLongitude ?? undefined;
    }

    if (lat === undefined || lng === undefined) {
      res.status(400).json({ error: { message: "Missing lat/lng" } });
      return;
    }

    if (!params.openWeatherApiKey) {
      res.status(501).json({ error: { message: "OPENWEATHER_API_KEY is not configured" } });
      return;
    }

    try {
      const url = new URL("https://api.openweathermap.org/data/2.5/weather");
      url.searchParams.set("lat", String(lat));
      url.searchParams.set("lon", String(lng));
      url.searchParams.set("appid", params.openWeatherApiKey);
      url.searchParams.set("units", "metric");

      const resp = await fetch(url.toString());
      if (!resp.ok) {
        const text = await resp.text();
        res.status(502).json({ error: { message: `Weather upstream error: ${text.slice(0, 400)}` } });
        return;
      }

      const data = (await resp.json()) as {
        weather?: Array<{ main?: string; description?: string }>;
        main?: { temp?: number };
        name?: string;
      };

      const temperature = data.main?.temp ?? null;
      const condition = data.weather?.[0]?.main ?? null;
      const description = data.weather?.[0]?.description ?? null;

      res.status(200).json({
        locationName: data.name ?? null,
        temperature,
        condition,
        description,
        forecast: null,
      });
    } catch (e) {
      res.status(502).json({ error: { message: e instanceof Error ? e.message : "Weather request failed" } });
    }
  });

  return router;
}
