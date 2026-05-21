'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TownSquare from './TownSquare';

interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  zIndex: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
}

export default function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'control', title: 'AgentVille Control Panel', x: 40, y: 40, width: 320, height: 240, minimized: false, zIndex: 10 },
    { id: 'town', title: 'Town Square - Live View', x: 400, y: 80, width: 420, height: 340, minimized: false, zIndex: 9 },
  ]);
  const [activeWindow, setActiveWindow] = useState('control');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '23:41:02', agent: 'SYSTEM', message: 'AgentVille 1996 initialized' },
    { id: '2', timestamp: '23:41:05', agent: 'KAREN', message: 'Research protocols loaded' },
    { id: '3', timestamp: '23:41:07', agent: 'CHAD', message: 'Execution engine ready' },
  ]);
  const [missionActive, setMissionActive] = useState(false);
  const zCounter = useRef(20);

  const bringToFront = (id: string) => {
    zCounter.current += 1;
    setWindows(w => w.map(win => 
      win.id === id ? { ...win, zIndex: zCounter.current } : win
    ));
    setActiveWindow(id);
  };

  const addLog = (agent: string, message: string) => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLogs(prev => [...prev.slice(-8), {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      agent: agent.toUpperCase(),
      message
    }]);
  };

  const launchMission = () => {
    if (missionActive) return;
    setMissionActive(true);
    
    addLog('SYSTEM', 'MISSION LAUNCH: Multi-agent research task initiated');
    
    setTimeout(() => {
      addLog('KAREN', 'Scanning knowledge base...');
    }, 600);
    
    setTimeout(() => {
      addLog('ALICE', 'Analyzing data patterns...');
    }, 1200);
    
    setTimeout(() => {
      addLog('CHAD', 'Executing code generation...');
    }, 1800);
    
    setTimeout(() => {
      addLog('BOB', 'Orchestrating final synthesis...');
    }, 2400);
    
    setTimeout(() => {
      addLog('SYSTEM', 'Mission complete. Results aggregated.');
      setMissionActive(false);
    }, 3200);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden crt select-none">
      {/* Desktop Icons */}
      <div className="absolute top-3 left-3 flex flex-col gap-4 z-10">
        {[
          { name: 'My Computer', icon: '💻' },
          { name: 'AgentVille.exe', icon: '🤖' },
          { name: 'Recycle Bin', icon: '🗑️' },
        ].map((item) => (
          <div key={item.name} className="flex flex-col items-center gap-1 cursor-pointer p-1 hover:bg-blue-900/30 w-16">
            <div className="text-[24px] leading-none">{item.icon}</div>
            <span className="text-white text-[10px] text-center leading-tight drop-shadow-[1px_1px_0px_black]">
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {/* Windows */}
      <AnimatePresence>
        {windows.filter(w => !w.minimized).map((win) => (
          <motion.div
            key={win.id}
            drag
            dragMomentum={false}
            dragElastic={0}
            initial={{ x: win.x, y: win.y, opacity: 0, scale: 0.95 }}
            animate={{ x: win.x, y: win.y, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              width: win.width, 
              height: win.height,
              zIndex: win.zIndex 
            }}
            className="absolute win95-window"
            onMouseDown={() => bringToFront(win.id)}
            onDragEnd={(_, info) => {
              setWindows(w => w.map(w2 => 
                w2.id === win.id 
                  ? { ...w2, x: w2.x + info.offset.x, y: w2.y + info.offset.y }
                  : w2
              ));
            }}
          >
            <div className={`win95-titlebar ${activeWindow === win.id ? '' : 'win95-titlebar-inactive'}`}>
              <span className="truncate px-1">{win.title}</span>
              <div className="flex gap-[2px] mr-[2px]">
                <button className="w-[14px] h-[12px] bg-[#c0c0c0] text-[8px] leading-none text-black flex items-center justify-center win95-border text-[9px]">_</button>
                <button className="w-[14px] h-[12px] bg-[#c0c0c0] text-[8px] leading-none text-black flex items-center justify-center win95-border">□</button>
                <button className="w-[14px] h-[12px] bg-[#c0c0c0] text-[8px] leading-none text-black flex items-center justify-center win95-border">×</button>
              </div>
            </div>
            
            <div className="h-[calc(100%-18px)] bg-[#c0c0c0] relative overflow-hidden">
              {win.id === 'control' && (
                <div className="p-2 h-full flex flex-col gap-2 text-[11px]">
                  <div className="win95-border-inset bg-white p-2 flex-1 overflow-hidden flex flex-col">
                    <div className="font-bold mb-1 border-b border-gray-400 pb-1">
                      ORCHESTRATION LOG
                    </div>
                    <div className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed">
                      {logs.map(log => (
                        <div key={log.id} className="flex gap-2">
                          <span className="text-gray-500">[{log.timestamp}]</span>
                          <span className="text-blue-800 font-bold min-w-[60px]">{log.agent}:</span>
                          <span className="text-black">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={launchMission}
                      disabled={missionActive}
                      className="win95-button flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {missionActive ? 'MISSION ACTIVE...' : 'LAUNCH MISSION'}
                    </button>
                    <button 
                      onClick={() => setLogs([])}
                      className="win95-button px-3"
                    >
                      CLEAR
                    </button>
                  </div>
                  
                  <div className="text-[9px] text-gray-700 text-center">
                    AgentVille 1996 v0.1 • 4 agents online • {missionActive ? 'BUSY' : 'IDLE'}
                  </div>
                </div>
              )}
              
              {win.id === 'town' && (
                <div className="relative w-full h-full bg-[#008080] flex items-center justify-center p-2">
                  <TownSquare />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="win95-taskbar">
        <button className="win95-start-button win95-border">
          <span className="text-[14px]">⊞</span>
          <span>Start</span>
        </button>
        <div className="flex-1 flex gap-[2px] ml-1">
          {windows.filter(w => !w.minimized).map(win => (
            <button
              key={win.id}
              onClick={() => bringToFront(win.id)}
              className={`h-[22px] px-2 text-[11px] truncate max-w-[140px] text-left ${
                activeWindow === win.id 
                  ? 'win95-border-inset' 
                  : 'win95-border'
              }`}
            >
              {win.title}
            </button>
          ))}
        </div>
        <div className="win95-border-inset px-2 h-[22px] flex items-center text-[10px] min-w-[70px] justify-center">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}