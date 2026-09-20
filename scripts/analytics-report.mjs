const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_ANALYTICS_READ_TOKEN;
const daysRaw = Number.parseInt(process.env.DAYS || "7", 10);
const days = [7, 30].includes(daysRaw) ? daysRaw : 7;

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

const interval = `INTERVAL '${days}' DAY`;

const [viewsResult, sourcesResult, destinationsResult, journeysResult] =
  await Promise.all([
    query(`
      SELECT
        SUM(_sample_interval) AS views
      FROM cecil_hub_events
      WHERE timestamp > NOW() - ${interval}
        AND blob1 = 'page_view'
        AND blob2 != 'outbound_test'
        AND blob3 != 'qa'
      FORMAT JSON
    `),
    query(`
      SELECT
        blob2 AS source,
        blob3 AS medium,
        SUM(_sample_interval) AS views
      FROM cecil_hub_events
      WHERE timestamp > NOW() - ${interval}
        AND blob1 = 'page_view'
        AND blob2 != 'outbound_test'
        AND blob3 != 'qa'
      GROUP BY source, medium
      ORDER BY views DESC
      LIMIT 20
      FORMAT JSON
    `),
    query(`
      SELECT
        blob7 AS destination,
        SUM(_sample_interval) AS clicks
      FROM cecil_hub_events
      WHERE timestamp > NOW() - ${interval}
        AND blob1 = 'outbound_click'
        AND blob2 != 'outbound_test'
        AND blob3 != 'qa'
      GROUP BY destination
      ORDER BY clicks DESC
      LIMIT 20
      FORMAT JSON
    `),
    query(`
      SELECT
        blob2 AS source,
        blob7 AS destination,
        SUM(_sample_interval) AS clicks
      FROM cecil_hub_events
      WHERE timestamp > NOW() - ${interval}
        AND blob1 = 'outbound_click'
        AND blob2 != 'outbound_test'
        AND blob3 != 'qa'
      GROUP BY source, destination
      ORDER BY clicks DESC
      LIMIT 30
      FORMAT JSON
    `),
  ]);

const totalViews = number(rows(viewsResult)[0]?.views);
const sources = rows(sourcesResult).map((row) => ({
  source: row.source || "unknown",
  medium: row.medium || "unknown",
  views: number(row.views),
}));
const destinations = rows(destinationsResult).map((row) => ({
  destination: row.destination || "unknown",
  clicks: number(row.clicks),
}));
const journeys = rows(journeysResult).map((row) => ({
  source: row.source || "unknown",
  destination: row.destination || "unknown",
  clicks: number(row.clicks),
}));

const report = {
  days,
  generated_at: new Date().toISOString(),
  total_views: totalViews,
  sources,
  destinations,
  journeys,
};

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

const summary = [
  `# Cecil Analytics — last ${days} days`,
  "",
  `Generated: ${report.generated_at}`,
  "",
  `**Page views:** ${totalViews}`,
  "",
  "## Inbound",
  "",
  sources.length
    ? mdTable(
        ["Source", "Medium", "Views"],
        sources.map((r) => [r.source, r.medium, String(r.views)])
      )
    : "_No page_view data yet._",
  "",
  "## Outbound",
  "",
  destinations.length
    ? mdTable(
        ["Destination", "Clicks"],
        destinations.map((r) => [r.destination, String(r.clicks)])
      )
    : "_No outbound_click data yet._",
  "",
  "## Source → Destination",
  "",
  journeys.length
    ? mdTable(
        ["Source", "Destination", "Clicks"],
        journeys.map((r) => [r.source, r.destination, String(r.clicks)])
      )
    : "_No source × destination data yet._",
  "",
].join("\n");

if (process.env.GITHUB_STEP_SUMMARY) {
  const fs = await import("node:fs/promises");
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
}

console.log(`Cecil analytics query succeeded for last ${days} days.`);
console.log(`Page views: ${totalViews}`);
console.log("Inbound:", JSON.stringify(sources));
console.log("Outbound:", JSON.stringify(destinations));
console.log("Journeys:", JSON.stringify(journeys));
