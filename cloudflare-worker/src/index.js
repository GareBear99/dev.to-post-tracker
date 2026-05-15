const DEFAULT_DEV_USERNAME = "tizwildin";
const DEFAULT_DEV_API_BASE = "https://dev.to/api";
const USER_AGENT = "TizWildinDevToAutoPoster/0.4 (+https://github.com/GareBear99/dev.to-post-tracker)";
const DEFAULT_TARGETS = "mastodon";

const CHANNELS = {
  mastodon: postToMastodon,
  bluesky: postToBlueskyPlaceholder,
  discord: postToDiscord,
  telegram: postToTelegram,
  github_discussion: createDraftOnlyResult,
  linkedin: createDraftOnlyResult,
  reddit: createDraftOnlyResult,
  facebook: createDraftOnlyResult,
  libhunt: createDiscoveryOnlyResult,
  saashub: createDiscoveryOnlyResult,
  alternativeto: createDiscoveryOnlyResult,
  awesome_lists: createDiscoveryOnlyResult
};

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runAutoPoster(env, { reason: "scheduled", cron: event.cron }));
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "devto-ecosystem-autoposter", version: "0.4.0" });
    }

    if (url.pathname === "/preview") {
      if (!isAuthorized(request, env)) return json({ ok: false, error: "Unauthorized" }, 401);
      const result = await runAutoPoster(env, { reason: "preview" }, { dryRun: true, persist: false, force: true });
      return json(result);
    }

    if (url.pathname === "/run") {
      if (!isAuthorized(request, env)) return json({ ok: false, error: "Unauthorized" }, 401);
      const force = url.searchParams.get("force") === "1" || url.searchParams.get("force") === "true";
      const dryRun = url.searchParams.get("dry_run") === "1" || url.searchParams.get("dry_run") === "true";
      const result = await runAutoPoster(env, { reason: "manual", force, dryRun }, { force, dryRun });
      return json(result);
    }

    if (url.pathname === "/last") {
      const last = await env.STATE.get("lastArticleUrl");
      const log = await env.STATE.get("lastRun", "json");
      return json({ lastArticleUrl: last || null, lastRun: log || null });
    }

    return json({ ok: false, error: "Not found" }, 404);
  }
};

async function runAutoPoster(env, context = {}, options = {}) {
  const username = env.DEVTO_USERNAME || DEFAULT_DEV_USERNAME;
  const apiBase = env.DEVTO_API_BASE || DEFAULT_DEV_API_BASE;
  const articles = await fetchDevArticles(apiBase, username);
  const latest = articles.find((article) => article?.url && article?.published_at) || articles[0];

  if (!latest?.url) {
    const empty = { ok: true, skipped: true, reason: "No published DEV.to article found", context };
    if (options.persist !== false) await env.STATE.put("lastRun", JSON.stringify(empty));
    return empty;
  }

  const articleKey = getArticleKey(latest);
  const alreadyProcessed = await env.STATE.get(articleKey);
  const lastArticleUrl = await env.STATE.get("lastArticleUrl");

  if (!options.force && (alreadyProcessed || lastArticleUrl === latest.url)) {
    const unchanged = {
      ok: true,
      skipped: true,
      reason: "Latest article already processed",
      url: latest.url,
      articleKey,
      context
    };
    if (options.persist !== false) await env.STATE.put("lastRun", JSON.stringify(unchanged));
    return unchanged;
  }

  const post = formatSyndicationPost(latest, env);
  const targets = parseTargets(env.AUTOPOST_TARGETS || DEFAULT_TARGETS);
  const shouldDryRun = options.dryRun || String(env.AUTOPOST_DRY_RUN || "").toLowerCase() === "true";
  const results = [];

  for (const target of targets) {
    const fn = CHANNELS[target] || createDraftOnlyResult;
    try {
      if (shouldDryRun && isAutoPostTarget(target)) {
        results.push(createDryRunResult({ target, article: latest, post }));
      } else {
        results.push(await fn({ target, article: latest, post, env, articleKey }));
      }
    } catch (error) {
      results.push({ target, ok: false, error: String(error?.message || error) });
    }
  }

  const output = {
    ok: true,
    dryRun: shouldDryRun,
    article: pickArticleFields(latest),
    post,
    articleKey,
    targets: results,
    context,
    processedAt: new Date().toISOString()
  };

  output.archive = shouldDryRun ? { enabled: false, reason: "dry_run" } : await archiveReceiptIfEnabled({ env, receipt: output });

  if (!shouldDryRun && options.persist !== false) {
    await env.STATE.put("lastArticleUrl", latest.url);
    await env.STATE.put(articleKey, JSON.stringify(output));
    await env.STATE.put("lastRun", JSON.stringify(output));
  } else if (options.persist !== false) {
    await env.STATE.put("lastRun", JSON.stringify(output));
  }

  return output;
}

