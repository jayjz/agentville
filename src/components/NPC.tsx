'use client';
import { motion } from 'framer-motion';

interface NPCProps {
  x: number; y: number; sprite: string;
  state: 'idle' | 'walking' | 'talking';
  dialogue?: string;
}

export default function NPC({ x, y, sprite, state, dialogue }: NPCProps) {
  return (
    <motion.div className="absolute" initial={{ x, y }} animate={{ x, y, scale: state === 'talking' ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
      <div className="relative">
        <div className="w-8 h-8 bg-purple-600 border border-black" style={{ imageRendering: 'pixelated' }}>
          <div className="w-full h-full flex items-center justify-center text-[8px] text-white">{sprite}</div>
        </div>
        {dialogue && state === 'talking' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white border-2 border-black px-2 py-1 text-[10px] whitespace-nowrap">
            {dialogue}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-2 border-b-2 border-black rotate-45"></div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}