# Changelog

## 0.4.0 - Mastodon live autopost hardening

- Added `/preview` route for non-posting previews.
- Added `/run?dry_run=1` and `/run?force=1` manual controls.
- Made Mastodon the default first live target.
- Added Mastodon `Idempotency-Key` support using the DEV.to article key.
- Added stable per-article KV receipt keys in addition to `lastArticleUrl`.
- Added configurable `POST_MAX_CHARS`, `MASTODON_VISIBILITY`, and `MASTODON_LANGUAGE`.
- Added `.env.example` and `docs/MASTODON_AUTOPUBLISH_SETUP.md`.


## 0.2.0 - 2026-05-15

- Expanded repo from a manual DEV.to draft tracker into a Cloudflare Worker auto-poster planning package.
- Added Worker starter in `cloudflare-worker/src/index.js`.
- Added `wrangler.toml` with hourly scheduled trigger and KV binding placeholders.
- Added `package.json` scripts for config checks, local Worker testing, and deployment.
- Added target matrix in `data/syndication-targets.json`.
- Added docs for Cloudflare autoposter setup, syndication targets, LibHunt/discovery lane, and automation roadmap.
- Added CI config check workflow.
- Preserved existing Markdown DEV.to drafts and `Tools/DEVto-CLI.md`.
