const els = {
  authCard: document.getElementById("authCard"),
  appShell: document.getElementById("appShell"),
  tabLogin: document.getElementById("tabLogin"),
  tabRegister: document.getElementById("tabRegister"),
  authForm: document.getElementById("authForm"),
  authSubmit: document.getElementById("authSubmit"),
  authError: document.getElementById("authError"),
  authHint: document.getElementById("authHint"),
  usernameField: document.getElementById("usernameField"),
  logoutBtn: document.getElementById("logoutBtn"),

  greetingTitle: document.getElementById("greetingTitle"),
  greetingName: document.getElementById("greetingName"),
  topWeatherChip: document.getElementById("topWeatherChip"),

  navButtons: Array.from(document.querySelectorAll(".nav__btn")),
  screens: {
    home: document.getElementById("screenHome"),
    wardrobe: document.getElementById("screenWardrobe"),
    avatar: document.getElementById("screenAvatar"),
    assistant: document.getElementById("screenAssistant"),
    settings: document.getElementById("screenSettings"),
  },

  homeSuggestBtn: document.getElementById("homeSuggestBtn"),
  homeMeta: document.getElementById("homeMeta"),
  homeOutfit: document.getElementById("homeOutfit"),
  homeError: document.getElementById("homeError"),
  goWardrobeBtn: document.getElementById("goWardrobeBtn"),

  refreshBtn: document.getElementById("refreshBtn"),
  addItemBtn: document.getElementById("addItemBtn"),
  filterType: document.getElementById("filterType"),
  itemsList: document.getElementById("itemsList"),
  itemForm: document.getElementById("itemForm"),
  itemError: document.getElementById("itemError"),
  itemPhoto: document.getElementById("itemPhoto"),

  addModal: document.getElementById("addModal"),
  addModalBackdrop: document.getElementById("addModalBackdrop"),
  addCloseBtn: document.getElementById("addCloseBtn"),
  addModalError: document.getElementById("addModalError"),
  addStepPhoto: document.getElementById("addStepPhoto"),
  addStepDetails: document.getElementById("addStepDetails"),
  addPhotoInput: document.getElementById("addPhotoInput"),
  addPhotoPreviewWrap: document.getElementById("addPhotoPreviewWrap"),
  addPhotoPreview: document.getElementById("addPhotoPreview"),
  addAutoColor: document.getElementById("addAutoColor"),
  addCropHint: document.getElementById("addCropHint"),
  addCropCanvas: document.getElementById("addCropCanvas"),
  addCropActions: document.getElementById("addCropActions"),
  addCropResetBtn: document.getElementById("addCropResetBtn"),
  addCutoutBtn: document.getElementById("addCutoutBtn"),
  addCutoutStatus: document.getElementById("addCutoutStatus"),
  addSkipPhotoBtn: document.getElementById("addSkipPhotoBtn"),
  addNextBtn: document.getElementById("addNextBtn"),
  addBackBtn: document.getElementById("addBackBtn"),
  addSaveBtn: document.getElementById("addSaveBtn"),

  weatherForm: document.getElementById("weatherForm"),
  weatherOut: document.getElementById("weatherOut"),
  weatherError: document.getElementById("weatherError"),
  useGpsBtn: document.getElementById("useGpsBtn"),

  suggestForm: document.getElementById("suggestForm"),
  suggestOut: document.getElementById("suggestOut"),
  suggestError: document.getElementById("suggestError"),
  suggestMeta: document.getElementById("suggestMeta"),
  suggestFromWeatherBtn: document.getElementById("suggestFromWeatherBtn"),
  applyToAvatarBtn: document.getElementById("applyToAvatarBtn"),
  feedbackLikeBtn: document.getElementById("feedbackLikeBtn"),
  feedbackDislikeBtn: document.getElementById("feedbackDislikeBtn"),
  feedbackReason: document.getElementById("feedbackReason"),
  feedbackStatus: document.getElementById("feedbackStatus"),
  marketMeta: document.getElementById("marketMeta"),
  marketList: document.getElementById("marketList"),
  shoppingMeta: document.getElementById("shoppingMeta"),
  shoppingList: document.getElementById("shoppingList"),

  avatarStage: document.getElementById("avatarStage"),
  avatarWear: document.getElementById("avatarWear"),
  avatarItems: document.getElementById("avatarItems"),
  avatarClearBtn: document.getElementById("avatarClearBtn"),

  profileOut: document.getElementById("profileOut"),
  profileError: document.getElementById("profileError"),
};

const storage = {
  get accessToken() {
    return localStorage.getItem("accessToken");
  },
  set accessToken(v) {
    if (v) localStorage.setItem("accessToken", v);
    else localStorage.removeItem("accessToken");
  },
  get refreshToken() {
    return localStorage.getItem("refreshToken");
  },
  set refreshToken(v) {
    if (v) localStorage.setItem("refreshToken", v);
    else localStorage.removeItem("refreshToken");
  },
};

const state = {
  screen: "home",
  wardrobeItems: [],
  lastWeather: null,
  lastSuggestion: null,
  lastSuggestionOutfitId: null,
  avatarSelectedIds: new Set(),
  addPhotoFile: null,
  addLastType: null,
  addLastColor: null,
  addLastSeason: null,
  addLastWarmth: null,
  addLastStyle: null,
  addDetectNonce: 0,
  addPhotoPreviewUrl: null,
  addCropRect: null,
  addCropActive: false,
  addCropPointerId: null,
};

function setText(el, text) {
  if (!el) return;
  el.textContent = text ?? "";
}

function show(el, yes) {
  if (!el) return;
  el.classList.toggle("card--hidden", !yes);
}

function setAuthMode(mode) {
  const isRegister = mode === "register";
  els.tabLogin.classList.toggle("tab--active", !isRegister);
  els.tabRegister.classList.toggle("tab--active", isRegister);
  els.usernameField.classList.toggle("field--hidden", !isRegister);
  els.authSubmit.textContent = isRegister ? "Создать аккаунт" : "Войти";
  setText(els.authHint, isRegister ? "Можно использовать email или username." : "");
}

function setScreen(name) {
  state.screen = name;
  for (const [k, el] of Object.entries(els.screens)) {
    if (!el) continue;
    el.classList.toggle("screen--active", k === name);
  }
  for (const btn of els.navButtons) {
    btn.classList.toggle("nav__btn--active", btn.dataset.screen === name);
  }
  if (name === "wardrobe") renderWardrobe().catch(() => {});
  if (name === "avatar") renderAvatar().catch(() => {});
  if (name === "settings") renderProfile().catch(() => {});
}

async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = storage.accessToken;
  if (token) headers.Authorization = `Bearer ${token}`;

  const resp = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (resp.status !== 401) return resp;

  const rt = storage.refreshToken;
  if (!rt) return resp;

  const r2 = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  });

  if (!r2.ok) {
    storage.accessToken = null;
    storage.refreshToken = null;
    return resp;
  }

  const tokens = await r2.json();
  storage.accessToken = tokens.accessToken;
  storage.refreshToken = tokens.refreshToken;

  const headers2 = { "Content-Type": "application/json", Authorization: `Bearer ${storage.accessToken}` };
  return fetch(path, {
    method,
    headers: headers2,
    body: body ? JSON.stringify(body) : undefined,
  });
}

function formatWeatherText(w) {
  return `Локация: ${w.locationName ?? "-"}\nТемпература: ${w.temperature ?? "-"}°C\nУсловие: ${w.condition ?? "-"}\nОписание: ${w.description ?? "-"}`;
}

function formatOutfitText(items, explanation) {
  const lines = [];
  if (explanation) lines.push(explanation);
  lines.push("");
  lines.push("Вещи:");
  for (const i of items) {
    lines.push(`- ${i.name} (${i.type}${i.color ? `, ${i.color}` : ""})`);
  }
  return lines.join("\n").trim();
}

function marketplaceSearchUrl(market, query) {
  const q = encodeURIComponent(String(query ?? "").trim());
  if (!q) return null;
  if (market === "wb") return `https://www.wildberries.ru/catalog/0/search.aspx?search=${q}`;
  if (market === "ozon") return `https://www.ozon.ru/search/?text=${q}`;
  return null;
}

function buildMarketplaceQuery(item) {
  const name = String(item?.name ?? "").trim();
  const type = String(item?.type ?? "").trim();
  const color = String(item?.color ?? "").trim();
  const base = name || autoItemName({ type, color }) || "";
  const brand = String(item?.brand ?? "").trim();
  const material = String(item?.material ?? "").trim();
  const season = String(item?.season ?? "").trim();
  const style = String(item?.style ?? "").trim();

  const parts = [base, brand, material, style, season].map((s) => String(s || "").trim()).filter(Boolean);
  return parts.join(" ").trim() || "одежда";
}

