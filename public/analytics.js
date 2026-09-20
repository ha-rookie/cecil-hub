"use strict";

(() => {
  const PRODUCTION_HOSTS = new Set(["cecil-hub.ha-rookie.workers.dev"]);
  const SOURCE_BY_HOST = new Map([
    ["note.com", ["note", "referral"]],
    ["x.com", ["x", "social"]],
    ["t.co", ["x", "social"]],
    ["instagram.com", ["instagram", "social"]],
    ["www.instagram.com", ["instagram", "social"]],
    ["protopedia.net", ["protopedia", "referral"]],
    ["www.protopedia.net", ["protopedia", "referral"]],
    ["line.me", ["line", "messaging"]],
    ["lit.link", ["litlink", "referral"]],
    ["weekend-morning-high-tide.pages.dev", ["asamazume", "app"]],
    ["ato-ippai.pages.dev", ["ato_ippai", "app"]],
    ["yohai-compass.pages.dev", ["yohai", "app"]],
    ["kurukuru-sommelier-game.pages.dev", ["kurukuru_sommelier", "app"]],
    ["omoi-no-hougaku.pages.dev", ["omoi_no_hougaku", "app"]],
  ]);

  function clean(value, fallback = "", max = 64) {
    if (typeof value !== "string") return fallback;
    const normalized = value.trim().toLowerCase();
    if (!normalized || !/^[a-z0-9._-]+$/.test(normalized)) return fallback;
    return normalized.slice(0, max);
  }

  function referrerHost() {
    if (!document.referrer) return "";
    try {
      return new URL(document.referrer).hostname.toLowerCase().slice(0, 120);
    } catch (_) {
      return "";
    }
  }

  function inferFromReferrer(host) {
    if (!host) return ["direct", "none"];

    const mapped = SOURCE_BY_HOST.get(host);
    if (mapped) return mapped;

    if (
      host === "google.com" ||
      host.endsWith(".google.com") ||
      host.endsWith(".google.co.jp")
    ) return ["google", "organic"];

    if (host === "bing.com" || host.endsWith(".bing.com")) return ["bing", "organic"];
    if (host === "search.yahoo.co.jp") return ["yahoo", "organic"];

    return ["other", "referral"];
  }

  function acquisition() {
    const params = new URLSearchParams(location.search);
    const refHost = referrerHost();
    const inferred = inferFromReferrer(refHost);
    return {
      source: clean(params.get("utm_source") || "", inferred[0]),
      medium: clean(params.get("utm_medium") || "", inferred[1]),
      campaign: clean(params.get("utm_campaign") || "", ""),
      content: clean(params.get("utm_content") || "", ""),
      referrer_host: refHost,
    };
  }

  function internalTestMode() {
    return new URLSearchParams(location.search).getAll("internal_test").includes("1");
  }

  function shouldSend() {
    return PRODUCTION_HOSTS.has(location.hostname.toLowerCase()) && !internalTestMode();
  }

  function post(payload) {
    if (!shouldSend()) return false;

    const body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon("/api/event", blob)) return true;
      }
    } catch (_) {
      // Analytics must never affect navigation.
    }

    fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {});

    return true;
  }

  const context = acquisition();

  post({
    event: "page_view",
    ...context,
    path: location.pathname,
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[data-analytics-destination]");
    if (!link) return;

    post({
      event: "outbound_click",
      ...context,
      path: location.pathname,
      destination: clean(link.dataset.analyticsDestination || "", "other"),
      link_id: clean(link.dataset.analyticsLinkId || "", "unknown"),
      section: clean(link.dataset.analyticsSection || "", "unknown"),
    });
  }, true);
})();
