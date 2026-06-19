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
    outfits: document.getElementById("screenOutfits"),
  },

  homeSuggestBtn: document.getElementById("homeSuggestBtn"),
  homeMeta: document.getElementById("homeMeta"),
  homeOutfit: document.getElementById("homeOutfit"),
  homeError: document.getElementById("homeError"),
  goWardrobeBtn: document.getElementById("goWardrobeBtn"),
  homeApplyOutfitBtn: document.getElementById("homeApplyOutfitBtn"),
  homeLikeOutfitBtn: document.getElementById("homeLikeOutfitBtn"),

  // Outfits screen
  refreshOutfitsBtn: document.getElementById("refreshOutfitsBtn"),
  outfitsList: document.getElementById("outfitsList"),
  outfitsError: document.getElementById("outfitsError"),

  // Wardrobe screen
  refreshBtn: document.getElementById("refreshBtn"),
  searchInput: document.getElementById("searchInput"),
  filterType: document.getElementById("filterType"),
  filterSeason: document.getElementById("filterSeason"),
  filterColor: document.getElementById("filterColor"),
  itemsList: document.getElementById("itemsList"),
  itemError: document.getElementById("itemError"),
  addItemBtn: document.getElementById("addItemBtn"),
  fabAddBtn: document.getElementById("fabAddBtn"),
  itemForm: document.getElementById("itemForm"),
  itemPhoto: document.getElementById("itemPhoto"),

  // Avatar screen
  avatarSaveOutfitBtn: document.getElementById("avatarSaveOutfitBtn"),
  avatarGenderSelect: document.getElementById("avatarGenderSelect"),

  // Quick actions
  quickAddItem: document.getElementById("quickAddItem"),
  quickSuggestOutfit: document.getElementById("quickSuggestOutfit"),
  quickGoAvatar: document.getElementById("quickGoAvatar"),

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
  addUndoPointBtn: document.getElementById("addUndoPointBtn"),
  addCutoutBtn: document.getElementById("addCutoutBtn"),
  addCutoutStatus: document.getElementById("addCutoutStatus"),
  addSkipPhotoBtn: document.getElementById("addSkipPhotoBtn"),
  addPolygonCanvas: document.getElementById("addPolygonCanvas"),
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
  avatarLayers: document.getElementById("avatarLayers"),
  avatarWear: document.getElementById("avatarWear"),
  avatarItems: document.getElementById("avatarItems"),
  avatarClearBtn: document.getElementById("avatarClearBtn"),
  avatarRotateLeftBtn: document.getElementById("avatarRotateLeftBtn"),
  avatarRotateRightBtn: document.getElementById("avatarRotateRightBtn"),
  avatarResetLayerBtn: document.getElementById("avatarResetLayerBtn"),

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
  avatarLayerTransforms: Object.create(null),
  avatarZ: 1,
  avatarActiveId: null,
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
  addPolygonPoints: [],
  addPolygonActive: false,
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
  if (name === "home") renderRecentItems().catch(() => {});
  if (name === "wardrobe") renderWardrobe().catch(() => {});
  if (name === "avatar") renderAvatar().catch(() => {});
  if (name === "settings") renderProfile().catch(() => {});
  if (name === "outfits") loadOutfits().catch(() => {});
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
  const type = String(els.filterType?.value ?? "").trim();
  const season = String(els.filterSeason?.value ?? "").trim();
  const color = String(els.filterColor?.value ?? "").trim();
  const search = String(els.searchInput?.value ?? "").trim().toLowerCase();
  
  return items.filter((item) => {
    if (type && item.type !== type) return false;
    if (season && item.season !== season) return false;
    if (color && item.color !== color) return false;
    if (search && !String(item.name ?? "").toLowerCase().includes(search)) return false;
    return true;
  });
}

// Функции для работы с аватаром
function getAvatarStyle() {
  return String(storage.avatarStyle || "default").trim();
}

function setAvatarStyle(style) {
  storage.avatarStyle = style;
  const avatarBase = document.getElementById("avatarBase");
  if (avatarBase) avatarBase.setAttribute("data-style", style);
}

function applyAvatarStyle() {
  const style = getAvatarStyle();
  const avatarBase = document.getElementById("avatarBase");
  if (avatarBase) avatarBase.setAttribute("data-style", style);
}

function getAvatarGender() {
  return String(storage.avatarGender || "male").trim();
}

function setAvatarGender(gender) {
  storage.avatarGender = gender;
  const avatarBase = document.getElementById("avatarBase");
  if (avatarBase) avatarBase.setAttribute("data-gender", gender);
}

function applyAvatarGender() {
  const gender = getAvatarGender();
  const avatarBase = document.getElementById("avatarBase");
  if (avatarBase) avatarBase.setAttribute("data-gender", gender);
  if (els.avatarGenderSelect) els.avatarGenderSelect.value = gender;
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

    const blob = await new Promise((resolve) => out.toBlob(resolve, "image/jpeg", 0.92));
    if (blob) return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
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

    const blob = await new Promise((resolve) => out.toBlob(resolve, "image/jpeg", 0.92));
    if (blob) return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
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
  const polygonCanvas = els.addPolygonCanvas;
  const img = els.addPhotoPreview;
  const wrap = els.addPhotoPreviewWrap;
  if (!canvas || !polygonCanvas || !img || !wrap) return;
  const rect = wrap.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  if (polygonCanvas.width !== w) polygonCanvas.width = w;
  if (polygonCanvas.height !== h) polygonCanvas.height = h;
  drawAddCropCanvas();
}