function renderMarketplace(items) {
  if (!els.marketList) return;
  els.marketList.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    setText(els.marketMeta, "Подбери образ — и я дам ссылки на поиск по каждой вещи.");
    return;
  }

  setText(els.marketMeta, "Открою поиск похожих вещей на WB и Ozon (в новой вкладке).");

  for (const item of items) {
    const query = buildMarketplaceQuery(item);
    const wbUrl = marketplaceSearchUrl("wb", query);
    const ozonUrl = marketplaceSearchUrl("ozon", query);

    const div = document.createElement("div");
    div.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const name = document.createElement("div");
    name.className = "item__name";
    name.textContent = String(item?.name ?? query).trim() || query;

    const actions = document.createElement("div");
    actions.className = "row";

    const wb = document.createElement("a");
    wb.className = "btn btn--ghost";
    wb.textContent = "WB";
    wb.href = wbUrl || "#";
    wb.target = "_blank";
    wb.rel = "noopener noreferrer";
    wb.tabIndex = wbUrl ? 0 : -1;
    if (!wbUrl) wb.setAttribute("aria-disabled", "true");

    const ozon = document.createElement("a");
    ozon.className = "btn btn--ghost";
    ozon.textContent = "Ozon";
    ozon.href = ozonUrl || "#";
    ozon.target = "_blank";
    ozon.rel = "noopener noreferrer";
    ozon.tabIndex = ozonUrl ? 0 : -1;
    if (!ozonUrl) ozon.setAttribute("aria-disabled", "true");

    actions.appendChild(wb);
    actions.appendChild(ozon);

    top.appendChild(name);
    top.appendChild(actions);

    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = `поиск: ${query}`;

    div.appendChild(top);
    div.appendChild(pill);
    els.marketList.appendChild(div);
  }
}

function renderShoppingList(needs) {
  if (!els.shoppingList) return;
  els.shoppingList.innerHTML = "";

  if (!Array.isArray(needs) || needs.length === 0) {
    setText(els.shoppingMeta, "Пока всё ок — обязательные категории закрыты.");
    return;
  }

  setText(els.shoppingMeta, "Быстрые идеи, что докупить (ссылки — это поиск на WB/Ozon).");

  for (const n of needs) {
    const query = String(n?.query ?? "").trim();
    const reason = String(n?.reason ?? "").trim();
    const title = String(n?.title ?? "").trim() || query || "Покупка";

    const wbUrl = marketplaceSearchUrl("wb", query);
    const ozonUrl = marketplaceSearchUrl("ozon", query);

    const div = document.createElement("div");
    div.className = "item";

    const top = document.createElement("div");
    top.className = "item__top";

    const name = document.createElement("div");
    name.className = "item__name";
    name.textContent = title;

    const actions = document.createElement("div");
    actions.className = "row";

    const wb = document.createElement("a");
    wb.className = "btn btn--ghost";
    wb.textContent = "WB";
    wb.href = wbUrl || "#";
    wb.target = "_blank";
    wb.rel = "noopener noreferrer";
    wb.tabIndex = wbUrl ? 0 : -1;
    if (!wbUrl) wb.setAttribute("aria-disabled", "true");

    const ozon = document.createElement("a");
    ozon.className = "btn btn--ghost";
    ozon.textContent = "Ozon";
    ozon.href = ozonUrl || "#";
    ozon.target = "_blank";
    ozon.rel = "noopener noreferrer";
    ozon.tabIndex = ozonUrl ? 0 : -1;
    if (!ozonUrl) ozon.setAttribute("aria-disabled", "true");

    actions.appendChild(wb);
    actions.appendChild(ozon);

    top.appendChild(name);
    top.appendChild(actions);

    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = [query ? `поиск: ${query}` : null, reason ? `почему: ${reason}` : null].filter(Boolean).join(" • ");

    div.appendChild(top);
    div.appendChild(pill);
    els.shoppingList.appendChild(div);
  }
}

async function loadShoppingList({ temperature, condition, occasion }) {
  renderShoppingList([]);
  try {
    const resp = await apiFetch("/api/outfits/shopping-list", {
      method: "POST",
      body: { temperature, condition, occasion: occasion || undefined },
    });
    if (!resp.ok) return;
    const data = await resp.json();
    renderShoppingList(data.needs ?? []);
  } catch {
    renderShoppingList([]);
  }
}

function applyFilter(items) {
  const t = String(els.filterType?.value ?? "").trim();
  if (!t) return items;
  return items.filter((i) => i.type === t);
}

function toTitleWord(s) {
  const v = String(s ?? "").trim();
  if (!v) return "";
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function normalizeColorName(color) {
  const c = String(color ?? "").trim().toLowerCase();
  if (!c) return "";
  const m = {
    white: "белый",
    black: "чёрный",
    blue: "синий",
    beige: "бежевый",
    gray: "серый",
    grey: "серый",
    red: "красный",
    green: "зелёный",
    brown: "коричневый",
    yellow: "жёлтый",
    orange: "оранжевый",
    purple: "фиолетовый",
    pink: "розовый",
  };
  return m[c] ?? c;
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s, l };
}

function classifyColor({ h, s, l }) {
  if (s < 0.25 && l > 0.65 && l < 0.92 && h >= 20 && h < 65) return "beige";
  if (s < 0.12) {
    if (l > 0.9) return "white";
    if (l < 0.14) return "black";
    return "gray";
  }

  if (l > 0.92 && s < 0.25) return "white";
  if (l < 0.12) return "black";

  if ((h >= 20 && h < 45 && l < 0.45) || (h >= 10 && h < 30 && l < 0.4 && s < 0.6)) return "brown";
  if (h >= 20 && h < 45) return "orange";
  if (h >= 45 && h < 70) return "yellow";
  if (h >= 70 && h < 165) return "green";
  if (h >= 165 && h < 255) return "blue";
  if (h >= 255 && h < 295) return "purple";
  if (h >= 295 && h < 345) return "pink";
  return "red";
}

async function detectColorFromImageFile(file) {
  if (!file) return null;

  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("Не удалось прочитать файл."));
    r.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Не удалось загрузить изображение."));
    i.src = dataUrl;
  });

  const target = 96;
  const iw = Math.max(1, img.naturalWidth || img.width || 1);
  const ih = Math.max(1, img.naturalHeight || img.height || 1);
  const scale = Math.min(target / iw, target / ih, 1);
  const w = Math.max(1, Math.round(iw * scale));
  const h = Math.max(1, Math.round(ih * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);

  const x0 = Math.floor(w * 0.2);
  const x1 = Math.ceil(w * 0.8);
  const y0 = Math.floor(h * 0.2);
  const y1 = Math.ceil(h * 0.8);

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const counts = Object.create(null);
  let total = 0;

  const step = 2;
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const idx = (y * w + x) * 4;
      const a = d[idx + 3];
      if (a < 40) continue;
      const r = d[idx + 0];
      const g = d[idx + 1];
      const b = d[idx + 2];
      const hsl = rgbToHsl(r, g, b);
      if (hsl.l > 0.985 && hsl.s < 0.1) continue;
      const key = classifyColor(hsl);
      counts[key] = (counts[key] || 0) + 1;
      total += 1;
    }
  }

  if (total < 50) return null;

  let bestKey = null;
  let bestCount = 0;
  for (const [k, v] of Object.entries(counts)) {
    if (v > bestCount) {
      bestCount = v;
      bestKey = k;
    }
  }
  if (!bestKey) return null;

  if (bestKey === "gray") {
    const white = counts.white || 0;
    const black = counts.black || 0;
    if (white > bestCount * 0.7) bestKey = "white";
    else if (black > bestCount * 0.7) bestKey = "black";
  }

  const ru = normalizeColorName(bestKey);
  return { key: bestKey, ru };
}

