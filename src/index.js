const PRODUCTION_HOST = "cecil-hub.ha-rookie.workers.dev";
const EVENTS = new Set(["page_view", "outbound_click", "deployment_smoke_test"]);
const DESTINATIONS = new Set([
  "",
  "asamazume",
  "ato_ippai",
  "yohai",
  "kurukuru_sommelier",
  "omoi_no_hougaku",
  "note",
  "github",
  "protopedia",
  "x",
  "instagram",
  "rakuten_room",
  "amazon",
  "line",
  "marshmallow",
  "litlink",
  "other",
]);

function safeToken(value, fallback = "", max = 64) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (!normalized || !/^[a-z0-9._-]+$/.test(normalized)) return fallback;
  return normalized.slice(0, max);
}

function safeHost(value) {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toLowerCase();
  if (!normalized || !/^[a-z0-9.-]+$/.test(normalized)) return "";
  return normalized.slice(0, 120);
}

function safePath(value) {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";
  return value.slice(0, 120);
}

function normalize(input) {
  if (!input || typeof input !== "object" || !EVENTS.has(input.event)) return null;

  if (input.event === "deployment_smoke_test") {
    return {
      event: input.event,
      source: "",
      medium: "",
      campaign: "",
      content: "",
      referrerHost: "",
      destination: "",
      linkId: "",
      section: "",
      path: "/",
    };
  }

  const destination = DESTINATIONS.has(input.destination) ? input.destination : "other";
  if (input.event === "outbound_click" && !input.destination) return null;

  return {
    event: input.event,
    source: safeToken(input.source, "other"),
    medium: safeToken(input.medium, "unknown"),
    campaign: safeToken(input.campaign),
    content: safeToken(input.content),
    referrerHost: safeHost(input.referrer_host),
    destination: input.event === "outbound_click" ? destination : "",
    linkId: input.event === "outbound_click" ? safeToken(input.link_id, "unknown") : "",
    section: input.event === "outbound_click" ? safeToken(input.section, "unknown") : "",
    path: safePath(input.path),
  };
}

function requestAllowed(request) {
  const url = new URL(request.url);
  if (url.hostname.toLowerCase() !== PRODUCTION_HOST) return false;

  const origin = request.headers.get("Origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === url.origin;
  } catch (_) {
    return false;
  }
}

async function handleEvent(request, env) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }

  if (!requestAllowed(request)) return new Response("Not allowed", { status: 403 });

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return new Response("Unsupported content type", { status: 415 });
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > 4096) return new Response("Payload too large", { status: 413 });

  const raw = await request.text();
  if (raw.length > 4096) return new Response("Payload too large", { status: 413 });

  let input;
  try {
    input = JSON.parse(raw);
  } catch (_) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const payload = normalize(input);
  if (!payload) return new Response("Invalid event", { status: 400 });

  if (!env.ANALYTICS || typeof env.ANALYTICS.writeDataPoint !== "function") {
    return new Response("Analytics unavailable", { status: 503 });
  }

  env.ANALYTICS.writeDataPoint({
    indexes: [payload.event],
    blobs: [
      payload.event,
      payload.source,
      payload.medium,
      payload.campaign,
      payload.content,
      payload.referrerHost,
      payload.destination,
      payload.linkId,
      payload.section,
      new URL(request.url).hostname,
      payload.path,
    ],
    doubles: [1],
  });

  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/event") return handleEvent(request, env);
    return new Response("Not found", { status: 404 });
  },
};
