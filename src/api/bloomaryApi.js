const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const IS_LOGGED_IN_KEY = "isLoggedIn";
const IS_SIGNED_OUT_KEY = "bloomarySignedOut";
const AUTH_CHECK_TTL_MS = 5000;

let authCheckPromise = null;
let authCheckCache = null;

const BLOOM_STYLES = {
  baby: {
    bloomType: "baby",
    bloom: {
      petal: "#fffaf4",
      petalDark: "#d9d7c8",
      center: "#f0d68a",
      stem: "#496753",
    },
  },
  daisy: {
    bloomType: "daisy",
    bloom: {
      petal: "#fff7df",
      petalDark: "#e1ded0",
      center: "#dfaa24",
      stem: "#37633d",
    },
  },
  gerbera: {
    bloomType: "gerbera",
    bloom: {
      petal: "#f7c948",
      petalDark: "#e1a51f",
      center: "#5b3620",
      stem: "#37633d",
    },
  },
  lily: {
    bloomType: "lily",
    bloom: {
      petal: "#fff7df",
      petalDark: "#e8d9b8",
      center: "#d58b2a",
      stem: "#3d6845",
    },
  },
  line: {
    bloomType: "line",
    bloom: {
      petal: "#7897f5",
      petalDark: "#4f69c8",
      center: "#f5f0c8",
      stem: "#355f4c",
    },
  },
  rose: {
    bloomType: "rose",
    bloom: {
      petal: "#d9273c",
      petalDark: "#9f1020",
      center: "#680812",
      stem: "#2f5b3b",
    },
  },
  sunflower: {
    bloomType: "sunflower",
    bloom: {
      petal: "#f7c948",
      petalDark: "#d99212",
      center: "#5b3620",
      stem: "#37633d",
    },
  },
  tulip: {
    bloomType: "tulip",
    bloom: {
      petal: "#ef514d",
      petalDark: "#bf2f34",
      center: "#ffd1c7",
      stem: "#28633c",
    },
  },
};

const FLOWER_TYPE_BY_NAME = new Map(
  Object.entries({
    alstroemeria: "lily",
    amaryllis: "lily",
    anthurium: "lily",
    azalea: "gerbera",
    bee_balm: "gerbera",
    bellflower: "line",
    blackberry_lily: "lily",
    blanket_flower: "gerbera",
    bougainvillea: "baby",
    bromeliad: "lily",
    calla_lily: "lily",
    camellia: "rose",
    canna_lily: "lily",
    canterbury_bells: "line",
    cape_flower: "gerbera",
    carnation: "rose",
    cattleya: "lily",
    celosia: "line",
    chamomile: "daisy",
    chrysanthemum: "daisy",
    clematis: "lily",
    columbine: "lily",
    coneflower: "gerbera",
    cosmos: "daisy",
    cyclamen: "tulip",
    daffodil: "lily",
    dahlia: "gerbera",
    daisy: "daisy",
    desert_rose: "rose",
    doraji: "line",
    eryngo: "gerbera",
    feather_celosia: "line",
    foxglove: "line",
    freesia: "line",
    fritillaria: "lily",
    garden_phlox: "baby",
    gaura: "line",
    gazania: "gerbera",
    gentian: "tulip",
    geranium: "gerbera",
    gerbera: "gerbera",
    gladiolus: "line",
    globe_thistle: "gerbera",
    gloriosa_lily: "lily",
    gyeongyeopduran: "gerbera",
    gypsophila: "baby",
    hellebores: "rose",
    hibiscus: "lily",
    hyacinth: "line",
    hydrangea: "baby",
    iris: "lily",
    ixora: "baby",
    japanese_anemone: "daisy",
    kalanchoe: "baby",
    lily: "lily",
    lisianthus: "rose",
    magnolia: "lily",
    marigold: "gerbera",
    masterwort: "gerbera",
    mexican_petunia: "tulip",
    monkshood: "line",
    morning_glory: "tulip",
    mulmangcho: "baby",
    nasturtium: "lily",
    nigella: "daisy",
    orchid: "lily",
    osteospermum: "daisy",
    pansy: "gerbera",
    passion_flower: "gerbera",
    peony: "rose",
    petunia: "tulip",
    pincushion_flower: "gerbera",
    pink_primrose: "daisy",
    plumeria: "lily",
    poinsettia: "lily",
    poppy: "gerbera",
    primula: "daisy",
    red_ginger: "line",
    rose: "rose",
    sampaguita: "baby",
    silverbush: "tulip",
    spring_crocus: "tulip",
    stock: "line",
    sunflower: "sunflower",
    sweet_pea: "line",
    sweet_william: "baby",
    trumpet_creeper: "line",
    tulip: "tulip",
    wallflower: "line",

    baby_breath: "baby",
    babys_breath: "baby",
    delphinium: "line",
    ranunculus: "rose",
  }),
);