async function normalizeImageOrientationFile(file) {
  if (!file || typeof file.type !== "string") return file;
  if (!file.type.startsWith("image/")) return file;

  const maxSide = 1600;
  const baseName = (file.name || "photo").replace(/\.[a-z0-9]+$/i, "");

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    if (typeof img.decode === "function") await img.decode();
    else
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

    const iw = Math.max(1, img.naturalWidth || img.width || 1);
    const ih = Math.max(1, img.naturalHeight || img.height || 1);
    const scale = Math.min(maxSide / iw, maxSide / ih, 1);
    const w = Math.max(1, Math.round(iw * scale));
    const h = Math.max(1, Math.round(ih * scale));

    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise((resolve) => out.toBlob(resolve, "image/png"));
    if (blob) return new File([blob], `${baseName}.png`, { type: "image/png" });
  } catch {
    if (typeof createImageBitmap !== "function") return file;

    let bmp;
    try {
      bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      bmp = await createImageBitmap(file);
    }

    const iw = Math.max(1, bmp.width || 1);
    const ih = Math.max(1, bmp.height || 1);
    const scale = Math.min(maxSide / iw, maxSide / ih, 1);
    const w = Math.max(1, Math.round(iw * scale));
    const h = Math.max(1, Math.round(ih * scale));

    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);

    if (typeof bmp.close === "function") {
      try {
        bmp.close();
      } catch {}
    }

    const blob = await new Promise((resolve) => out.toBlob(resolve, "image/png"));
    if (blob) return new File([blob], `${baseName}.png`, { type: "image/png" });
  } finally {
    URL.revokeObjectURL(url);
  }

  return file;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeRect(r) {
  if (!r) return null;
  const x0 = Math.min(r.x0, r.x1);
  const y0 = Math.min(r.y0, r.y1);
  const x1 = Math.max(r.x0, r.x1);
  const y1 = Math.max(r.y0, r.y1);
  const w = Math.max(0, x1 - x0);
  const h = Math.max(0, y1 - y0);
  return { x: x0, y: y0, w, h };
}

function syncAddCropCanvasSize() {
  const canvas = els.addCropCanvas;
  const img = els.addPhotoPreview;
  const wrap = els.addPhotoPreviewWrap;
  if (!canvas || !img || !wrap) return;
  const rect = wrap.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  redrawAddCropOverlay();
}

function redrawAddCropOverlay() {
  const canvas = els.addCropCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const lineW = Math.max(2, Math.round((window.devicePixelRatio || 1) * 1.25));
  const nr = normalizeRect(state.addCropRect);
  if (!nr || nr.w < 6 || nr.h < 6) {
    if (els.addCutoutBtn) els.addCutoutBtn.disabled = true;
    return;
  }

  if (els.addCutoutBtn) els.addCutoutBtn.disabled = false;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(nr.x, nr.y, nr.w, nr.h);
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = lineW;
  ctx.strokeRect(nr.x + 0.5, nr.y + 0.5, nr.w - 1, nr.h - 1);
}

function resetAddCropSelection() {
  state.addCropRect = null;
  state.addCropActive = false;
  state.addCropPointerId = null;
  if (els.addCutoutBtn) els.addCutoutBtn.disabled = true;
  redrawAddCropOverlay();
}

async function aiCutoutAddPhotoFromRect() {
  const file = state.addPhotoFile;
  const img = els.addPhotoPreview;
  const canvas = els.addCropCanvas;
  if (!file || !img || !canvas) return;

  const iw = img.naturalWidth || 0;
  const ih = img.naturalHeight || 0;
  if (!iw || !ih) return;

  const nr = normalizeRect(state.addCropRect) ?? { x: 0, y: 0, w: canvas.width, h: canvas.height };
  if (nr.w < 6 || nr.h < 6) return;

  const sx = nr.x * (iw / canvas.width);
  const sy = nr.y * (ih / canvas.height);
  const sw = nr.w * (iw / canvas.width);
  const sh = nr.h * (ih / canvas.height);

  const outW = Math.max(1, Math.round(sw));
  const outH = Math.max(1, Math.round(sh));
  const maxSide = 1024;
  const scale = Math.min(maxSide / outW, maxSide / outH, 1);
  const cw = Math.max(1, Math.round(outW * scale));
  const ch = Math.max(1, Math.round(outH * scale));

  const crop = document.createElement("canvas");
  crop.width = cw;
  crop.height = ch;
  const cctx = crop.getContext("2d");
  if (!cctx) return;
  cctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);

  setText(els.addCutoutStatus, "Вырезаю…");

  const blob = await new Promise((resolve) => crop.toBlob(resolve, "image/png"));
  if (!blob) {
    setText(els.addCutoutStatus, "");
    return;
  }

  const base64 = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || "");
      const i = s.indexOf("base64,");
      resolve(i >= 0 ? s.slice(i + 7) : s);
    };
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(blob);
  });

  try {
    const resp = await apiFetch("/api/wardrobe/segment", {
      method: "POST",
      body: { contentType: "image/png", imageBase64: base64 },
    });

    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      let msg = t;
      try {
        const j = JSON.parse(t);
        msg = j?.error?.message ?? t;
      } catch {}
      throw new Error(msg || `HTTP ${resp.status}`);
    }

    const out = await resp.json().catch(() => null);
    if (!out || typeof out.imageBase64 !== "string" || !out.imageBase64) throw new Error("Bad segment response");

    const contentType = typeof out.contentType === "string" && out.contentType ? out.contentType : "image/png";
    const dataUrl = out.imageBase64.startsWith("data:")
      ? out.imageBase64
      : `data:${contentType};base64,${out.imageBase64}`;

    const b = await (await fetch(dataUrl)).blob();
    if (!b || !b.size) throw new Error("Empty segment result");
    const cut = new File([b], (file.name || "photo").replace(/\.[a-z0-9]+$/i, "") + ".png", {
      type: contentType,
    });
    state.addPhotoFile = cut;

    resetAddCropSelection();
    const url = URL.createObjectURL(cut);
    setAddPhotoPreviewUrl(url);
    if (els.addPhotoPreview) els.addPhotoPreview.src = url;
    els.addPhotoPreviewWrap?.classList.add("preview--show");
    setText(els.addCutoutStatus, "Готово");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setText(els.addCutoutStatus, `Не получилось вырезать (сервер): ${String(msg || "").slice(0, 220)}`);
    return;
  }

  const nonce = (state.addDetectNonce += 1);
  setText(els.addAutoColor, "Определяю цвет…");
  try {
    const detected = await detectColorFromImageFile(state.addPhotoFile);
    if (state.addDetectNonce !== nonce) return;
    if (!detected?.ru) {
      setText(els.addAutoColor, "");
      return;
    }
    const input = els.itemForm?.querySelector('input[name="color"]');
    const current = String(input?.value ?? "").trim();
    if (input && !current) input.value = detected.ru;
    setText(els.addAutoColor, `Цвет на фото: ${detected.ru}`);
  } catch {
    if (state.addDetectNonce !== nonce) return;
    setText(els.addAutoColor, "");
  }
}

