# MongoDB Atlas Archive Layer

MongoDB Atlas is the optional long-term database layer for this repo. Cloudflare KV remains the v1 duplicate-protection and last-run state store. Atlas is for searchable campaign history, per-platform receipts, and SEO/discovery tracking across the wider TizWildin / ARC / MuseMeter ecosystem.

## Recommended architecture

```text
DEV.to article
  ↓
Cloudflare Worker cron
  ↓
Cloudflare KV duplicate check
  ↓
Mastodon / Discord / Telegram / drafts / discovery checklist
  ↓
Optional archive webhook
  ↓
Small Node API / serverless function
  ↓
MongoDB Atlas
```

Do **not** make MongoDB mandatory for the first auto-poster. The Worker should keep working even when the archive service is offline.

## Why not direct Atlas-first from the Worker?

For this project, the safest production shape is an HTTP archive collector between Cloudflare Workers and Atlas. That keeps MongoDB credentials out of the Worker runtime, avoids driver/runtime compatibility surprises, and gives you one hardened ingestion endpoint for receipts from future tools.

## What Atlas stores

Use Atlas for records like:

- published DEV.to articles
- generated post copy
- target result receipts
- draft-only tasks for Reddit/Facebook/LinkedIn/Hacker News
- discovery-only tasks for LibHunt, SaaSHub, AlternativeTo, awesome lists, and editorial outreach
- per-repo campaign records for FreeEQ8, ARC-Neuron LLMBuilder, AI Desk Meter / MuseMeter, Proto-Synth, Voxel Audio, and future projects

## Collections

Suggested database: `tizwildin_syndication`

Suggested collections:

| Collection | Purpose |
|---|---|
| `articles` | One canonical DEV.to article record per article URL/id |
| `receipts` | One Worker run receipt per detected/published article |
| `target_results` | Flattened per-platform result rows for filtering and dashboards |
| `draft_tasks` | Manual-approval tasks for restricted platforms |
| `discovery_tasks` | LibHunt/SaaSHub/AlternativeTo/awesome-list/editorial tasks |
| `projects` | Project metadata, repo links, tags, and preferred hashtags |

## Minimal indexes

```js
// articles
db.articles.createIndex({ url: 1 }, { unique: true })
db.articles.createIndex({ published_at: -1 })
db.articles.createIndex({ project_key: 1, published_at: -1 })

// receipts
db.receipts.createIndex({ "article.url": 1, processedAt: -1 })
db.receipts.createIndex({ processedAt: -1 })

// target_results
db.target_results.createIndex({ article_url: 1, target: 1 })
db.target_results.createIndex({ lane: 1, status: 1, created_at: -1 })

// discovery_tasks
db.discovery_tasks.createIndex({ project_key: 1, target: 1 })
db.discovery_tasks.createIndex({ status: 1, updated_at: -1 })
```

## Worker environment variables

These are optional. Without them, the Worker only uses Cloudflare KV.

```bash
npx wrangler secret put ARCHIVE_WEBHOOK_URL
npx wrangler secret put ARCHIVE_WEBHOOK_TOKEN
```

Optional plain variable in `wrangler.toml`:

```toml
[vars]
ARCHIVE_PROVIDER = "mongodb-atlas-collector"
```

## Atlas collector secrets

The collector service should store these outside Git:

```bash
MONGODB_URI="mongodb+srv://..."
MONGODB_DB="tizwildin_syndication"
ARCHIVE_WEBHOOK_TOKEN="same-token-used-by-worker"
```

Use a least-privilege Atlas database user limited to the syndication database.

## Security baseline

- Keep Atlas credentials out of GitHub and public frontend code.
- Use a least-privilege database user.
- Restrict Atlas network access as tightly as your host allows.
- Require a bearer token on the archive webhook.
- Store the Worker token through `wrangler secret put`.
- Treat the archive collector as optional: if it fails, KV posting still succeeds.

## Promotion-intelligence role

Atlas becomes the long-term “promotion intelligence” database. KV answers: “Did we already post this latest article?” Atlas answers: “What projects have we promoted, where, with what results, and what still needs manual submission?”
