'use client';
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export default function TownSquare() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let app: PIXI.Application | null = null;

    const initPixi = async () => {
      app = new PIXI.Application();
      await app.init({
        width: 620,
        height: 420,
        background: 0x008080,
        antialias: false,
        resolution: window.devicePixelRatio || 1,
      });

      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas);
      }

      // 4 NPCs as Graphics (replace later with sprites)
      const colors = [0xff69b4, 0x00ff00, 0x1e90ff, 0xffa500];
      const names = ['Karen', 'Chad', 'Alice', 'Bob'];

      names.forEach((name, i) => {
        const g = new PIXI.Graphics();
        g.beginFill(colors[i]);
        g.drawRect(-16, -16, 32, 32);
        g.endFill();
        g.x = 100 + i * 120;
        g.y = 180;
        g.pivot.set(16, 16);
        g.interactive = true;
        g.on('pointerdown', () => alert(`${name}: Processing step...`));

        app!.stage.addChild(g);
      });

      // Simple idle animation
      app.ticker.add(() => {
        app!.stage.children.forEach((child, i) => {
          child.y = 180 + Math.sin(Date.now() / 400 + i) * 3;
        });
      });
    };

    initPixi();

    return () => {
      if (app) app.destroy(true);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full border-4 border-[#000080] overflow-hidden" />;
}