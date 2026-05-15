# Cloudflare DEV.to Auto-Poster Plan

This repo is now planned as the control plane for DEV.to-first publishing across the TizWildin / ARC / Synth ecosystem.

## Goal

Use DEV.to as the canonical long-form devlog source, then let a Cloudflare Worker detect newly published posts and distribute them into safe channels.

```text
DEV.to article published
        ↓
Cloudflare Worker Cron Trigger
        ↓
Fetch latest DEV.to posts through Forem/DEV API
        ↓
Check KV state to prevent duplicate reposts
        ↓
Format project-specific social post
        ↓
Auto-post, draft, or discovery-checklist target lanes
```

## Why Cloudflare Workers

Cloudflare Workers Cron Triggers run a Worker on a schedule through a `scheduled()` handler, which fits hourly DEV.to polling and avoids running a VPS just for syndication. Workers KV provides a globally replicated key-value store for state such as the last processed article URL and per-article run receipts.

## Current Worker scope

The starter Worker in `cloudflare-worker/src/index.js` currently supports:

- `/health` — simple health check.
- `/last` — shows the last processed article and last run receipt.
- `/preview` — previews the latest formatted post without live posting or mutating KV.
- `/run` — manually triggers a run when authorized by `RUN_TOKEN`. Supports `?dry_run=1` and `?force=1`.
- Scheduled polling through `wrangler.toml` cron.
- DEV.to public article fetch for `DEVTO_USERNAME`.
- KV duplicate protection through `STATE`.
- Auto-post lane: Mastodon, with per-article idempotency keys.
- Auto-post lane: Discord webhook.
- Auto-post lane: Telegram bot channel.
- Planned lane: Bluesky / AT Protocol.
- Draft-only lanes: Reddit, LinkedIn, Facebook, GitHub Discussions.
- Discovery-only lanes: LibHunt, SaaSHub, AlternativeTo, curated awesome lists.

## Required Cloudflare setup

1. Install dependencies:

```bash
npm install
```

2. Create KV namespaces:

```bash
npx wrangler kv namespace create DEVTO_AUTOPUBLISH_STATE
npx wrangler kv namespace create DEVTO_AUTOPUBLISH_STATE --preview
```

3. Paste the returned namespace IDs into `wrangler.toml`.

4. Add secrets:

```bash
npx wrangler secret put RUN_TOKEN
npx wrangler secret put MASTODON_INSTANCE
npx wrangler secret put MASTODON_TOKEN
npx wrangler secret put DISCORD_WEBHOOK_URL
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

Only add the secrets for targets you actually enable.

5. Set non-secret variables in `wrangler.toml` if desired:

```toml
[vars]
DEVTO_USERNAME = "tizwildin"
AUTOPOST_TARGETS = "mastodon"
DEFAULT_ECOSYSTEM_TAG = "BuildInPublic"
MAX_HASHTAGS = "5"
POST_MAX_CHARS = "480"
MASTODON_VISIBILITY = "public"
MASTODON_LANGUAGE = "en"
```

6. Test locally:

```bash
npx wrangler dev cloudflare-worker/src/index.js --test-scheduled
curl http://localhost:8787/health
curl -H "Authorization: Bearer $RUN_TOKEN" http://localhost:8787/preview
curl -H "Authorization: Bearer $RUN_TOKEN" "http://localhost:8787/run?dry_run=1"
curl -H "Authorization: Bearer $RUN_TOKEN" http://localhost:8787/run
```

7. Deploy:

```bash
npx wrangler deploy
```

## Posting policy

Do not blindly auto-post everywhere. Use three lanes:

| Lane | Use for | Current examples |
|---|---|---|
| Auto-post | Owned/API-friendly feeds | Mastodon, Discord, Telegram |
| Draft-only | Communities where automation can look spammy | Reddit, Facebook, LinkedIn, GitHub Discussions |
| Discovery-only | Directories and curated lists | LibHunt, SaaSHub, AlternativeTo, awesome lists |

## Recommended first production target set

```toml
AUTOPOST_TARGETS = "mastodon"
```

This gives real distribution without risking community spam flags.

## Next engineering steps

1. Add Bluesky AT Protocol session creation and post record publishing.
2. Add GitHub Discussions posting only after repo/category mapping is explicit.
3. Add project classifier so FreeEQ8 posts get audio/plugin tags while ARC posts get local-AI/open-source tags.
4. Add a receipt dashboard generated from KV run history.
5. Add a manual approval queue for draft-only targets.

## Optional MongoDB Atlas archive upgrade

Atlas is now treated as a v2 archive layer, not a hard dependency. The Worker continues to use Cloudflare KV for duplicate protection and last-run state. When `ARCHIVE_WEBHOOK_URL` is configured, the Worker posts a receipt payload to the archive collector after each successful run.

Recommended split:

```text
Cloudflare KV
- lastArticleUrl
- lastRun
- small article receipts
- duplicate protection

MongoDB Atlas
- full receipt history
- per-target status rows
- draft-only manual approval queue
- LibHunt/SaaSHub/AlternativeTo/awesome-list discovery tasks
- future dashboard/search/filtering
```

Secrets to add only when archive mode is enabled:

```bash
npx wrangler secret put ARCHIVE_WEBHOOK_URL
npx wrangler secret put ARCHIVE_WEBHOOK_TOKEN
```

The collector API lives in `server/mongodb-archive-api/` and expects:

```bash
MONGODB_URI="mongodb+srv://..."
MONGODB_DB="tizwildin_syndication"
ARCHIVE_WEBHOOK_TOKEN="same-token-used-by-worker"
```

See `docs/MONGODB_ATLAS_ARCHIVE_LAYER.md` for the full schema, collection plan, index plan, and security baseline.
