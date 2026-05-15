# DEV.to Post Automation Roadmap

## v0.1 — Manual tracker

Current original state:

- Markdown draft files live in the repo.
- Posts are manually pasted into DEV.to.
- The repo acts as a content vault.

## v0.2 — Cloudflare auto-poster foundation

Added in this package:

- Cloudflare Worker skeleton.
- Wrangler config with scheduled hourly cron.
- KV duplicate-protection plan.
- Mastodon, Discord, and Telegram auto-post lanes.
- Bluesky placeholder lane.
- Draft-only lanes for Reddit, Facebook, LinkedIn, GitHub Discussions.
- Discovery-only lanes for LibHunt, SaaSHub, AlternativeTo, and awesome lists.
- JSON target matrix.
- Config/docs validation script.

## v0.3 — Real production wiring

- Add real Cloudflare KV namespace IDs.
- Add Wrangler secrets.
- Deploy Worker.
- Confirm `/health`, `/last`, and `/run`.
- Test with one published DEV.to article.
- Verify Mastodon/Discord/Telegram results.

## v0.4 — Project-aware formatting

Add a classifier:

- FreeEQ8 / audio plugins → `#AudioDSP`, `#JUCE`, `#VST3`, `#OpenSource`.
- ARC / LLMBuilder → `#LocalAI`, `#LLM`, `#OpenSource`, `#AIEngineering`.
- AI Desk Meter / MuseMeter → `#LocalFirst`, `#DevTools`, `#AI`.
- Music → `#NewMusic`, `#ElectronicMusic`, `#TizWildin`.

## v0.5 — Draft approval queue

Add KV-backed pending drafts:

```text
pending:reddit:<article-id>
pending:facebook:<article-id>
pending:linkedin:<article-id>
pending:github-discussion:<article-id>
```

Then add `/drafts` and `/approve` routes.

## v1.0 — Full distribution control plane

- DEV.to canonical post source.
- Public IO page update hook.
- GitHub Discussions mapped per project.
- Mastodon/Bluesky/Discord/Telegram live.
- Discovery lane tracker for LibHunt and curated list submissions.
- Receipts dashboard for every article and target.
