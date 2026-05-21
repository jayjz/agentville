'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Desktop() {
  const [windows] = useState([{ id: 1, title: 'AgentVille.exe', x: 100, y: 100 }]);
  return (
    <div className="w-screen h-screen relative overflow-hidden crt">
      <div className="absolute top-4 left-4 space-y-4">
        <div className="flex flex-col items-center cursor-pointer hover:bg-blue-900/20 p-2">
          <div className="w-8 h-8 bg-gray-400 border-2 border-white"></div>
          <span className="text-white text-xs mt-1">My Computer</span>
        </div>
      </div>
      {windows.map((win) => (
        <motion.div key={win.id} drag dragMomentum={false} initial={{ x: win.x, y: win.y }} className="absolute win95-window w-96">
          <div className="win95-titlebar">
            <span>{win.title}</span>
            <div className="flex gap-1">
              <button className="w-4 h-3 bg-gray-300 border text-black text-[8px]">_</button>
              <button className="w-4 h-3 bg-gray-300 border text-black text-[8px]">□</button>
              <button className="w-4 h-3 bg-gray-300 border text-black text-[8px]">×</button>
            </div>
          </div>
          <div className="p-4 bg-[#c0c0c0] text-black text-sm">
            <p>AgentVille 1996 - AI Orchestration Demo</p>
            <p className="mt-2 text-xs">Ready for sprite integration...</p>
          </div>
        </motion.div>
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1">
        <button className="h-6 px-2 bg-[#c0c0c0] border-2 border-white text-black text-xs font-bold">Start</button>
        <div className="ml-2 text-xs text-black">AgentVille 1996</div>
      </div>
    </div>
  );
}