export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const toArray = (value) => (Array.isArray(value) ? value : []);

const pick = (source, camelKey, snakeKey = camelKey) => {
  if (!source || typeof source !== "object") return undefined;
  return source[camelKey] ?? source[snakeKey];
};

const pickAny = (source, keys) => {
  if (!source || typeof source !== "object") return undefined;

  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }

  return undefined;
};

const getMessageText = (value) => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(getMessageText).filter(Boolean).join(", ");
  if (!value || typeof value !== "object") return "";

  const nestedMessage = pickAny(value, ["message", "msg", "error", "detail"]);
  return nestedMessage === value ? "" : getMessageText(nestedMessage);
};

const setAuthCache = (value) => {
  authCheckCache = {
    expiresAt: Date.now() + AUTH_CHECK_TTL_MS,
    value,
  };
};

const normalizeColorHex = (value) => {
  if (!value || typeof value !== "string") return "";

  const color = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toUpperCase();
  if (/^[0-9a-f]{6}$/i.test(color)) return `#${color.toUpperCase()}`;
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [, r, g, b] = color;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  if (/^[0-9a-f]{3}$/i.test(color)) {
    const [r, g, b] = color;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return "";
};

const normalizeFlowerName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['`]/g, "")
    .replace(/[-\s]+/g, "_")
    .replace(/[^a-z_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

const resolveBloomType = (nameEn) => {
  const normalizedName = normalizeFlowerName(nameEn);
  if (!normalizedName) return "gerbera";

  const exactType = FLOWER_TYPE_BY_NAME.get(normalizedName);
  if (exactType) return exactType;

  const partialMatch = Array.from(FLOWER_TYPE_BY_NAME.entries()).find(([flowerName]) =>
    normalizedName.includes(flowerName),
  );

  return partialMatch?.[1] ?? "gerbera";
};

const getFlowerStyle = (nameEn) => {
  const bloomType = resolveBloomType(nameEn);
  const style = BLOOM_STYLES[bloomType] ?? BLOOM_STYLES.gerbera;

  return {
    bloomType: style.bloomType,
    bloom: { ...style.bloom },
  };
};

const resolveApiUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }
  return `${API_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const resolveAnalysisImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";

  const imageUrl = value.trim();
  if (!imageUrl) return "";

  if (
    /^https?:\/\//i.test(imageUrl) ||
    imageUrl.startsWith("blob:") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/uploads/") || imageUrl.startsWith("uploads/")) {
    return resolveApiUrl(imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`);
  }

  if (!imageUrl.includes("/") && /\.(avif|bmp|gif|heic|heif|jpe?g|png|webp)$/i.test(imageUrl)) {
    return resolveApiUrl(`/uploads/flowers/${imageUrl}`);
  }

  return resolveApiUrl(imageUrl);
};

export const markLoggedIn = () => {
  localStorage.removeItem(IS_SIGNED_OUT_KEY);
  localStorage.setItem(IS_LOGGED_IN_KEY, "true");
  setAuthCache(true);
};

export const clearTokens = () => {
  localStorage.removeItem(IS_LOGGED_IN_KEY);
  localStorage.setItem(IS_SIGNED_OUT_KEY, "true");
  authCheckPromise = null;
  setAuthCache(false);
};

async function parseResponse(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const body = await parseResponse(response);

  if (!response.ok) {
    const code = pickAny(body, ["code", "errorCode", "error_code"]);
    const message =
      getMessageText(pickAny(body, ["message", "error", "detail"])) ||
      code ||
      (typeof body === "string" && body) ||
      "API request failed.";

    if (response.status === 401) {
      clearTokens();
    }

    throw new ApiError(message, {
      status: response.status,
      code,
      details: body,
    });
  }

  return body;
}

export function getKakaoLoginUrl() {
  localStorage.removeItem(IS_SIGNED_OUT_KEY);
  if (!API_BASE_URL) return "";
  return `${API_BASE_URL}/auth/kakao`;
}

export async function checkAuth() {
  if (localStorage.getItem(IS_SIGNED_OUT_KEY) === "true") {
    setAuthCache(false);
    return false;
  }

  if (authCheckCache && authCheckCache.expiresAt > Date.now()) {
    return authCheckCache.value;
  }

  if (authCheckPromise) return authCheckPromise;

  authCheckPromise = request("/auth/me")
    .then(() => {
      markLoggedIn();
      return true;
    })
    .catch(() => {
      clearTokens();
      return false;
    })
    .finally(() => {
      authCheckPromise = null;
    });

  return authCheckPromise;
}

