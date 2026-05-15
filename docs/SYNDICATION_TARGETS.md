# Syndication Target Matrix

DEV.to should stay the canonical source for long-form posts. Every other channel is either a broadcast copy, a manually approved draft, or a discovery/SEO submission task.

## Tier 1 — safe auto-post targets

| Target | Why it fits | Required setup | Default mode |
|---|---|---|---|
| Mastodon | Strong open-source and dev audience; full status API | Instance URL + user token with status write scope | Auto-post |
| Discord | Owned community/update server; webhook is simple | Incoming webhook URL | Auto-post |
| Telegram | Lightweight announcement channel | Bot token + chat ID | Auto-post |
| Bluesky | Good build-in-public/dev audience | AT Protocol app password/session handling | Planned auto-post |

## Tier 2 — draft/manual approval targets

| Target | Why not blind auto-post | Recommended workflow |
|---|---|---|
| Reddit | Subreddit rules and spam filters are strict | Generate subreddit-specific drafts and approve manually |
| Facebook groups/pages | API permissions can be restrictive; groups dislike bots | Generate polished FB drafts from DEV.to posts |
| LinkedIn | Good business credibility but APIs are restricted | Generate professional drafts or use approved API access |
| Hacker News | Manual post only; title quality matters | Generate one-line Show HN / Launch HN title drafts |
| GitHub Discussions | Good persistent SEO but repo/category-specific | Create repo-specific drafts first; automate only after mapping is stable |

## Tier 3 — SEO/discovery targets

| Target | Purpose | Action |
|---|---|---|
| LibHunt | Open-source alternatives/discovery traffic | Submit/monitor relevant GitHub repos and related alternatives |
| SaaSHub | Product comparison and alternatives pages | Submit project/product profile where relevant |
| AlternativeTo | Broader non-dev discovery | Submit polished product listing where relevant |
| Curated awesome lists | High-trust backlinks and validation | Open targeted pull requests with one clean entry |
| Product Hunt | Launch moment, not every article | Use only for major launches |
| GitHub Topics | Repo-native discoverability | Keep repo topics aligned with article keywords |

## Suggested project routing

| Project family | Primary channels | Draft/manual channels | Discovery channels |
|---|---|---|---|
| FreeEQ8 / plugin ecosystem | Mastodon, Discord, Telegram, Bluesky | Reddit audio/plugin subs, Facebook music groups, LinkedIn | LibHunt, awesome-juce, audio plugin lists, SaaSHub |
| ARC-Neuron / LLMBuilder | Mastodon, Discord, Telegram, Bluesky | Reddit LocalLLaMA/open-source AI, LinkedIn, HN | LibHunt, awesome LLM/ML lists, SaaSHub |
| AI Desk Meter / MuseMeter | Mastodon, Discord, Telegram, Bluesky | LinkedIn, Reddit side-project/devtools | LibHunt, AlternativeTo, SaaSHub |
| Music releases | Discord, Telegram, Mastodon, Bluesky | Facebook groups, Reddit music subs | Link hubs, public IO page, SoundCloud/Spotify routers |

## Default hashtags by family

| Family | Hashtags |
|---|---|
| Audio plugins | `#AudioDSP #JUCE #VST3 #OpenSource #MusicProduction` |
| ARC / AI | `#LocalAI #OpenSource #LLM #AIEngineering #BuildInPublic` |
| AI Desk Meter | `#LocalFirst #OpenSource #DevTools #AI #BuildInPublic` |
| Music | `#NewMusic #ElectronicMusic #TizWildin #MusicProducer` |

## Anti-spam rules

- Never post the same article twice to the same target.
- Do not auto-post to Reddit, Facebook groups, or HN.
- Keep hashtags tight; five or fewer is usually cleaner.
- Route posts by project family instead of blasting every channel with the same text.
- Keep a KV receipt for every run so failures and duplicate protection are auditable.