function drawAddCropCanvas() {
  const canvas = els.addCropCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const lineW = Math.max(2, Math.round((window.devicePixelRatio || 1) * 1.25));
  const nr = normalizeRect(state.addCropRect);
  if (!nr || nr.w < 6 || nr.h < 6) {
    // Не блокируем кнопку, если есть полигон
    if (state.addPolygonPoints.length < 3 && els.addCutoutBtn) {
      els.addCutoutBtn.disabled = true;
    }
  } else {
    if (els.addCutoutBtn) els.addCutoutBtn.disabled = false;
  }

  // Активируем кнопку, если есть хотя бы 3 точки в полигоне
  if (state.addPolygonPoints.length >= 3 && els.addCutoutBtn) {
    els.addCutoutBtn.disabled = false;
  }

  if (nr) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(nr.x, nr.y, nr.w, nr.h);
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = lineW;
    ctx.strokeRect(nr.x + 0.5, nr.y + 0.5, nr.w - 1, nr.h - 1);
  }

  drawPolygon();
}

function resetAddCropSelection() {
  state.addCropRect = null;
  state.addCropActive = false;
  state.addCropPointerId = null;
  drawAddCropCanvas();
}

function clearPolygonCanvas() {
  const canvas = els.addPolygonCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPolygon() {
  const canvas = els.addPolygonCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  clearPolygonCanvas();

  if (state.addPolygonPoints.length === 0) return;

  // Рисуем полигон
  ctx.beginPath();
  ctx.moveTo(state.addPolygonPoints[0].x, state.addPolygonPoints[0].y);
  for (let i = 1; i < state.addPolygonPoints.length; i++) {
    ctx.lineTo(state.addPolygonPoints[i].x, state.addPolygonPoints[i].y);
  }
  if (state.addPolygonPoints.length >= 3) ctx.closePath();
  ctx.strokeStyle = "rgba(124, 58, 237, 0.8)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "rgba(124, 58, 237, 0.15)";
  ctx.fill();

  // Рисуем точки
  for (let i = 0; i < state.addPolygonPoints.length; i++) {
    ctx.beginPath();
    ctx.arc(state.addPolygonPoints[i].x, state.addPolygonPoints[i].y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(124, 58, 237, 0.9)";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function getPolygonPointerCoords(e) {
  const canvas = els.addPolygonCanvas;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  if (e.touches) {
    const touch = e.touches[0];
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function addPolygonPoint(e) {
  e.preventDefault();
  const coords = getPolygonPointerCoords(e);
  if (!coords) return;
  state.addPolygonPoints.push(coords);
  drawPolygon();
}

function undoPolygonPoint() {
  if (state.addPolygonPoints.length > 0) {
    state.addPolygonPoints.pop();
    drawPolygon();
  }
}

// Функция для проверки, находится ли точка внутри полигона (алгоритм лучевого пересечения)
function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}



async function aiCutoutAddPhotoFromRect() {
  const file = state.addPhotoFile;
  const img = els.addPhotoPreview;
  const cropCanvas = els.addCropCanvas;
  const polygonCanvas = els.addPolygonCanvas;
  if (!file || !img || !cropCanvas || !polygonCanvas) return;

  const iw = img.naturalWidth || 0;
  const ih = img.naturalHeight || 0;
  if (!iw || !ih) return;

  let sx, sy, sw, sh;
  let usePolygon = false;

  if (state.addPolygonPoints.length >= 3) {
    usePolygon = true;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of state.addPolygonPoints) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    sx = minX * (iw / cropCanvas.width);
    sy = minY * (ih / cropCanvas.height);
    sw = (maxX - minX) * (iw / cropCanvas.width);
    sh = (maxY - minY) * (ih / cropCanvas.height);
  } else {
    const nr = normalizeRect(state.addCropRect) ?? { x: 0, y: 0, w: cropCanvas.width, h: cropCanvas.height };
    if (nr.w < 6 || nr.h < 6) return;
    sx = nr.x * (iw / cropCanvas.width);
    sy = nr.y * (ih / cropCanvas.height);
    sw = nr.w * (iw / cropCanvas.width);
    sh = nr.h * (ih / cropCanvas.height);
  }

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

  if (usePolygon) {
    const minX = state.addPolygonPoints.reduce((m, p) => Math.min(m, p.x), Infinity);
    const minY = state.addPolygonPoints.reduce((m, p) => Math.min(m, p.y), Infinity);
    const scaleX = (outW / (Math.max(...state.addPolygonPoints.map(p => p.x)) - minX)) * scale;
    const scaleY = (outH / (Math.max(...state.addPolygonPoints.map(p => p.y)) - minY)) * scale;

    cctx.beginPath();
    const transformedPoints = state.addPolygonPoints.map(p => ({
      x: (p.x - minX) * (iw / cropCanvas.width) * scale,
      y: (p.y - minY) * (ih / cropCanvas.height) * scale
    }));
    cctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
    for (let i = 1; i < transformedPoints.length; i++) {
      cctx.lineTo(transformedPoints[i].x, transformedPoints[i].y);
    }
    cctx.closePath();
    cctx.save();
    cctx.clip();
  }

  cctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);

  if (usePolygon) {
    cctx.restore();
  }

  setText(els.addCutoutStatus, "Вырезаю…");

  const blob = await new Promise((resolve) => crop.toBlob(resolve, "image/jpeg", 0.9));
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
      body: { contentType: "image/jpeg", imageBase64: base64 },
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
    state.addPolygonPoints = [];
    drawPolygon();
    const url = URL.createObjectURL(cut);
    setAddPhotoPreviewUrl(url);
    if (els.addPhotoPreview) els.addPhotoPreview.src = url;
    els.addPhotoPreviewWrap?.classList.add("preview--show");
    setText(els.addCutoutStatus, "Готово");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setText(els.addCutoutStatus, `Не получилось вырезать (сервер): ${String(msg || "").slice(0, 2000)}`);
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
  state.editingItem = null;
  setText(els.addModalError, "");
  if (!els.addModal) return;
  els.addModal.classList.remove("modal--hidden");
  document.body.style.overflow = "hidden";

  state.addPhotoFile = null;
  state.addDetectNonce += 1;
  state.addPolygonPoints = [];
  if (els.addPhotoInput) els.addPhotoInput.value = "";
  if (els.addPhotoPreview) els.addPhotoPreview.src = "";
  setAddPhotoPreviewUrl(null);
  els.addPhotoPreviewWrap?.classList.remove("preview--show");
  setText(els.addAutoColor, "");
  setText(els.addCropHint, "Тапни по фото, чтобы добавить точки — обведи ими одежду. Затем нажми «Вырезать».");
  setText(els.addCutoutStatus, "");
  resetAddCropSelection();
  clearPolygonCanvas();

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

  // Обновляем заголовок модалки
  const modalTitle = document.getElementById("addModalTitle");
  if (modalTitle) modalTitle.textContent = "Новая вещь";

  setAddStep("photo");
}

function openEditModal(item) {
  state.editingItem = item;
  setText(els.addModalError, "");
  if (!els.addModal) return;
  els.addModal.classList.remove("modal--hidden");
  document.body.style.overflow = "hidden";

  state.addPhotoFile = null;
  state.addDetectNonce += 1;
  if (els.addPhotoInput) els.addPhotoInput.value = "";
  if (els.addPhotoPreview) els.addPhotoPreview.src = item.photoUrl || "";
  setAddPhotoPreviewUrl(item.photoUrl || null);
  els.addPhotoPreviewWrap?.classList.toggle("preview--show", !!item.photoUrl);
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

  if (typeSelect) typeSelect.value = item.type || "";
  if (colorInput) colorInput.value = item.color || "";
  if (seasonSelect) seasonSelect.value = item.season || "";
  if (warmthSelect) warmthSelect.value = item.warmth?.toString() || "";
  if (styleSelect) styleSelect.value = item.style || "";
  if (brandInput) brandInput.value = item.brand || "";
  if (materialInput) materialInput.value = item.material || "";
  if (nameInput) nameInput.value = item.name || "";

  // Обновляем заголовок модалки
  const modalTitle = document.getElementById("addModalTitle");
  if (modalTitle) modalTitle.textContent = "Редактировать вещь";

  setAddStep("details");
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
    div.className = "wardrobe-item";

    // Изображение
    const imageWrap = document.createElement("div");
    imageWrap.className = "wardrobe-item__image";
    if (item.photoUrl) {
      const img = document.createElement("img");
      img.src = item.photoUrl;
      img.alt = item.name;
      imageWrap.appendChild(img);
    } else {
      imageWrap.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" style="width:48px;height:48px;color:var(--muted)">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      `;
    }

    // Информация
    const info = document.createElement("div");
    info.className = "wardrobe-item__info";

    const name = document.createElement("div");
    name.className = "wardrobe-item__name";
    name.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "wardrobe-item__meta";
    const parts = [];
    parts.push(String(item.type));
    if (item.color) parts.push(String(item.color));
    if (item.season) parts.push(String(item.season));
    if (item.warmth != null) parts.push(`🔥 ${item.warmth}`);
    if (item.style) parts.push(String(item.style));
    parts.forEach(p => {
      const span = document.createElement("span");
      span.textContent = p;
      meta.appendChild(span);
    });

    info.appendChild(name);
    info.appendChild(meta);

    // Кнопки действий (редактировать и удалить)
    const actions = document.createElement("div");
    actions.className = "wardrobe-item__actions";
    actions.style.marginTop = "auto";
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.flexWrap = "wrap";

    // Кнопка добавить на аватар
    const addBtn = document.createElement("button");
    addBtn.className = "btn btn--ghost";
    addBtn.textContent = "Примерить";
    addBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      state.avatarSelectedIds.add(item.id);
      await renderAvatar();
      setScreen("avatar");
    });

    // Кнопка редактировать
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn--ghost";
    editBtn.textContent = "Редактировать";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditModal(item);
    });

    // Кнопка удалить
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn--ghost";
    deleteBtn.style.color = "var(--danger)";
    deleteBtn.textContent = "Удалить";
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (confirm("Удалить вещь?")) {
        try {
          const resp = await apiFetch(`/api/wardrobe/${item.id}`, {
            method: "DELETE",
          });
          if (resp.ok) await renderWardrobe();
        } catch {
          setText(els.itemError, "Не удалось удалить вещь");
        }
      }
    });

    actions.appendChild(addBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    // Добавляем всё в карточку
    div.appendChild(imageWrap);
    div.appendChild(info);
    div.appendChild(actions);

    els.itemsList.appendChild(div);
  }
}

