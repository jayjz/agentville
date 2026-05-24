'use client';
import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

interface Agent {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: number;
  status: 'idle' | 'thinking' | 'working' | 'moving';
  task?: string;
  homeX: number;
  homeY: number;
}

export default function TownSquare() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const agentsRef = useRef<Map<string, PIXI.Container>>(new Map());
  const trailsRef = useRef<Map<string, PIXI.Graphics[]>>(new Map());
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [speechBubble, setSpeechBubble] = useState<{agentId: string, text: string} | null>(null);

  const [agents] = useState<Agent[]>([
    { id: 'karen', name: 'Karen', role: 'Research Specialist', x: 110, y: 160, targetX: 110, targetY: 160, homeX: 110, homeY: 160, color: 0xff69b4, status: 'idle', task: 'Knowledge synthesis' },
    { id: 'chad', name: 'Chad', role: 'Code Executor', x: 235, y: 130, targetX: 235, targetY: 130, homeX: 235, homeY: 130, color: 0x00ff7f, status: 'idle', task: 'Code generation' },
    { id: 'alice', name: 'Alice', role: 'Data Analyst', x: 360, y: 165, targetX: 360, targetY: 165, homeX: 360, homeY: 165, color: 0x1e90ff, status: 'idle', task: 'Pattern recognition' },
    { id: 'bob', name: 'Bob', role: 'Orchestrator', x: 485, y: 135, targetX: 485, targetY: 135, homeX: 485, homeY: 135, color: 0xffa500, status: 'idle', task: 'Task coordination' },
    { id: 'eve', name: 'Eve', role: 'Security Analyst', x: 175, y: 285, targetX: 175, targetY: 285, homeX: 175, homeY: 285, color: 0xff1493, status: 'idle', task: 'Threat assessment' },
    { id: 'mallory', name: 'Mallory', role: 'OSINT Specialist', x: 425, y: 290, targetX: 425, targetY: 290, homeX: 425, homeY: 290, color: 0x9370db, status: 'idle', task: 'Open-source intel' },
  ]);

  useEffect(() => {
    if (!containerRef.current || appRef.current) return;
    let mounted = true;
    let animationId: number;

    const initPixi = async () => {
      const app = new PIXI.Application();
      await app.init({
        width: 620,
        height: 420,
        backgroundColor: 0x008080,
        antialias: false,
        resolution: window.devicePixelRatio > 1 ? 2 : 1,
        autoDensity: true,
        preference: 'webgl',
        powerPreference: 'high-performance',
        backgroundAlpha: 1,
      });

      if (!mounted || !containerRef.current) {
        app.destroy();
        return;
      }

      appRef.current = app;
      containerRef.current.appendChild(app.canvas);
      app.canvas.style.imageRendering = 'pixelated';
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';

      const stage = app.stage;

      // Enhanced background with texture
      const bg = new PIXI.Graphics();
      bg.beginFill(0x008080);
      bg.drawRect(0, 0, 620, 420);
      bg.endFill();
      
      // Add subtle texture
      for (let i = 0; i < 200; i++) {
        bg.beginFill(0x007070, 0.03 + Math.random() * 0.02);
        bg.drawRect(
          Math.random() * 620,
          Math.random() * 420,
          Math.random() * 3 + 1,
          Math.random() * 3 + 1
        );
        bg.endFill();
      }
      stage.addChild(bg);

      // Enhanced grid
      const grid = new PIXI.Graphics();
      grid.lineStyle(1, 0x006666, 0.4);
      for (let x = 0; x <= 620; x += 20) {
        grid.moveTo(x, 0);
        grid.lineTo(x, 420);
      }
      for (let y = 0; y <= 420; y += 20) {
        grid.moveTo(0, y);
        grid.lineTo(620, y);
      }
      stage.addChild(grid);

      // Grid intersection dots (brighter)
      const dots = new PIXI.Graphics();
      dots.beginFill(0x00a0a0, 0.6);
      for (let x = 0; x <= 620; x += 20) {
        for (let y = 0; y <= 420; y += 20) {
          dots.drawRect(x - 0.5, y - 0.5, 1, 1);
        }
      }
      dots.endFill();
      stage.addChild(dots);

      // Buildings with enhanced details
      const buildings = [
        { x: 35, y: 35, w: 90, h: 70, color: 0x8b7355, name: 'RESEARCH', accent: 0x6b5345 },
        { x: 495, y: 40, w: 85, h: 60, color: 0x696969, name: 'EXECUTE', accent: 0x494949 },
        { x: 40, y: 310, w: 100, h: 75, color: 0x556b2f, name: 'ANALYTICS', accent: 0x354b1f },
        { x: 485, y: 305, w: 95, h: 80, color: 0x8b4513, name: 'COMMAND', accent: 0x6b2503 },
        { x: 265, y: 25, w: 90, h: 55, color: 0x4b0082, name: 'SECURE', accent: 0x2b0062 },
        { x: 265, y: 340, w: 90, h: 55, color: 0x2f4f4f, name: 'INTEL', accent: 0x1f3f3f },
      ];

      buildings.forEach((b, i) => {
        const building = new PIXI.Container();
        building.x = b.x;
        building.y = b.y;
        building.name = `building-${i}`;
        building.eventMode = 'static';
        building.cursor = 'pointer';

        // Shadow
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.3);
        shadow.drawRoundedRect(3, 3, b.w, b.h, 2);
        shadow.endFill();
        building.addChild(shadow);

        // Main structure with gradient effect
        const base = new PIXI.Graphics();
        base.beginFill(b.color);
        base.lineStyle(2, 0x000000, 0.9);
        base.drawRoundedRect(0, 0, b.w, b.h, 3);
        base.endFill();
        
        // Highlight edge
        base.lineStyle(1, 0xffffff, 0.2);
        base.moveTo(1, 1);
        base.lineTo(b.w - 1, 1);
        base.lineTo(b.w - 1, b.h - 1);
        building.addChild(base);

        // Roof with texture
        const roof = new PIXI.Graphics();
        roof.beginFill(b.accent);
        roof.drawRoundedRect(-3, -10, b.w + 6, 12, 2);
        roof.endFill();
        // Roof tiles
        roof.lineStyle(1, 0x000000, 0.3);
        for (let x = 0; x < b.w + 6; x += 8) {
          roof.moveTo(x - 3, -10);
          roof.lineTo(x - 3, 2);
        }
        building.addChild(roof);

        // Windows with frames
        const windows = new PIXI.Container();
        for (let wx = 12; wx < b.w - 12; wx += 20) {
          for (let wy = 12; wy < b.h - 12; wy += 18) {
            const isLit = Math.random() > 0.25;
            const window = new PIXI.Graphics();
            
            // Window frame
            window.lineStyle(1, 0x000000, 0.8);
            window.beginFill(isLit ? 0xffffcc : 0x1a1a2e, isLit ? 0.95 : 0.7);
            window.drawRect(wx, wy, 10, 12);
            window.endFill();
            
            // Cross bars
            window.lineStyle(1, 0x000000, 0.6);
            window.moveTo(wx + 5, wy);
            window.lineTo(wx + 5, wy + 12);
            window.moveTo(wx, wy + 6);
            window.lineTo(wx + 10, wy + 6);
            
            // Glow if lit
            if (isLit && Math.random() > 0.7) {
              window.beginFill(0xffff99, 0.3);
              window.drawRect(wx - 1, wy - 1, 12, 14);
              window.endFill();
            }
            
            windows.addChild(window);
          }
        }
        building.addChild(windows);

        // Building label with background
        const labelBg = new PIXI.Graphics();
        labelBg.beginFill(0x000000, 0.85);
        labelBg.drawRoundedRect(-2, -18, b.name.length * 6 + 4, 12, 2);
        labelBg.endFill();
        labelBg.x = b.w / 2;
        labelBg.y = -8;
        building.addChild(labelBg);

        const label = new PIXI.Text({
          text: b.name,
          style: {
            fontFamily: 'monospace',
            fontSize: 8,
            fill: 0x00ff00,
            fontWeight: 'bold',
          } as any
        });
        label.anchor.set(0.5, 0.5);
        label.x = b.w / 2;
        label.y = -12;
        building.addChild(label);

        // Activation glow (for when building is in use)
        const glow = new PIXI.Graphics();
        glow.name = 'glow';
        building.addChild(glow);

        // Click handler for building info
        building.on('pointerdown', () => {
          const buildingNames = ['Research Lab', 'Execution Bay', 'Analytics Hub', 'Command Center', 'Secure Facility', 'Intel Center'];
          setSpeechBubble({
            agentId: `building-${i}`,
            text: `${buildingNames[i]}\nStatus: ${glow.alpha > 0 ? 'ACTIVE' : 'IDLE'}`
          });
          setTimeout(() => setSpeechBubble(null), 2500);
        });

        stage.addChild(building);
      });

      // Enhanced pathways with center lines
      const paths = new PIXI.Graphics();
      // Main paths
      paths.lineStyle(5, 0xc2b280, 1);
      paths.beginFill(0xdeb887, 0.9);
      // Horizontal
      paths.drawRoundedRect(0, 207, 620, 6, 2);
      // Verticals
      [125, 260, 395, 530].forEach(x => {
        paths.drawRoundedRect(x - 3, 0, 6, 420, 2);
      });
      paths.endFill();
      
      // Center lines
      paths.lineStyle(1, 0xffffff, 0.6);
      paths.moveTo(0, 210);
      paths.lineTo(620, 210);
      [125, 260, 395, 530].forEach(x => {
        paths.moveTo(x, 0);
        paths.lineTo(x, 420);
      });
      
      // Dashed lines for visual interest
      paths.lineStyle(1, 0xffffff, 0.3);
      for (let i = 0; i < 620; i += 20) {
        if (i % 40 === 0) {
          paths.moveTo(i, 208);
          paths.lineTo(i + 10, 208);
          paths.moveTo(i, 212);
          paths.lineTo(i + 10, 212);
        }
      }
      stage.addChild(paths);

      // Enhanced decorative elements
      const decor = new PIXI.Container();
      
      // Trees with more detail
      const treePositions = [
        [80, 60], [540, 65], [85, 250], [535, 255],
        [200, 45], [420, 40], [200, 370], [420, 375],
        [310, 180], [310, 240], [150, 140], [470, 280]
      ];
      
      treePositions.forEach(([x, y], idx) => {
        const tree = new PIXI.Container();
        tree.x = x;
        tree.y = y;
        
        // Shadow
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.2);
        shadow.drawEllipse(0, 12, 8, 3);
        shadow.endFill();
        tree.addChild(shadow);
        
        // Trunk with bark texture
        const trunk = new PIXI.Graphics();
        trunk.beginFill(0x8b4513);
        trunk.drawRoundedRect(-3, 0, 6, 16, 1);
        trunk.endFill();
        // Bark lines
        trunk.lineStyle(1, 0x654321, 0.5);
        for (let i = 2; i < 14; i += 3) {
          trunk.moveTo(-2, i);
          trunk.lineTo(2, i + 1);
        }
        tree.addChild(trunk);
        
        // Foliage - multiple layers for depth
        const colors = [0x0f5132, 0x1a6b3a, 0x228b22, 0x32cd32];
        colors.forEach((color, layerIdx) => {
          const foliage = new PIXI.Graphics();
          foliage.beginFill(color, 0.9 - layerIdx * 0.15);
          const radius = 12 - layerIdx * 2;
          const offsetY = -4 - layerIdx * 1.5;
          foliage.drawCircle((Math.random() - 0.5) * 2, offsetY, radius);
          foliage.endFill();
          tree.addChild(foliage);
        });
        
        // Gentle sway animation
        (tree as any).swayOffset = idx * 0.7;
        decor.addChild(tree);
      });

      // Benches with detail
      [[180, 200], [440, 200], [310, 120], [310, 300]].forEach(([x, y]) => {
        const bench = new PIXI.Graphics();
        // Seat
        bench.beginFill(0x8b6914);
        bench.lineStyle(1, 0x5d4e0a);
        bench.drawRoundedRect(x - 14, y - 3, 28, 6, 1);
        bench.endFill();
        // Legs
        bench.beginFill(0x5d4e0a);
        bench.drawRect(x - 12, y + 3, 3, 8);
        bench.drawRect(x + 9, y + 3, 3, 8);
        bench.endFill();
        // Backrest
        bench.beginFill(0x8b6914);
        bench.drawRect(x - 14, y - 8, 28, 3);
        bench.endFill();
        decor.addChild(bench);
      });

      stage.addChild(decor);

      // Create agent sprites with enhanced visuals
      agents.forEach((agent) => {
        const container = new PIXI.Container();
        container.x = agent.x;
        container.y = agent.y;
        container.name = agent.id;
        container.eventMode = 'static';
        container.cursor = 'pointer';
        container.zIndex = 100;

        // Trail container (for movement traces)
        const trailContainer = new PIXI.Container();
        trailContainer.name = 'trails';
        container.addChild(trailContainer);
        trailsRef.current.set(agent.id, []);

        // Enhanced shadow with blur
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.35);
        shadow.drawEllipse(0, 16, 11, 5);
        shadow.endFill();
        shadow.filters = [new PIXI.BlurFilter({ strength: 2 })];
        container.addChild(shadow);

        // Body with gradient effect
        const body = new PIXI.Graphics();
        body.beginFill(agent.color);
        body.lineStyle(2, 0x000000, 1);
        body.drawRoundedRect(-11, -9, 22, 20, 3);
        body.endFill();
        // Highlight
        body.beginFill(0xffffff, 0.25);
        body.drawRoundedRect(-9, -7, 18, 6, 2);
        body.endFill();
        container.addChild(body);

        // Head with more detail
        const head = new PIXI.Graphics();
        head.beginFill(0xfdbcb4);
        head.lineStyle(1.5, 0x000000, 0.9);
        head.drawRoundedRect(-9, -24, 18, 17, 4);
        head.endFill();
        // Cheek blush
        head.beginFill(0xffb6c1, 0.4);
        head.drawCircle(-4, -14, 2);
        head.drawCircle(4, -14, 2);
        head.endFill();
        container.addChild(head);

        // Eyes with pupils
        const eyes = new PIXI.Graphics();
        eyes.beginFill(0xffffff);
        eyes.drawCircle(-4, -17, 2.5);
        eyes.drawCircle(4, -17, 2.5);
        eyes.endFill();
        eyes.beginFill(0x000000);
        eyes.drawCircle(-4, -17, 1.2);
        eyes.drawCircle(4, -17, 1.2);
        eyes.endFill();
        // Eye shine
        eyes.beginFill(0xffffff, 0.8);
        eyes.drawCircle(-3.5, -17.5, 0.5);
        eyes.drawCircle(4.5, -17.5, 0.5);
        eyes.endFill();
        container.addChild(eyes);

        // Mouth (changes with status)
        const mouth = new PIXI.Graphics();
        mouth.lineStyle(1.5, 0x000000, 0.8);
        mouth.moveTo(-3, -10);
        mouth.lineTo(3, -10);
        mouth.name = 'mouth';
        container.addChild(mouth);

        // Agent initial badge
        const badge = new PIXI.Graphics();
        badge.beginFill(0x000000, 0.85);
        badge.lineStyle(1, 0xffffff, 0.3);
        badge.drawRoundedRect(-8, -2, 16, 10, 2);
        badge.endFill();
        container.addChild(badge);

        const initial = new PIXI.Text({
          text: agent.name[0],
          style: {
            fontFamily: 'monospace',
            fontSize: 9,
            fill: 0xffffff,
            fontWeight: 'bold',
            stroke: { color: 0x000000, width: 3 },
          } as any
        });
        initial.anchor.set(0.5);
        initial.y = 3;
        container.addChild(initial);

        // Status ring (around agent)
        const statusRing = new PIXI.Graphics();
        statusRing.name = 'statusRing';
        container.addChild(statusRing);

        // Activity particles container
        const particles = new PIXI.Container();
        particles.name = 'particles';
        container.addChild(particles);

        // Selection indicator (hidden by default)
        const selection = new PIXI.Graphics();
        selection.name = 'selection';
        selection.visible = false;
        selection.lineStyle(2, 0xffff00, 1);
        selection.drawRoundedRect(-14, -27, 28, 44, 3);
        // Corner brackets
        const bracketSize = 5;
        [[-14, -27], [14 - bracketSize, -27], [-14, 17], [14 - bracketSize, 17]].forEach(([x, y], i) => {
          selection.moveTo(x, y);
          if (i % 2 === 0) {
            selection.lineTo(x + bracketSize, y);
            selection.moveTo(x, y);
            selection.lineTo(x, y + bracketSize);
          } else {
            selection.lineTo(x, y);
            selection.lineTo(x, y + bracketSize);
            selection.moveTo(x, y);
            selection.lineTo(x - bracketSize, y);
          }
        });
        container.addChild(selection);

        stage.addChild(container);
        agentsRef.current.set(agent.id, container);

        // Enhanced click handler
        container.on('pointerdown', (e) => {
          e.stopPropagation();
          const isSelected = selectedAgent === agent.id;
          setSelectedAgent(isSelected ? null : agent.id);
          
          if (!isSelected) {
            setSpeechBubble({
              agentId: agent.id,
              text: `${agent.name}\n${agent.role}\n\nStatus: ${agent.status.toUpperCase()}\nTask: ${agent.task || 'Idle'}`
            });
            setTimeout(() => setSpeechBubble(null), 4000);
          } else {
            setSpeechBubble(null);
          }
          
          // Visual feedback
          container.scale.set(0.92);
          setTimeout(() => {
            if (container) container.scale.set(1);
          }, 120);
        });

        // Hover effects
        container.on('pointerover', () => {
          if (selectedAgent !== agent.id) {
            container.alpha = 0.9;
            document.body.style.cursor = 'pointer';
          }
        });
        
        container.on('pointerout', () => {
          container.alpha = 1;
          document.body.style.cursor = 'auto';
        });
      });

      // Enhanced ambient particles
      const ambientParticles = new PIXI.Container();
      for (let i = 0; i < 25; i++) {
        const p = new PIXI.Graphics();
        const size = Math.random() * 1.8 + 0.3;
        const brightness = Math.random() * 0.12 + 0.03;
        p.beginFill(0xffffff, brightness);
        p.drawCircle(0, 0, size);
        if (Math.random() > 0.7) {
          p.beginFill(0xaaccff, brightness * 0.7);
          p.drawCircle(0, 0, size * 0.6);
        }
        p.endFill();
        p.x = Math.random() * 620;
        p.y = Math.random() * 420;
        (p as any).vx = (Math.random() - 0.5) * 0.25;
        (p as any).vy = (Math.random() - 0.5) * 0.25;
        (p as any).baseAlpha = p.alpha;
        (p as any).pulseSpeed = 0.5 + Math.random() * 1.5;
        ambientParticles.addChild(p);
      }
      stage.addChild(ambientParticles);

      // Main animation loop
      let time = 0;
      const animate = () => {
        if (!mounted) return;
        time += 0.016;

        // Animate ambient particles
        ambientParticles.children.forEach((p: any, i) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = 630;
          if (p.x > 630) p.x = -10;
          if (p.y < -10) p.y = 430;
          if (p.y > 430) p.y = -10;
          p.alpha = p.baseAlpha * (0.4 + Math.sin(time * p.pulseSpeed + i) * 0.6);
          p.rotation += 0.005;
        });

        // Animate trees (gentle sway)
        decor.children.forEach((child, idx) => {
          if (idx < 12) { // Trees are first 12 children
            child.rotation = Math.sin(time * 0.5 + idx) * 0.015;
          }
        });

        // Animate agents
        agentsRef.current.forEach((container, id) => {
          const agent = agents.find(a => a.id === id);
          if (!agent || !container) return;

          const dx = agent.targetX - container.x;
          const dy = agent.targetY - container.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Movement with trails
          if (dist > 2) {
            const speed = 0.045; // Slower, more visible movement
            const moveX = dx * speed;
            const moveY = dy * speed;
            
            // Add trail particle
            if (Math.random() < 0.3) {
              const trails = trailsRef.current.get(id) || [];
              const trail = new PIXI.Graphics();
              trail.beginFill(agent.color, 0.15);
              trail.drawCircle(0, 0, 2);
              trail.endFill();
              trail.x = container.x;
              trail.y = container.y + 8;
              trail.alpha = 0.6;
              (trail as any).life = 0;
              stage.addChildAt(trail, stage.children.length - 1);
              trails.push(trail);
              trailsRef.current.set(id, trails);
              
              // Clean old trails
              if (trails.length > 8) {
                const old = trails.shift();
                if (old && old.parent) old.parent.removeChild(old);
              }
            }
            
            container.x += moveX;
            container.y += moveY;
            
            // Walking animation - more pronounced
            const walkCycle = Math.sin(time * 12) * 1.2;
            const body = container.children[1];
            const head = container.children[2];
            if (body) body.y = walkCycle * 0.3;
            if (head) {
              head.y = -22 + Math.abs(walkCycle * 0.2);
              head.rotation = Math.sin(time * 12) * 0.03;
            }
            
            // Leg animation
            container.children.forEach(child => {
              if (child.name === 'legs') {
                child.children.forEach((leg: any, idx) => {
                  leg.y = Math.sin(time * 12 + idx * Math.PI) * 1.5;
                });
              }
            });
            
            agent.status = 'moving';
          } else {
            // Snap to target and idle
            container.x = agent.targetX;
            container.y = agent.targetY;
            
            // Idle breathing animation
            const breathe = Math.sin(time * 1.8 + parseInt(id, 36) % 10) * 0.8;
            container.y = agent.targetY + breathe;
            
            // Reset walk pose
            const body = container.children[1];
            const head = container.children[2];
            if (body) body.y = 0;
            if (head) {
              head.y = -22;
              head.rotation = 0;
            }
            
            if (agent.status === 'moving') {
              agent.status = 'idle';
            }
          }

          // Update status ring
          const statusRing = container.getChildByName('statusRing') as PIXI.Graphics;
          if (statusRing) {
            statusRing.clear();
            const colors: Record<string, number> = {
              idle: 0x00ff00,
              thinking: 0xffff00,
              working: 0x00ffff,
              moving: 0xff8000,
            };
            const color = colors[agent.status] || 0x00ff00;
            const pulseSize = agent.status === 'idle' ? 0 : 2 + Math.sin(time * 8) * 1.5;
            
            statusRing.lineStyle(2, color, 0.9);
            statusRing.drawCircle(0, -8, 16 + pulseSize);
            
            if (agent.status !== 'idle') {
              statusRing.lineStyle(1, color, 0.4);
              statusRing.drawCircle(0, -8, 20 + pulseSize * 1.5);
            }
          }

          // Update mouth based on status
          const mouth = container.getChildByName('mouth') as PIXI.Graphics;
          if (mouth) {
            mouth.clear();
            mouth.lineStyle(1.5, 0x000000, 0.9);
            if (agent.status === 'working' || agent.status === 'thinking') {
              // Open mouth
              mouth.drawCircle(0, -10, 1.5);
            } else if (agent.status === 'moving') {
              // Determined line
              mouth.moveTo(-2.5, -10);
              mouth.lineTo(2.5, -10);
            } else {
              // Neutral
              mouth.moveTo(-2, -10);
              mouth.lineTo(2, -10);
            }
          }

          // Thinking/working particles
          const particles = container.getChildByName('particles') as PIXI.Container;
          if (particles) {
            const isActive = agent.status === 'thinking' || agent.status === 'working';
            particles.visible = isActive;
            
            if (isActive) {
              // Ensure we have particles
              while (particles.children.length < 4) {
                const p = new PIXI.Graphics();
                const colors = agent.status === 'thinking' ? 
                  [0xffff00, 0xffffff, 0xffff99] : 
                  [0x00ffff, 0xffffff, 0x99ffff];
                p.beginFill(colors[Math.floor(Math.random() * colors.length)], 0.9);
                p.drawCircle(0, 0, Math.random() * 1.2 + 0.5);
                p.endFill();
                p.x = (Math.random() - 0.5) * 24;
                p.y = -28 - Math.random() * 8;
                (p as any).vy = -0.3 - Math.random() * 0.4;
                (p as any).vx = (Math.random() - 0.5) * 0.3;
                (p as any).life = 0;
                particles.addChild(p);
              }
              
              // Animate particles
              particles.children.forEach((p: any) => {
                p.y += p.vy;
                p.x += p.vx;
                p.alpha = Math.max(0, 1 - p.life / 80);
                p.scale.set(1 - p.life / 160);
                p.life++;
                
                if (p.life > 80 || p.y < -45) {
                  p.y = -28 - Math.random() * 8;
                  p.x = (Math.random() - 0.5) * 24;
                  p.life = 0;
                  p.alpha = 0.9;
                  p.scale.set(1);
                }
              });
            } else {
              particles.removeChildren();
            }
          }

          // Update selection indicator
          const selection = container.getChildByName('selection') as PIXI.Graphics;
          if (selection) {
            selection.visible = selectedAgent === id;
            if (selection.visible) {
              selection.alpha = 0.7 + Math.sin(time * 4) * 0.3;
              selection.rotation = Math.sin(time * 0.5) * 0.02;
            }
          }

          // Fade trails
          const trails = trailsRef.current.get(id) || [];
          trails.forEach((trail, idx) => {
            (trail as any).life = ((trail as any).life || 0) + 1;
            trail.alpha = Math.max(0, 0.6 - (trail as any).life / 40);
            trail.scale.set(1 + (trail as any).life / 80);
            if ((trail as any).life > 40) {
              if (trail.parent) trail.parent.removeChild(trail);
              trails.splice(idx, 1);
            }
          });
        });

        // Building effects
        for (let i = 0; i < 6; i++) {
          const building = stage.getChildByName(`building-${i}`) as PIXI.Container;
          if (building) {
            const glow = building.getChildByName('glow') as PIXI.Graphics;
            if (glow && glow.alpha > 0) {
              // Pulsing glow effect
              const pulseIntensity = 0.2 + Math.sin(time * 3 + i) * 0.1;
              glow.clear();
              glow.beginFill(0x00ff00, pulseIntensity);
              const bounds = building.getBounds();
              glow.drawRoundedRect(-6, -6, bounds.width + 12, bounds.height + 12, 4);
              glow.endFill();
              glow.filters = [new PIXI.BlurFilter({ strength: 3 })];
            }
            
            // Random window flicker
            if (Math.random() < 0.008) {
              building.alpha = 0.92 + Math.random() * 0.08;
              setTimeout(() => { if (building) building.alpha = 1; }, 80 + Math.random() * 150);
            }
          }
        }

        animationId = requestAnimationFrame(animate);
      };
      
      animate();

      // Expose enhanced API
      (window as any).__agentville = {
        moveAgent: (id: string, x: number, y: number, status: Agent['status'] = 'moving') => {
          const agent = agents.find(a => a.id === id);
          if (agent) {
            agent.targetX = x;
            agent.targetY = y;
            agent.status = status;
          }
        },
        setAgentStatus: (id: string, status: Agent['status'], task?: string) => {
          const agent = agents.find(a => a.id === id);
          if (agent) {
            agent.status = status;
            if (task) agent.task = task;
          }
        },
        activateBuilding: (index: number, active: boolean) => {
          const building = stage.getChildByName(`building-${index}`) as PIXI.Container;
          if (building) {
            const glow = building.getChildByName('glow') as PIXI.Graphics;
            if (glow) {
              glow.alpha = active ? 0.35 : 0;
            }
          }
        },
        getAgents: () => agents,
        speakAgent: (id: string, text: string, duration = 3000) => {
          setSpeechBubble({ agentId: id, text });
          setTimeout(() => setSpeechBubble(null), duration);
        }
      };
    };

    initPixi();

    return () => {
      mounted = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
      trailsRef.current.forEach(trails => {
        trails.forEach(t => t.destroy());
      });
      trailsRef.current.clear();
      delete (window as any).__agentville;
    };
  }, [agents, selectedAgent]);

  useEffect(() => {
    (window as any).__agents = agents;
  }, [agents]);

  return (
    <div className="relative w-full h-full bg-[#008080] overflow-hidden select-none">
      <div 
        ref={containerRef} 
        className="absolute inset-0"
        style={{ imageRendering: 'pixelated' as any }}
      />
      
      {/* Agent labels with enhanced styling */}
      <div className="absolute inset-0 pointer-events-none">
        {agents.map(agent => (
          <div
            key={agent.id}
            className="absolute transition-all duration-200 pointer-events-none"
            style={{
              left: agent.x,
              top: agent.y + 26,
              transform: 'translateX(-50%)',
              opacity: selectedAgent === agent.id ? 1 : 0.85,
              filter: selectedAgent === agent.id ? 'drop-shadow(0 0 3px rgba(255,255,0,0.8))' : 'none',
            }}
          >
            <div className={`
              px-[4px] py-[2px] text-[9px] font-bold font-mono whitespace-nowrap
              border backdrop-blur-sm transition-all
              ${selectedAgent === agent.id 
                ? 'bg-[#ffff00] text-black border-black shadow-[1px_1px_0px_rgba(0,0,0,0.5)]' 
                : 'bg-black/85 text-white border-white/30'
              }
            `}>
              {agent.name.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Speech Bubble */}
      {speechBubble && (
        <div 
          className="absolute z-50 pointer-events-none"
          style={{
            left: '50%',
            top: '20%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="speech-bubble animate-[fadeIn_0.15s_ease-out]">
            <div className="font-bold text-[10px] mb-[2px] text-[#000080]">
              {agents.find(a => a.id === speechBubble.agentId)?.name.toUpperCase()}
            </div>
            <div className="whitespace-pre-line leading-tight">
              {speechBubble.text}
            </div>
          </div>
        </div>
      )}

      {/* Selected agent detailed info */}
      {selectedAgent && (
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none z-20">
          <div className="bg-black/95 text-[#00ff00] p-2 border-2 border-[#00ff00]/50 font-mono text-[10px] backdrop-blur-md shadow-[0_0_20px_rgba(0,255,0,0.3)]">
            {(() => {
              const agent = agents.find(a => a.id === selectedAgent)!;
              const statusColors = {
                idle: 'text-[#00ff00]',
                thinking: 'text-[#ffff00]',
                working: 'text-[#00ffff]',
                moving: 'text-[#ff8000]',
              };
              return (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 border border-white/50"
                      style={{ backgroundColor: `#${agent.color.toString(16).padStart(6, '0')}` }}
                    />
                    <span className="text-[#ffff00] font-bold">{agent.name.toUpperCase()}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/90">{agent.role}</span>
                  </div>
                  <div className="text-right">
                    <span className={statusColors[agent.status]}>
                      ● {agent.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="col-span-2 text-white/70 text-[9px] border-t border-white/10 pt-1 mt-1">
                    TASK: <span className="text-white">{agent.task}</span> • 
                    POS: <span className="text-[#00ffff]">
                      {Math.round(agent.x)},{Math.round(agent.y)}
                    </span> • 
                    CLICK AGENT TO DISMISS
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Town HUD */}
      <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between pointer-events-none z-10">
        <div className="bg-black/80 text-[#00ff00] text-[8px] px-2 py-1 font-mono border border-[#00ff00]/40 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">●</span>
            <span>AGENTVILLE v1996.5</span>
            <span className="text-white/40">|</span>
            <span className="text-[#00ffff]">6 AGENTS ONLINE</span>
            <span className="text-white/40">|</span>
            <span className="text-[#ffff00]">ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
        <div className="bg-black/80 text-white text-[8px] px-2 py-1 font-mono border border-white/20 backdrop-blur-sm">
          GRID: 20px • FPS: 60 • POP: 6
        </div>
      </div>

      {/* Enhanced scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            black 1px,
            black 2px,
            transparent 2px,
            transparent 3px
          )`,
        }}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}