async function smartCutoutAddPhotoFromRect() {
  const file = state.addPhotoFile;
  const img = els.addPhotoPreview;
  const canvas = els.addCropCanvas;
  if (!file || !img || !canvas) return;

  const nr = normalizeRect(state.addCropRect);
  if (!nr || nr.w < 12 || nr.h < 12) return;

  const iw = img.naturalWidth || 0;
  const ih = img.naturalHeight || 0;
  if (!iw || !ih) return;

  const sx = nr.x * (iw / canvas.width);
  const sy = nr.y * (ih / canvas.height);
  const sw = nr.w * (iw / canvas.width);
  const sh = nr.h * (ih / canvas.height);

  const outW = Math.max(1, Math.round(sw));
  const outH = Math.max(1, Math.round(sh));

  const procMax = 320;
  const procScale = Math.min(procMax / outW, procMax / outH, 1);
  const pw = Math.max(1, Math.round(outW * procScale));
  const ph = Math.max(1, Math.round(outH * procScale));

  const proc = document.createElement("canvas");
  proc.width = pw;
  proc.height = ph;
  const pctx = proc.getContext("2d", { willReadFrequently: true });
  if (!pctx) return;
  pctx.drawImage(img, sx, sy, sw, sh, 0, 0, pw, ph);

  const imgData = pctx.getImageData(0, 0, pw, ph);
  const d = imgData.data;

  const margin = Math.max(2, Math.round(Math.min(pw, ph) * 0.07));
  const samples = [];
  for (let x = 0; x < pw; x += 2) {
    for (let y = 0; y < margin; y += 2) samples.push((y * pw + x) * 4);
    for (let y = ph - margin; y < ph; y += 2) samples.push((y * pw + x) * 4);
  }
  for (let y = 0; y < ph; y += 2) {
    for (let x = 0; x < margin; x += 2) samples.push((y * pw + x) * 4);
    for (let x = pw - margin; x < pw; x += 2) samples.push((y * pw + x) * 4);
  }

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let count = 0;
  for (const idx of samples) {
    const a = d[idx + 3];
    if (a < 40) continue;
    rSum += d[idx + 0];
    gSum += d[idx + 1];
    bSum += d[idx + 2];
    count += 1;
  }
  if (count < 20) return;
  const br = rSum / count;
  const bg = gSum / count;
  const bb = bSum / count;

  const dists = [];
  for (const idx of samples) {
    const a = d[idx + 3];
    if (a < 40) continue;
    const r = d[idx + 0];
    const g = d[idx + 1];
    const b = d[idx + 2];
    dists.push(Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb));
  }
  dists.sort((a, b) => a - b);
  const median = dists.length ? dists[(dists.length / 2) | 0] : 18;
  const threshold = Math.max(28, Math.round(median * 2.0));

  const fg = new Uint8Array(pw * ph);
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const idx = (y * pw + x) * 4;
      const a = d[idx + 3];
      if (a < 40) continue;
      const r = d[idx + 0];
      const g = d[idx + 1];
      const b = d[idx + 2];
      const dist = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
      if (dist > threshold) fg[y * pw + x] = 1;
    }
  }

  const visited = new Uint8Array(pw * ph);
  const keep = new Uint8Array(pw * ph);
  const qx = new Int32Array(pw * ph);
  const qy = new Int32Array(pw * ph);

  let bestCount = 0;
  let bestSeed = -1;
  for (let i = 0; i < fg.length; i++) {
    if (!fg[i] || visited[i]) continue;
    const sx2 = i % pw;
    const sy2 = (i / pw) | 0;
    let head = 0;
    let tail = 0;
    qx[tail] = sx2;
    qy[tail] = sy2;
    tail += 1;
    visited[i] = 1;
    let c = 0;
    while (head < tail) {
      const x = qx[head];
      const y = qy[head];
      head += 1;
      c += 1;
      const n1 = x > 0 ? y * pw + (x - 1) : -1;
      const n2 = x + 1 < pw ? y * pw + (x + 1) : -1;
      const n3 = y > 0 ? (y - 1) * pw + x : -1;
      const n4 = y + 1 < ph ? (y + 1) * pw + x : -1;
      if (n1 >= 0 && fg[n1] && !visited[n1]) {
        visited[n1] = 1;
        qx[tail] = x - 1;
        qy[tail] = y;
        tail += 1;
      }
      if (n2 >= 0 && fg[n2] && !visited[n2]) {
        visited[n2] = 1;
        qx[tail] = x + 1;
        qy[tail] = y;
        tail += 1;
      }
      if (n3 >= 0 && fg[n3] && !visited[n3]) {
        visited[n3] = 1;
        qx[tail] = x;
        qy[tail] = y - 1;
        tail += 1;
      }
      if (n4 >= 0 && fg[n4] && !visited[n4]) {
        visited[n4] = 1;
        qx[tail] = x;
        qy[tail] = y + 1;
        tail += 1;
      }
    }
    if (c > bestCount) {
      bestCount = c;
      bestSeed = i;
    }
  }

  if (bestSeed < 0 || bestCount < 60) return;

  visited.fill(0);
  {
    const sx2 = bestSeed % pw;
    const sy2 = (bestSeed / pw) | 0;
    let head = 0;
    let tail = 0;
    qx[tail] = sx2;
    qy[tail] = sy2;
    tail += 1;
    visited[bestSeed] = 1;
    keep[bestSeed] = 1;
    while (head < tail) {
      const x = qx[head];
      const y = qy[head];
      head += 1;
      const n1 = x > 0 ? y * pw + (x - 1) : -1;
      const n2 = x + 1 < pw ? y * pw + (x + 1) : -1;
      const n3 = y > 0 ? (y - 1) * pw + x : -1;
      const n4 = y + 1 < ph ? (y + 1) * pw + x : -1;
      if (n1 >= 0 && fg[n1] && !visited[n1]) {
        visited[n1] = 1;
        keep[n1] = 1;
        qx[tail] = x - 1;
        qy[tail] = y;
        tail += 1;
      }
      if (n2 >= 0 && fg[n2] && !visited[n2]) {
        visited[n2] = 1;
        keep[n2] = 1;
        qx[tail] = x + 1;
        qy[tail] = y;
        tail += 1;
      }
      if (n3 >= 0 && fg[n3] && !visited[n3]) {
        visited[n3] = 1;
        keep[n3] = 1;
        qx[tail] = x;
        qy[tail] = y - 1;
        tail += 1;
      }
      if (n4 >= 0 && fg[n4] && !visited[n4]) {
        visited[n4] = 1;
        keep[n4] = 1;
        qx[tail] = x;
        qy[tail] = y + 1;
        tail += 1;
      }
    }
  }

  const mask = document.createElement("canvas");
  mask.width = pw;
  mask.height = ph;
  const mctx = mask.getContext("2d");
  if (!mctx) return;
  const maskData = mctx.createImageData(pw, ph);
  const md = maskData.data;
  for (let i = 0; i < keep.length; i++) {
    const a = keep[i] ? 255 : 0;
    const j = i * 4;
    md[j + 3] = a;
  }
  mctx.putImageData(maskData, 0, 0);

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const octx = out.getContext("2d");
  if (!octx) return;
  octx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
  octx.globalCompositeOperation = "destination-in";
  octx.imageSmoothingEnabled = true;
  octx.drawImage(mask, 0, 0, outW, outH);
  octx.globalCompositeOperation = "source-over";

  const blob = await new Promise((resolve) => out.toBlob(resolve, "image/png"));
  if (!blob) return;
  const cut = new File([blob], (file.name || "photo").replace(/\.[a-z0-9]+$/i, "") + ".png", { type: "image/png" });
  state.addPhotoFile = cut;

  resetAddCropSelection();

  const url = URL.createObjectURL(cut);
  setAddPhotoPreviewUrl(url);
  if (els.addPhotoPreview) els.addPhotoPreview.src = url;
  els.addPhotoPreviewWrap?.classList.add("preview--show");

  const nonce = (state.addDetectNonce += 1);
  setText(els.addAutoColor, "Определяю цвет…");
  try {
    const detected = await detectColorFromImageFile(cut);
    if (state.addDetectNonce !== nonce) return;
    if (!detected?.ru) {
      setText(els.addAutoColor, "");
      return;
    }
    const input = els.itemForm?.querySelector('input[name="color"]');
    const current = String(input?.value ?? "").trim();
    if (input && !current) input.value = detected.ru;
    setText(els.addAutoColor, `Цвет на фото: ${detected.ru}`);
  } catch {
    if (state.addDetectNonce !== nonce) return;
    setText(els.addAutoColor, "");
  }
}

function setAddPhotoPreviewUrl(url) {
  const prev = state.addPhotoPreviewUrl;
  if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(prev);
    } catch {}
  }
  state.addPhotoPreviewUrl = url;
}

async function cropAddPhotoToSelection() {
  const file = state.addPhotoFile;
  const img = els.addPhotoPreview;
  const canvas = els.addCropCanvas;
  if (!file || !img || !canvas) return;

  const nr = normalizeRect(state.addCropRect);
  if (!nr || nr.w < 12 || nr.h < 12) return;

  const iw = img.naturalWidth || 0;
  const ih = img.naturalHeight || 0;
  if (!iw || !ih) return;

  const sx = nr.x * (iw / canvas.width);
  const sy = nr.y * (ih / canvas.height);
  const sw = nr.w * (iw / canvas.width);
  const sh = nr.h * (ih / canvas.height);

  const outW = Math.max(1, Math.round(sw));
  const outH = Math.max(1, Math.round(sh));
  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const ctx = out.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

  const blob = await new Promise((resolve) => out.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) return;

  const cropped = new File([blob], file.name || "photo.jpg", { type: blob.type || "image/jpeg" });
  state.addPhotoFile = cropped;
  resetAddCropSelection();

  const url = URL.createObjectURL(cropped);
  setAddPhotoPreviewUrl(url);
  if (els.addPhotoPreview) els.addPhotoPreview.src = url;
  els.addPhotoPreviewWrap?.classList.add("preview--show");

  const nonce = (state.addDetectNonce += 1);
  setText(els.addAutoColor, "Определяю цвет…");
  try {
    const detected = await detectColorFromImageFile(cropped);
    if (state.addDetectNonce !== nonce) return;
    if (!detected?.ru) {
      setText(els.addAutoColor, "");
      return;
    }
    const input = els.itemForm?.querySelector('input[name="color"]');
    const current = String(input?.value ?? "").trim();
    if (input && !current) input.value = detected.ru;
    setText(els.addAutoColor, `Цвет на фото: ${detected.ru}`);
  } catch {
    if (state.addDetectNonce !== nonce) return;
    setText(els.addAutoColor, "");
  }
}

