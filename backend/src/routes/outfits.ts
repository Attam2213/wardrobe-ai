import { Router } from "express";
import { PrismaClient, WardrobeItemType, type WardrobeItem } from "@prisma/client";
import { z } from "zod";
import { ollamaChat, type OllamaConfig } from "../services/ollama";

function dbDown(res: { status: (code: number) => any }) {
  return res.status(503).json({ error: { message: "Database unavailable" } });
}

const OutfitCreateSchema = z.object({
  name: z.string().min(1).optional(),
  itemIds: z.array(z.string().min(1)).min(1),
  wornDate: z.string().datetime().optional(),
  weatherCondition: z.string().min(1).optional(),
  occasion: z.string().min(1).optional(),
  aiGenerated: z.boolean().optional(),
});

const OutfitFeedbackSchema = z.object({
  feedback: z.enum(["like", "dislike"]),
  reason: z.string().min(1).max(80).optional(),
});

const OutfitSuggestSchema = z.object({
  temperature: z.number().finite(),
  condition: z.string().min(1),
  occasion: z.string().min(1).optional(),
});

const ShoppingListSchema = OutfitSuggestSchema;

const LlmOutfitSchema = z.object({
  itemIds: z.array(z.string().min(1)).min(1),
  explanation: z.string().min(1),
});

function pickFirst(items: WardrobeItem[], type: WardrobeItemType): WardrobeItem | null {
  return items.find((i) => i.type === type) ?? null;
}

function normalizeSeason(v: unknown): "winter" | "spring" | "summer" | "autumn" | "all" | null {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "winter" || s === "spring" || s === "summer" || s === "autumn" || s === "all") return s;
  return null;
}

function normalizeWarmth(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  if (i < 1 || i > 5) return null;
  return i;
}

function seasonForToday(): "winter" | "spring" | "summer" | "autumn" {
  const m = new Date().getMonth() + 1;
  if (m === 12 || m === 1 || m === 2) return "winter";
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  return "autumn";
}

function targetWarmthForTempC(t: number): number {
  if (t <= 0) return 5;
  if (t <= 5) return 4;
  if (t <= 10) return 3;
  if (t <= 15) return 2;
  return 1;
}

function seasonAdjRu(season: "winter" | "spring" | "summer" | "autumn") {
  if (season === "winter") return "зимняя";
  if (season === "spring") return "весенняя";
  if (season === "summer") return "летняя";
  return "осенняя";
}

function typeLabelRu(type: WardrobeItemType) {
  const m: Record<string, string> = {
    shirt: "рубашка",
    pants: "штаны",
    jacket: "куртка",
    shoes: "обувь",
    accessories: "аксессуар",
    other: "вещь",
  };
  return m[String(type)] ?? "вещь";
}

function makeShoppingNeeds(params: {
  items: WardrobeItem[];
  temperature: number;
  condition: string;
}): Array<{ title: string; query: string; reason: string }> {
  const season = seasonForToday();
  const seasonAdj = seasonAdjRu(season);
  const targetWarmth = targetWarmthForTempC(params.temperature);
  const isCold = params.temperature <= 15;
  const isRain = params.condition.toLowerCase().includes("rain");

  const countByType = new Map<WardrobeItemType, number>();
  for (const i of params.items) {
    countByType.set(i.type, (countByType.get(i.type) ?? 0) + 1);
  }

  const needs: Array<{ title: string; query: string; reason: string }> = [];

  const must: WardrobeItemType[] = [WardrobeItemType.shirt, WardrobeItemType.pants, WardrobeItemType.shoes];
  for (const t of must) {
    if ((countByType.get(t) ?? 0) > 0) continue;
    needs.push({
      title: `Нет категории: ${typeLabelRu(t)}`,
      query: `${typeLabelRu(t)} ${seasonAdj}`.trim(),
      reason: "В гардеробе нет этой категории.",
    });
  }

  if (isCold || isRain) {
    const jackets = params.items.filter((i) => i.type === WardrobeItemType.jacket);
    if (jackets.length === 0) {
      needs.push({
        title: "Нужна куртка",
        query: `куртка ${seasonAdj} тёплая`.trim(),
        reason: "Холодно/дождливо — лучше верхний слой.",
      });
    } else {
      const warmths = jackets
        .map((j) => normalizeWarmth((j as any).warmth))
        .filter((x): x is number => x != null);
      const bestWarmth = warmths.length ? Math.max(...warmths) : 0;
      if (bestWarmth > 0 && bestWarmth + 1 < targetWarmth) {
        needs.push({
          title: "Более тёплая куртка",
          query: `куртка ${seasonAdj} тёплая теплота ${targetWarmth}`.trim(),
          reason: "Есть куртка, но по теплоте может не хватить.",
        });
      }
    }
  }

  return needs;
}