export async function signOut() {
  try {
    await request("/auth/signout", { method: "POST" });
  } catch {
    // Local sign-out should still complete when the server session already expired.
  } finally {
    clearTokens();
  }
}

export function normalizeFlower(flower, index = 0, imageUrl = "") {
  const nameKo =
    pick(flower, "nameKo", "name_ko") ??
    pickAny(flower, ["nameKr", "name_kr", "koreanName", "korean_name", "name"]) ??
    "";
  const nameEn =
    pick(flower, "nameEn", "name_en") ??
    pickAny(flower, ["className", "class_name", "label", "flowerName", "flower_name"]) ??
    "";
  const style = getFlowerStyle(nameEn);
  const colorHex = normalizeColorHex(
    pick(flower, "colorHex", "color_hex") ??
      pick(flower, "petalColor", "petal_color") ??
      pick(flower, "dominantColor", "dominant_color") ??
      pick(flower, "color"),
  );
  const box2d =
    pick(flower, "box2d", "box_2d") ??
    pickAny(flower, ["bbox", "box", "xyxy", "boundingBox", "bounding_box"]) ??
    [];

  return {
    ...style,
    id: pick(flower, "id") ?? `${nameKo || nameEn || "flower"}-${index}`,
    name: nameKo || nameEn,
    nameKo,
    nameEn,
    meaning: pick(flower, "meaning") ?? "",
    box2d,
    colorHex,
    imageUrl: resolveApiUrl(pick(flower, "imageUrl", "image_url") ?? imageUrl),
  };
}

export function normalizeAnalysis(analysis) {
  if (!analysis) return null;

  const flowers =
    pick(analysis, "flowers") ??
    pick(analysis, "flowersMeanings", "flowers_meanings") ??
    pick(analysis, "flowerMeanings", "flower_meanings") ??
    [];

  return {
    id: pick(analysis, "id") ?? "",
    summary: pick(analysis, "summary") ?? "",
    content: pick(analysis, "content") ?? "",
    imageUrl: resolveAnalysisImageUrl(
      pick(analysis, "imageUrl", "image_url") ?? pick(analysis, "imgUrl", "img_url"),
    ),
    story: pick(analysis, "story") ?? null,
    flowers: toArray(flowers).map((flower, index) => normalizeFlower(flower, index)),
    createdAt: pick(analysis, "createdAt", "created_at") ?? "",
  };
}

export function normalizeAnalysisList(payload) {
  const analyses = toArray(pick(payload, "analyses")).map((item) => ({
    id: pick(item, "id") ?? "",
    summary: pick(item, "summary") ?? "",
    imageUrl: resolveAnalysisImageUrl(
      pick(item, "imageUrl", "image_url") ?? pick(item, "imgUrl", "img_url"),
    ),
    createdAt: pick(item, "createdAt", "created_at") ?? "",
  }));

  return {
    analyses,
    total: pick(payload, "total") ?? analyses.length,
    hasNextPage: Boolean(pick(payload, "hasNextPage", "has_next_page")),
  };
}

export function normalizeRecommendation(payload) {
  if (!payload) return null;

  return {
    title: pick(payload, "title") ?? "",
    content: pick(payload, "content") ?? "",
    flowers: toArray(pick(payload, "flowers")).map((flower, index) => normalizeFlower(flower, index)),
  };
}

export async function classifyFlowers(imageFile, imageUrl = "", options = {}) {
  const formData = new FormData();
  formData.append("image", imageFile);

  const payload = await request("/flowers", {
    method: "POST",
    body: formData,
    signal: options.signal,
  });

  const flowers = pick(payload, "flowers") ?? pick(payload, "detectedObjects", "detected_objects");

  return toArray(flowers).map((flower, index) =>
    normalizeFlower(flower, index, imageUrl),
  );
}

export async function createAnalysis({ flowers }, options = {}) {
  const normalizedFlowers = toArray(flowers).map(({ nameKo, nameEn, meaning, box2d }) => ({
    nameKo,
    nameEn,
    meaning,
    box2d,
  }));

  const payload = await request("/analyses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ flowers: normalizedFlowers }),
    signal: options.signal,
  });

  return normalizeAnalysis(payload);
}

export async function getAnalyses({ page = 1, size = 10, signal } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const payload = await request(`/analyses?${query.toString()}`, { signal });

  return normalizeAnalysisList(payload);
}

export async function getAnalysis(id, options = {}) {
  const payload = await request(`/analyses/${encodeURIComponent(id)}`, {
    signal: options.signal,
  });
  return normalizeAnalysis(payload);
}

export async function getRecommendation(situation, options = {}) {
  const payload = await request("/recommendations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ situation }),
    signal: options.signal,
  });

  return normalizeRecommendation(payload);
}
