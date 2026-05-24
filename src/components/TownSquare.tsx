'use client';
import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import NPC from './NPC';

interface Agent {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  color: string;
  status: 'idle' | 'thinking' | 'working' | 'complete';
  task?: string;
}

export default function TownSquare() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agents] = useState<Agent[]>([
    { 
      id: 'karen', 
      name: 'Karen', 
      role: 'Research Specialist',
      x: 90, 
      y: 140, 
      color: '#ff69b4',
      status: 'idle',
      task: 'Knowledge synthesis'
    },
    { 
      id: 'chad', 
      name: 'Chad', 
      role: 'Code Executor',
      x: 210, 
      y: 110, 
      color: '#00ff7f',
      status: 'idle',
      task: 'Code generation'
    },
    { 
      id: 'alice', 
      name: 'Alice', 
      role: 'Data Analyst',
      x: 330, 
      y: 145, 
      color: '#1e90ff',
      status: 'idle',
      task: 'Pattern recognition'
    },
    { 
      id: 'bob', 
      name: 'Bob', 
      role: 'Orchestrator',
      x: 450, 
      y: 115, 
      color: '#ffa500',
      status: 'idle',
      task: 'Task coordination'
    },
  ]);

  useEffect(() => {
    if (!containerRef.current || appRef.current) return;

    let mounted = true;

    const initPixi = async () => {
      const app = new PIXI.Application();
      await app.init({
        width: 620,
        height: 420,
        backgroundColor: 0x008080,
        antialias: false,
        resolution: 1,
        autoDensity: false,
        preference: 'webgl',
      });

      if (!mounted || !containerRef.current) {
        app.destroy();
        return;
      }

      appRef.current = app;
      containerRef.current.appendChild(app.canvas);
      
      // Set pixelated rendering
      app.canvas.style.imageRendering = 'pixelated';
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';

      // Create background grid
      const grid = new PIXI.Graphics();
      grid.lineStyle(1, 0x006666, 0.3);
      
      // Vertical lines
      for (let x = 0; x <= 620; x += 20) {
        grid.moveTo(x, 0);
        grid.lineTo(x, 420);
      }
      // Horizontal lines
      for (let y = 0; y <= 420; y += 20) {
        grid.moveTo(0, y);
        grid.lineTo(620, y);
      }
      app.stage.addChild(grid);

      // Add subtle grid dots at intersections
      const dots = new PIXI.Graphics();
      dots.beginFill(0x006666, 0.15);
      for (let x = 0; x <= 620; x += 20) {
        for (let y = 0; y <= 420; y += 20) {
          dots.drawRect(x - 0.5, y - 0.5, 1, 1);
        }
      }
      dots.endFill();
      app.stage.addChild(dots);

      // Create town buildings (simple rectangles)
      const buildings = [
        { x: 40, y: 40, w: 80, h: 60, color: 0x8b7355 },
        { x: 500, y: 50, w: 70, h: 50, color: 0x696969 },
        { x: 45, y: 300, w: 90, h: 70, color: 0x556b2f },
        { x: 480, y: 310, w: 85, h: 65, color: 0x8b4513 },
      ];

      buildings.forEach(b => {
        const building = new PIXI.Graphics();
        building.beginFill(b.color);
        building.drawRect(0, 0, b.w, b.h);
        building.endFill();
        building.x = b.x;
        building.y = b.y;
        
        // Add windows
        building.beginFill(0xffff99, 0.6);
        for (let wx = 10; wx < b.w - 10; wx += 18) {
          for (let wy = 10; wy < b.h - 10; wy += 16) {
            building.drawRect(wx, wy, 8, 10);
          }
        }
        building.endFill();
        
        app.stage.addChild(building);
      });

      // Add pathways
      const paths = new PIXI.Graphics();
      paths.lineStyle(3, 0xdeb887, 0.8);
      // Horizontal main path
      paths.moveTo(0, 210);
      paths.lineTo(620, 210);
      // Vertical paths
      paths.moveTo(160, 0);
      paths.lineTo(160, 420);
      paths.moveTo(310, 0);
      paths.lineTo(310, 420);
      paths.moveTo(460, 0);
      paths.lineTo(460, 420);
      app.stage.addChild(paths);

      // Add decorative elements (trees, etc.)
      const decor = new PIXI.Graphics();
      const treePositions = [
        [150, 80], [470, 75], [140, 340], [480, 345],
        [280, 60], [350, 350], [80, 200], [540, 200]
      ];
      
      treePositions.forEach(([x, y]) => {
        // Tree trunk
        decor.beginFill(0x8b4513);
        decor.drawRect(x - 2, y, 4, 12);
        decor.endFill();
        // Tree foliage
        decor.beginFill(0x228b22, 0.8);
        decor.drawCircle(x, y - 2, 10);
        decor.endFill();
      });
      app.stage.addChild(decor);

      // Add ambient particles
      const particles = new PIXI.Container();
      app.stage.addChild(particles);

      for (let i = 0; i < 15; i++) {
        const p = new PIXI.Graphics();
        p.beginFill(0xffffff, Math.random() * 0.15 + 0.05);
        p.drawCircle(0, 0, Math.random() * 1.5 + 0.5);
        p.endFill();
        p.x = Math.random() * 620;
        p.y = Math.random() * 420;
        (p as any).vx = (Math.random() - 0.5) * 0.2;
        (p as any).vy = (Math.random() - 0.5) * 0.2;
        particles.addChild(p);
      }

      // Animation loop
      let time = 0;
      app.ticker.add(() => {
        time += 0.016;
        
        // Animate particles
        particles.children.forEach((p: any) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = 620;
          if (p.x > 620) p.x = 0;
          if (p.y < 0) p.y = 420;
          if (p.y > 420) p.y = 0;
          p.alpha = 0.05 + Math.sin(time * 2 + p.x * 0.01) * 0.05;
        });

        // Subtle building window flicker
        buildings.forEach((_, i) => {
          const building = app.stage.children[2 + i] as PIXI.Graphics;
          if (building && Math.random() < 0.002) {
            building.alpha = 0.85 + Math.random() * 0.15;
          }
        });
      });
    };

    initPixi();

    return () => {
      mounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-[#008080] overflow-hidden select-none">
      {/* Pixi.js Canvas Container */}
      <div 
        ref={containerRef} 
        className="absolute inset-0"
        style={{ 
          imageRendering: 'pixelated',
        }}
      />

      {/* NPC Agents Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="absolute pointer-events-auto"
            style={{
              left: agent.x - 16,
              top: agent.y - 20,
              transform: 'translate3d(0,0,0)',
            }}
          >
            <NPC
              name={agent.name}
              role={agent.role}
              color={agent.color}
              active={selectedAgent === agent.id}
              selected={selectedAgent === agent.id}
              onClick={() => setSelectedAgent(
                selectedAgent === agent.id ? null : agent.id
              )}
            />
          </div>
        ))}
      </div>

      {/* Agent Info Panel */}
      {selectedAgent && (
        <div className="absolute bottom-[8px] left-[8px] right-[8px] pointer-events-none">
          <div className="bg-black/85 text-white text-[10px] p-[6px] border border-white/20 font-mono backdrop-blur-sm max-w-[280px]">
            {(() => {
              const agent = agents.find(a => a.id === selectedAgent)!;
              return (
                <div className="space-y-[2px]">
                  <div className="flex items-center gap-[6px] pb-[3px] border-b border-white/20">
                    <div 
                      className="w-[10px] h-[10px] border border-white/40"
                      style={{ backgroundColor: agent.color }}
                    />
                    <span className="font-bold text-[#ffff00]">
                      {agent.name.toUpperCase()}
                    </span>
                    <span className="text-white/60">•</span>
                    <span className="text-white/80">{agent.role}</span>
                  </div>
                  <div className="text-[9px] leading-relaxed">
                    <div className="text-[#00ff00]">STATUS: ACTIVE</div>
                    <div className="text-white/70">TASK: {agent.task}</div>
                    <div className="text-white/50 mt-[2px]">
                      Click again to dismiss • Double-click agent for details
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Grid coordinates overlay (subtle) */}
      <div className="absolute top-[4px] right-[4px] pointer-events-none">
        <div className="bg-black/60 text-[#00ff00] text-[8px] px-[4px] py-[2px] font-mono border border-[#00ff00]/20">
          TOWN_SQUARE • GRID: 20px • AGENTS: 4/4 ONLINE
        </div>
      </div>

      {/* Scanlines overlay for authenticity */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply"
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