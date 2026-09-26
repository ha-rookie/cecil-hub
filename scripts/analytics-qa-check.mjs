const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_ANALYTICS_READ_TOKEN;

if (!accountId || !token) {
  console.error("Required Cloudflare analytics secrets are missing.");
  process.exit(1);
}

const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`;
const sql = `
  SELECT
    blob1 AS event,
    blob2 AS source,
    blob3 AS medium,
    blob4 AS campaign,
    blob7 AS destination,
    blob8 AS link_id,
    blob9 AS section,
    blob11 AS path,
    SUM(_sample_interval) AS events
  FROM cecil_hub_events
  WHERE timestamp > NOW() - INTERVAL '2' HOUR
    AND blob4 = 'check'
  GROUP BY event, source, medium, campaign, destination, link_id, section, path
  ORDER BY events DESC
  FORMAT JSON
`;

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
  console.error(text.slice(0, 1000));
  process.exit(1);
}
const result = JSON.parse(text);
const rows = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
console.log("QaCampaignCheck:", JSON.stringify(rows));
