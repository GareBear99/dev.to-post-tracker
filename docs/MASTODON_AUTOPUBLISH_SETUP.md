# Mastodon Auto-Publish Setup

This repo is now wired for the safest v1 flow:

```text
DEV.to latest public article
  -> Cloudflare Worker cron/manual run
  -> Cloudflare KV duplicate check
  -> Mastodon /api/v1/statuses
  -> KV receipt + optional MongoDB Atlas archive receipt
```

## What changed in v0.4.0

- Mastodon is now the default live target in `wrangler.toml`.
- `/preview` shows the exact outgoing post without posting or mutating KV.
- `/run?dry_run=1` runs the full target loop without live auto-posting.
- `/run?force=1` can intentionally repost the latest article if needed.
- Mastodon posts use an `Idempotency-Key` derived from the DEV.to article key.
- The Worker stores a stable per-article KV receipt key, not only `lastArticleUrl`.
- `POST_MAX_CHARS`, `MASTODON_VISIBILITY`, and `MASTODON_LANGUAGE` are configurable.

## Required Mastodon values

You need:

- `MASTODON_INSTANCE`, for example `https://mastodon.social` or your chosen instance URL.
- `MASTODON_TOKEN`, a user access token with `write:statuses` scope.

Add them to Cloudflare as secrets:

```bash
npx wrangler secret put RUN_TOKEN
npx wrangler secret put MASTODON_INSTANCE
npx wrangler secret put MASTODON_TOKEN
```

The Worker posts to:

```text
POST /api/v1/statuses
```

The payload includes:

```json
{
  "status": "formatted DEV.to announcement",
  "visibility": "public",
  "language": "en"
}
```

## Safe local / staging test sequence

1. Install dependencies:

```bash
npm install
npm run check
```

2. Create KV namespaces and paste the IDs into `wrangler.toml`:

```bash
npx wrangler kv namespace create DEVTO_AUTOPUBLISH_STATE
npx wrangler kv namespace create DEVTO_AUTOPUBLISH_STATE --preview
```

3. Start local Worker:

```bash
npm run worker:dev
```

4. In another terminal:

```bash
curl http://localhost:8787/health
curl -H "Authorization: Bearer $RUN_TOKEN" http://localhost:8787/preview
curl -H "Authorization: Bearer $RUN_TOKEN" "http://localhost:8787/run?dry_run=1"
```

5. Deploy after preview looks right:

```bash
npm run worker:deploy
```

6. Confirm deployed health/preview with the deployed Worker URL:

```bash
curl https://YOUR_WORKER.YOUR_SUBDOMAIN.workers.dev/health
curl -H "Authorization: Bearer $RUN_TOKEN" https://YOUR_WORKER.YOUR_SUBDOMAIN.workers.dev/preview
```

7. Live manual run:

```bash
curl -H "Authorization: Bearer $RUN_TOKEN" https://YOUR_WORKER.YOUR_SUBDOMAIN.workers.dev/run
```

## Recommended first production config

Keep it narrow first:

```toml
AUTOPOST_TARGETS = "mastodon"
AUTOPOST_DRY_RUN = "false"
POST_MAX_CHARS = "480"
MASTODON_VISIBILITY = "public"
MASTODON_LANGUAGE = "en"
```

After Mastodon is proven, expand to owned feeds:

```toml
AUTOPOST_TARGETS = "mastodon,discord,telegram,libhunt"
```

`libhunt` remains a discovery checklist receipt, not a blind API post.

## Do not commit secrets

Use `.env.example` only as a local template. Real credentials belong in Cloudflare secrets or your local shell environment.
