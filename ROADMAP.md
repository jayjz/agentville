# AgentVille Roadmap

**Vision**: A compelling, interactive retro desktop portfolio that demonstrates real AI agent orchestration capabilities.

## Phase 0: Foundation ✓ (Completed)
- Next.js 16 + TypeScript + Tailwind
- Retro Win95 styling + CRT effects
- Draggable/resizable/minimizable windows
- Basic NPC skeleton + TownSquare canvas

## Phase 1: Core Orchestration (Priority - Current)
**Goal**: Make agents feel alive and interactive.
- [ ] **Agent State Machine**
  - Define states: idle, moving, working, success, error
  - Centralized state management (context or custom hook)
- [ ] **Tool-Calling Visualization**
  - Visual indicators (progress bars, icons) when agents "call tools"
  - Log integration with visual feedback
- [ ] **Real-time Workflow Rendering**
  - Sequence visualization in TownSquare or Control Panel
- [ ] **Sprite Animation System**
  - Improved Pixi.js animations for movement, actions, emotions
  - Pixel-art style consistency

**Success Criteria**: Smooth 60fps animations, clear agent states, demo mission feels dynamic and responsive.

## Phase 2: Integration
- [ ] OpenClaw / real agent connector (mock first)
- [ ] Live agent traces & debugging overlay
- [ ] Performance metrics (FPS counter, agent stats)
- [ ] Export/share functionality (screenshot, JSON export of session)

## Phase 3: Polish & Production
- [ ] Mobile responsive retro shell (touch-friendly windows)
- [ ] Accessibility (ARIA, keyboard nav, screen reader)
- [ ] Deep performance optimization
- [ ] Production deployment + Vercel polish
- [ ] Additional demo scenarios / extensibility

**Overall Priorities**
1. Visual polish & immersion (never sacrifice retro feel)
2. Performance & stability
3. Real orchestration capabilities
4. Portfolio presentation

Update this file after completing phases. Reference in every Claude session.
