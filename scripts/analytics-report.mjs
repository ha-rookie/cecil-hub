const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_ANALYTICS_READ_TOKEN;

const backfillDays = 90;
const analyticsStartDate = "2026-09-20";

if (!accountId || !token) {
  console.error("Required Cloudflare analytics secrets are missing.");
  process.exit(1);
}

const endpoint =
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`;

async function query(sql) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain; charset=utf-8",
    },
    body: sql,
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(`Cloudflare SQL API failed: HTTP ${response.status}`);
    console.error(text.slice(0, 500));
    process.exit(1);
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error("Cloudflare SQL API returned non-JSON data.");
    console.error(text.slice(0, 500));
    process.exit(1);
  }
}

function rows(result) {
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result)) return result;
  return [];
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function jstDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(dateString, delta) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + delta));
  return date.toISOString().slice(0, 10);
}

const todayJst = jstDateString();
const yesterdayJst = addDays(todayJst, -1);
const requestedWindowStart = addDays(yesterdayJst, -(backfillDays - 1));
const windowStartJst =
  analyticsStartDate > requestedWindowStart
    ? analyticsStartDate
    : requestedWindowStart;

// Fetch one extra day so the earliest JST day in the 90-day backfill window
// is complete even though the SQL timestamp boundary is evaluated at runtime.
const queryInterval = `INTERVAL '${backfillDays + 1}' DAY`;
const dayExpr =
  "formatDateTime(timestamp, '%Y-%m-%d', 'Asia/Tokyo')";

const normalTrafficFilter = `
  AND blob2 != 'outbound_test'
  AND blob3 != 'qa'
  AND blob2 != 'chatgpt.com'
  AND blob2 != 'chatgpt'