async function removeBackgroundFromImageFile(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("Не удалось прочитать файл."));
    r.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Не удалось загрузить изображение."));
    i.src = dataUrl;
  });

  const iw = Math.max(1, img.naturalWidth || img.width || 1);
  const ih = Math.max(1, img.naturalHeight || img.height || 1);

  const target = 256;
  const scale = Math.min(target / iw, target / ih, 1);
  const w = Math.max(1, Math.round(iw * scale));
  const h = Math.max(1, Math.round(ih * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  const margin = Math.max(2, Math.round(Math.min(w, h) * 0.06));
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let count = 0;

  const addSample = (x, y) => {
    const idx = (y * w + x) * 4;
    const a = d[idx + 3];
    if (a < 40) return;
    rSum += d[idx + 0];
    gSum += d[idx + 1];
    bSum += d[idx + 2];
    count += 1;
  };

  for (let x = 0; x < w; x += 2) {
    for (let y = 0; y < margin; y += 2) addSample(x, y);
    for (let y = h - margin; y < h; y += 2) addSample(x, y);
  }
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < margin; x += 2) addSample(x, y);
    for (let x = w - margin; x < w; x += 2) addSample(x, y);
  }

  if (count < 20) return null;

  const br = rSum / count;
  const bg = gSum / count;
  const bb = bSum / count;
  const baseThreshold = 32;

  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const a = d[idx + 3];
      if (a < 40) {
        mask[y * w + x] = 0;
        continue;
      }
      const r = d[idx + 0];
      const g = d[idx + 1];
      const b = d[idx + 2];
      const dist = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
      mask[y * w + x] = dist > baseThreshold ? 1 : 0;
    }
  }

  const visited = new Uint8Array(w * h);
  let bestCount = 0;
  let bestSeed = -1;
  const qx = new Int32Array(w * h);
  const qy = new Int32Array(w * h);

  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || visited[i]) continue;
    const sx = i % w;
    const sy = (i / w) | 0;
    let head = 0;
    let tail = 0;
    qx[tail] = sx;
    qy[tail] = sy;
    tail += 1;
    visited[i] = 1;
    let c = 0;
    while (head < tail) {
      const x = qx[head];
      const y = qy[head];
      head += 1;
      c += 1;
      const n1 = x > 0 ? y * w + (x - 1) : -1;
      const n2 = x + 1 < w ? y * w + (x + 1) : -1;
      const n3 = y > 0 ? (y - 1) * w + x : -1;
      const n4 = y + 1 < h ? (y + 1) * w + x : -1;
      if (n1 >= 0 && mask[n1] && !visited[n1]) {
        visited[n1] = 1;
        qx[tail] = x - 1;
        qy[tail] = y;
        tail += 1;
      }
      if (n2 >= 0 && mask[n2] && !visited[n2]) {
        visited[n2] = 1;
        qx[tail] = x + 1;
        qy[tail] = y;
        tail += 1;
      }
      if (n3 >= 0 && mask[n3] && !visited[n3]) {
        visited[n3] = 1;
        qx[tail] = x;
        qy[tail] = y - 1;
        tail += 1;
      }
      if (n4 >= 0 && mask[n4] && !visited[n4]) {
        visited[n4] = 1;
        qx[tail] = x;
        qy[tail] = y + 1;
        tail += 1;
      }
    }
    if (c > bestCount) {
      bestCount = c;
      bestSeed = i;
    }
  }

  if (bestSeed < 0) return null;

  visited.fill(0);
  const keep = new Uint8Array(w * h);
  {
    const sx = bestSeed % w;
    const sy = (bestSeed / w) | 0;
    let head = 0;
    let tail = 0;
    qx[tail] = sx;
    qy[tail] = sy;
    tail += 1;
    visited[bestSeed] = 1;
    keep[bestSeed] = 1;
    while (head < tail) {
      const x = qx[head];
      const y = qy[head];
      head += 1;
      const n1 = x > 0 ? y * w + (x - 1) : -1;
      const n2 = x + 1 < w ? y * w + (x + 1) : -1;
      const n3 = y > 0 ? (y - 1) * w + x : -1;
      const n4 = y + 1 < h ? (y + 1) * w + x : -1;
      if (n1 >= 0 && mask[n1] && !visited[n1]) {
        visited[n1] = 1;
        keep[n1] = 1;
        qx[tail] = x - 1;
        qy[tail] = y;
        tail += 1;
      }
      if (n2 >= 0 && mask[n2] && !visited[n2]) {
        visited[n2] = 1;
        keep[n2] = 1;
        qx[tail] = x + 1;
        qy[tail] = y;
        tail += 1;
      }
      if (n3 >= 0 && mask[n3] && !visited[n3]) {
        visited[n3] = 1;
        keep[n3] = 1;
        qx[tail] = x;
        qy[tail] = y - 1;
        tail += 1;
      }
      if (n4 >= 0 && mask[n4] && !visited[n4]) {
        visited[n4] = 1;
        keep[n4] = 1;
        qx[tail] = x;
        qy[tail] = y + 1;
        tail += 1;
      }
    }
  }

  for (let i = 0; i < keep.length; i++) {
    if (!keep[i]) {
      const idx = i * 4;
      d[idx + 3] = 0;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const out = document.createElement("canvas");
  out.width = iw;
  out.height = ih;
  const octx = out.getContext("2d");
  if (!octx) return null;
  octx.drawImage(canvas, 0, 0, w, h, 0, 0, iw, ih);
  const blob = await new Promise((resolve) => out.toBlob(resolve, "image/png"));
  if (!blob) return null;
  return new File([blob], (file.name || "photo").replace(/\.[a-z0-9]+$/i, "") + ".png", { type: "image/png" });
}

async function cutoutAddPhoto() {
  const f = state.addPhotoFile;
  if (!f) return;
  if (els.addCutoutBtn) els.addCutoutBtn.disabled = true;
  setText(els.addCutoutStatus, "Вырезаю фон…");
  try {
    const out = await removeBackgroundFromImageFile(f);
    if (!out) {
      setText(els.addCutoutStatus, "Не получилось вырезать фон. Попробуй сначала обрезать точнее.");
      return;
    }
    state.addPhotoFile = out;
    const url = URL.createObjectURL(out);
    setAddPhotoPreviewUrl(url);
    if (els.addPhotoPreview) {
      els.addPhotoPreview.onload = () => syncAddCropCanvasSize();
      els.addPhotoPreview.src = url;
    }
    setText(els.addCutoutStatus, "Готово: фон вырезан");

    const nonce = (state.addDetectNonce += 1);
    setText(els.addAutoColor, "Определяю цвет…");
    try {
      const detected = await detectColorFromImageFile(out);
      if (state.addDetectNonce !== nonce) return;
      if (!detected?.ru) {
        setText(els.addAutoColor, "");
        return;
      }
      const input = els.itemForm?.querySelector('input[name="color"]');
      const current = String(input?.value ?? "").trim();
      if (input && !current) input.value = detected.ru;
      setText(els.addAutoColor, `Цвет на фото: ${detected.ru}`);
    } catch {
      if (state.addDetectNonce !== nonce) return;
      setText(els.addAutoColor, "");
    }
  } finally {
    if (els.addCutoutBtn) els.addCutoutBtn.disabled = false;
  }
}

function typeLabelRu(type) {
  const t = String(type ?? "").trim();
  const m = {
    shirt: "рубашка",
    pants: "штаны",
    jacket: "куртка",
    shoes: "обувь",
    accessories: "аксессуар",
    other: "вещь",
  };
  return m[t] ?? "вещь";
}

function autoItemName({ type, color }) {
  const t = typeLabelRu(type);
  const c = normalizeColorName(color);
  if (c) return `${toTitleWord(c)} ${t}`;
  return toTitleWord(t);
}

function setAddStep(step) {
  const isPhoto = step === "photo";
  els.addStepPhoto?.classList.toggle("step--hidden", !isPhoto);
  els.addStepDetails?.classList.toggle("step--hidden", isPhoto);
}

function openAddModal({ prefillType } = {}) {
  setText(els.addModalError, "");
  if (!els.addModal) return;
  els.addModal.classList.remove("modal--hidden");
  document.body.style.overflow = "hidden";

  state.addPhotoFile = null;
  state.addDetectNonce += 1;
  if (els.addPhotoInput) els.addPhotoInput.value = "";
  if (els.addPhotoPreview) els.addPhotoPreview.src = "";
  setAddPhotoPreviewUrl(null);
  els.addPhotoPreviewWrap?.classList.remove("preview--show");
  setText(els.addAutoColor, "");
  setText(els.addCropHint, "Обведи вокруг вещи рамкой — я вырежу её без фона.");
  setText(els.addCutoutStatus, "");
  resetAddCropSelection();

  const typeSelect = els.itemForm?.querySelector('select[name="type"]');
  const colorInput = els.itemForm?.querySelector('input[name="color"]');
  const brandInput = els.itemForm?.querySelector('input[name="brand"]');
  const materialInput = els.itemForm?.querySelector('input[name="material"]');
  const seasonSelect = els.itemForm?.querySelector('select[name="season"]');
  const warmthSelect = els.itemForm?.querySelector('select[name="warmth"]');
  const styleSelect = els.itemForm?.querySelector('select[name="style"]');
  const nameInput = els.itemForm?.querySelector('input[name="name"]');

  if (typeSelect && prefillType) typeSelect.value = prefillType;
  else if (typeSelect && state.addLastType) typeSelect.value = state.addLastType;
  if (colorInput && state.addLastColor) colorInput.value = state.addLastColor;
  if (seasonSelect) seasonSelect.value = state.addLastSeason ?? "";
  if (warmthSelect) warmthSelect.value = state.addLastWarmth ?? "";
  if (styleSelect) styleSelect.value = state.addLastStyle ?? "";
  if (brandInput) brandInput.value = "";
  if (materialInput) materialInput.value = "";
  if (nameInput) nameInput.value = "";

  setAddStep("photo");
}

function closeAddModal() {
  if (!els.addModal) return;
  els.addModal.classList.add("modal--hidden");
  document.body.style.overflow = "";
  setText(els.addModalError, "");
}

async function fetchWardrobe() {
  const resp = await apiFetch("/api/wardrobe");
  if (!resp.ok) throw new Error(await resp.text());
  const data = await resp.json();
  state.wardrobeItems = data.items ?? [];
  return state.wardrobeItems;
}

async function renderWardrobe() {
  setText(els.itemError, "");
  if (!els.itemsList) return;
  els.itemsList.innerHTML = "";

  let items;
  try {
    items = await fetchWardrobe();
  } catch (e) {
    setText(els.itemError, e?.message ?? String(e));
    return;
  }

  const filtered = applyFilter(items);
  if (filtered.length === 0) {
    els.itemsList.innerHTML = '<div class="muted">Пока нет вещей (или фильтр пустой). Добавь первую.</div>';
    return;
  }

  for (const item of filtered) {
    const div = document.createElement("div");
    div.className = "item";

    const pill = document.createElement("span");
    pill.className = "pill";
    const parts = [];
    parts.push(String(item.type));
    if (item.color) parts.push(String(item.color));
    if (item.season) parts.push(String(item.season));
    if (item.warmth != null) parts.push(`теплота ${item.warmth}`);
    if (item.style) parts.push(String(item.style));
    pill.textContent = parts.join(" • ");

    const top = document.createElement("div");
    top.className = "item__top";

    const name = document.createElement("div");
    name.className = "item__name";
    name.textContent = item.name;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn btn--ghost";
    del.textContent = "Удалить";
    del.addEventListener("click", async () => {
      const resp2 = await apiFetch(`/api/wardrobe/${item.id}`, { method: "DELETE" });
      if (!resp2.ok) {
        setText(els.itemError, await resp2.text());
        return;
      }
      await renderWardrobe();
      await renderAvatar();
    });

    top.appendChild(name);
    top.appendChild(del);

    div.appendChild(top);
    div.appendChild(pill);

    if (item.photoUrl) {
      const media = document.createElement("div");
      media.className = "item__media";
      const img = document.createElement("img");
      img.src = item.photoUrl;
      img.alt = item.name;
      media.appendChild(img);
      div.appendChild(media);
    }

    els.itemsList.appendChild(div);
  }
}

async function onAuthSubmit(e) {
  e.preventDefault();
  setText(els.authError, "");

  const form = new FormData(els.authForm);
  const mode = els.tabRegister.classList.contains("tab--active") ? "register" : "login";
  const login = String(form.get("login") ?? "").trim();
  const password = String(form.get("password") ?? "").trim();
  const username = String(form.get("username") ?? "").trim();

  if (!login || !password) {
    setText(els.authError, "Заполни логин и пароль.");
    return;
  }

  const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
  const body = mode === "register" ? { login, password, username } : { login, password };

  const resp = await apiFetch(endpoint, { method: "POST", body });
  if (!resp.ok) {
    setText(els.authError, await resp.text());
    return;
  }

  const data = await resp.json();
  storage.accessToken = data.tokens.accessToken;
  storage.refreshToken = data.tokens.refreshToken;
  await enterApp();
}

async function loadWeather(lat, lng) {
  setText(els.weatherError, "");
  setText(els.weatherOut, "");

  const qs = new URLSearchParams();
  if (lat) qs.set("lat", lat);
  if (lng) qs.set("lng", lng);

  const resp = await apiFetch(`/api/weather?${qs.toString()}`);
  if (!resp.ok) {
    setText(els.weatherError, await resp.text());
    return null;
  }
  const data = await resp.json();
  state.lastWeather = data;
  setText(els.weatherOut, formatWeatherText(data));
  await renderTopbar();
  return data;
}

async function getGpsPosition() {
  if (!("geolocation" in navigator)) throw new Error("Геолокация не поддерживается в этом браузере.");
  if (!window.isSecureContext) {
    throw new Error("GPS работает только по HTTPS. Введи координаты вручную (Lat/Lng) или подключи домен + HTTPS.");
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve(p),
      (e) => reject(e),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}

async function useGps() {
  const pos = await getGpsPosition();
  const lat = String(pos.coords.latitude);
  const lng = String(pos.coords.longitude);

  const latInput = els.weatherForm?.querySelector('input[name="lat"]');
  const lngInput = els.weatherForm?.querySelector('input[name="lng"]');
  if (latInput) latInput.value = lat;
  if (lngInput) lngInput.value = lng;

  await apiFetch("/api/user/profile", {
    method: "PUT",
    body: { geoLatitude: Number(lat), geoLongitude: Number(lng) },
  });

  await loadWeather(lat, lng);
}

async function suggestFromWeather() {
  setText(els.suggestError, "");
  if (!state.lastWeather) {
    setText(els.suggestError, "Сначала получи погоду (кнопка GPS или форма).");
    return;
  }
  const t = els.suggestForm.querySelector('input[name="temperature"]');
  const c = els.suggestForm.querySelector('input[name="condition"]');
  if (t) t.value = String(state.lastWeather.temperature ?? "");
  if (c) c.value = String(state.lastWeather.condition ?? "");
  els.suggestForm.requestSubmit();
}

async function suggestOutfit(e) {
  e.preventDefault();
  setText(els.suggestError, "");
  setText(els.suggestOut, "");
  setText(els.suggestMeta, "");
  setText(els.feedbackStatus, "");
  if (els.feedbackReason) els.feedbackReason.value = "";
  state.lastSuggestionOutfitId = null;
  renderMarketplace([]);
  renderShoppingList([]);

  const form = new FormData(els.suggestForm);
  const temperature = Number(form.get("temperature"));
  const condition = String(form.get("condition") ?? "").trim();
  const occasion = String(form.get("occasion") ?? "").trim();

  const resp = await apiFetch("/api/outfits/ai-suggest", {
    method: "POST",
    body: { temperature, condition, occasion: occasion || undefined },
  });
  if (!resp.ok) {
    setText(els.suggestError, await resp.text());
    return;
  }
  const data = await resp.json();
  state.lastSuggestion = data;
  setText(els.suggestMeta, `Источник: ${data.provider ?? "unknown"}`);
  const items = data.items ?? [];
  setText(els.suggestOut, formatOutfitText(items, data.explanation ?? ""));
  renderMarketplace(items);
  loadShoppingList({ temperature, condition, occasion }).catch(() => {});

  if (Array.isArray(items) && items.length > 0) {
    try {
      const createdResp = await apiFetch("/api/outfits", {
        method: "POST",
        body: {
          name: "AI образ",
          itemIds: items.map((i) => i.id),
          weatherCondition: String(condition),
          occasion: occasion || undefined,
          aiGenerated: true,
        },
      });
      if (createdResp.ok) {
        const created = await createdResp.json();
        state.lastSuggestionOutfitId = created?.outfit?.id ?? null;
      }
    } catch {
      state.lastSuggestionOutfitId = null;
    }
  }
}

async function renderTopbar() {
  try {
    const r = await apiFetch("/api/user/profile");
    if (r.ok) {
      const data = await r.json();
      const user = data.user;
      setText(els.greetingName, user?.username || user?.email || "—");
    }
  } catch {
    setText(els.greetingName, "—");
  }

  if (state.lastWeather?.temperature != null && state.lastWeather?.condition) {
    setText(els.topWeatherChip, `${state.lastWeather.temperature}°C · ${state.lastWeather.condition}`);
  } else {
    setText(els.topWeatherChip, "Погода не загружена");
  }
}

async function homeSuggest() {
  setText(els.homeError, "");
  setText(els.homeMeta, "");
  setText(els.homeOutfit, "");
  state.lastSuggestionOutfitId = null;

  if (!state.lastWeather || typeof state.lastWeather.temperature !== "number" || !state.lastWeather.condition) {
    try {
      await useGps();
    } catch (e) {
      setText(els.homeError, e?.message ?? String(e));
      return;
    }
  }

  const w = state.lastWeather;
  if (!w || typeof w.temperature !== "number" || !w.condition) {
    setText(els.homeError, "Не удалось получить погоду.");
    return;
  }

  const occasionInput = els.suggestForm.querySelector('input[name="occasion"]');
  const occasion = String(occasionInput?.value ?? "").trim() || undefined;

  const resp = await apiFetch("/api/outfits/ai-suggest", {
    method: "POST",
    body: { temperature: w.temperature, condition: w.condition, occasion },
  });
  if (!resp.ok) {
    setText(els.homeError, await resp.text());
    return;
  }

  const data = await resp.json();
  state.lastSuggestion = data;
  const items = data.items ?? [];
  if (items.length === 0) {
    setText(els.homeError, "Не получилось собрать образ. Добавь вещи в гардероб.");
    return;
  }

  setText(els.homeOutfit, formatOutfitText(items, data.explanation ?? ""));
  setText(els.homeMeta, `Источник: ${data.provider ?? "unknown"}`);

  try {
    const createdResp = await apiFetch("/api/outfits", {
      method: "POST",
      body: {
        name: "Образ дня",
        itemIds: items.map((i) => i.id),
        wornDate: new Date().toISOString(),
        weatherCondition: String(w.condition),
        occasion,
        aiGenerated: true,
      },
    });
    if (createdResp.ok) {
      const created = await createdResp.json();
      state.lastSuggestionOutfitId = created?.outfit?.id ?? null;
    }
  } catch {
    state.lastSuggestionOutfitId = null;
  }

  await renderTopbar();
}

function setAvatarSelection(ids) {
  state.avatarSelectedIds = new Set(ids);
  localStorage.setItem("avatarSelectedIds", JSON.stringify(Array.from(state.avatarSelectedIds)));
}

function restoreAvatarSelection() {
  try {
    const raw = localStorage.getItem("avatarSelectedIds");
    const arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr)) setAvatarSelection(arr.filter((x) => typeof x === "string"));
  } catch {
    setAvatarSelection([]);
  }
}

