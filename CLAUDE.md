# CLAUDE.md - AgentVille 1996

@AGENTS.md

## Project Overview
High-signal retro Windows 95-themed AI orchestration portfolio piece. Demonstrates multi-agent systems, tool calling, and live visualization in a nostalgic desktop environment. Target audience: recruiters, AI/tech enthusiasts, portfolio viewers (Jay — Agent Systems Architect branding).

Core goals:
- Perfect 90s Win95 authenticity with CRT effects, draggable windows, pixel-perfect details.
- Showcase agentic workflows (state machines, Pixi.js sprites, simulated/real orchestration).
- Maintain 60fps performance and clean, maintainable React/Next.js code.
- Portfolio-ready: cinematic, shareable, extensible.

## Tech Stack & Conventions
- Next.js 16 (App Router) + TypeScript (strict)
- Tailwind CSS + custom CRT/scanline effects in globals.css
- Framer Motion for UI, Pixi.js for TownSquare canvas/sprites
- Retro aesthetic: Press Start 2P / VT323 fonts, teal/gray Win95 palette, pixel art agents

**Critical Rules:**
- Never break retro immersion. All new UI must feel native 1995-1996 Windows 95.
- Prefer custom hooks for window management, agent state.
- Keep components under ~400-500 LOC. Refactor Desktop.tsx aggressively.
- Use TypeScript strictly. No `any` except for Pixi.js interop where unavoidable.
- Performance: Memoize heavily, optimize Pixi renders, target 60fps.

## File Structure & Architecture
- `src/components/Desktop.tsx` → Main shell, window manager, logs, icons
- `src/components/TownSquare.tsx` → Pixi.js agent canvas (core visual)
- `src/components/NPC.tsx` → Individual agent sprites
- New features go in `src/components/` or `src/lib/`

## Development Workflow
- Dev: `npm run dev`
- Build: `npm run build`
- Always run build before committing major changes.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `style: retro-ui`

## Agentic / Orchestration Guidelines
- Agents (Karen, Chad, etc.) must have clear states: idle, moving, working, success/error.
- Visualize tool-calling and workflows in TownSquare where possible.
- Simulate → Real integration (OpenClaw connector) path in roadmap.
- State management: React + custom hooks first; consider Zustand/Jotai only if needed.

## Code Style & Quality
- Pixel-perfect where possible for retro feel.
- Accessible where it doesn't break aesthetic (ARIA labels on windows).
- Self-review every change for immersion, performance, and bugs.
- No modern "AI slop" UI — strict 90s fidelity.

## Roadmap Alignment
Always reference ROADMAP.md phases. Prioritize Phase 1 (Core Orchestration) next.

Update this file after major changes.