function pickBestByType(params: {
  items: WardrobeItem[];
  type: WardrobeItemType;
  season: "winter" | "spring" | "summer" | "autumn";
  targetWarmth: number;
  dislikedItemIds?: Set<string>;
  likedItemIds?: Set<string>;
}): WardrobeItem | null {
  const candidates = params.items.filter((i) => i.type === params.type);
  if (candidates.length === 0) return null;

  let best = candidates[0];
  let bestScore = -1e9;
  for (const i of candidates) {
    let score = 0;
    if (params.dislikedItemIds?.has(i.id)) score -= 100;
    if (params.likedItemIds?.has(i.id)) score += 4;
    const s = normalizeSeason((i as any).season);
    if (!s) score += 1;
    else if (s === "all") score += 3;
    else if (s === params.season) score += 3;
    else score -= 1;

    const w = normalizeWarmth((i as any).warmth);
    if (w == null) score += 1;
    else score += 6 - Math.abs(w - params.targetWarmth);

    const color = String((i as any).color ?? "").trim();
    if (color) score += 0.25;
    const material = String((i as any).material ?? "").trim();
    if (material) score += 0.25;

    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

function buildSuggestedOutfit(params: {
  items: WardrobeItem[];
  temperature: number;
  condition: string;
  occasion?: string;
  dislikedItemIds?: Set<string>;
  likedItemIds?: Set<string>;
}): { items: WardrobeItem[]; explanation: string } {
  const selected: WardrobeItem[] = [];

  const season = seasonForToday();
  const targetWarmth = targetWarmthForTempC(params.temperature);

  const shirt = pickBestByType({
    items: params.items,
    type: WardrobeItemType.shirt,
    season,
    targetWarmth,
    dislikedItemIds: params.dislikedItemIds,
    likedItemIds: params.likedItemIds,
  });
  if (shirt) selected.push(shirt);

  const pants = pickBestByType({
    items: params.items,
    type: WardrobeItemType.pants,
    season,
    targetWarmth,
    dislikedItemIds: params.dislikedItemIds,
    likedItemIds: params.likedItemIds,
  });
  if (pants) selected.push(pants);

  const shoes = pickBestByType({
    items: params.items,
    type: WardrobeItemType.shoes,
    season,
    targetWarmth,
    dislikedItemIds: params.dislikedItemIds,
    likedItemIds: params.likedItemIds,
  });
  if (shoes) selected.push(shoes);

  const isCold = params.temperature <= 15;
  const isVeryCold = params.temperature <= 5;
  const isRain = params.condition.toLowerCase().includes("rain");

  if (isCold || isRain) {
    const jacket = pickBestByType({
      items: params.items,
      type: WardrobeItemType.jacket,
      season,
      targetWarmth,
      dislikedItemIds: params.dislikedItemIds,
      likedItemIds: params.likedItemIds,
    });
    if (jacket) selected.push(jacket);
  }

  const accessories = pickBestByType({
    items: params.items,
    type: WardrobeItemType.accessories,
    season,
    targetWarmth,
    dislikedItemIds: params.dislikedItemIds,
    likedItemIds: params.likedItemIds,
  });
  if (accessories && selected.length < 4) selected.push(accessories);

  const explanationParts: string[] = [];
  explanationParts.push(`Температура: ${params.temperature}°C`);
  explanationParts.push(`Погода: ${params.condition}`);
  explanationParts.push(`Сезон: ${season}`);
  if (params.occasion) explanationParts.push(`Повод: ${params.occasion}`);
  if (isVeryCold) explanationParts.push("Добавил(а) верхнюю одежду из-за холода.");
  else if (isCold) explanationParts.push("Можно накинуть верхнюю одежду, чтобы было комфортно.");
  if (isRain) explanationParts.push("Учитываю дождь — лучше с курткой.");

  if (selected.length === 0) {
    return {
      items: [],
      explanation: "В гардеробе пока нет вещей, чтобы собрать образ. Добавь хотя бы рубашку/штаны/обувь.",
    };
  }

  return { items: selected, explanation: explanationParts.join(" ") };
}

export function outfitsRouter(params: { prisma: PrismaClient; ollama?: OllamaConfig }) {
  const router = Router();

  router.get("/", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }
    let outfits;
    try {
      outfits = await params.prisma.outfit.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      dbDown(res);
      return;
    }
    const normalized = outfits.map((o: any) => {
      try {
        return { ...o, items: JSON.parse(o.items) };
      } catch {
        return o;
      }
    });
    res.status(200).json({ outfits: normalized });
  });

  router.post("/", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }
    const body = OutfitCreateSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }
    let outfit;
    try {
      outfit = await params.prisma.outfit.create({
        data: {
          userId,
          name: body.data.name,
          items: JSON.stringify(body.data.itemIds),
          wornDate: body.data.wornDate ? new Date(body.data.wornDate) : undefined,
          weatherCondition: body.data.weatherCondition,
          occasion: body.data.occasion,
          aiGenerated: body.data.aiGenerated ?? false,
        },
      });
    } catch {
      dbDown(res);
      return;
    }
    res.status(201).json({ outfit: { ...outfit, items: body.data.itemIds } });
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
      existing = await params.prisma.outfit.findFirst({ where: { id, userId } });
    } catch {
      dbDown(res);
      return;
    }
    if (!existing) {
      res.status(404).json({ error: { message: "Outfit not found" } });
      return;
    }
    try {
      await params.prisma.outfit.delete({ where: { id } });
    } catch {
      dbDown(res);
      return;
    }
    res.status(204).end();
  });

  router.patch("/:id/feedback", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }
    const id = req.params.id;
    const body = OutfitFeedbackSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }

    let existing;
    try {
      existing = await params.prisma.outfit.findFirst({ where: { id, userId } });
    } catch {
      dbDown(res);
      return;
    }
    if (!existing) {
      res.status(404).json({ error: { message: "Outfit not found" } });
      return;
    }

    const v = body.data.feedback === "like" ? 1 : -1;
    let updated;
    try {
      updated = await params.prisma.outfit.update({
        where: { id },
        data: {
          userFeedback: v,
          feedbackReason: body.data.reason,
          feedbackAt: new Date(),
        },
      });
    } catch {
      dbDown(res);
      return;
    }
    res.status(200).json({ outfit: updated });
  });

  router.post("/shopping-list", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }
    const body = ShoppingListSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }

    let wardrobeItems;
    try {
      wardrobeItems = await params.prisma.wardrobeItem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      dbDown(res);
      return;
    }

    const needs = makeShoppingNeeds({
      items: wardrobeItems,
      temperature: body.data.temperature,
      condition: body.data.condition,
    });

    res.status(200).json({
      needs,
      meta: { season: seasonForToday(), targetWarmth: targetWarmthForTempC(body.data.temperature) },
    });
  });

  router.post("/ai-suggest", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }

    const body = OutfitSuggestSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: { message: "Invalid payload" } });
      return;
    }

    let wardrobeItems;
    try {
      wardrobeItems = await params.prisma.wardrobeItem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      dbDown(res);
      return;
    }

    let feedbackOutfits: Array<{ items: string; userFeedback: number | null }> = [];
    try {
      feedbackOutfits = await params.prisma.outfit.findMany({
        where: { userId, userFeedback: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { items: true, userFeedback: true },
      });
    } catch {
      feedbackOutfits = [];
    }

    const likedItemIds = new Set<string>();
    const dislikedItemIds = new Set<string>();
    for (const o of feedbackOutfits) {
      let ids: unknown = null;
      try {
        ids = JSON.parse(o.items);
      } catch {
        ids = null;
      }
      if (!Array.isArray(ids)) continue;
      for (const id of ids) {
        if (typeof id !== "string") continue;
        if (o.userFeedback === 1) likedItemIds.add(id);
        if (o.userFeedback === -1) dislikedItemIds.add(id);
      }
    }

    if (!params.ollama) {
      const suggestion = buildSuggestedOutfit({
        items: wardrobeItems,
        temperature: body.data.temperature,
        condition: body.data.condition,
        occasion: body.data.occasion,
        likedItemIds,
        dislikedItemIds,
      });
      res.status(200).json({
        items: suggestion.items,
        explanation: suggestion.explanation,
        provider: "heuristic",
      });
      return;
    }

    const itemsForPrompt = wardrobeItems.map((i) => ({
      id: i.id,
      name: i.name,
      type: i.type,
      color: i.color ?? null,
      material: i.material ?? null,
      brand: (i as any).brand ?? null,
      size: i.size ?? null,
      season: (i as any).season ?? null,
      warmth: (i as any).warmth ?? null,
      style: (i as any).style ?? null,
    }));

    const system = [
      "You are a wardrobe stylist assistant for a mobile app.",
      "Select the best outfit from the provided wardrobe items given weather and optional occasion.",
      "Use feedback.likedItemIds as a weak preference and feedback.dislikedItemIds as a strong avoidance signal.",
      "Return ONLY valid JSON with keys: itemIds (array of item ids), explanation (string).",
      "Do not include any extra keys, markdown, or commentary.",
      "itemIds must reference existing ids from the input list.",
    ].join(" ");

    const user = JSON.stringify(
      {
        weather: {
          temperatureC: body.data.temperature,
          condition: body.data.condition,
        },
        inferredSeason: seasonForToday(),
        targetWarmth: targetWarmthForTempC(body.data.temperature),
        occasion: body.data.occasion ?? null,
        wardrobeItems: itemsForPrompt,
        feedback: {
          likedItemIds: Array.from(likedItemIds),
          dislikedItemIds: Array.from(dislikedItemIds),
        },
        constraints: {
          maxItems: 4,
          mustIncludeTypes: ["shirt", "pants", "shoes"],
          ifColdOrRainPreferJacket: true,
        },
      },
      null,
      2,
    );

    try {
      const content = await ollamaChat({ cfg: params.ollama, system, user });
      const jsonText = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
      const parsed = LlmOutfitSchema.safeParse(JSON.parse(jsonText));
      if (!parsed.success) {
        throw new Error("LLM returned invalid JSON shape");
      }

      const idSet = new Set(wardrobeItems.map((i) => i.id));
      const pickedIds = parsed.data.itemIds.filter((id) => idSet.has(id));
      const picked = wardrobeItems.filter((i) => pickedIds.includes(i.id));
      if (picked.length === 0) {
        throw new Error("LLM did not select any valid item ids");
      }

      res.status(200).json({ items: picked, explanation: parsed.data.explanation, provider: "ollama" });
    } catch {
      const fallback = buildSuggestedOutfit({
        items: wardrobeItems,
        temperature: body.data.temperature,
        condition: body.data.condition,
        occasion: body.data.occasion,
        likedItemIds,
        dislikedItemIds,
      });
      res.status(200).json({ items: fallback.items, explanation: fallback.explanation, provider: "heuristic" });
    }
  });

  return router;
}
