'use client';
import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

interface NPC {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  color: number;
  sprite?: PIXI.Graphics;
}

interface TownSquareProps {
  onAgentClick?: (name: string, role: string) => void;
  missionActive?: boolean;
  onMissionComplete?: () => void;
}

export default function TownSquare({ onAgentClick, missionActive, onMissionComplete }: TownSquareProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const npcsRef = useRef<NPC[]>([]);
  const connectionLinesRef = useRef<PIXI.Graphics | null>(null);
  const [isMissionRunning, setIsMissionRunning] = useState(false);

  useEffect(() => {
    if (!containerRef.current || appRef.current) return;

    const app = new PIXI.Application({
      width: 384,
      height: 280,
      backgroundAlpha: 0,
      resolution: 2,
      antialias: false,
    });
    
    appRef.current = app;
    containerRef.current.appendChild(app.view as HTMLCanvasElement);

    // Background floor
    const floor = new PIXI.Graphics();
    floor.beginFill(0x0a4a3a);
    floor.drawRect(0, 0, 384, 280);
    floor.endFill();
    
    // Grid pattern
    floor.lineStyle(1, 0x0d5e4a, 0.3);
    for (let i = 0; i < 384; i += 32) {
      floor.moveTo(i, 0);
      floor.lineTo(i, 280);
    }
    for (let i = 0; i < 280; i += 32) {
      floor.moveTo(0, i);
      floor.lineTo(384, i);
    }
    app.stage.addChild(floor);

    // Connection lines container
    const connectionLines = new PIXI.Graphics();
    connectionLinesRef.current = connectionLines;
    app.stage.addChild(connectionLines);

    // NPC Definitions
    const npcData: NPC[] = [
      { id: 'karen', name: 'KAREN', role: 'Research Lead', x: 72, y: 80, color: 0xff69b4 },
      { id: 'chad', name: 'CHAD', role: 'Code Execution', x: 312, y: 80, color: 0x00ff88 },
      { id: 'alice', name: 'ALICE', role: 'Data Analysis', x: 72, y: 200, color: 0x4488ff },
      { id: 'bob', name: 'BOB', role: 'Synthesis', x: 312, y: 200, color: 0xffaa00 },
    ];

    // Create NPC sprites
    npcData.forEach((npc) => {
      const container = new PIXI.Container();
      container.x = npc.x;
      container.y = npc.y;
      
      // Shadow
      const shadow = new PIXI.Graphics();
      shadow.beginFill(0x000000, 0.3);
      shadow.drawEllipse(0, 14, 14, 6);
      shadow.endFill();
      container.addChild(shadow);
      
      // Body
      const body = new PIXI.Graphics();
      body.beginFill(npc.color);
      body.drawRect(-12, -12, 24, 24);
      body.endFill();
      body.beginFill(0xffffff, 0.2);
      body.drawRect(-12, -12, 24, 8);
      body.endFill();
      body.lineStyle(2, 0x000000, 0.8);
      body.drawRect(-12, -12, 24, 24);
      container.addChild(body);
      
      // Eyes
      const eye1 = new PIXI.Graphics();
      eye1.beginFill(0x000000);
      eye1.drawCircle(-5, -4, 2);
      eye1.endFill();
      const eye2 = new PIXI.Graphics();
      eye2.beginFill(0x000000);
      eye2.drawCircle(5, -4, 2);
      eye2.endFill();
      container.addChild(eye1, eye2);
      
      // Name label background
      const labelBg = new PIXI.Graphics();
      labelBg.beginFill(0x000000, 0.7);
      labelBg.drawRoundedRect(-22, 18, 44, 12, 2);
      labelBg.endFill();
      container.addChild(labelBg);
      
      // Name text
      const nameText = new PIXI.Text(npc.name, {
        fontFamily: 'MS Sans Serif, Arial',
        fontSize: 7,
        fill: 0xffffff,
      });
      nameText.anchor.set(0.5, 0);
      nameText.y = 19;
      container.addChild(nameText);
      
      container.interactive = true;
      container.cursor = 'pointer';
      container.on('pointerdown', () => {
        onAgentClick?.(npc.name, npc.role);
        // Pulse animation
        container.scale.set(1.2);
        setTimeout(() => container.scale.set(1), 150);
      });
      
      app.stage.addChild(container);
      npc.sprite = container as any;
    });

    npcsRef.current = npcData;

    // Idle animation
    let time = 0;
    app.ticker.add(() => {
      time += 0.02;
      npcData.forEach((npc, i) => {
        if (npc.sprite && !isMissionRunning) {
          npc.sprite.y = npc.y + Math.sin(time + i * 1.5) * 2;
        }
      });
    });

    return () => {
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, [onAgentClick]);

  // Mission orchestration effect
  useEffect(() => {
    if (!missionActive || isMissionRunning || !appRef.current) return;
    
    setIsMissionRunning(true);
    const app = appRef.current;
    const npcs = npcsRef.current;
    const lines = connectionLinesRef.current;
    if (!lines) return;

    let step = 0;
    const missionSteps = [
      { from: 'karen', to: 'alice', delay: 0 },
      { from: 'alice', to: 'chad', delay: 600 },
      { from: 'chad', to: 'bob', delay: 1200 },
      { from: 'bob', to: 'karen', delay: 1800 },
    ];

    const executeStep = (stepData: typeof missionSteps[0]) => {
      const fromNPC = npcs.find(n => n.id === stepData.from);
      const toNPC = npcs.find(n => n.id === stepData.to);
      if (!fromNPC?.sprite || !toNPC?.sprite || !lines) return;

      // Draw glowing connection
      lines.clear();
      lines.lineStyle(3, 0xffff00, 0.9);
      lines.moveTo(fromNPC.sprite.x, fromNPC.sprite.y);
      lines.lineTo(toNPC.sprite.x, toNPC.sprite.y);
      
      // Pulse effect
      let pulse = 0;
      const pulseInterval = setInterval(() => {
        pulse += 0.1;
        if (lines && app.stage.children.includes(lines)) {
          lines.alpha = 0.5 + Math.sin(pulse * 3) * 0.5;
        }
      }, 50);

      // Move sprite particle
      const particle = new PIXI.Graphics();
      particle.beginFill(0xffff00);
      particle.drawCircle(0, 0, 4);
      particle.endFill();
      particle.x = fromNPC.sprite.x;
      particle.y = fromNPC.sprite.y;
      app.stage.addChild(particle);

      const startX = fromNPC.sprite.x;
      const startY = fromNPC.sprite.y;
      const endX = toNPC.sprite.x;
      const endY = toNPC.sprite.y;
      let progress = 0;

      const moveInterval = setInterval(() => {
        progress += 0.05;
        if (progress >= 1) {
          clearInterval(moveInterval);
          clearInterval(pulseInterval);
          app.stage.removeChild(particle);
          lines.clear();
          lines.alpha = 1;
          
          // Highlight target
          if (toNPC.sprite) {
            toNPC.sprite.scale.set(1.3);
            setTimeout(() => toNPC.sprite?.scale.set(1), 200);
          }
        } else {
          particle.x = startX + (endX - startX) * progress;
          particle.y = startY + (endY - startY) * progress - Math.sin(progress * Math.PI) * 20;
        }
      }, 16);
    };

    const interval = setInterval(() => {
      if (step < missionSteps.length) {
        executeStep(missionSteps[step]);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsMissionRunning(false);
          onMissionComplete?.();
        }, 500);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [missionActive, isMissionRunning, onMissionComplete]);

  return (
    <div 
      ref={containerRef} 
      className="relative"
      style={{ 
        width: '384px', 
        height: '280px',
        imageRendering: 'pixelated',
      }} 
    />
  );
}