import "server-only";

/**
 * Server-side PostHog Query API client.
 * Requires POSTHOG_PERSONAL_API_KEY (query:read) and POSTHOG_PROJECT_ID.
 * Never expose the personal API key to the client.
 */

export type HogQLQueryResult = {
  columns: string[];
  results: Array<Array<string | number | null>>;
};

type HogQLResponse = {
  results?: HogQLQueryResult["results"];
  columns?: string[];
  error?: string;
  detail?: string;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const queryCache = new Map<string, { at: number; data: HogQLQueryResult }>();

export function isPostHogQueryConfigured(): boolean {
  return Boolean(
    process.env.POSTHOG_PERSONAL_API_KEY?.trim() &&
      process.env.POSTHOG_PROJECT_ID?.trim(),
  );
}

/** App host for Query API (not the ingest host). */
export function getPostHogApiHost(): string {
  const explicit = process.env.POSTHOG_API_HOST?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const ingest =
    process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ?? "https://us.i.posthog.com";
  if (ingest.includes("eu.i.posthog.com")) return "https://eu.posthog.com";
  if (ingest.includes("us.i.posthog.com")) return "https://us.posthog.com";
  if (ingest.includes("posthog.com")) {
    return ingest.replace("i.posthog.com", "posthog.com").replace(/\/$/, "");
  }
  return "https://us.posthog.com";
}

export function getPostHogProjectId(): string | undefined {
  return process.env.POSTHOG_PROJECT_ID?.trim() || undefined;
}

function cacheKey(sql: string): string {
  return sql.replace(/\s+/g, " ").trim();
}

/**
 * Run a HogQL query against PostHog Query API.
 */
export async function runHogQLQuery(
  sql: string,
  options?: { refresh?: boolean; name?: string },
): Promise<HogQLQueryResult> {
  if (!isPostHogQueryConfigured()) {
    return { columns: [], results: [] };
  }

  const key = cacheKey(sql);
  if (!options?.refresh) {
    const hit = queryCache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return hit.data;
    }
  }

  const projectId = getPostHogProjectId()!;
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY!.trim();
  const url = `${getPostHogApiHost()}/api/projects/${projectId}/query/`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: { kind: "HogQLQuery", query: sql },
      name: options?.name ?? "admin_dashboard",
      refresh: options?.refresh ? "force_blocking" : "blocking",
    }),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[posthog] Query failed", res.status, text.slice(0, 500));
    throw new Error(`PostHog query failed (${res.status})`);
  }

  const json = (await res.json()) as HogQLResponse;
  if (json.error || json.detail) {
    throw new Error(json.error ?? json.detail ?? "PostHog query error");
  }

  const data: HogQLQueryResult = {
    columns: json.columns ?? [],
    results: json.results ?? [],
  };

  queryCache.set(key, { at: Date.now(), data });
  return data;
}