async function renderAvatar() {
  if (!els.avatarItems || !els.avatarWear) return;
  els.avatarItems.innerHTML = "";
  els.avatarWear.innerHTML = "";

  if (!Array.isArray(state.wardrobeItems) || state.wardrobeItems.length === 0) {
    try {
      await fetchWardrobe();
    } catch {}
  }

  const items = state.wardrobeItems ?? [];
  for (const item of items) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.draggable = true;
    b.textContent = item.name;
    b.dataset.itemId = item.id;
    b.addEventListener("click", () => {
      if (state.avatarSelectedIds.has(item.id)) state.avatarSelectedIds.delete(item.id);
      else state.avatarSelectedIds.add(item.id);
      setAvatarSelection(Array.from(state.avatarSelectedIds));
      renderAvatar().catch(() => {});
    });
    b.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.id);
    });
    els.avatarItems.appendChild(b);
  }

  const selected = items.filter((i) => state.avatarSelectedIds.has(i.id));
  if (selected.length === 0) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "Пока ничего не надето.";
    els.avatarWear.appendChild(empty);
    return;
  }

  for (const item of selected) {
    const w = document.createElement("div");
    w.className = "wear";
    w.textContent = `${item.name} (${item.type}${item.color ? `, ${item.color}` : ""})`;
    els.avatarWear.appendChild(w);
  }
}