`;

const [
  dailyViewsResult,
  dailyClicksResult,
  inboundResult,
  pathsResult,
  outboundResult,
  journeysResult,
] = await Promise.all([
  query(`
    SELECT
      ${dayExpr} AS date,
      SUM(_sample_interval) AS views
    FROM cecil_hub_events
    WHERE timestamp > NOW() - ${queryInterval}
      AND blob1 = 'page_view'
      ${normalTrafficFilter}
    GROUP BY date
    ORDER BY date ASC
    FORMAT JSON
  `),
  query(`
    SELECT
      ${dayExpr} AS date,
      SUM(_sample_interval) AS clicks
    FROM cecil_hub_events
    WHERE timestamp > NOW() - ${queryInterval}
      AND blob1 = 'outbound_click'
      ${normalTrafficFilter}
    GROUP BY date
    ORDER BY date ASC
    FORMAT JSON
  `),
  query(`
    SELECT
      ${dayExpr} AS date,
      blob2 AS source,
      blob3 AS medium,
      SUM(_sample_interval) AS views
    FROM cecil_hub_events
    WHERE timestamp > NOW() - ${queryInterval}
      AND blob1 = 'page_view'
      ${normalTrafficFilter}
    GROUP BY date, source, medium
    ORDER BY date ASC, views DESC
    FORMAT JSON
  `),
  query(`
    SELECT
      ${dayExpr} AS date,
      blob11 AS path,
      SUM(_sample_interval) AS views
    FROM cecil_hub_events
    WHERE timestamp > NOW() - ${queryInterval}
      AND blob1 = 'page_view'
      ${normalTrafficFilter}
    GROUP BY date, path
    ORDER BY date ASC, views DESC
    FORMAT JSON
  `),
  query(`
    SELECT
      ${dayExpr} AS date,
      blob7 AS destination,
      blob8 AS link_id,
      blob9 AS section,
      SUM(_sample_interval) AS clicks
    FROM cecil_hub_events
    WHERE timestamp > NOW() - ${queryInterval}
      AND blob1 = 'outbound_click'
      ${normalTrafficFilter}
    GROUP BY date, destination, link_id, section
    ORDER BY date ASC, clicks DESC
    FORMAT JSON
  `),
  query(`
    SELECT
      ${dayExpr} AS date,
      blob2 AS source,
      blob7 AS destination,
      SUM(_sample_interval) AS clicks
    FROM cecil_hub_events
    WHERE timestamp > NOW() - ${queryInterval}
      AND blob1 = 'outbound_click'
      ${normalTrafficFilter}
    GROUP BY date, source, destination
    ORDER BY date ASC, clicks DESC
    FORMAT JSON
  `),
]);

function isCompletedDate(date) {
  return date >= windowStartJst && date <= yesterdayJst;
}

const dailyViews = rows(dailyViewsResult)
  .map((row) => ({
    date: row.date,
    views: number(row.views),
  }))
  .filter((row) => isCompletedDate(row.date));

const dailyClicks = rows(dailyClicksResult)
  .map((row) => ({
    date: row.date,
    clicks: number(row.clicks),
  }))
  .filter((row) => isCompletedDate(row.date));

const overviewByDate = new Map();
for (let date = windowStartJst; date <= yesterdayJst; date = addDays(date, 1)) {
  overviewByDate.set(date, {
    date,
    page_views: 0,
    outbound_clicks: 0,
  });
}

for (const row of dailyViews) {
  overviewByDate.get(row.date).page_views = row.views;
}
for (const row of dailyClicks) {
  overviewByDate.get(row.date).outbound_clicks = row.clicks;
}

const dailyOverview = [...overviewByDate.values()].sort((a, b) =>
  a.date.localeCompare(b.date)
);

const inbound = rows(inboundResult)
  .map((row) => ({
    date: row.date,
    source: row.source || "unknown",
    medium: row.medium || "unknown",
    views: number(row.views),
  }))
  .filter((row) => isCompletedDate(row.date));

const paths = rows(pathsResult)
  .map((row) => ({
    date: row.date,
    path: row.path || "/",
    views: number(row.views),
  }))
  .filter((row) => isCompletedDate(row.date));

const outbound = rows(outboundResult)
  .map((row) => ({
    date: row.date,
    destination: row.destination || "unknown",
    link_id: row.link_id || "unknown",
    section: row.section || "unknown",
    clicks: number(row.clicks),
  }))
  .filter((row) => isCompletedDate(row.date));

const journeys = rows(journeysResult)
  .map((row) => ({
    date: row.date,
    source: row.source || "unknown",
    destination: row.destination || "unknown",
    clicks: number(row.clicks),
  }))
  .filter((row) => isCompletedDate(row.date));

function mdTable(headers, dataRows) {
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
  ];
  for (const row of dataRows) {
    lines.push(`| ${row.join(" | ")} |`);
  }
  return lines.join("\n");
}

const reportMeta = {
  backfill_days: backfillDays,
  analytics_start_date: analyticsStartDate,
  window_start_jst: windowStartJst,
  window_end_jst: yesterdayJst,
  current_jst_day_excluded: true,
  daily_overview_zero_filled: true,
};

const summary = [
  "# Cecil Analytics — daily backfill source",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Backfill window (JST): ${windowStartJst} - ${yesterdayJst}`,
  "",
  "This workflow always returns the recoverable daily source window.",
  "7 / 30 / 90 day analysis is derived later from the Google Sheets daily master.",
  "The current JST day is excluded because it is incomplete.",
  "Daily overview zero-fills dates with no traffic.",
  "",
  "Normal analysis excludes:",
  "- source=outbound_test",
  "- medium=qa",
  "- source=chatgpt.com",
  "- source=chatgpt",
  "",
  "## Daily overview",
  "",
  dailyOverview.length
    ? mdTable(
        ["Date (JST)", "Page views", "Outbound clicks"],
        dailyOverview.map((r) => [
          r.date,
          String(r.page_views),
          String(r.outbound_clicks),
        ])
      )
    : "_No completed daily data yet._",
  "",
  "The machine-readable arrays are written to the workflow log for Google Sheets upsert.",
  "",
].join("\n");

if (process.env.GITHUB_STEP_SUMMARY) {
  const fs = await import("node:fs/promises");
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
}

console.log(
  `Cecil analytics backfill query succeeded for ${windowStartJst} through ${yesterdayJst} JST.`
);
console.log("ReportMeta:", JSON.stringify(reportMeta));
console.log("DailyOverview:", JSON.stringify(dailyOverview));
console.log("DailyInbound:", JSON.stringify(inbound));
console.log("DailyPaths:", JSON.stringify(paths));
console.log("DailyOutbound:", JSON.stringify(outbound));
console.log("DailyJourneys:", JSON.stringify(journeys));