/** Count events matching a single event name in the last N days. */
export async function countEvents(
  event: string,
  days = 30,
): Promise<number> {
  const safeEvent = event.replace(/'/g, "''");
  const sql = `
    SELECT count() AS c
    FROM events
    WHERE event = '${safeEvent}'
      AND timestamp >= now() - INTERVAL ${days} DAY
  `;
  const { results } = await runHogQLQuery(sql, { name: `count_${event}` });
  return Number(results[0]?.[0] ?? 0);
}

/** Distinct active users (persons) in the last N days. */
export async function countActiveUsers(days: number): Promise<number> {
  const sql = `
    SELECT uniq(person_id) AS c
    FROM events
    WHERE timestamp >= now() - INTERVAL ${days} DAY
      AND person_id IS NOT NULL
  `;
  const { results } = await runHogQLQuery(sql, { name: `dau_${days}d` });
  return Number(results[0]?.[0] ?? 0);
}

/** Daily event counts for charting. */
export async function eventSeries(
  event: string,
  days = 30,
): Promise<TimeSeriesRow[]> {
  const safeEvent = event.replace(/'/g, "''");
  const sql = `
    SELECT toDate(timestamp) AS day, count() AS c
    FROM events
    WHERE event = '${safeEvent}'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY day
    ORDER BY day ASC
  `;
  const { results } = await runHogQLQuery(sql, { name: `series_${event}` });
  return results.map((row) => ({
    day: formatDay(row[0]),
    value: Number(row[1] ?? 0),
  }));
}

/** Group by a string property on events. */
export async function groupByProperty(
  event: string,
  property: string,
  days = 30,
  limit = 10,
): Promise<Array<{ key: string; count: number }>> {
  const safeEvent = event.replace(/'/g, "''");
  const safeProp = property.replace(/'/g, "''");
  const sql = `
    SELECT properties.${safeProp} AS k, count() AS c
    FROM events
    WHERE event = '${safeEvent}'
      AND timestamp >= now() - INTERVAL ${days} DAY
      AND properties.${safeProp} IS NOT NULL
      AND toString(properties.${safeProp}) != ''
    GROUP BY k
    ORDER BY c DESC
    LIMIT ${limit}
  `;
  const { results } = await runHogQLQuery(sql, {
    name: `group_${event}_${property}`,
  });
  return results.map((row) => ({
    key: String(row[0] ?? "unknown"),
    count: Number(row[1] ?? 0),
  }));
}

/** Group by property across all events (e.g. device_type). */
export async function groupByPropertyAllEvents(
  property: string,
  days = 30,
  limit = 8,
): Promise<Array<{ key: string; count: number }>> {
  const safeProp = property.replace(/'/g, "''");
  const sql = `
    SELECT properties.${safeProp} AS k, count() AS c
    FROM events
    WHERE timestamp >= now() - INTERVAL ${days} DAY
      AND properties.${safeProp} IS NOT NULL
      AND toString(properties.${safeProp}) != ''
    GROUP BY k
    ORDER BY c DESC
    LIMIT ${limit}
  `;
  const { results } = await runHogQLQuery(sql, {
    name: `group_all_${property}`,
  });
  return results.map((row) => ({
    key: String(row[0] ?? "unknown"),
    count: Number(row[1] ?? 0),
  }));
}

/** Average numeric property for an event. */
export async function avgProperty(
  event: string,
  property: string,
  days = 30,
): Promise<number> {
  const safeEvent = event.replace(/'/g, "''");
  const safeProp = property.replace(/'/g, "''");
  const sql = `
    SELECT avg(toFloat(properties.${safeProp})) AS a
    FROM events
    WHERE event = '${safeEvent}'
      AND timestamp >= now() - INTERVAL ${days} DAY
      AND properties.${safeProp} IS NOT NULL
  `;
  const { results } = await runHogQLQuery(sql, { name: `avg_${event}_${property}` });
  return Number(results[0]?.[0] ?? 0);
}

/** Recent error-like events for admin tables. */
export async function recentErrorEvents(
  events: string[],
  limit = 10,
): Promise<
  Array<{
    event: string;
    timestamp: string;
    endpoint?: string;
    status?: number;
    durationMs?: number;
    category?: string;
  }>
> {
  if (events.length === 0) return [];
  const list = events.map((e) => `'${e.replace(/'/g, "''")}'`).join(", ");
  const sql = `
    SELECT
      event,
      timestamp,
      properties.endpoint,
      properties.status_code,
      properties.response_time_ms,
      properties.error_category
    FROM events
    WHERE event IN (${list})
      AND timestamp >= now() - INTERVAL 30 DAY
    ORDER BY timestamp DESC
    LIMIT ${limit}
  `;
  const { results } = await runHogQLQuery(sql, { name: "recent_errors" });
  return results.map((row) => ({
    event: String(row[0] ?? ""),
    timestamp: String(row[1] ?? ""),
    endpoint: row[2] != null ? String(row[2]) : undefined,
    status: row[3] != null ? Number(row[3]) : undefined,
    durationMs: row[4] != null ? Number(row[4]) : undefined,
    category: row[5] != null ? String(row[5]) : undefined,
  }));
}

export type TimeSeriesRow = { day: string; value: number };

function formatDay(raw: string | number | null | undefined): string {
  if (raw == null) return "";
  const s = String(raw);
  if (s.length >= 10) return s.slice(0, 10);
  return s;
}

/** Clear in-memory query cache (tests / manual refresh). */
export function clearPostHogQueryCache(): void {
  queryCache.clear();
}
