---
title: Proto-Synth Grid Engine: Building a Math-First 2D World Runtime That Feels 3D
published: false
description: Proto-Synth Grid Engine is a deterministic, blueprint-driven, math-first simulation surface where geometry becomes computation, entities act as executors, and 2D worlds are projected to feel visually 3D.
tags: gamedev,opensource,javascript,ai
canonical_url: https://github.com/GareBear99/Proto-Synth_Grid_Engine
---

# Proto-Synth Grid Engine: Building a Math-First 2D World Runtime That Feels 3D

I’m building **Proto-Synth Grid Engine**, also described in the repo as **I/O Synth Grid Engine**.

The project is an experimental, deterministic, low-weight world runtime where geometry is not just decoration. Geometry becomes structure, storage, routing, and execution space.

The core idea is:

```text
Geometry = storage
Movement = computation
Entities = executors
```

Instead of building a heavy 3D stack first, the engine starts with deterministic 2D simulation logic and projects it into a visually 3D synth-grid interface.

## What this is

Proto-Synth Grid Engine is a math-first simulation surface.

It treats the world like a programmable environment:

- shell geometry defines the world
- module blueprints attach systems into that shell
- entities move through the grid as executors
- grid mutations become event-shaped state changes
- deterministic replay becomes possible through event logs and receipts
- the render layer projects the 2D core into a 3D-feeling visual surface

The result is not just a game prototype or visual toy. It is an engine surface for future local-first systems, AI runtimes, neural interfaces, spatial dashboards, and programmable world simulations.

## Why 2D first

The engine is built around a deterministic 2D vector-space core.

That matters because 2D simulation is:

- easier to replay
- easier to audit
- easier to seed
- easier to run on older hardware
- easier to reason about
- lighter than full 3D
- still capable of looking spatial through projection

The visual layer can then use:

- perspective scaling
- cube-grid projection
- layered sprite depth
- shell overlays
- depth shading
- reticle and HUD surfaces
- synthwave geometry

That creates a 3D-feeling interface without making the core simulation dependent on a heavyweight 3D engine.

## Blueprint-driven worlds

The engine loads blueprints that define the structure and behavior of the world.

The main blueprint layers are:

1. **Shell Blueprint** — defines the geometry of the world.
2. **Module Blueprints** — attach systems into the shell.
3. **Execution Layer** — runs the deterministic simulation loop.

Example runtime concepts include:

- shell blueprints
- ship modules
- scanner modules
- HUD modules
- cube-grid projection mapping
- deterministic seeded worlds
- modular system attachment
- spatial execution visualization

This lets the world become a programmable surface instead of a fixed scene.

## ARC-Core-shaped event discipline

Proto-Synth Grid Engine is designed around the same doctrine as the ARC ecosystem: authority, events, receipts, deterministic replay, and audit trails.

The repo describes the engine as built on an ARC-Core pattern where grid mutations, module attachment, blueprint loads, and execution steps are modeled as receipt-shaped events.

That means core actions can be thought of as:

```text
blueprint load → signed receipt
grid mutation → append-only event
module attach → authority-gated event
simulation loop → deterministic replay
save/load → event log + snapshot
```

This direction is important because it gives the engine a path toward:

- reproducible worlds
- receipt-verified loads
- replayable simulations
- audit trails
- source-of-truth state
- module synchronization

## Iteration path

The repo has evolved through multiple iterations:

### Iteration 8 — Blueprint Shell Prototyping

Early shell generation and blueprint structure.

Example direction:

```text
blueprint_octagon.json
→ octagon shell
→ module attachment surface
```

### Iteration 9 — Game Engine Prototype

Prototype world runtime demonstrating:

- blueprint shell generation
- cube-grid projection mapping
- deterministic seed worlds
- modular system attachment
- spatial execution visualization

### Iteration 10 — Synth Grid Engine

A stronger blueprint-driven simulation shell where geometry becomes computation.

This iteration frames the runtime as a serious modular world engine direction, not just a one-off demo.

### Iteration 11 — Neural-Synth / Wetware Core

The engine expands into a neural-style interface direction with:

- Neural-Synth view
- Voxel Directory view
- synchronized visual structures
- RGB/seed reproducibility
- wetware-style runtime presentation
- spatial interface concepts for future AI systems

## Neural-Synth and Voxel Directory

One of the most interesting pieces is the relationship between the **Neural-Synth** view and the **Voxel Directory** view.

Both are intended to represent the same underlying source information through different visual surfaces:

- Neural-Synth: node/web/thinking surface
- Voxel Directory: icon/grid/filesystem-style surface

The important idea is synchronization.

A change in one representation should correspond to the same source structure in the other representation.

That creates a future path where an AI or user can inspect the same runtime through multiple visual modes without losing the underlying source-of-truth relationship.

## Why this matters

A lot of engines treat visuals, state, and logic as separate concerns.

Proto-Synth Grid Engine explores a different idea:

```text
space itself can act like a filesystem
geometry can be executable structure
visual layout can reflect runtime state
entities can act as autonomous executors
blueprints can define both shape and behavior
```

This makes the project relevant beyond normal game development.

Possible use cases include:

- deterministic game/sim prototypes
- AI runtime visualizers
- spatial dashboards
- local-first programmable environments
- neural interface experiments
- visual source-of-truth editors
- low-weight world simulations
- seeded universe or grid simulations
- blueprint-based runtime shells

## Controls

The engine includes simple interaction controls such as:

```text
W A S D → move master control
Mouse   → aim vector
C       → toggle reticle
R       → reset
```

The goal is direct interaction with the simulated surface while still keeping the core lightweight.

## Repo

https://github.com/GareBear99/Proto-Synth_Grid_Engine

## What I’m looking for

I’m looking for feedback from:

- game developers
- simulation developers
- JavaScript developers
- AI interface builders
- low-level engine designers
- UI/UX experimenters
- local-first software builders
- people interested in deterministic systems
- people interested in visual AI runtimes

Useful feedback includes:

- simulation architecture feedback
- blueprint format ideas
- deterministic replay suggestions
- low-weight rendering ideas
- Neural-Synth interface feedback
- Voxel Directory interaction ideas
- event/receipt architecture feedback
- performance suggestions
- docs and onboarding improvements

## Long-term direction

The long-term goal is to make Proto-Synth Grid Engine a lightweight programmable world surface.

Not just a visual demo.

Not just a grid.

A deterministic simulation layer where geometry, execution, memory, and interface all live in the same blueprint-driven environment.
