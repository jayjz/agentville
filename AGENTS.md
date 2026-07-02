<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AgentVille 1996 - Agent Instructions

## Project Identity
High-signal retro Windows 95 AI orchestration portfolio demo. Nostalgic desktop environment showcasing multi-agent systems, live visualization, and tool orchestration. Strong "Jay — Agent Systems Architect" cinematic branding.

## Core Design Principles (Non-Negotiable)
- **Retro Fidelity First**: Every UI element must feel authentic to 1995-1996 Windows 95 (colors, borders, icons, sounds if added, behavior). No modern glassmorphism or clean minimalism.
- **Performance**: Target 60fps. Optimize Pixi.js renders, use React.memo, minimize re-renders in Desktop.tsx.
- **Immersive Agent Experience**: Agents (Karen, Chad, Alice, Bob, Eve, Mallory) are characters with personality. Visualize their states clearly in TownSquare.
- **Portfolio Quality**: Clean, bug-free, impressive on first load. Cinematic feel with CRT effects.

## Architecture Rules
- Desktop.tsx: Window manager + shell. Keep logic modular via custom hooks.
- TownSquare.tsx: Pixi.js canvas for agents, buildings, animations. Central visual hub.
- State: React + custom hooks preferred. Avoid over-engineering early.
- New components: `src/components/` only. Clear naming (`AgentSprite.tsx`, `WorkflowViz.tsx`).

## Coding Standards
- TypeScript strict. Minimal `any` (only for Pixi interop).
- Tailwind + custom CSS for retro effects.
- Framer Motion for smooth window interactions.
- Conventional commits.
- Always run `npm run build` before major PRs/commits.

## When Adding Features
- Prioritize roadmap phases strictly.
- For agent behaviors: Implement state machine first (idle/moving/working/success).
- Visualization > Simulation. Move toward real OpenClaw integration in Phase 2.

Follow CLAUDE.md for full details.