async function fetchDevArticles(apiBase, username) {
  const url = new URL(`${apiBase}/articles`);
  url.searchParams.set("username", username);
  url.searchParams.set("state", "fresh");
  url.searchParams.set("per_page", "10");

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.forem.api-v1+json",
      "User-Agent": USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`DEV.to fetch failed: HTTP ${response.status} ${await response.text()}`);
  }
  return response.json();
}

function formatSyndicationPost(article, env) {
  const ecosystemTag = env.DEFAULT_ECOSYSTEM_TAG || "#BuildInPublic";
  const maxTags = Number(env.MAX_HASHTAGS || 5);
  const tags = [...new Set([...(article.tag_list || article.tags || []), ecosystemTag.replace(/^#/, "")])]
    .slice(0, maxTags)
    .map((tag) => `#${String(tag).replace(/^#/, "").replace(/[^A-Za-z0-9_]/g, "")}`)
    .filter((tag) => tag.length > 1);

  const title = article.title || "New DEV.to post";
  const description = article.description ? `\n\n${article.description}` : "";
  const suffix = tags.length ? `\n\n${tags.join(" ")}` : "";
  const base = `New DEV.to post is live:\n\n${title}${description}\n\n${article.url}${suffix}`.trim();
  return clampPost(base, Number(env.POST_MAX_CHARS || 480), article.url, tags);
}

async function postToMastodon({ post, env, article, articleKey }) {
  requireEnv(env, ["MASTODON_INSTANCE", "MASTODON_TOKEN"]);
  const idempotencyKey = stableIdempotencyKey(`mastodon:${articleKey}:${article?.url || ""}`);
  const response = await fetch(`${trimSlash(env.MASTODON_INSTANCE)}/api/v1/statuses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MASTODON_TOKEN}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify({
      status: post,
      visibility: env.MASTODON_VISIBILITY || "public",
      language: env.MASTODON_LANGUAGE || "en"
    })
  });
  const body = await safeJson(response);
  if (!response.ok) throw new Error(`Mastodon failed: HTTP ${response.status} ${JSON.stringify(body)}`);
  return { target: "mastodon", ok: true, url: body.url || body.uri || null, id: body.id || null };
}

async function postToDiscord({ post, env }) {
  requireEnv(env, ["DISCORD_WEBHOOK_URL"]);
  const response = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: post })
  });
  if (!response.ok) throw new Error(`Discord failed: HTTP ${response.status} ${await response.text()}`);
  return { target: "discord", ok: true };
}

async function postToTelegram({ post, env }) {
  requireEnv(env, ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"]);
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: post, disable_web_page_preview: false })
  });
  const body = await safeJson(response);
  if (!response.ok) throw new Error(`Telegram failed: HTTP ${response.status} ${JSON.stringify(body)}`);
  return { target: "telegram", ok: true, message_id: body?.result?.message_id || null };
}

async function postToBlueskyPlaceholder({ post }) {
  return {
    target: "bluesky",
    ok: false,
    mode: "planned",
    reason: "Add AT Protocol session creation and post record publishing after app password is configured.",
    draft: post
  };
}

async function createDraftOnlyResult({ target, post, article }) {
  return {
    target,
    ok: true,
    mode: "draft_only",
    reason: "Manual approval recommended to avoid platform spam/rate-limit issues.",
    title: article.title || null,
    draft: post
  };
}

async function createDiscoveryOnlyResult({ target, article }) {
  return {
    target,
    ok: true,
    mode: "discovery_checklist",
    reason: "Directory/listing targets are submission or monitoring lanes, not blind social auto-post targets.",
    articleUrl: article.url,
    action: "Use the discovery matrix to submit the relevant repo/article and record status."
  };
}

function createDryRunResult({ target, article, post }) {
  return {
    target,
    ok: true,
    mode: "dry_run",
    reason: "AUTOPOST_DRY_RUN or /preview prevented a live API post.",
    title: article.title || null,
    draft: post
  };
}

async function archiveReceiptIfEnabled({ env, receipt }) {
  if (!env.ARCHIVE_WEBHOOK_URL) {
    return { enabled: false, provider: env.ARCHIVE_PROVIDER || "cloudflare-kv-only" };
  }

  const headers = {
    "Content-Type": "application/json",
    "User-Agent": USER_AGENT
  };
  if (env.ARCHIVE_WEBHOOK_TOKEN) {
    headers.Authorization = `Bearer ${env.ARCHIVE_WEBHOOK_TOKEN}`;
  }

  const payload = {
    provider: env.ARCHIVE_PROVIDER || "mongodb-atlas-collector",
    source: "cloudflare-worker",
    receipt
  };

  try {
    const response = await fetch(env.ARCHIVE_WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    const body = await safeJson(response);
    if (!response.ok) {
      return { enabled: true, ok: false, status: response.status, body };
    }
    return { enabled: true, ok: true, status: response.status, body };
  } catch (error) {
    return { enabled: true, ok: false, error: String(error?.message || error) };
  }
}

function parseTargets(raw) {
  return String(raw)
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

function isAutoPostTarget(target) {
  return ["mastodon", "discord", "telegram"].includes(target);
}

function isAuthorized(request, env) {
  if (!env.RUN_TOKEN) return true;
  return request.headers.get("Authorization") === `Bearer ${env.RUN_TOKEN}`;
}

function requireEnv(env, names) {
  const missing = names.filter((name) => !env[name]);
  if (missing.length) throw new Error(`Missing env vars: ${missing.join(", ")}`);
}

function trimSlash(value) {
  return String(value || "").replace(/\/$/, "");
}

function getArticleKey(article) {
  const stable = article.id || article.slug || article.url || article.title || "unknown";
  return `article:${stableIdempotencyKey(String(stable))}`;
}

function stableIdempotencyKey(input) {
  // Workers provide Web Crypto, but this synchronous FNV-1a style key keeps ids stable without async ceremony.
  let hash = 2166136261;
  for (const char of String(input)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `devto-${(hash >>> 0).toString(16)}`;
}

function clampPost(text, maxChars, url, tags) {
  if (!maxChars || text.length <= maxChars) return text;
  const tagText = tags.length ? `\n\n${tags.join(" ")}` : "";
  const reserved = `\n\n${url}${tagText}`;
  const room = Math.max(80, maxChars - reserved.length - 3);
  return `${text.slice(0, room).trimEnd()}...${reserved}`;
}

function pickArticleFields(article) {
  return {
    id: article.id,
    title: article.title,
    url: article.url,
    published_at: article.published_at,
    tag_list: article.tag_list || article.tags || []
  };
}

async function safeJson(response) {
  const text = await response.text();
  try { return text ? JSON.parse(text) : {}; } catch { return { raw: text }; }
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
