'use client';
import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

interface Agent {
  id: string;
  name: string;
  role: string;
  station: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  homeX: number;
  homeY: number;
  color: number;
  status: 'idle' | 'walking' | 'working' | 'complete';
  task: string;
  workProgress: number;
}

interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: number;
  icon: string;
  agentId: string;
}

export default function TownSquare() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const agentsRef = useRef<Map<string, PIXI.Container>>(new Map());
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [orderActive, setOrderActive] = useState(false);

  const stations: Station[] = [
    { id: 'pantry', name: 'RESEARCH\nPANTRY', x: 40, y: 40, w: 110, h: 85, color: 0x8b4513, icon: '🥫', agentId: 'karen' },
    { id: 'prep', name: 'PREP\nSTATION', x: 180, y: 35, w: 100, h: 80, color: 0x556b2f, icon: '🔪', agentId: 'mallory' },
    { id: 'grill', name: 'ANALYSIS\nGRILL', x: 310, y: 40, w: 105, h: 85, color: 0x8b0000, icon: '🔥', agentId: 'alice' },
    { id: 'oven', name: 'EXECUTION\nOVEN', x: 445, y: 35, w: 100, h: 80, color: 0x4b0082, icon: '♨️', agentId: 'chad' },
    { id: 'dishwasher', name: 'SECURITY\nDISHWASHER', x: 85, y: 295, w: 110, h: 85, color: 0x4682b4, icon: '🧽', agentId: 'eve' },
    { id: 'plating', name: 'COMMAND\nPLATING', x: 425, y: 300, w: 115, h: 85, color: 0xdaa520, icon: '🍽️', agentId: 'bob' },
  ];

  const [agents] = useState<Agent[]>([
    { 
      id: 'karen', name: 'Karen', role: 'Pantry Chef', 
      station: 'pantry',
      x: 95, y: 160, targetX: 95, targetY: 160, homeX: 95, homeY: 160,
      color: 0xff69b4, status: 'idle', task: 'Gathering ingredients', workProgress: 0
    },
    { 
      id: 'mallory', name: 'Mallory', role: 'Prep Cook',
      station: 'prep', 
      x: 230, y: 145, targetX: 230, targetY: 145, homeX: 230, homeY: 145,
      color: 0x9370db, status: 'idle', task: 'Chopping data', workProgress: 0
    },
    { 
      id: 'alice', name: 'Alice', role: 'Grill Master',
      station: 'grill',
      x: 362, y: 162, targetX: 362, targetY: 162, homeX: 362, homeY: 162,
      color: 0x1e90ff, status: 'idle', task: 'Grilling insights', workProgress: 0
    },
    { 
      id: 'chad', name: 'Chad', role: 'Oven Chef',
      station: 'oven',
      x: 495, y: 145, targetX: 495, targetY: 145, homeX: 495, homeY: 145,
      color: 0x00ff7f, status: 'idle', task: 'Baking code', workProgress: 0
    },
    { 
      id: 'eve', name: 'Eve', role: 'Dishwasher',
      station: 'dishwasher',
      x: 140, y: 270, targetX: 140, targetY: 270, homeX: 140, homeY: 270,
      color: 0xff1493, status: 'idle', task: 'Scrubbing threats', workProgress: 0
    },
    { 
      id: 'bob', name: 'Bob', role: 'Expediter',
      station: 'plating',
      x: 482, y: 275, targetX: 482, targetY: 275, homeX: 482, homeY: 275,
      color: 0xffa500, status: 'idle', task: 'Plating report', workProgress: 0
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
        backgroundColor: 0x2a2a2a,
        antialias: false,
        resolution: 1,
        autoDensity: false,
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

      // Kitchen floor - checkerboard tile
      const floor = new PIXI.Graphics();
      const tileSize = 20;
      for (let x = 0; x < 620; x += tileSize) {
        for (let y = 0; y < 420; y += tileSize) {
          const isLight = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
          floor.beginFill(isLight ? 0x3a3a3a : 0x2e2e2e);
          floor.drawRect(x, y, tileSize, tileSize);
          floor.endFill();
        }
      }
      // Grout lines
      floor.lineStyle(1, 0x1a1a1a, 0.8);
      for (let x = 0; x <= 620; x += tileSize) {
        floor.moveTo(x, 0);
        floor.lineTo(x, 420);
      }
      for (let y = 0; y <= 420; y += tileSize) {
        floor.moveTo(0, y);
        floor.lineTo(620, y);
      }
      stage.addChild(floor);

      // Kitchen stations
      stations.forEach((station) => {
        const stationContainer = new PIXI.Container();
        stationContainer.x = station.x;
        stationContainer.y = station.y;
        stationContainer.name = station.id;
        stationContainer.eventMode = 'static';
        stationContainer.cursor = 'pointer';

        // Station base with 3D effect
        const base = new PIXI.Graphics();
        // Shadow
        base.beginFill(0x000000, 0.4);
        base.drawRoundedRect(3, 3, station.w, station.h, 4);
        base.endFill();
        // Main body
        base.beginFill(station.color);
        base.lineStyle(2, 0x000000, 1);
        base.drawRoundedRect(0, 0, station.w, station.h, 4);
        base.endFill();
        // Highlight top edge
        base.lineStyle(2, 0xffffff, 0.2);
        base.moveTo(2, 2);
        base.lineTo(station.w - 2, 2);
        stationContainer.addChild(base);

        // Station surface/work area
        const surface = new PIXI.Graphics();
        surface.beginFill(0x1a1a1a, 0.9);
        surface.drawRoundedRect(8, 8, station.w - 16, station.h - 25, 2);
        surface.endFill();
        // Stainless steel effect
        surface.lineStyle(1, 0x888888, 0.3);
        for (let i = 0; i < 3; i++) {
          surface.moveTo(10, 12 + i * 4);
          surface.lineTo(station.w - 10, 12 + i * 4);
        }
        stationContainer.addChild(surface);

        // Station-specific details
        const details = new PIXI.Graphics();
        if (station.id === 'pantry') {
          // Shelves with cans
          details.beginFill(0x8b4513);
          for (let i = 0; i < 3; i++) {
            details.drawRect(12 + i * 28, 15, 22, 4);
            // Cans
            details.beginFill([0xcc0000, 0x0066cc, 0x009900][i]);
            details.drawRoundedRect(14 + i * 28, 20, 8, 12, 1);
            details.drawRoundedRect(24 + i * 28, 20, 8, 12, 1);
            details.endFill();
            details.beginFill(0x8b4513);
          }
          details.endFill();
        } else if (station.id === 'prep') {
          // Cutting board
          details.beginFill(0xdeb887);
          details.drawRoundedRect(15, 18, station.w - 30, 20, 2);
          details.endFill();
          // Knife
          details.beginFill(0xc0c0c0);
          details.drawRect(station.w - 25, 15, 3, 25);
          details.beginFill(0x8b4513);
          details.drawRect(station.w - 26, 12, 5, 8);
          details.endFill();
        } else if (station.id === 'grill') {
          // Grill grates
          details.lineStyle(2, 0x333333);
          for (let i = 0; i < 5; i++) {
            details.moveTo(12, 18 + i * 4);
            details.lineTo(station.w - 12, 18 + i * 4);
          }
          // Flames (when active)
          const flames = new PIXI.Graphics();
          flames.name = 'flames';
          flames.visible = false;
          stationContainer.addChild(flames);
        } else if (station.id === 'oven') {
          // Oven door with window
          details.beginFill(0x2a2a2a);
          details.lineStyle(2, 0x000000);
          details.drawRoundedRect(10, 12, station.w - 20, station.h - 30, 3);
          details.endFill();
          // Window
          details.beginFill(0x1a1a2e, 0.8);
          details.drawRoundedRect(18, 20, station.w - 36, 18, 2);
          details.endFill();
          // Handle
          details.beginFill(0x888888);
          details.drawRoundedRect(station.w / 2 - 15, station.h - 15, 30, 4, 2);
          details.endFill();
        } else if (station.id === 'dishwasher') {
          // Water/dish rack
          details.lineStyle(1, 0x4682b4, 0.6);
          for (let i = 0; i < 4; i++) {
            details.moveTo(15 + i * 20, 15);
            details.lineTo(15 + i * 20, station.h - 20);
          }
          // Soap bubbles (when active)
          const bubbles = new PIXI.Container();
          bubbles.name = 'bubbles';
          bubbles.visible = false;
          stationContainer.addChild(bubbles);
        } else if (station.id === 'plating') {
          // Plates
          for (let i = 0; i < 3; i++) {
            details.beginFill(0xffffff, 0.9);
            details.lineStyle(1, 0xcccccc);
            details.drawCircle(20 + i * 28, 25, 10);
            details.endFill();
            details.beginFill(0xffffff);
            details.drawCircle(20 + i * 28, 25, 7);
            details.endFill();
          }
        }
        stationContainer.addChild(details);

        // Station icon (large)
        const iconBg = new PIXI.Graphics();
        iconBg.beginFill(0x000000, 0.7);
        iconBg.drawRoundedRect(station.w - 28, station.h - 28, 24, 24, 3);
        iconBg.endFill();
        stationContainer.addChild(iconBg);

        const icon = new PIXI.Text({
          text: station.icon,
          style: { fontSize: 16 }
        } as any);
        icon.x = station.w - 16;
        icon.y = station.h - 16;
        icon.anchor.set(0.5);
        stationContainer.addChild(icon);

        // Station label
        const labelBg = new PIXI.Graphics();
        labelBg.beginFill(0x000000, 0.9);
        labelBg.drawRoundedRect(4, station.h - 18, station.w - 8, 14, 2);
        labelBg.endFill();
        stationContainer.addChild(labelBg);

        const label = new PIXI.Text({
          text: station.name,
          style: {
            fontFamily: 'monospace',
            fontSize: 7,
            fill: 0x00ff00,
            align: 'center',
            fontWeight: 'bold',
          } as any
        });
        label.anchor.set(0.5, 0);
        label.x = station.w / 2;
        label.y = station.h - 16;
        stationContainer.addChild(label);

        // Work progress bar (hidden by default)
        const progressBg = new PIXI.Graphics();
        progressBg.beginFill(0x000000, 0.8);
        progressBg.drawRect(8, station.h + 4, station.w - 16, 4);
        progressBg.endFill();
        progressBg.visible = false;
        progressBg.name = 'progressBg';
        stationContainer.addChild(progressBg);

        const progressBar = new PIXI.Graphics();
        progressBar.name = 'progressBar';
        progressBar.visible = false;
        stationContainer.addChild(progressBar);

        // Status light
        const statusLight = new PIXI.Graphics();
        statusLight.beginFill(0x333333);
        statusLight.drawCircle(station.w - 8, 8, 4);
        statusLight.endFill();
        statusLight.name = 'statusLight';
        stationContainer.addChild(statusLight);

        // Click handler
        stationContainer.on('pointerdown', () => {
          setSelectedStation(selectedStation === station.id ? null : station.id);
        });

        stage.addChild(stationContainer);
      });

      // Create enhanced agent sprites
      agents.forEach(agent => {
        const container = new PIXI.Container();
        container.x = agent.x;
        container.y = agent.y;
        container.name = agent.id;
        container.eventMode = 'static';
        container.cursor = 'pointer';
        container.zIndex = 200;

        // Shadow with blur
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.4);
        shadow.drawEllipse(0, 18, 12, 5);
        shadow.endFill();
        shadow.filters = [new PIXI.BlurFilter({ strength: 2 })];
        container.addChild(shadow);

        // Chef hat
        const hat = new PIXI.Graphics();
        hat.beginFill(0xffffff);
        hat.lineStyle(1, 0xcccccc);
        hat.drawRoundedRect(-10, -32, 20, 10, 5);
        hat.endFill();
        hat.beginFill(0xffffff);
        hat.drawRoundedRect(-8, -38, 16, 8, 4);
        hat.endFill();
        container.addChild(hat);

        // Head
        const head = new PIXI.Graphics();
        head.beginFill(0xfdbcb4);
        head.lineStyle(1.5, 0x000000, 0.9);
        head.drawCircle(0, -18, 9);
        head.endFill();
        container.addChild(head);

        // Eyes - looking around
        const eyes = new PIXI.Container();
        eyes.name = 'eyes';
        [-3, 3].forEach(x => {
          const eye = new PIXI.Graphics();
          eye.beginFill(0xffffff);
          eye.drawCircle(x, -19, 2.5);
          eye.endFill();
          eye.beginFill(0x000000);
          eye.drawCircle(x, -19, 1.2);
          eye.endFill();
          eyes.addChild(eye);
        });
        container.addChild(eyes);

        // Body - chef coat
        const body = new PIXI.Graphics();
        body.beginFill(0xffffff);
        body.lineStyle(1.5, 0x000000, 0.9);
        body.drawRoundedRect(-11, -8, 22, 22, 3);
        body.endFill();
        // Buttons
        body.beginFill(0x333333);
        [ -4, 0, 4 ].forEach(y => {
          body.drawCircle(0, y, 1);
        });
        body.endFill();
        // Agent color accent (apron/tie)
        body.beginFill(agent.color, 0.8);
        body.drawRoundedRect(-9, -6, 18, 14, 2);
        body.endFill();
        container.addChild(body);

        // Arms
        const arms = new PIXI.Container();
        arms.name = 'arms';
        [-9, 9].forEach((x, i) => {
          const arm = new PIXI.Graphics();
          arm.beginFill(0xfdbcb4);
          arm.lineStyle(1, 0x000000, 0.7);
          arm.drawRoundedRect(x - 3, -2, 6, 12, 3);
          arm.endFill();
          // Hand
          arm.beginFill(0xfdbcb4);
          arm.drawCircle(x, 10, 3.5);
          arm.endFill();
          arms.addChild(arm);
        });
        container.addChild(arms);

        // Legs with shoes
        const legs = new PIXI.Container();
        legs.name = 'legs';
        [-5, 5].forEach(x => {
          const leg = new PIXI.Graphics();
          leg.beginFill(0x2a2a2a);
          leg.drawRoundedRect(x - 3, 12, 6, 10, 2);
          leg.endFill();
          // Shoe
          leg.beginFill(0x000000);
          leg.drawRoundedRect(x - 4, 20, 8, 4, 2);
          leg.endFill();
          legs.addChild(leg);
        });
        container.addChild(legs);

        // Name tag
        const nameTag = new PIXI.Graphics();
        nameTag.beginFill(0x000080);
        nameTag.lineStyle(1, 0xffffff, 0.5);
        nameTag.drawRoundedRect(-16, 26, 32, 10, 2);
        nameTag.endFill();
        container.addChild(nameTag);

        const nameText = new PIXI.Text({
          text: agent.name.toUpperCase(),
          style: {
            fontFamily: 'monospace',
            fontSize: 7,
            fill: 0xffffff,
            fontWeight: 'bold',
          } as any
        });
        nameText.anchor.set(0.5, 0.5);
        nameText.y = 31;
        container.addChild(nameText);

        // Tool/utensil (changes based on station)
        const tool = new PIXI.Container();
        tool.name = 'tool';
        tool.visible = false;
        container.addChild(tool);

        // Status indicator (above head)
        const statusIndicator = new PIXI.Container();
        statusIndicator.name = 'statusIndicator';
        statusIndicator.y = -42;
        statusIndicator.visible = false;
        container.addChild(statusIndicator);

        const statusBg = new PIXI.Graphics();
        statusBg.beginFill(0x000000, 0.9);
        statusBg.lineStyle(1, 0x00ff00);
        statusBg.drawRoundedRect(-25, -8, 50, 14, 3);
        statusBg.endFill();
        statusIndicator.addChild(statusBg);

        const statusText = new PIXI.Text({
          text: '',
          style: {
            fontFamily: 'monospace',
            fontSize: 7,
            fill: 0x00ff00,
          } as any
        });
        statusText.anchor.set(0.5, 0.5);
        statusText.name = 'statusText';
        statusIndicator.addChild(statusText);

        stage.addChild(container);
        agentsRef.current.set(agent.id, container);

        // Interaction
        container.on('pointerdown', (e) => {
          e.stopPropagation();
          const isSelected = selectedAgent === agent.id;
          setSelectedAgent(isSelected ? null : agent.id);
          setSelectedStation(null);
        });
      });

      // Work effect particles container
      const workEffects = new PIXI.Container();
      workEffects.name = 'workEffects';
      stage.addChild(workEffects);

      // Animation loop
      let time = 0;
      const animate = () => {
        if (!mounted) return;
        time += 0.016;

        // Animate agents
        agentsRef.current.forEach((container, id) => {
          const agent = agents.find(a => a.id === id);
          if (!agent || !container) return;

          const dx = agent.targetX - container.x;
          const dy = agent.targetY - container.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 3) {
            // WALKING - Very visible movement
            const speed = 0.018; // ~3+ seconds across screen
            container.x += dx * speed;
            container.y += dy * speed;
            
            // Exaggerated walking animation
            const walkCycle = Math.sin(time * 10);
            const legs = container.getChildByName('legs') as PIXI.Container;
            if (legs) {
              legs.children.forEach((leg: any, idx) => {
                leg.y = Math.sin(time * 10 + idx * Math.PI) * 2;
                leg.rotation = Math.sin(time * 10 + idx * Math.PI) * 0.15;
              });
            }
            
            // Body bob - strong trail + exaggerated bob
            const walk = Math.sin(time * 6);
            const body = container.children[3];
            if (body) body.y = walk * 1.8;
            
            // Arms swing opposite to legs
            const arms = container.getChildByName('arms') as PIXI.Container;
            if (arms) {
              arms.children.forEach((arm: any, idx) => {
                arm.rotation = Math.sin(time * 10 + idx * Math.PI) * 0.2;
              });
            }
            
            agent.status = 'walking';
            
            // Footstep dust particles
            if (Math.random() < 0.3) {
              const dust = new PIXI.Graphics();
              dust.beginFill(0x999999, 0.4);
              dust.drawCircle(0, 0, Math.random() * 1.5 + 0.5);
              dust.endFill();
              dust.x = container.x + (Math.random() - 0.5) * 4;
              dust.y = container.y + 20;
              dust.alpha = 0.6;
              (dust as any).life = 0;
              workEffects.addChild(dust);
            }
          } else {
            // Arrived at destination
            container.x = agent.targetX;
            container.y = agent.targetY;
            
            // Idle breathing
            const breathe = Math.sin(time * 1.5 + parseInt(id, 36) % 10) * 0.4;
            container.y = agent.targetY + breathe;
            
            if (agent.status === 'walking') {
              agent.status = 'idle';
            }
          }

          // Work animations based on status
          if (agent.status === 'working') {
            const workIntensity = Math.sin(time * 8) * 0.5 + 0.5;
            
            // Arms working motion
            const arms = container.getChildByName('arms') as PIXI.Container;
            if (arms) {
              arms.children.forEach((arm: any, idx) => {
                if (agent.id === 'mallory') {
                  // Chopping motion
                  arm.rotation = Math.sin(time * 15 + idx * Math.PI) * 0.4;
                  arm.y = Math.abs(Math.sin(time * 15)) * -2;
                } else if (agent.id === 'alice') {
                  // Stirring motion
                  arm.rotation = Math.sin(time * 6 + idx) * 0.3;
                  arm.x = Math.cos(time * 6 + idx) * 1;
                } else if (agent.id === 'chad') {
                  // Oven checking
                  arm.rotation = Math.sin(time * 4) * 0.15;
                } else {
                  // General working
                  arm.rotation = Math.sin(time * 10 + idx) * 0.2;
                }
              });
            }

            // Station-specific work effects
            const station = stations.find(s => s.agentId === agent.id);
            if (station) {
              const stationContainer = stage.getChildByName(station.id) as PIXI.Container;
              if (stationContainer) {
                // Create work particles based on station type
                if (Math.random() < 0.4) {
                  const particle = new PIXI.Graphics();
                  
                  if (agent.id === 'mallory') {
                    // Knife sparks / chopped bits
                    particle.beginFill([0xffffff, 0xffff00, 0xffcc00][Math.floor(Math.random() * 3)], 0.9);
                    particle.drawRect(-1, -1, 2, 2);
                    particle.endFill();
                    particle.x = station.x + station.w / 2 + (Math.random() - 0.5) * 30;
                    particle.y = station.y + 25;
                    (particle as any).vy = -1 - Math.random() * 2;
                    (particle as any).vx = (Math.random() - 0.5) * 1.5;
                  } else if (agent.id === 'alice') {
                    // Steam from grill
                    particle.beginFill(0xffffff, 0.3 + Math.random() * 0.3);
                    particle.drawCircle(0, 0, Math.random() * 3 + 1);
                    particle.endFill();
                    particle.x = station.x + station.w / 2 + (Math.random() - 0.5) * 20;
                    particle.y = station.y + 15;
                    (particle as any).vy = -0.5 - Math.random() * 0.5;
                    (particle as any).vx = (Math.random() - 0.5) * 0.3;
                  } else if (agent.id === 'chad') {
                    // Heat waves from oven
                    if (Math.random() < 0.2) {
                      particle.beginFill(0xff4500, 0.2);
                      particle.drawCircle(0, 0, Math.random() * 4 + 2);
                      particle.endFill();
                      particle.x = station.x + station.w / 2;
                      particle.y = station.y + station.h - 10;
                      (particle as any).vy = -0.3;
                      (particle as any).vx = 0;
                    }
                  } else if (agent.id === 'eve') {
                    // Soap bubbles
                    particle.beginFill(0x87ceeb, 0.6);
                    particle.drawCircle(0, 0, Math.random() * 2 + 1);
                    particle.endFill();
                    particle.lineStyle(1, 0xffffff, 0.8);
                    particle.drawCircle(0, 0, Math.random() * 2 + 1);
                    particle.x = station.x + 15 + Math.random() * (station.w - 30);
                    particle.y = station.y + 20 + Math.random() * 10;
                    (particle as any).vy = -0.2 - Math.random() * 0.3;
                    (particle as any).vx = (Math.random() - 0.5) * 0.5;
                  } else {
                    return;
                  }
                  
                  if (particle.width > 0) {
                    (particle as any).life = 0;
                    (particle as any).maxLife = 40 + Math.random() * 20;
                    workEffects.addChild(particle);
                  }
                }
              }
            }

            // Update work progress
            agent.workProgress = Math.min(100, agent.workProgress + 0.3);
            
            // Update station progress bar
            const stationInfo = stations.find(s => s.agentId === agent.id);
            if (stationInfo) {
              const stationContainer = stage.getChildByName(stationInfo.id) as PIXI.Container;
              if (stationContainer) {
                const progressBg = stationContainer.getChildByName('progressBg') as PIXI.Graphics;
                const progressBar = stationContainer.getChildByName('progressBar') as PIXI.Graphics;
                if (progressBg && progressBar) {
                  progressBg.visible = true;
                  progressBar.visible = true;
                  progressBar.clear();
                  progressBar.beginFill(0x00ff00);
                  progressBar.drawRect(8, stationInfo.h + 4, (stationInfo.w - 16) * (agent.workProgress / 100), 4);
                  progressBar.endFill();
                  
                  if (agent.workProgress >= 100) {
                    setTimeout(() => {
                      progressBg.visible = false;
                      progressBar.visible = false;
                      agent.workProgress = 0;
                    }, 500);
                  }
                }

                // Activate station glow
                const glow = stationContainer.children.find(c => 
                  c instanceof PIXI.Graphics && c.name !== 'progressBg' && c.name !== 'progressBar'
                ) as PIXI.Graphics;
                if (glow && agent.workProgress > 0) {
                  glow.clear();
                  glow.beginFill(0x00ff00, 0.15 + Math.sin(time * 5) * 0.1);
                  glow.drawRoundedRect(-4, -4, station.w + 8, station.h + 8, 4);
                  glow.endFill();
                }
              }
            }
          }

          // Update status indicator
          const statusIndicator = container.getChildByName('statusIndicator') as PIXI.Container;
          if (statusIndicator) {
            const statusText = statusIndicator.getChildByName('statusText') as PIXI.Text;
            if (statusText) {
              const statusMap = {
                idle: 'IDLE',
                walking: 'MOVING',
                working: 'WORKING',
                complete: 'DONE'
              };
              statusText.text = statusMap[agent.status] || 'IDLE';
              statusIndicator.visible = agent.status !== 'idle';
            }
          }
        });

        // Animate work effects
        workEffects.children.forEach((effect: any, idx) => {
          effect.y += effect.vy || 0;
          effect.x += effect.vx || 0;
          effect.life = (effect.life || 0) + 1;
          effect.alpha = Math.max(0, 1 - effect.life / effect.maxLife);
          
          if (effect.life > effect.maxLife || effect.alpha <= 0) {
            workEffects.removeChild(effect);
          }
        });

        // Clean up old effects
        if (workEffects.children.length > 100) {
          workEffects.removeChildren(0, 20);
        }

        animationId = requestAnimationFrame(animate);
      };
      
      animate();

      // Expose API
      (window as any).__agentville = {
        moveAgent: (id: string, x: number, y: number) => {
          const agent = agents.find(a => a.id === id);
          if (agent) {
            agent.targetX = x;
            agent.targetY = y;
            agent.status = 'walking';
          }
        },
        setAgentStatus: (id: string, status: Agent['status'], task?: string) => {
          const agent = agents.find(a => a.id === id);
          if (agent) {
            agent.status = status;
            if (task) agent.task = task;
            if (status !== 'working') {
              agent.workProgress = 0;
            }
          }
        },
        getAgents: () => agents,
        getStations: () => stations,
      };
    };

    initPixi();

    return () => {
      mounted = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
      }
      delete (window as any).__agentville;
    };
  }, [agents]);

  return (
    <div className="relative w-full h-full bg-[#1a1a1a] overflow-hidden select-none">
      {/* Kitchen ambient lighting */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,200,100,0.1) 0%, transparent 50%),
                         radial-gradient(circle at 80% 70%, rgba(255,150,50,0.08) 0%, transparent 50%),
                         radial-gradient(circle at 50% 50%, rgba(200,200,255,0.05) 0%, transparent 70%)`
      }} />
      
      <div ref={containerRef} className="absolute inset-0" style={{ imageRendering: 'pixelated' as any }} />
      
      {/* Station labels overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {stations.map(station => (
          <div
            key={station.id}
            className="absolute text-[8px] font-bold font-mono pointer-events-none select-none"
            style={{
              left: station.x + station.w / 2,
              top: station.y - 2,
              transform: 'translateX(-50%)',
              color: '#ffff00',
              textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
              opacity: 0.9,
            }}
          >
            {station.name.split('\n').map((line, i) => (
              <div key={i} className="leading-none text-center whitespace-nowrap">
                {line}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Active order display */}
      {orderActive && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-black border-2 border-[#ff0000] px-3 py-1.5 shadow-[0_0_10px_rgba(255,0,0,0.5)]">
            <div className="flex items-center gap-2 text-[10px] font-bold font-mono">
              <span className="text-[#ff0000] animate-pulse">●</span>
              <span className="text-white">ORDER IN PROGRESS:</span>
              <span className="text-[#ffff00]">OSINT RECON - openclaw.ai</span>
              <span className="text-white/60">|</span>
              <span className="text-[#00ff00]">6 CHEFS ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* Agent info panels */}
      {selectedAgent && (
        <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none">
          <div className="bg-black/95 border-2 border-[#00ff00] p-2 backdrop-blur-sm">
            {(() => {
              const agent = agents.find(a => a.id === selectedAgent);
              if (!agent) return null;
              const station = stations.find(s => s.agentId === agent.id);
              if (!station) return null;
              return (
                <div className="font-mono text-[10px] leading-relaxed">
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-[#00ff00]/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: `#${agent.color.toString(16).padStart(6, '0')}` }} />
                      <span className="text-[#ffff00] font-bold">{agent.name.toUpperCase()}</span>
                      <span className="text-white/50">•</span>
                      <span className="text-white">{agent.role}</span>
                      <span className="text-white/50">•</span>
                      <span className="text-[#00ffff]">{station.name.replace('\n', ' ')}</span>
                    </div>
                    <div className={`px-1.5 py-0.5 text-[9px] font-bold border ${
                      agent.status === 'working' ? 'bg-[#00ff00]/20 text-[#00ff00] border-[#00ff00]/50' :
                      agent.status === 'walking' ? 'bg-[#ff8000]/20 text-[#ff8000] border-[#ff8000]/50' :
                      'bg-white/10 text-white/70 border-white/20'
                    }`}>
                      {agent.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[9px]">
                    <div>
                      <span className="text-white/50">TASK:</span>
                      <div className="text-[#00ff00] truncate">{agent.task}</div>
                    </div>
                    <div>
                      <span className="text-white/50">STATION:</span>
                      <div className="text-white">{station.icon} {station.name.split('\n')[0]}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-white/50">PROGRESS:</span>
                      <div className="text-[#ffff00]">{Math.round(agent.workProgress)}%</div>
                    </div>
                  </div>
                  {agent.status === 'working' && (
                    <div className="mt-1.5 pt-1.5 border-t border-white/10">
                      <div className="h-1 bg-black border border-white/20 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00ff00] to-[#00ffff] transition-all duration-100"
                          style={{ width: `${agent.workProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Station info popup */}
      {selectedStation && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="bg-[#c0c0c0] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.5)] p-3 min-w-[200px]">
            {(() => {
              const station = stations.find(s => s.id === selectedStation);
              if (!station) return null;
              const agent = agents.find(a => a.id === station.agentId);
              if (!agent) return null;
              return (
                <div className="font-mono text-[11px]">
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b-2 border-[#808080]">
                    <span className="text-[16px]">{station.icon}</span>
                    <div>
                      <div className="font-bold text-black">{station.name.replace('\n', ' ')}</div>
                      <div className="text-[9px] text-[#404040]">STATION #{stations.indexOf(station) + 1}</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-[#404040]">Assigned Chef:</span>
                      <span className="font-bold" style={{ color: `#${agent.color.toString(16).padStart(6, '0')}` }}>
                        {agent.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#404040]">Status:</span>
                      <span className={agent.status === 'working' ? 'text-[#008000] font-bold' : ''}>
                        {agent.status === 'working' ? '● COOKING' : '○ IDLE'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#404040]">Current Task:</span>
                      <span className="text-black truncate ml-2">{agent.task}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#808080] text-[9px] text-center text-[#606060]">
                    Click anywhere to close
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Kitchen HUD */}
      <div className="absolute top-1 left-1 right-1 flex justify-between pointer-events-none z-10">
        <div className="bg-black/90 text-[#ff6600] px-2 py-1 text-[9px] font-bold font-mono border border-[#ff6600]/50 backdrop-blur-sm">
          🍳 AGENTVILLE KITCHEN • EST. 1996
        </div>
        <div className="bg-black/90 text-white px-2 py-1 text-[8px] font-mono border border-white/20 backdrop-blur-sm">
          <span className="text-[#00ff00]">●</span> LIVE • 
          <span className="text-[#ffff00]"> {agents.filter(a => a.status !== 'idle').length}/6 ACTIVE</span> • 
          <span className="text-[#00ffff]"> ORDERS: {orderActive ? '1' : '0'}</span>
        </div>
      </div>

      {/* Click to dismiss overlays */}
      {(selectedAgent || selectedStation) && (
        <div 
          className="absolute inset-0 z-[5]"
          onClick={() => {
            setSelectedAgent(null);
            setSelectedStation(null);
          }}
        />
      )}

      <style>{`
        @keyframes kitchen-flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 0.97; }
          94% { opacity: 1; }
          96% { opacity: 0.98; }
          98% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}