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

function openMeteoCodeToText(code: number): { condition: string; description: string } {
  if (code === 0) return { condition: "Clear", description: "ясно" };
  if (code >= 1 && code <= 3) return { condition: "Clouds", description: "облачно" };
  if (code === 45 || code === 48) return { condition: "Fog", description: "туман" };
  if (code >= 51 && code <= 57) return { condition: "Drizzle", description: "морось" };
  if (code >= 61 && code <= 67) return { condition: "Rain", description: "дождь" };
  if (code >= 71 && code <= 77) return { condition: "Snow", description: "снег" };
  if (code >= 80 && code <= 82) return { condition: "Rain", description: "ливень" };
  if (code >= 85 && code <= 86) return { condition: "Snow", description: "снегопад" };
  if (code === 95) return { condition: "Thunderstorm", description: "гроза" };
  if (code === 96 || code === 99) return { condition: "Thunderstorm", description: "гроза с градом" };
  return { condition: "Unknown", description: `код погоды ${code}` };
}

async function fetchOpenMeteoWeather(lat: number, lng: number) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("timezone", "auto");

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`Open-Meteo upstream error: ${await resp.text()}`);

  const data = (await resp.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
  };
  const temperature = data.current?.temperature_2m ?? null;
  const code = typeof data.current?.weather_code === "number" ? data.current.weather_code : null;
  const mapped = code == null ? { condition: null, description: null } : openMeteoCodeToText(code);

  return {
    locationName: null,
    temperature,
    condition: mapped.condition,
    description: mapped.description,
    forecast: null,
  };
}

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
      try {
        const out = await fetchOpenMeteoWeather(lat, lng);
        res.status(200).json({ ...out, provider: "open-meteo" });
      } catch (e) {
        res.status(502).json({ error: { message: e instanceof Error ? e.message : "Weather request failed" } });
      }
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
        throw new Error(`OpenWeather upstream error: ${await resp.text()}`);
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
        provider: "openweather",
      });
    } catch (e) {
      try {
        const out = await fetchOpenMeteoWeather(lat, lng);
        res.status(200).json({ ...out, provider: "open-meteo" });
      } catch (e2) {
        res.status(502).json({ error: { message: e2 instanceof Error ? e2.message : "Weather request failed" } });
      }
    }
  });

  return router;
}
