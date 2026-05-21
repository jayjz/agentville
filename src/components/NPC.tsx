'use client';
import { motion } from 'framer-motion';

interface NPCProps {
  name: string;
  role: string;
  color: string;
  active?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export default function NPC({ name, role, color, active = false, selected = false, onClick }: NPCProps) {
  const initials = name.split(' ').map(n => n[0]).join('');
  
  return (
    <motion.div
      className="relative cursor-pointer select-none"
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      animate={{
        y: active ? [0, -2, 0] : 0,
      }}
      transition={{
        y: {
          duration: 0.6,
          repeat: active ? Infinity : 0,
          ease: "easeInOut"
        }
      }}
    >
      {/* Shadow */}
      <motion.div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/40 rounded-full blur-[2px]"
        animate={{
          scale: active ? [1, 0.85, 1] : 1,
          opacity: active ? [0.4, 0.6, 0.4] : 0.4,
        }}
        transition={{
          duration: 0.6,
          repeat: active ? Infinity : 0,
        }}
      />
      
      {/* NPC Sprite Container */}
      <div className="relative">
        {/* Main sprite body - pixel art style */}
        <motion.div
          className="relative"
          style={{ width: 32, height: 40 }}
          animate={{
            filter: active 
              ? ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
              : 'brightness(1)',
          }}
          transition={{
            duration: 1.2,
            repeat: active ? Infinity : 0,
          }}
        >
          {/* Head */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[20px] h-[18px] win95-border"
            style={{ 
              backgroundColor: '#fdbcb4',
              imageRendering: 'pixelated',
            }}
          >
            {/* Eyes */}
            <div className="absolute top-[5px] left-[4px] w-[3px] h-[3px] bg-black" />
            <div className="absolute top-[5px] right-[4px] w-[3px] h-[3px] bg-black" />
            {/* Mouth */}
            <div className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[6px] h-[2px] bg-black" />
          </div>
          
          {/* Body */}
          <div 
            className="absolute top-[16px] left-1/2 -translate-x-1/2 w-[24px] h-[20px] win95-border"
            style={{ backgroundColor: color }}
          >
            {/* Initials badge */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="text-[10px] font-bold text-white"
                style={{ 
                  textShadow: '1px 1px 0px rgba(0,0,0,0.8)',
                  fontFamily: 'monospace',
                }}
              >
                {initials}
              </span>
            </div>
            
            {/* Pixel details */}
            <div className="absolute top-[2px] left-[2px] w-[4px] h-[2px] bg-white/30" />
            <div className="absolute bottom-[2px] right-[2px] w-[3px] h-[3px] bg-black/20" />
          </div>
          
          {/* Legs */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-[2px]">
            <div className="w-[8px] h-[6px] bg-[#4a4a4a] win95-border" />
            <div className="w-[8px] h-[6px] bg-[#4a4a4a] win95-border" />
          </div>
        </motion.div>

        {/* Selection indicator */}
        {selected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -inset-2 pointer-events-none"
          >
            <div className="w-full h-full border-2 border-yellow-400 animate-pulse" 
                 style={{ 
                   borderStyle: 'dashed',
                   filter: 'drop-shadow(0 0 4px rgba(255,255,0,0.8))'
                 }} 
            />
          </motion.div>
        )}

        {/* Active state glow */}
        {active && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            <div 
              className="w-full h-full rounded-sm"
              style={{
                background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
                filter: 'blur(4px)',
              }}
            />
          </motion.div>
        )}

        {/* Activity particles when active */}
        {active && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-[2px] h-[2px] bg-white rounded-full"
                style={{
                  left: '50%',
                  top: '20%',
                }}
                animate={{
                  y: [-5, -15, -25],
                  x: [(i - 1) * 8, (i - 1) * 12, (i - 1) * 8],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Name label */}
      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: selected ? 1 : 0.7 }}
      >
        <div className="bg-black/80 text-white text-[8px] px-1 py-[1px] border border-white/20 font-mono">
          {name.split(' ')[0]}
        </div>
      </motion.div>

      {/* Hover tooltip */}
      <motion.div
        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none z-50"
        initial={{ opacity: 0, y: 4 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="bg-[#ffffcc] text-black text-[8px] px-2 py-1 whitespace-nowrap win95-border font-bold">
          Click for status
        </div>
      </motion.div>
    </motion.div>
  );
}