async function renderRecentItems() {
  const container = document.getElementById("homeRecentItems");
  if (!container) return;
  container.innerHTML = "";

  let items;
  try {
    items = await fetchWardrobe();
  } catch {
    return;
  }

  const recent = items.slice(0, 4); // последние 4 вещи
  if (recent.length === 0) {
    container.innerHTML = '<div class="muted">Пока нет вещей</div>';
    return;
  }

  for (const item of recent) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.innerHTML = `
      <span class="tile__icon" aria-hidden="true">
        ${item.photoUrl ? `<img src="${item.photoUrl}" alt="" style="width:100%;height:100%;object-fit:contain;border-radius:12px" />` : `
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        `}
      </span>
      <span class="tile__label">
        <span>${item.name}</span>
        <span class="tile__sub">${item.type}</span>
      </span>
    `;
    tile.addEventListener("click", async () => {
      state.avatarSelectedIds.add(item.id);
      await renderAvatar();
      setScreen("avatar");
    });
    container.appendChild(tile);
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

function getWeatherIconSvg(condition) {
  const c = (condition || "").toLowerCase();
  if (c.includes("rain") || c.includes("дождь")) {
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 13v8" />
      <path d="M8 13v8" />
      <path d="M12 15v8" />
      <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
    </svg>`;
  }
  if (c.includes("cloud") || c.includes("облач")) {
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>`;
  }
  if (c.includes("snow") || c.includes("снег")) {
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v22" />
      <path d="M4.93 4.93l14.14 14.14" />
      <path d="M19.07 4.93L4.93 19.07" />
      <path d="M2 12h20" />
      <path d="M8 6v2a2 2 0 0 1-2 2H4" />
      <path d="M16 6v2a2 2 0 0 0 2 2h2" />
      <path d="M8 16v2a2 2 0 0 0 2 2h2" />
      <path d="M16 16v2a2 2 0 0 1 2 2h2" />
    </svg>`;
  }
  // По умолчанию солнце
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
    <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
  </svg>`;
}

async function renderHomeWeather() {
  const w = state.lastWeather;
  if (!w) return;

  const tempEl = document.getElementById("homeWeatherTemp");
  const descEl = document.getElementById("homeWeatherDesc");
  const iconEl = document.querySelector("#homeWeatherWidget .weather-icon");

  if (tempEl) setText(tempEl, `${w.temperature ?? "—"}°C`);
  
  let desc = w.description || w.condition || "Погода не загружена";
  if (w.locationName) {
    desc = `${w.locationName} · ${desc}`;
  }
  if (descEl) setText(descEl, desc);

  if (iconEl) {
    iconEl.innerHTML = getWeatherIconSvg(w.condition);
  }
}

async function loadOutfits() {
  setText(els.outfitsError, "");
  try {
    const resp = await apiFetch("/api/outfits");
    if (!resp.ok) {
      setText(els.outfitsError, "Не удалось загрузить образы");
      return;
    }
    const data = await resp.json();
    state.outfits = data.outfits || [];
    renderOutfits();
  } catch (e) {
    setText(els.outfitsError, "Не удалось загрузить образы");
  }
}

async function renderOutfits() {
  if (!els.outfitsList) return;
  els.outfitsList.innerHTML = "";

  const outfits = state.outfits || [];
  if (outfits.length === 0) {
    const div = document.createElement("div");
    div.className = "muted";
    div.style.gridColumn = "1 / -1";
    div.style.textAlign = "center";
    div.style.padding = "2rem";
    div.textContent = "Пока нет сохранённых образов. Создай первый на главной!";
    els.outfitsList.appendChild(div);
    return;
  }

  // Создадим карточки для каждого образа
  for (const outfit of outfits) {
    const card = document.createElement("div");
    card.className = "wardrobe-item";
    card.style.padding = "1rem";
    card.style.flexDirection = "column";
    card.style.gap = "0.75rem";
    card.style.background = "var(--card)";
    card.style.borderRadius = "var(--radius-lg)";
    card.style.boxShadow = "var(--shadow-md)";

    // Заголовок
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "flex-start";
    header.style.gap = "0.5rem";

    const title = document.createElement("div");
    title.className = "wardrobe-item__name";
    title.textContent = outfit.name || "Без названия";
    if (outfit.userFeedback === 1) {
      title.textContent += " ❤️";
    } else if (outfit.userFeedback === -1) {
      title.textContent += " 👎";
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn--ghost";
    deleteBtn.style.padding = "0.5rem";
    deleteBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 16h10l1-16"/></svg>`;
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        const resp = await apiFetch(`/api/outfits/${outfit.id}`, { method: "DELETE" });
        if (resp.ok) await loadOutfits();
      } catch {
        setText(els.outfitsError, "Не удалось удалить образ");
      }
    });

    header.appendChild(title);
    header.appendChild(deleteBtn);
    card.appendChild(header);

    // Детали (дата, погода, повод)
    const meta = document.createElement("div");
    meta.className = "wardrobe-item__meta";
    const metaParts = [];
    if (outfit.wornDate) {
      const d = new Date(outfit.wornDate);
      metaParts.push(d.toLocaleDateString());
    }
    if (outfit.weatherCondition) metaParts.push(outfit.weatherCondition);
    if (outfit.occasion) metaParts.push(outfit.occasion);
    meta.textContent = metaParts.join(" · ");
    card.appendChild(meta);

    // Превью вещей
    const itemsPreview = document.createElement("div");
    itemsPreview.style.display = "flex";
    itemsPreview.style.flexWrap = "wrap";
    itemsPreview.style.gap = "0.5rem";
    itemsPreview.style.marginTop = "0.5rem";

    // Получим вещи из state.wardrobeItems, если они есть
    const itemIds = Array.isArray(outfit.items) ? outfit.items : [];
    for (let i = 0; i < Math.min(itemIds.length, 4); i++) {
      const id = itemIds[i];
      const item = state.wardrobeItems?.find((x) => x.id === id);
      const img = document.createElement("img");
      img.style.width = "3rem";
      img.style.height = "3rem";
      img.style.objectFit = "contain";
      img.style.background = "var(--card2)";
      img.style.borderRadius = "0.5rem";
      if (item?.photoUrl) {
        img.src = item.photoUrl;
        img.alt = item.name || "";
      } else {
        img.alt = "Вещь без фото";
        img.src = "";
      }
      itemsPreview.appendChild(img);
    }
    card.appendChild(itemsPreview);

    // Кнопки действий
    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "0.5rem";
    actions.style.marginTop = "0.5rem";

    const applyBtn = document.createElement("button");
    applyBtn.className = "btn";
    applyBtn.style.flex = "1";
    applyBtn.textContent = "Примерить";
    applyBtn.addEventListener("click", () => {
      setAvatarSelection(itemIds);
      setScreen("avatar");
    });

    actions.appendChild(applyBtn);
    card.appendChild(actions);

    // Клик по карточке — тоже применить
    card.addEventListener("click", () => {
      setAvatarSelection(itemIds);
      setScreen("avatar");
    });

    els.outfitsList.appendChild(card);
  }
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
  await renderHomeWeather();
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

function renderHomeOutfitPreview(items) {
  const el = document.getElementById("homeOutfitPreview");
  const actionsEl = document.getElementById("homeOutfitActions");
  
  if (!el) return;
  
  el.innerHTML = "";
  
  if (!Array.isArray(items) || items.length === 0) {
    el.innerHTML = '<div class="muted">Нажми "Подобрать образ" — я предложу вариант</div>';
    if (actionsEl) actionsEl.style.display = "none";
    return;
  }
  
  // Показываем кнопки действий
  if (actionsEl) actionsEl.style.display = "flex";
  
  for (const item of items) {
    const div = document.createElement("div");
    div.className = "outfit-item";
    
    const img = document.createElement("img");
    img.src = item.photoUrl || "";
    img.alt = item.name || "";
    img.loading = "lazy";
    
    div.appendChild(img);
    el.appendChild(div);
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
    renderHomeOutfitPreview(null);
    return;
  }

  const data = await resp.json();
  state.lastSuggestion = data;
  const items = data.items ?? [];
  if (items.length === 0) {
    setText(els.homeError, "Не получилось собрать образ. Добавь вещи в гардероб.");
    renderHomeOutfitPreview(null);
    return;
  }

  setText(els.homeOutfit, formatOutfitText(items, data.explanation ?? ""));
  setText(els.homeMeta, `Источник: ${data.provider ?? "unknown"}`);
  renderHomeOutfitPreview(items);

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

function setAvatarLayerTransforms(next) {
  state.avatarLayerTransforms = next && typeof next === "object" ? next : Object.create(null);
}

let avatarTransformsPersistTimer = null;
function persistAvatarLayerTransformsNow() {
  try {
    localStorage.setItem("avatarLayerTransforms", JSON.stringify(state.avatarLayerTransforms || Object.create(null)));
  } catch {}
}

function scheduleAvatarLayerTransformsPersist() {
  if (avatarTransformsPersistTimer) clearTimeout(avatarTransformsPersistTimer);
  avatarTransformsPersistTimer = setTimeout(() => {
    avatarTransformsPersistTimer = null;
    persistAvatarLayerTransformsNow();
  }, 250);
}

function restoreAvatarLayerTransforms() {
  try {
    const raw = localStorage.getItem("avatarLayerTransforms");
    const obj = raw ? JSON.parse(raw) : null;
    if (obj && typeof obj === "object") {
      setAvatarLayerTransforms(obj);
      return;
    }
  } catch {}
  setAvatarLayerTransforms(Object.create(null));
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

function getAvatarTransform(itemId) {
  const t = state.avatarLayerTransforms?.[itemId];
  const x = Number.isFinite(t?.x) ? t.x : 0;
  const y = Number.isFinite(t?.y) ? t.y : 0;
  const s = Number.isFinite(t?.s) ? t.s : 1;
  const r = Number.isFinite(t?.r) ? t.r : 0;
  return { x, y, s, r };
}

function saveAvatarTransform(itemId, t) {
  const next = { ...(state.avatarLayerTransforms || Object.create(null)) };
  next[itemId] = { x: t.x, y: t.y, s: t.s, r: t.r ?? 0 };
  setAvatarLayerTransforms(next);
  scheduleAvatarLayerTransformsPersist();
}

function applyAvatarLayerTransform(el, t) {
  el.style.transform = `translate(-50%, -50%) translate(${t.x}px, ${t.y}px) rotate(${t.r || 0}deg) scale(${t.s})`;
}

function defaultAvatarTransformForItem(item) {
  const type = String(item?.type || "").toLowerCase();
  if (type === "shirt") return { x: 0, y: -40, s: 1.05, r: 0 };
  if (type === "jacket") return { x: 0, y: -30, s: 1.1, r: 0 };
  if (type === "pants") return { x: 0, y: 90, s: 1.1, r: 0 };
  if (type === "shoes") return { x: 0, y: 160, s: 0.9, r: 0 };
  if (type === "accessories") return { x: 0, y: -120, s: 0.75, r: 0 };
  return { x: 0, y: 0, s: 1, r: 0 };
}

function setAvatarActive(itemId) {
  state.avatarActiveId = itemId || null;
  const root = els.avatarLayers || els.avatarStage;
  if (!root) return;
  for (const el of root.querySelectorAll(".avatar__layer")) {
    const id = el?.dataset?.itemId;
    el.classList.toggle("avatar__layer--active", Boolean(id && id === state.avatarActiveId));
  }
}

function bindAvatarLayerGestures(el, itemId) {
  const pointers = new Map();
  let drag = null;
  let pinch = null;

  const getEventXY = (e) => ({ x: e.clientX, y: e.clientY });

  const onDown = (e) => {
    if (!(e instanceof PointerEvent)) return;
    try {
      e.preventDefault();
      e.stopPropagation();
    } catch {}
    setAvatarActive(itemId);
    el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, getEventXY(e));
    el.style.zIndex = String((state.avatarZ += 1));

    const t = getAvatarTransform(itemId);
    if (pointers.size === 1) {
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, tx: t.x, ty: t.y };
      pinch = null;
    } else if (pointers.size === 2) {
      const arr = Array.from(pointers.values());
      const dx = arr[0].x - arr[1].x;
      const dy = arr[0].y - arr[1].y;
      pinch = { dist0: Math.max(1, Math.hypot(dx, dy)), s0: t.s };
      drag = null;
    }
  };

  const onMove = (e) => {
    if (!(e instanceof PointerEvent)) return;
    if (!pointers.has(e.pointerId)) return;
    try {
      e.preventDefault();
      e.stopPropagation();
    } catch {}
    pointers.set(e.pointerId, getEventXY(e));

    const t = getAvatarTransform(itemId);
    if (pinch && pointers.size >= 2) {
      const arr = Array.from(pointers.values()).slice(0, 2);
      const dx = arr[0].x - arr[1].x;
      const dy = arr[0].y - arr[1].y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const ns = clamp(pinch.s0 * (dist / pinch.dist0), 0.25, 3.5);
      const next = { x: t.x, y: t.y, s: ns, r: t.r };
      applyAvatarLayerTransform(el, next);
      saveAvatarTransform(itemId, next);
      return;
    }

    if (drag && drag.id === e.pointerId) {
      const dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;
      const next = { x: drag.tx + dx, y: drag.ty + dy, s: t.s, r: t.r };
      applyAvatarLayerTransform(el, next);
      saveAvatarTransform(itemId, next);
    }
  };

  const onUp = (e) => {
    if (!(e instanceof PointerEvent)) return;
    pointers.delete(e.pointerId);
    if (drag && drag.id === e.pointerId) drag = null;
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) persistAvatarLayerTransformsNow();
  };

  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
}

