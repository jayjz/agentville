'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NPC from './NPC';

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

const NPCS = [
  { id: 'karen', name: 'Researcher Karen', role: 'Research Agent', x: 15, y: 20, color: '#ff6b9d' },
  { id: 'chad', name: 'Coder Chad', role: 'Execution Agent', x: 75, y: 20, color: '#4ecdc4' },
  { id: 'alice', name: 'Analyst Alice', role: 'Analysis Agent', x: 15, y: 70, color: '#ffe66d' },
  { id: 'bob', name: 'Executor Bob', role: 'Orchestrator', x: 75, y: 70, color: '#a8dadc' },
];

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
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null);
  const [connections, setConnections] = useState<Array<{from: string, to: string}>>([]);
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
    setConnections([]);
    
    addLog('SYSTEM', 'MISSION LAUNCH: Multi-agent research task initiated');
    
    setTimeout(() => {
      addLog('KAREN', 'Scanning knowledge base...');
      setConnections([{from: 'karen', to: 'alice'}]);
    }, 600);
    
    setTimeout(() => {
      addLog('ALICE', 'Analyzing data patterns...');
      setConnections(prev => [...prev, {from: 'alice', to: 'chad'}]);
    }, 1200);
    
    setTimeout(() => {
      addLog('CHAD', 'Executing code generation...');
      setConnections(prev => [...prev, {from: 'chad', to: 'bob'}]);
    }, 1800);
    
    setTimeout(() => {
      addLog('BOB', 'Orchestrating final synthesis...');
      setConnections([
        {from: 'karen', to: 'bob'},
        {from: 'alice', to: 'bob'},
        {from: 'chad', to: 'bob'},
      ]);
    }, 2400);
    
    setTimeout(() => {
      addLog('SYSTEM', 'Mission complete. Results aggregated.');
      setMissionActive(false);
      setTimeout(() => setConnections([]), 2000);
    }, 3200);
  };

  const handleNPCClick = (npcId: string) => {
    setSelectedNPC(npcId);
    const npc = NPCS.find(n => n.id === npcId);
    if (npc) {
      addLog(npc.name.split(' ')[1].toUpperCase(), `Status check: ${npc.role} ready`);
    }
    setTimeout(() => setSelectedNPC(null), 3000);
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
                <div className="relative w-full h-full bg-[#2a4d3a] town-grid overflow-hidden">
                  {/* Pixel Town Background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-[#1a3a2a]" />
                    <div className="absolute top-[30%] left-[10%] w-8 h-12 bg-[#4a5d4a] win95-border" />
                    <div className="absolute top-[25%] right-[15%] w-10 h-16 bg-[#5a6d5a] win95-border" />
                    <div className="absolute bottom-[40%] left-[40%] w-16 h-8 bg-[#3a4a3a] win95-border" />
                  </div>

                  {/* Connection Lines SVG */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                    {connections.map((conn, idx) => {
                      const from = NPCS.find(n => n.id === conn.from);
                      const to = NPCS.find(n => n.id === conn.to);
                      if (!from || !to) return null;
                      return (
                        <g key={idx}>
                          <line
                            x1={`${from.x}%`}
                            y1={`${from.y}%`}
                            x2={`${to.x}%`}
                            y2={`${to.y}%`}
                            stroke="#00ff88"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                            className="pulse"
                            filter="url(#glow)"
                          />
                          <circle
                            cx={`${from.x}%`}
                            cy={`${from.y}%`}
                            r="3"
                            fill="#00ff88"
                            className="pulse"
                          />
                        </g>
                      );
                    })}
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                  </svg>

                  {/* NPCs */}
                  {NPCS.map(npc => (
                    <div
                      key={npc.id}
                      className="absolute"
                      style={{ 
                        left: `${npc.x}%`, 
                        top: `${npc.y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10
                      }}
                    >
                      <NPC
                        name={npc.name}
                        role={npc.role}
                        color={npc.color}
                        active={missionActive}
                        selected={selectedNPC === npc.id}
                        onClick={() => handleNPCClick(npc.id)}
                      />
                      {selectedNPC === npc.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                        >
                          <div className="bg-[#ffffe1] text-black text-[9px] px-2 py-1 win95-border max-w-[140px]">
                            <div className="font-bold">{npc.name}</div>
                            <div className="text-[8px] text-gray-700">{npc.role}</div>
                            <div className="mt-1 text-[8px]">
                              Status: {missionActive ? 'WORKING' : 'IDLE'}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}

                  {/* Mission Status Overlay */}
                  {missionActive && (
                    <div className="absolute top-2 left-2 right-2">
                      <div className="bg-black/80 text-[#00ff00] text-[9px] font-mono px-2 py-1 border border-[#00ff00]/50">
                        MISSION IN PROGRESS • AGENTS SYNCING...
                      </div>
                    </div>
                  )}
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