'use client';
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export default function TownSquare() {
 const containerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const app = new PIXI.Application({
 width: 620, height: 420, background: 0x008080, antialias: false
 });
 containerRef.current?.appendChild(app.view as HTMLCanvasElement);

 const npcs = ['Karen', 'Chad', 'Alice', 'Bob'].map((name, i) => {
 const sprite = new PIXI.Graphics();
 sprite.beginFill([0xff0000, 0x00ff00, 0x0000ff, 0xffff00][i]);
 sprite.drawRect(0, 0, 32, 32);
 sprite.x = 100 + i * 120;
 sprite.y = 150;
 sprite.interactive = true;
 sprite.on('pointerdown', () => alert(`${name} says: Processing orchestration step...`));
 app.stage.addChild(sprite);
 return sprite;
 });

 const animate = () => {
 npcs.forEach((npc, i) => npc.x += Math.sin(Date.now() / 500 + i) * 0.5);
 app.renderer.render(app.stage);
 };
 app.ticker.add(animate);

 return () => app.destroy(true);
 }, []);

 return <div ref={containerRef} className="border-2 border-[#000080] bg-[#008080]" />;
}