async function renderAvatar() {
  if (!els.avatarItems || !els.avatarWear || !els.avatarStage) return;
  els.avatarItems.innerHTML = "";
  els.avatarWear.innerHTML = "";
  if (els.avatarLayers) els.avatarLayers.innerHTML = "";

  if (!Array.isArray(state.wardrobeItems) || state.wardrobeItems.length === 0) {
    try {
      await fetchWardrobe();
    } catch {}
  }

  const items = state.wardrobeItems ?? [];
  for (const item of items) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = state.avatarSelectedIds.has(item.id) ? "chip chip--active" : "chip";
    b.draggable = true;
    b.textContent = item.name;
    b.dataset.itemId = item.id;
    b.addEventListener("click", () => {
      if (state.avatarSelectedIds.has(item.id)) state.avatarSelectedIds.delete(item.id);
      else state.avatarSelectedIds.add(item.id);
      setAvatarSelection(Array.from(state.avatarSelectedIds));
      if (state.avatarSelectedIds.has(item.id)) setAvatarActive(item.id);
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

  const layers = els.avatarLayers ?? els.avatarStage;
  let anyImage = false;
  for (const item of selected) {
    const src = String(item.photoUrl || "").trim();
    if (!src) continue;
    anyImage = true;
    const img = document.createElement("img");
    img.className = "avatar__layer";
    img.alt = item.name || "";
    img.draggable = false;
    img.src = src;
    img.dataset.itemId = item.id;
    let t = getAvatarTransform(item.id);
    if (!state.avatarLayerTransforms?.[item.id]) {
      t = defaultAvatarTransformForItem(item);
      saveAvatarTransform(item.id, t);
    }
    applyAvatarLayerTransform(img, t);
    img.classList.toggle("avatar__layer--active", state.avatarActiveId === item.id);
    bindAvatarLayerGestures(img, item.id);
    layers.appendChild(img);
  }

  for (const item of selected) {
    const w = document.createElement("div");
    w.className = "wear";
    w.textContent = `${item.name} (${item.type}${item.color ? `, ${item.color}` : ""})`;
    w.addEventListener("click", () => {
      state.avatarSelectedIds.delete(item.id);
      setAvatarSelection(Array.from(state.avatarSelectedIds));
      renderAvatar().catch(() => {});
    });
    els.avatarWear.appendChild(w);
  }

  if (!anyImage) {
    const hint = document.createElement("div");
    hint.className = "muted";
    hint.textContent = "У выбранных вещей нет фото. Сначала добавь фото (лучше — вырезанное без фона).";
    els.avatarWear.appendChild(hint);
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
  restoreAvatarLayerTransforms();
  applyAvatarStyle();
  applyAvatarGender();
  await renderTopbar();
  setScreen("home");
  await renderWardrobe();
  
  // Автоматически загружаем погоду
  try {
    await loadWeather();
    await renderHomeWeather();
  } catch {}
}

els.tabLogin.addEventListener("click", () => setAuthMode("login"));
els.tabRegister.addEventListener("click", () => setAuthMode("register"));
els.authForm.addEventListener("submit", onAuthSubmit);

if (els.refreshBtn) els.refreshBtn.addEventListener("click", () => renderWardrobe().catch(() => {}));
if (els.filterType) els.filterType.addEventListener("change", () => renderWardrobe().catch(() => {}));
if (els.filterSeason) els.filterSeason.addEventListener("change", () => renderWardrobe().catch(() => {}));
if (els.filterColor) els.filterColor.addEventListener("change", () => renderWardrobe().catch(() => {}));
if (els.searchInput) els.searchInput.addEventListener("input", () => renderWardrobe().catch(() => {}));
if (els.avatarGenderSelect) {
  els.avatarGenderSelect.addEventListener("change", () => setAvatarGender(els.avatarGenderSelect.value));
}
if (els.addItemBtn) {
  els.addItemBtn.addEventListener("click", () => openAddModal({ prefillType: String(els.filterType?.value ?? "").trim() }));
}



// Обработчик плавающей кнопки добавления
if (els.fabAddBtn) {
  els.fabAddBtn.addEventListener("click", () => openAddModal({}));
}

// Быстрые действия (quick actions)
if (els.quickAddItem) {
  els.quickAddItem.addEventListener("click", () => openAddModal({}));
}
if (els.quickSuggestOutfit) {
  els.quickSuggestOutfit.addEventListener("click", () =>
    homeSuggest().catch((e) => setText(els.homeError, e?.message ?? String(e))),
  );
}
if (els.quickGoAvatar) {
  els.quickGoAvatar.addEventListener("click", () => setScreen("avatar"));
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

// Обработчики кнопок на главной для образа
if (els.homeApplyOutfitBtn) {
  els.homeApplyOutfitBtn.addEventListener("click", () => {
    const items = state.lastSuggestion?.items ?? [];
    if (!Array.isArray(items) || items.length === 0) {
      setText(els.homeError, "Сначала подбери образ.");
      return;
    }
    setAvatarSelection(items.map((i) => i.id));
    setScreen("avatar");
  });
}
if (els.homeLikeOutfitBtn) {
  els.homeLikeOutfitBtn.addEventListener("click", () => 
    submitFeedback("like").catch((e) => setText(els.homeError, e?.message ?? String(e)))
  );
}

// Инициализация приложения при загрузке страницы
enterApp();

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
    state.addPolygonPoints = [];
    drawPolygon();
    setText(els.addCropHint, "Тапни по фото, чтобы добавить точки — обведи ими одежду. Затем нажми «Вырезать».");
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

if (els.addCropResetBtn) {
  els.addCropResetBtn.addEventListener("click", () => {
    resetAddCropSelection();
    state.addPolygonPoints = [];
    drawPolygon();
  });
}

if (els.addUndoPointBtn) {
  els.addUndoPointBtn.addEventListener("click", undoPolygonPoint);
}

if (els.addPolygonCanvas) {
  els.addPolygonCanvas.addEventListener("pointerdown", addPolygonPoint);
  els.addPolygonCanvas.addEventListener("touchstart", addPolygonPoint, { passive: false });
}

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

  let item;
  if (state.editingItem) {
    // Редактирование вещи
    const resp = await apiFetch(`/api/wardrobe/${state.editingItem.id}`, {
      method: "PUT",
      body: { name, type, color, brand, material, season, warmth, style },
    });
    if (!resp.ok) {
      const t = await resp.text();
      setText(els.addModalError, t);
      setText(els.itemError, t);
      return;
    }
    const updated = await resp.json();
    item = updated.item;
  } else {
    // Добавление новой вещи
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
    item = created.item;
  }

  // Загружаем фото, если есть
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

if (els.refreshOutfitsBtn) {
  els.refreshOutfitsBtn.addEventListener("click", () => loadOutfits().catch(() => {}));
}

if (els.homeApplyOutfitBtn) {
  els.homeApplyOutfitBtn.addEventListener("click", () => {
    const items = state.lastSuggestion?.items ?? [];
    if (!Array.isArray(items) || items.length === 0) {
      setText(els.homeError, "Сначала подбери образ.");
      return;
    }
    setAvatarSelection(items.map((i) => i.id));
    setScreen("avatar");
  });
}

if (els.homeLikeOutfitBtn) {
  els.homeLikeOutfitBtn.addEventListener("click", () => submitFeedback("like").catch((e) => setText(els.homeError, e?.message ?? String(e))));
}

if (els.avatarClearBtn) {
  els.avatarClearBtn.addEventListener("click", () => {
    setAvatarSelection([]);
    setAvatarActive(null);
    renderAvatar().catch(() => {});
  });
}

if (els.avatarRotateLeftBtn) {
  els.avatarRotateLeftBtn.addEventListener("click", () => {
    const id = state.avatarActiveId;
    if (!id) return;
    const t = getAvatarTransform(id);
    const next = { ...t, r: (t.r || 0) - 90 };
    saveAvatarTransform(id, next);
    renderAvatar().catch(() => {});
  });
}

if (els.avatarRotateRightBtn) {
  els.avatarRotateRightBtn.addEventListener("click", () => {
    const id = state.avatarActiveId;
    if (!id) return;
    const t = getAvatarTransform(id);
    const next = { ...t, r: (t.r || 0) + 90 };
    saveAvatarTransform(id, next);
    renderAvatar().catch(() => {});
  });
}

if (els.avatarResetLayerBtn) {
  els.avatarResetLayerBtn.addEventListener("click", () => {
    const id = state.avatarActiveId;
    if (!id) return;
    const item = (state.wardrobeItems || []).find((x) => x.id === id);
    const t = item ? defaultAvatarTransformForItem(item) : { x: 0, y: 0, s: 1, r: 0 };
    saveAvatarTransform(id, t);
    renderAvatar().catch(() => {});
  });
}

if (els.avatarSaveOutfitBtn) {
  els.avatarSaveOutfitBtn.addEventListener("click", async () => {
    const selectedIds = Array.from(state.avatarSelectedIds);
    if (selectedIds.length === 0) {
      alert("Сначала выберите вещи для образа!");
      return;
    }
    try {
      const resp = await apiFetch("/api/outfits", {
        method: "POST",
        body: {
          name: "Мой образ",
          itemIds: selectedIds,
          wornDate: new Date().toISOString(),
        },
      });
      if (!resp.ok) {
        const errorText = await resp.text();
        alert(`Ошибка сохранения образа: ${errorText}`);
        return;
      }
      alert("Образ сохранён!");
      setScreen("outfits");
    } catch (err) {
      alert(`Ошибка сохранения образа: ${err?.message ?? String(err)}`);
    }
  });
}

// Уведомления
const requestNotificationBtn = document.getElementById("requestNotificationBtn");
const testNotificationBtn = document.getElementById("testNotificationBtn");

if (requestNotificationBtn) {
  requestNotificationBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      alert("Этот браузер не поддерживает уведомления.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      alert("Уведомления разрешены!");
    } else {
      alert("Уведомления отклонены. Вы можете изменить это в настройках браузера.");
    }
  });
}

if (testNotificationBtn) {
  testNotificationBtn.addEventListener("click", () => {
    if (!("Notification" in window)) {
      alert("Этот браузер не поддерживает уведомления.");
      return;
    }
    if (Notification.permission === "granted") {
      new Notification("Wardrobe AI", {
        body: "Проверьте погоду и подберите образ на сегодня!",
        icon: "/app/favicon.ico",
      });
    } else if (Notification.permission !== "denied") {
      alert("Сначала разрешите уведомления.");
    }
  });
}

els.logoutBtn.addEventListener("click", async () => {
  storage.accessToken = null;
  storage.refreshToken = null;
  await enterApp();
});

setAuthMode("login");
await enterApp();