async function renderProfile() {
  setText(els.profileError, "");
  setText(els.profileOut, "");
  const resp = await apiFetch("/api/user/profile");
  if (!resp.ok) {
    setText(els.profileError, await resp.text());
    return;
  }
  const data = await resp.json();
  const u = data.user;
  setText(
    els.profileOut,
    `username: ${u.username ?? "-"}\nemail: ${u.email ?? "-"}\nlat: ${u.geoLatitude ?? "-"}\nlng: ${u.geoLongitude ?? "-"}`,
  );
}

async function enterApp() {
  const ok = Boolean(storage.accessToken && storage.refreshToken);
  show(els.authCard, !ok);
  show(els.appShell, ok);
  if (!ok) return;

  restoreAvatarSelection();
  await renderTopbar();
  setScreen("home");
  await renderWardrobe();
}

els.tabLogin.addEventListener("click", () => setAuthMode("login"));
els.tabRegister.addEventListener("click", () => setAuthMode("register"));
els.authForm.addEventListener("submit", onAuthSubmit);

if (els.refreshBtn) els.refreshBtn.addEventListener("click", () => renderWardrobe().catch(() => {}));
if (els.filterType) els.filterType.addEventListener("change", () => renderWardrobe().catch(() => {}));
if (els.addItemBtn) {
  els.addItemBtn.addEventListener("click", () => openAddModal({ prefillType: String(els.filterType?.value ?? "").trim() }));
}

for (const btn of els.navButtons) {
  btn.addEventListener("click", () => setScreen(btn.dataset.screen));
}

for (const tile of document.querySelectorAll("[data-go]")) {
  tile.addEventListener("click", () => {
    const go = tile.dataset.go;
    if (go === "wardrobe") {
      const type = tile.dataset.type ?? "";
      setScreen("wardrobe");
      if (!type) {
        openAddModal({ prefillType: String(els.filterType?.value ?? "").trim() });
        return;
      }
      if (els.filterType) els.filterType.value = type;
      renderWardrobe().catch(() => {});
    }
  });
}

if (els.goWardrobeBtn) els.goWardrobeBtn.addEventListener("click", () => setScreen("wardrobe"));
if (els.homeSuggestBtn)
  els.homeSuggestBtn.addEventListener("click", () =>
    homeSuggest().catch((e) => setText(els.homeError, e?.message ?? String(e))),
  );

if (els.addModalBackdrop) els.addModalBackdrop.addEventListener("click", closeAddModal);
if (els.addCloseBtn) els.addCloseBtn.addEventListener("click", closeAddModal);
if (els.addNextBtn) els.addNextBtn.addEventListener("click", () => setAddStep("details"));
if (els.addSkipPhotoBtn) els.addSkipPhotoBtn.addEventListener("click", () => setAddStep("details"));
if (els.addBackBtn) els.addBackBtn.addEventListener("click", () => setAddStep("photo"));

if (els.addPhotoInput) {
  els.addPhotoInput.addEventListener("change", async () => {
    setText(els.addModalError, "");
    let f = els.addPhotoInput.files?.[0] ?? null;
    const nonce = (state.addDetectNonce += 1);
    if (!f) {
      state.addPhotoFile = null;
      if (els.addPhotoPreview) els.addPhotoPreview.src = "";
      setAddPhotoPreviewUrl(null);
      els.addPhotoPreviewWrap?.classList.remove("preview--show");
      setText(els.addAutoColor, "");
      setText(els.addCropHint, "");
      setText(els.addCutoutStatus, "");
      resetAddCropSelection();
      return;
    }

    setText(els.addCutoutStatus, "Подготавливаю фото…");
    try {
      f = await normalizeImageOrientationFile(f);
    } catch {}
    if (state.addDetectNonce !== nonce) return;

    state.addPhotoFile = f;
    resetAddCropSelection();
    setText(els.addCropHint, "Обведи вокруг вещи рамкой — я вырежу её без фона.");
    setText(els.addCutoutStatus, "");

    const url = URL.createObjectURL(f);
    setAddPhotoPreviewUrl(url);
    if (els.addPhotoPreview) {
      els.addPhotoPreview.onload = () => syncAddCropCanvasSize();
      els.addPhotoPreview.src = url;
    }
    els.addPhotoPreviewWrap?.classList.add("preview--show");
    requestAnimationFrame(() => syncAddCropCanvasSize());

    setText(els.addAutoColor, "Определяю цвет…");
    try {
      const detected = await detectColorFromImageFile(f);
      if (state.addDetectNonce !== nonce) return;
      if (!detected?.ru) {
        setText(els.addAutoColor, "");
        return;
      }
      const input = els.itemForm?.querySelector('input[name="color"]');
      const current = String(input?.value ?? "").trim();
      if (input && !current) input.value = detected.ru;
      setText(els.addAutoColor, `Цвет на фото: ${detected.ru}`);
    } catch {
      if (state.addDetectNonce !== nonce) return;
      setText(els.addAutoColor, "");
    }
  });
}

