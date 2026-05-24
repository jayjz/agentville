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
}

export default function TownSquare() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const agentsRef = useRef<Map<string, PIXI.Container>>(new Map());
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const [agents] = useState<Agent[]>([
    { 
      id: 'karen', 
      name: 'Karen', 
      role: 'Research Specialist',
      x: 110, 
      y: 160,
      targetX: 110,
      targetY: 160,
      color: 0xff69b4,
      status: 'idle',
      task: 'Knowledge synthesis'
    },
    { 
      id: 'chad', 
      name: 'Chad', 
      role: 'Code Executor',
      x: 235, 
      y: 130,
      targetX: 235,
      targetY: 130,
      color: 0x00ff7f,
      status: 'idle',
      task: 'Code generation'
    },
    { 
      id: 'alice', 
      name: 'Alice', 
      role: 'Data Analyst',
      x: 360, 
      y: 165,
      targetX: 360,
      targetY: 165,
      color: 0x1e90ff,
      status: 'idle',
      task: 'Pattern recognition'
    },
    { 
      id: 'bob', 
      name: 'Bob', 
      role: 'Orchestrator',
      x: 485, 
      y: 135,
      targetX: 485,
      targetY: 135,
      color: 0xffa500,
      status: 'idle',
      task: 'Task coordination'
    },
    { 
      id: 'eve', 
      name: 'Eve', 
      role: 'Security Analyst',
      x: 175, 
      y: 285,
      targetX: 175,
      targetY: 285,
      color: 0xff1493,
      status: 'idle',
      task: 'Threat assessment'
    },
    { 
      id: 'mallory', 
      name: 'Mallory', 
      role: 'OSINT Specialist',
      x: 425, 
      y: 290,
      targetX: 425,
      targetY: 290,
      color: 0x9370db,
      status: 'idle',
      task: 'Open-source intel'
    },
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
      (app.canvas.style as any).imageRendering = '-moz-crisp-edges';

      const stage = app.stage;

      // Background with subtle texture
      const bg = new PIXI.Graphics();
      bg.beginFill(0x008080);
      bg.drawRect(0, 0, 620, 420);
      bg.endFill();
      stage.addChild(bg);

      // Grid overlay
      const grid = new PIXI.Graphics();
      grid.lineStyle(1, 0x006666, 0.25);
      for (let x = 0; x <= 620; x += 20) {
        grid.moveTo(x, 0);
        grid.lineTo(x, 420);
      }
      for (let y = 0; y <= 420; y += 20) {
        grid.moveTo(0, y);
        grid.lineTo(620, y);
      }
      stage.addChild(grid);

      // Grid dots
      const dots = new PIXI.Graphics();
      dots.beginFill(0x004040, 0.4);
      for (let x = 10; x < 620; x += 20) {
        for (let y = 10; y < 420; y += 20) {
          dots.drawRect(x, y, 1, 1);
        }
      }
      dots.endFill();
      stage.addChild(dots);

      // Buildings with details
      const buildings = [
        { x: 35, y: 35, w: 90, h: 70, color: 0x8b7355, name: 'RESEARCH LAB' },
        { x: 495, y: 40, w: 85, h: 60, color: 0x696969, name: 'EXECUTION' },
        { x: 40, y: 310, w: 100, h: 75, color: 0x556b2f, name: 'ANALYTICS' },
        { x: 485, y: 305, w: 95, h: 80, color: 0x8b4513, name: 'COMMAND' },
        { x: 265, y: 25, w: 90, h: 55, color: 0x4b0082, name: 'SECURE' },
        { x: 265, y: 340, w: 90, h: 55, color: 0x2f4f4f, name: 'INTEL' },
      ];

      buildings.forEach((b, i) => {
        const building = new PIXI.Container();
        building.x = b.x;
        building.y = b.y;
        building.name = `building-${i}`;

        // Main structure
        const base = new PIXI.Graphics();
        base.beginFill(b.color);
        base.lineStyle(2, 0x000000, 0.8);
        base.drawRect(0, 0, b.w, b.h);
        base.endFill();
        building.addChild(base);

        // Roof
        const roof = new PIXI.Graphics();
        roof.beginFill(b.color + 0x222222);
        roof.drawRect(-2, -8, b.w + 4, 10);
        roof.endFill();
        building.addChild(roof);

        // Windows with random flicker
        const windows = new PIXI.Graphics();
        for (let wx = 12; wx < b.w - 12; wx += 20) {
          for (let wy = 12; wy < b.h - 12; wy += 18) {
            const isLit = Math.random() > 0.3;
            windows.beginFill(isLit ? 0xffff99 : 0x333333, isLit ? 0.9 : 0.6);
            windows.drawRect(wx, wy, 10, 12);
            windows.endFill();
            // Window frame
            windows.lineStyle(1, 0x000000, 0.5);
            windows.moveTo(wx + 5, wy);
            windows.lineTo(wx + 5, wy + 12);
            windows.moveTo(wx, wy + 6);
            windows.lineTo(wx + 10, wy + 6);
          }
        }
        building.addChild(windows);

        // Building label
        const label = new PIXI.Text({
          text: b.name,
          style: {
            fontFamily: 'monospace',
            fontSize: 8,
            fill: 0xffffff,
            stroke: { color: 0x000000, width: 2 },
          } as any
        });
        label.x = b.w / 2 - label.width / 2;
        label.y = -16;
        building.addChild(label);

        // Activation glow (hidden by default)
        const glow = new PIXI.Graphics();
        glow.beginFill(0x00ff00, 0);
        glow.drawRoundedRect(-4, -4, b.w + 8, b.h + 8, 2);
        glow.endFill();
        glow.name = 'glow';
        building.addChild(glow);

        stage.addChild(building);
      });

      // Pathways
      const paths = new PIXI.Graphics();
      paths.lineStyle(4, 0xdeb887, 0.9);
      // Main horizontal
      paths.moveTo(0, 210);
      paths.lineTo(620, 210);
      // Verticals
      [125, 260, 395, 530].forEach(x => {
        paths.moveTo(x, 0);
        paths.lineTo(x, 420);
      });
      // Diagonals for interest
      paths.lineStyle(2, 0xdeb887, 0.5);
      paths.moveTo(125, 105);
      paths.lineTo(260, 105);
      paths.moveTo(395, 315);
      paths.lineTo(530, 315);
      stage.addChild(paths);

      // Decorative elements
      const decor = new PIXI.Container();
      
      // Trees
      const treePositions = [
        [80, 60], [540, 65], [85, 250], [535, 255],
        [200, 45], [420, 40], [200, 370], [420, 375],
        [310, 180], [310, 240]
      ];
      
      treePositions.forEach(([x, y]) => {
        const tree = new PIXI.Graphics();
        // Trunk
        tree.beginFill(0x8b4513);
        tree.drawRect(x - 2, y, 4, 14);
        tree.endFill();
        // Foliage layers
        tree.beginFill(0x228b22);
        tree.drawCircle(x, y - 2, 11);
        tree.endFill();
        tree.beginFill(0x32cd32, 0.7);
        tree.drawCircle(x - 2, y - 4, 7);
        tree.endFill();
        decor.addChild(tree);
      });

      // Benches
      [[180, 200], [440, 200], [310, 120], [310, 300]].forEach(([x, y]) => {
        const bench = new PIXI.Graphics();
        bench.beginFill(0x8b6914);
        bench.drawRect(x - 12, y - 2, 24, 4);
        bench.drawRect(x - 10, y + 2, 3, 8);
        bench.drawRect(x + 7, y + 2, 3, 8);
        bench.endFill();
        decor.addChild(bench);
      });

      stage.addChild(decor);

      // Create agent sprites
      agents.forEach(agent => {
        const container = new PIXI.Container();
        container.x = agent.x;
        container.y = agent.y;
        container.name = agent.id;
        container.eventMode = 'static';
        container.cursor = 'pointer';

        // Shadow
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.3);
        shadow.drawEllipse(0, 14, 10, 4);
        shadow.endFill();
        container.addChild(shadow);

        // Body
        const body = new PIXI.Graphics();
        body.beginFill(agent.color);
        body.lineStyle(1, 0x000000, 0.8);
        body.drawRoundedRect(-10, -8, 20, 18, 2);
        body.endFill();
        container.addChild(body);

        // Head
        const head = new PIXI.Graphics();
        head.beginFill(0xfdbcb4);
        head.lineStyle(1, 0x000000, 0.8);
        head.drawRoundedRect(-8, -22, 16, 16, 3);
        head.endFill();
        container.addChild(head);

        // Eyes
        const eyes = new PIXI.Graphics();
        eyes.beginFill(0x000000);
        eyes.drawRect(-5, -16, 2, 2);
        eyes.drawRect(3, -16, 2, 2);
        eyes.endFill();
        container.addChild(eyes);

        // Agent initial
        const initial = new PIXI.Text({
          text: agent.name[0],
          style: {
            fontFamily: 'monospace',
            fontSize: 10,
            fill: 0xffffff,
            stroke: { color: 0x000000, width: 2 },
            fontWeight: 'bold',
          } as any
        });
        initial.anchor.set(0.5);
        initial.y = 1;
        container.addChild(initial);

        // Status indicator
        const status = new PIXI.Graphics();
        status.beginFill(0x00ff00);
        status.drawCircle(9, -18, 3);
        status.endFill();
        status.name = 'status';
        container.addChild(status);

        // Thinking particles container
        const particles = new PIXI.Container();
        particles.name = 'particles';
        particles.visible = false;
        container.addChild(particles);

        // Add to stage
        stage.addChild(container);
        agentsRef.current.set(agent.id, container);

        // Click handler
        container.on('pointerdown', () => {
          setSelectedAgent(agent.id === selectedAgent ? null : agent.id);
        });
      });

      // Ambient particles
      const ambientParticles = new PIXI.Container();
      for (let i = 0; i < 20; i++) {
        const p = new PIXI.Graphics();
        const size = Math.random() * 1.5 + 0.5;
        p.beginFill(0xffffff, Math.random() * 0.1 + 0.02);
        p.drawCircle(0, 0, size);
        p.endFill();
        p.x = Math.random() * 620;
        p.y = Math.random() * 420;
        (p as any).vx = (Math.random() - 0.5) * 0.15;
        (p as any).vy = (Math.random() - 0.5) * 0.15;
        (p as any).baseAlpha = p.alpha;
        ambientParticles.addChild(p);
      }
      stage.addChild(ambientParticles);

      // Animation loop
      let time = 0;
      const animate = () => {
        if (!mounted) return;
        
        time += 0.016;
        
        // Animate ambient particles
        ambientParticles.children.forEach((p: any) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -5) p.x = 625;
          if (p.x > 625) p.x = -5;
          if (p.y < -5) p.y = 425;
          if (p.y > 425) p.y = -5;
          p.alpha = p.baseAlpha * (0.5 + Math.sin(time + p.x * 0.01) * 0.5);
        });

        // Animate agents (idle bobbing)
        agentsRef.current.forEach((container, id) => {
          const agent = agents.find(a => a.id === id);
          if (!agent) return;

          // Smooth movement towards target
          const dx = agent.targetX - container.x;
          const dy = agent.targetY - container.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 1) {
            container.x += dx * 0.06;
            container.y += dy * 0.06;
            
            // Walking animation
            const walkCycle = Math.sin(time * 8) * 0.5;
            const body = container.children[1] as PIXI.Graphics;
            if (body) {
              body.y = walkCycle;
            }
          } else {
            // Idle bobbing
            container.y = agent.y + Math.sin(time * 2 + parseInt(id, 36) % 10) * 1.2;
          }

          // Update status indicator
          const status = container.getChildByName('status') as PIXI.Graphics;
          if (status) {
            const colors: Record<string, number> = {
              idle: 0x00ff00,
              thinking: 0xffff00,
              working: 0x00ffff,
              moving: 0xff8000,
            };
            status.clear();
            status.beginFill(colors[agent.status] || 0x00ff00);
            status.drawCircle(9, -18, 3);
            status.endFill();
            
            if (agent.status !== 'idle') {
              status.alpha = 0.6 + Math.sin(time * 6) * 0.4;
            } else {
              status.alpha = 1;
            }
          }

          // Thinking particles
          const particles = container.getChildByName('particles') as PIXI.Container;
          if (particles) {
            particles.visible = agent.status === 'thinking' || agent.status === 'working';
            if (particles.visible && particles.children.length < 3) {
              // Add particles
              while (particles.children.length < 3) {
                const p = new PIXI.Graphics();
                p.beginFill(0xffffff, 0.8);
                p.drawCircle(0, 0, 1);
                p.endFill();
                p.x = (Math.random() - 0.5) * 20;
                p.y = -25 - Math.random() * 10;
                (p as any).life = 0;
                particles.addChild(p);
              }
            }
            
            // Animate particles
            particles.children.forEach((p: any) => {
              p.y -= 0.4;
              p.alpha = 1 - (p.life / 60);
              p.life++;
              if (p.life > 60) {
                p.y = -25 - Math.random() * 10;
                p.x = (Math.random() - 0.5) * 20;
                p.life = 0;
              }
            });
          }
        });

        // Building window flicker
        if (Math.random() < 0.015) {
          const buildingIndex = Math.floor(Math.random() * 6);
          const building = stage.children[3 + buildingIndex] as PIXI.Container;
          if (building) {
            building.alpha = 0.9 + Math.random() * 0.1;
            setTimeout(() => {
              if (building) building.alpha = 1;
            }, 100 + Math.random() * 200);
          }
        }

        animationId = requestAnimationFrame(animate);
      };
      
      animate();

      // Expose agent control to window for Desktop component
      (window as any).__agentville = {
        moveAgent: (id: string, x: number, y: number, status: Agent['status'] = 'moving') => {
          const agent = agents.find(a => a.id === id);
          if (agent) {
            agent.targetX = x;
            agent.targetY = y;
            agent.status = status;
            setTimeout(() => {
              agent.status = 'idle';
            }, 800);
          }
        },
        setAgentStatus: (id: string, status: Agent['status']) => {
          const agent = agents.find(a => a.id === id);
          if (agent) agent.status = status;
        },
        activateBuilding: (index: number, active: boolean) => {
          const building = stage.children[3 + index] as PIXI.Container;
          if (building) {
            const glow = building.getChildByName('glow') as PIXI.Graphics;
            if (glow) {
              glow.alpha = active ? 0.3 : 0;
            }
          }
        }
      };
    };

    initPixi();

    return () => {
      mounted = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      delete (window as any).__agentville;
    };
  }, [agents]);

  // Expose agents data for external access
  useEffect(() => {
    (window as any).__agents = agents;
  }, [agents]);

  return (
    <div className="relative w-full h-full bg-[#008080] overflow-hidden select-none">
      <div 
        ref={containerRef} 
        className="absolute inset-0"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Agent labels overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {agents.map(agent => (
          <div
            key={agent.id}
            className="absolute text-[8px] font-mono pointer-events-none transition-opacity duration-200"
            style={{
              left: agent.x,
              top: agent.y + 22,
              transform: 'translateX(-50%)',
              opacity: selectedAgent === agent.id ? 1 : 0.7,
            }}
          >
            <div className={`
              px-[3px] py-[1px] whitespace-nowrap
              ${selectedAgent === agent.id 
                ? 'bg-[#ffff00] text-black font-bold' 
                : 'bg-black/80 text-white/90'
              }
              border border-white/20
            `}>
              {agent.name}
            </div>
          </div>
        ))}
      </div>

      {/* Selected agent info */}
      {selectedAgent && (
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none z-10">
          <div className="bg-black/90 text-white text-[9px] p-2 border border-white/30 font-mono backdrop-blur-sm">
            {(() => {
              const agent = agents.find(a => a.id === selectedAgent)!;
              return (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 border border-white/50"
                      style={{ backgroundColor: `#${agent.color.toString(16).padStart(6, '0')}` }}
                    />
                    <span className="text-[#ffff00] font-bold">{agent.name.toUpperCase()}</span>
                    <span className="text-white/60">•</span>
                    <span className="text-white/90">{agent.role}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[8px]">
                    <span className={`
                      ${agent.status === 'idle' ? 'text-[#00ff00]' : ''}
                      ${agent.status === 'thinking' ? 'text-[#ffff00]' : ''}
                      ${agent.status === 'working' ? 'text-[#00ffff]' : ''}
                      ${agent.status === 'moving' ? 'text-[#ff8000]' : ''}
                    `}>
                      ● {agent.status.toUpperCase()}
                    </span>
                    <span className="text-white/50">
                      {Math.round(agent.x)},{Math.round(agent.y)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Town info HUD */}
      <div className="absolute top-1.5 right-1.5 pointer-events-none z-10">
        <div className="bg-black/75 text-[#00ff00] text-[8px] px-1.5 py-1 font-mono border border-[#00ff00]/30 leading-tight">
          <div>AGENTVILLE POP:6</div>
          <div className="text-white/70">GRID 20px • 60 FPS</div>
        </div>
      </div>

      {/* Scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            black 2px,
            black 3px
          )`,
        }}
      />
    </div>
  );
}