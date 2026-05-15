# dev.to-post-tracker

Profile: https://dev.to/tizwildin

Markdown draft tracker and automation control plane for DEV.to outreach posts across the TizWildin / ARC / Synth ecosystem.

This repo now has three jobs:

1. Keep clean Markdown drafts for DEV.to publishing.
2. Plan and host a Cloudflare Worker that detects newly published DEV.to posts and syndicates them safely.
3. Optionally archive campaign receipts into MongoDB Atlas through a small collector API for long-term SEO/discovery tracking.

## Current draft files

- `AI_DESK_METER_DEVTO_POST.md` — AI Desk Meter / MuseMeter foundation
- `ARC_LANGUAGE_MODULE_DEVTO_POST.md` — ARC Language Module
- `ARC_STREAMMEMORY_DEVTO_POST.md` — ARC-StreamMemory
- `ARC_TURBO_OS_DEVTO_POST.md` — ARC Turbo OS
- `INSTRUDIO_STUDIO_VIOLIN_DEVTO.md` — Instrudio / Studio Violin
- `LLMBUILDER_DEVTO_POST.md` — ARC-Neuron LLMBuilder
- `PROTO_SYNTH_GRID_ENGINE_DEVTO_POST.md` — Proto-Synth Grid Engine
- `SEEDED_UNIVERSE_RECREATION_ENGINE_DEVTO_POST.md` — Seeded Universe Recreation Engine

## Automation plan

```text
DEV.to article published
        ↓
Cloudflare Worker Cron Trigger
        ↓
Fetch latest public DEV.to article
        ↓
KV duplicate check
        ↓
Format post by project family
        ↓
Auto-post / draft / discovery lane
        ↓
Optional MongoDB Atlas archive collector
```

### Auto-post lane

These are safe first because they are controlled feeds or API-friendly destinations:

- Mastodon
- Discord webhook
- Telegram channel
- Bluesky planned next through AT Protocol

### Draft-only lane

These should generate copy for manual approval instead of blind posting:

- Reddit
- Facebook groups/pages
- LinkedIn
- Hacker News
- GitHub Discussions until repo/category routing is explicit

### SEO/discovery lane

These are not normal social-post targets. They are directory/listing/submission targets:

- LibHunt
- SaaSHub
- AlternativeTo
- curated awesome lists
- editorial/review outlets
- GitHub Topics and public IO/HUB routing

## Key files

| File | Purpose |
|---|---|
| `cloudflare-worker/src/index.js` | Cloudflare Worker starter for scheduled DEV.to polling and syndication |
| `wrangler.toml` | Cloudflare Worker config with hourly cron and KV binding placeholder |
| `data/syndication-targets.json` | Machine-readable target matrix |
| `docs/CLOUDFLARE_AUTOPOSTER_PLAN.md` | Setup plan and deployment instructions |
| `docs/SYNDICATION_TARGETS.md` | Social/platform target strategy |
| `docs/LIBHUNT_AND_DISCOVERY_LANE.md` | LibHunt and directory-submission strategy |
| `docs/MONGODB_ATLAS_ARCHIVE_LAYER.md` | Optional Atlas archive/campaign database plan |
| `data/schemas/mongodb-receipt.schema.json` | Receipt payload schema for archive collector |
| `server/mongodb-archive-api/` | Optional Node/Express collector that writes receipts to Atlas |
| `docs/DEVTO_POST_AUTOMATION_ROADMAP.md` | Versioned automation roadmap |
| `Tools/DEVto-CLI.md` | Existing DEV.to CLI helper notes |

## Quick setup

```bash
npm install
npm run check
```

Create Cloudflare KV namespaces:

```bash
npx wrangler kv namespace create DEVTO_AUTOPUBLISH_STATE
npx wrangler kv namespace create DEVTO_AUTOPUBLISH_STATE --preview
```

Paste the returned IDs into `wrangler.toml`, then add secrets only for the enabled targets:

```bash
npx wrangler secret put RUN_TOKEN
npx wrangler secret put MASTODON_INSTANCE
npx wrangler secret put MASTODON_TOKEN
npx wrangler secret put DISCORD_WEBHOOK_URL
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID

# Optional Atlas archive collector webhook
npx wrangler secret put ARCHIVE_WEBHOOK_URL
npx wrangler secret put ARCHIVE_WEBHOOK_TOKEN
```

Test locally:

```bash
npx wrangler dev cloudflare-worker/src/index.js --test-scheduled
curl http://localhost:8787/health
curl -H "Authorization: Bearer $RUN_TOKEN" http://localhost:8787/run
```

Deploy:

```bash
npx wrangler deploy
```


## Optional MongoDB Atlas archive mode

For v1, Cloudflare KV is enough. Use MongoDB Atlas when you want the bigger promotion brain: searchable post history, per-platform receipts, LibHunt/submission tasks, manual-approval queues, and project-level SEO tracking.

```text
Cloudflare KV = duplicate protection and last-run state
MongoDB Atlas = campaign archive, dashboard data, and discovery/task history
```

The Worker does not require MongoDB. When `ARCHIVE_WEBHOOK_URL` is set, it sends a receipt to the optional collector in `server/mongodb-archive-api/`.

```bash
cd server/mongodb-archive-api
npm install
MONGODB_URI="mongodb+srv://..." \
MONGODB_DB="tizwildin_syndication" \
ARCHIVE_WEBHOOK_TOKEN="same-token-as-worker" \
npm start
```

See `docs/MONGODB_ATLAS_ARCHIVE_LAYER.md` for collections, indexes, secrets, and security baseline.

## Recommended first live target set

Start with:

```toml
AUTOPOST_TARGETS = "mastodon,discord,telegram,libhunt"
```

Why: Mastodon/Discord/Telegram can be automated cleanly, while LibHunt stays as a discovery checklist receipt instead of a blind post.

## Seeded Universe ecosystem update

The Seeded Universe draft includes a related-repos section linking the wider ARC/Synth stack:

- ARC-Neuron LLMBuilder
- ARC-Core
- Proto-Synth Grid Engine
- Neo-VECTR Solar Sim NASA Standard
- TT-101 Handbook
- ARC Language Module
- ARC-StreamMemory

## Publishing flow

1. Write or update the Markdown draft.
2. Publish the final article on DEV.to.
3. Cloudflare Worker detects the latest article on schedule.
4. Worker checks KV state to avoid duplicate reposts.
5. Worker sends safe auto-posts and records draft/discovery tasks.
6. Manual approval handles Reddit, Facebook, LinkedIn, HN, and GitHub Discussions when needed.
7. Directory/discovery actions are tracked through the LibHunt/discovery lane.

## Safety

- Do not store DEV.to, Mastodon, Discord, Telegram, Bluesky, GitHub, or Meta credentials in this repo.
- Use `wrangler secret put` or environment variables only.
- Do not blind auto-post into Reddit, Facebook groups, LinkedIn, or Hacker News.
- Keep duplicate protection enabled through KV before turning on public posting.
- Keep DEV.to as the canonical source so SEO signals point back to one stable long-form article.