if (els.addCropCanvas) {
  els.addCropCanvas.addEventListener("pointerdown", (e) => {
    if (!(e instanceof PointerEvent)) return;
    if (!state.addPhotoFile) return;
    const canvas = els.addCropCanvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = clamp((e.clientX - rect.left) * dpr, 0, canvas.width);
    const y = clamp((e.clientY - rect.top) * dpr, 0, canvas.height);
    state.addCropActive = true;
    state.addCropPointerId = e.pointerId;
    state.addCropRect = { x0: x, y0: y, x1: x, y1: y };
    canvas.setPointerCapture(e.pointerId);
    redrawAddCropOverlay();
  });
  els.addCropCanvas.addEventListener("pointermove", (e) => {
    if (!(e instanceof PointerEvent)) return;
    const canvas = els.addCropCanvas;
    if (!canvas) return;
    if (!state.addCropActive) return;
    if (state.addCropPointerId !== e.pointerId) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = clamp((e.clientX - rect.left) * dpr, 0, canvas.width);
    const y = clamp((e.clientY - rect.top) * dpr, 0, canvas.height);
    if (state.addCropRect) {
      state.addCropRect.x1 = x;
      state.addCropRect.y1 = y;
    }
    redrawAddCropOverlay();
  });
  const end = (e) => {
    if (!(e instanceof PointerEvent)) return;
    if (state.addCropPointerId !== e.pointerId) return;
    state.addCropActive = false;
    state.addCropPointerId = null;
    redrawAddCropOverlay();
  };
  els.addCropCanvas.addEventListener("pointerup", end);
  els.addCropCanvas.addEventListener("pointercancel", end);
}

if (els.addCropResetBtn) els.addCropResetBtn.addEventListener("click", resetAddCropSelection);
if (els.addCutoutBtn) {
  els.addCutoutBtn.addEventListener("click", () => aiCutoutAddPhotoFromRect().catch(() => {}));
}

if (els.addStepDetails) {
  els.addStepDetails.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const typeBtn = t.closest("button[data-type]");
    const colorBtn = t.closest("button[data-color]");
    const styleBtn = t.closest("button[data-style]");
    if (typeBtn) {
      const v = String(typeBtn.getAttribute("data-type") ?? "");
      const sel = els.itemForm?.querySelector('select[name="type"]');
      if (sel) sel.value = v;
      return;
    }
    if (colorBtn) {
      const v = String(colorBtn.getAttribute("data-color") ?? "");
      const input = els.itemForm?.querySelector('input[name="color"]');
      if (input) input.value = normalizeColorName(v);
      return;
    }
    if (styleBtn) {
      const v = String(styleBtn.getAttribute("data-style") ?? "");
      const sel = els.itemForm?.querySelector('select[name="style"]');
      if (sel) sel.value = v;
    }
  });
}

els.itemForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setText(els.itemError, "");
  setText(els.addModalError, "");

  const form = new FormData(els.itemForm);
  const type = String(form.get("type") ?? "other");
  const colorRaw = String(form.get("color") ?? "").trim();
  const color = colorRaw || undefined;
  const brandRaw = String(form.get("brand") ?? "").trim();
  const brand = brandRaw || undefined;
  const materialRaw = String(form.get("material") ?? "").trim();
  const material = materialRaw || undefined;
  const seasonRaw = String(form.get("season") ?? "").trim();
  const season = seasonRaw || undefined;
  const warmthRaw = String(form.get("warmth") ?? "").trim();
  const warmth = warmthRaw ? Number(warmthRaw) : undefined;
  const styleRaw = String(form.get("style") ?? "").trim();
  const style = styleRaw || undefined;
  const nameRaw = String(form.get("name") ?? "").trim();
  const name = nameRaw || autoItemName({ type, color: colorRaw });

  state.addLastType = type;
  state.addLastColor = colorRaw || null;
  state.addLastSeason = seasonRaw || null;
  state.addLastWarmth = warmthRaw || null;
  state.addLastStyle = styleRaw || null;

  const resp = await apiFetch("/api/wardrobe", {
    method: "POST",
    body: { name, type, color, brand, material, season, warmth, style },
  });
  if (!resp.ok) {
    const t = await resp.text();
    setText(els.addModalError, t);
    setText(els.itemError, t);
    return;
  }

  const created = await resp.json();
  const item = created.item;
  const f = state.addPhotoFile;

  if (f && item?.id) {
    try {
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Не удалось прочитать файл."));
        reader.readAsDataURL(f);
      });

      const r = await apiFetch("/api/wardrobe/upload", {
        method: "POST",
        body: { contentType: f.type || "image/jpeg", imageBase64, itemId: item.id },
      });
      if (!r.ok) {
        const t = await r.text();
        setText(els.addModalError, t);
        setText(els.itemError, t);
        return;
      }
    } catch (err) {
      const t = err?.message ?? String(err);
      setText(els.addModalError, t);
      setText(els.itemError, t);
      return;
    }
  }

  await renderWardrobe();
  await renderAvatar();
  closeAddModal();
});

els.weatherForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(els.weatherForm);
  await loadWeather(String(form.get("lat") ?? "").trim(), String(form.get("lng") ?? "").trim());
});

els.suggestForm.addEventListener("submit", suggestOutfit);
if (els.useGpsBtn) {
  els.useGpsBtn.addEventListener("click", () =>
    useGps().catch((e) => setText(els.weatherError, e?.message ?? String(e))),
  );
}
if (els.suggestFromWeatherBtn) {
  els.suggestFromWeatherBtn.addEventListener("click", () =>
    suggestFromWeather().catch((e) => setText(els.suggestError, e?.message ?? String(e))),
  );
}

if (els.applyToAvatarBtn) {
  els.applyToAvatarBtn.addEventListener("click", () => {
    const items = state.lastSuggestion?.items ?? [];
    if (!Array.isArray(items) || items.length === 0) {
      setText(els.suggestError, "Сначала подбери образ.");
      return;
    }
    setAvatarSelection(items.map((i) => i.id));
    setScreen("avatar");
  });
}

async function submitFeedback(feedback) {
  setText(els.feedbackStatus, "");
  const id = state.lastSuggestionOutfitId;
  if (!id) {
    setText(els.feedbackStatus, "Сначала подбери образ.");
    return;
  }
  const reason = String(els.feedbackReason?.value ?? "").trim() || undefined;
  const resp = await apiFetch(`/api/outfits/${id}/feedback`, { method: "PATCH", body: { feedback, reason } });
  if (!resp.ok) {
    setText(els.feedbackStatus, await resp.text());
    return;
  }
  setText(els.feedbackStatus, feedback === "like" ? "Сохранено: нравится" : "Сохранено: не нравится");
}

if (els.feedbackLikeBtn) {
  els.feedbackLikeBtn.addEventListener("click", () => submitFeedback("like").catch((e) => setText(els.feedbackStatus, e?.message ?? String(e))));
}
if (els.feedbackDislikeBtn) {
  els.feedbackDislikeBtn.addEventListener("click", () =>
    submitFeedback("dislike").catch((e) => setText(els.feedbackStatus, e?.message ?? String(e))),
  );
}

if (els.avatarStage) {
  els.avatarStage.addEventListener("dragover", (e) => e.preventDefault());
  els.avatarStage.addEventListener("drop", (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      state.avatarSelectedIds.add(id);
      setAvatarSelection(Array.from(state.avatarSelectedIds));
      renderAvatar().catch(() => {});
    }
  });
}

if (els.avatarClearBtn) {
  els.avatarClearBtn.addEventListener("click", () => {
    setAvatarSelection([]);
    renderAvatar().catch(() => {});
  });
}

els.logoutBtn.addEventListener("click", async () => {
  storage.accessToken = null;
  storage.refreshToken = null;
  await enterApp();
});

setAuthMode("login");
await enterApp();
