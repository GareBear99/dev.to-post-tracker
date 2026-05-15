---
title: AI Desk Meter: Building a Local-First Runtime Dashboard Toward MuseMeter
published: false
description: AI Desk Meter is an open-source local-first runtime dashboard that syncs with a JSON source of truth and forms the foundation for MuseMeter, a future second-brain / Neural Synth / AI buddy system.
tags: ai,opensource,python,webdev
canonical_url: https://github.com/GareBear99/ai-desk-meter
---

# AI Desk Meter: Building a Local-First Runtime Dashboard Toward MuseMeter

I’m building **AI Desk Meter**, an open-source local-first runtime dashboard for AI status, runtime state, and companion-style desktop visibility.

The project is also the open-source foundation leading toward **MuseMeter**, a future second-brain / Neural Synth / AI buddy product.

The core idea is simple:

```text
local runtime state → JSON source of truth → dashboard sync → native/app/hardware display
```

AI Desk Meter is meant to stay lightweight, inspectable, and useful without requiring a server.

## What AI Desk Meter is

AI Desk Meter is a local-first dashboard project that displays runtime state from a JSON-backed source of truth.

It is designed as a visible companion surface for an AI/runtime system, showing state in a way that can eventually connect to:

- local AI agents
- runtime monitors
- desktop companion apps
- small hardware displays
- Raspberry Pi / ESP32 style companion builds
- native app shells
- future MuseMeter hardware/software releases

The current project is focused on making the foundation clean, open, and usable.

## Why I’m building it

Most AI interfaces are either chat boxes, dashboards, or cloud services.

AI Desk Meter is aimed at a different interaction pattern: a small visible runtime companion that can sit on your desktop, show what the system is doing, and eventually become a bridge between AI status, local memory, agent state, and companion hardware.

The long-term direction is **MuseMeter**:

- second-brain style companion
- local-first AI buddy
- Neural Synth-inspired visual interface
- desktop/runtime visibility
- optional companion hardware
- open-source foundation before the commercial 3.0 product line

## Local-first design

The project is intentionally built around a no-server default.

That means:

- no required cloud backend
- dashboard state comes from local files/runtime output
- JSON can act as the source of truth
- the system can be inspected directly
- future native/hardware layers can read the same state model

This keeps the project simple, portable, and easier to reason about.

## Current release direction

The current AI Desk Meter direction includes:

- runtime dashboard sync
- JSON-backed state updates
- local-first/no-server architecture
- support/funding links
- open-source project foundation
- future native app holster direction
- future companion hardware direction
- roadmap toward MuseMeter 3.0

The small pixel companion character and “Musing...” state are intentional.

Right now, **Musing...** represents an active response/action/loading state. Later versions may split this into more specific runtime states such as:

- responding
- loading
- thinking
- idle
- action running
- waiting for input
- agent task active

## Why JSON as source of truth

The dashboard is built around a JSON state model because it gives the project a clean bridge between layers.

A JSON runtime state can be read by:

- the web dashboard
- a native app wrapper
- Python CLI tools
- hardware companion displays
- future agent runtimes
- test scripts
- docs and demos

This makes the dashboard more than a static UI. It becomes a visible surface for a local runtime.

## Where MuseMeter fits

AI Desk Meter is the open-source foundation.

MuseMeter is the larger product direction.

The plan is:

```text
AI Desk Meter open-source foundation
→ runtime dashboard stability
→ native app shell / holster
→ real Muse/agent connection
→ companion hardware support
→ MuseMeter 3.0 commercial package
```

Everything leading up to the commercial 3.0 direction is meant to preserve the open-source foundation while proving the runtime/dashboard concept in public.

## Repo

https://github.com/GareBear99/ai-desk-meter

## What I’m looking for

I’m looking for feedback from:

- AI developers
- local-first app builders
- Python developers
- web dashboard developers
- hardware/display builders
- Raspberry Pi users
- ESP32/Arduino experimenters
- people interested in AI companion interfaces
- open-source maintainers

Useful feedback includes:

- dashboard layout issues
- JSON runtime state suggestions
- native app packaging ideas
- hardware display ideas
- local-first architecture feedback
- UI/UX suggestions
- install/run issues
- roadmap feedback

## Long-term vision

The long-term goal is a small, useful, local-first AI companion surface that can grow from a web dashboard into a native app and eventually into hardware.

AI Desk Meter is the foundation.

MuseMeter is the product horizon.

I’m building it in public so the runtime, dashboard, and companion architecture can be tested, improved, and documented as it grows.
