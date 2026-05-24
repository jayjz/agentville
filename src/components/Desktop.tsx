'use client';
import { useState, useRef, useEffect } from 'react';
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
  maximized: boolean;
  zIndex: number;
  prevState?: { x: number; y: number; width: number; height: number };
}

interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  action: () => void;
}

export default function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>([
    { 
      id: 'control', 
      title: 'AgentVille Control Panel', 
      x: 60, 
      y: 50, 
      width: 360, 
      height: 280, 
      minimized: false, 
      maximized: false,
      zIndex: 10 
    },
    { 
      id: 'town', 
      title: 'Town Square - Live View', 
      x: 460, 
      y: 90, 
      width: 480, 
      height: 380, 
      minimized: false,
      maximized: false,
      zIndex: 9 
    },
  ]);
  
  const [activeWindow, setActiveWindow] = useState('control');
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '23:41:02', agent: 'SYSTEM', message: 'AgentVille 1996 initialized successfully', type: 'success' },
    { id: '2', timestamp: '23:41:05', agent: 'KAREN', message: 'Research protocols loaded (4 modules)', type: 'info' },
    { id: '3', timestamp: '23:41:07', agent: 'CHAD', message: 'Execution engine ready', type: 'success' },
    { id: '4', timestamp: '23:41:09', agent: 'ALICE', message: 'Analysis pipeline online', type: 'info' },
    { id: '5', timestamp: '23:41:11', agent: 'BOB', message: 'Orchestrator standing by', type: 'info' },
  ]);
  const [missionActive, setMissionActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const zCounter = useRef(20);
  const startMenuRef = useRef<HTMLDivElement>(null);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close start menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('.win95-start-button')) {
          setShowStartMenu(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const bringToFront = (id: string) => {
    zCounter.current += 1;
    setWindows(w => w.map(win => 
      win.id === id ? { ...win, zIndex: zCounter.current, minimized: false } : win
    ));
    setActiveWindow(id);
  };

  const toggleMinimize = (id: string) => {
    setWindows(w => w.map(win => 
      win.id === id ? { ...win, minimized: !win.minimized } : win
    ));
  };

  const toggleMaximize = (id: string) => {
    setWindows(w => w.map(win => {
      if (win.id !== id) return win;
      
      if (win.maximized && win.prevState) {
        return { 
          ...win, 
          maximized: false,
          x: win.prevState.x,
          y: win.prevState.y,
          width: win.prevState.width,
          height: win.prevState.height,
          prevState: undefined
        };
      } else {
        return {
          ...win,
          maximized: true,
          prevState: { x: win.x, y: win.y, width: win.width, height: win.height },
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight - 30,
        };
      }
    }));
    bringToFront(id);
  };

  const closeWindow = (id: string) => {
    setWindows(w => w.filter(win => win.id !== id));
  };

  const addLog = (agent: string, message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLogs(prev => [...prev.slice(-12), {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      agent: agent.toUpperCase(),
      message,
      type
    }]);
  };

  const launchMission = () => {
    if (missionActive) return;
    setMissionActive(true);
    
    const av = (window as any).__agentville;
    
    addLog('SYSTEM', '╔══════════════════════════════════════╗', 'warning');
    addLog('SYSTEM', '║  OSINT RECONNAISSANCE MISSION       ║', 'warning');
    addLog('SYSTEM', '║  Target: openclaw.ai infrastructure  ║', 'warning');
    addLog('SYSTEM', '╚══════════════════════════════════════╝', 'warning');
    addLog('SYSTEM', '', 'info');
    
    // Phase 1: Deployment
    setTimeout(() => {
      addLog('BOB', '→ Deploying agent swarm to target zone', 'info');
      if (av) {
        av.setAgentStatus('bob', 'working');
        av.activateBuilding(3, true);
      }
    }, 300);

    // Phase 2: Karen - Research Lab
    setTimeout(() => {
      addLog('KAREN', '→ Moving to RESEARCH LAB', 'info');
      if (av) {
        av.moveAgent('karen', 80, 70, 'moving');
        av.activateBuilding(0, true);
      }
    }, 600);
    
    setTimeout(() => {
      addLog('KAREN', '✓ Scanning public repositories and documentation', 'info');
      if (av) av.setAgentStatus('karen', 'working');
    }, 1100);
    
    setTimeout(() => {
      addLog('KAREN', '✓ Found 47 public repos, 12 documentation sites', 'success');
      addLog('KAREN', '✓ Extracted tech stack: Next.js, TypeScript, Tailwind', 'success');
    }, 1800);

    // Phase 3: Mallory - OSINT
    setTimeout(() => {
      addLog('MALLORY', '→ Deploying to INTEL CENTER', 'info');
      if (av) {
        av.moveAgent('mallory', 310, 365, 'moving');
        av.activateBuilding(5, true);
      }
    }, 1400);
    
    setTimeout(() => {
      addLog('MALLORY', '→ Querying Shodan, Censys, public DNS records', 'info');
      if (av) av.setAgentStatus('mallory', 'working');
    }, 2100);
    
    setTimeout(() => {
      addLog('MALLORY', '✓ Discovered 3 public IPs, 8 subdomains', 'success');
      addLog('MALLORY', '✓ SSL cert valid until 2026-11-14', 'success');
    }, 2800);

    // Phase 4: Eve - Security Analysis
    setTimeout(() => {
      addLog('EVE', '→ Moving to SECURE FACILITY', 'info');
      if (av) {
        av.moveAgent('eve', 310, 50, 'moving');
        av.activateBuilding(4, true);
      }
    }, 2000);
    
    setTimeout(() => {
      addLog('EVE', '→ Analyzing attack surface and vulnerabilities', 'info');
      if (av) av.setAgentStatus('eve', 'working');
    }, 2700);
    
    setTimeout(() => {
      addLog('EVE', '⚠ Found exposed /.git directory (INFO)', 'warning');
      addLog('EVE', '✓ No critical vulnerabilities detected', 'success');
    }, 3400);

    // Phase 5: Alice - Data Analysis
    setTimeout(() => {
      addLog('ALICE', '→ Proceeding to ANALYTICS HUB', 'info');
      if (av) {
        av.moveAgent('alice', 90, 345, 'moving');
        av.activateBuilding(2, true);
      }
    }, 2400);
    
    setTimeout(() => {
      addLog('ALICE', '→ Correlating findings, building attack graph', 'info');
      if (av) av.setAgentStatus('alice', 'working');
    }, 3100);
    
    setTimeout(() => {
      addLog('ALICE', '✓ Mapped 12 potential entry points', 'success');
      addLog('ALICE', '✓ Identified 3 high-value targets', 'success');
    }, 3800);

    // Phase 6: Chad - Execution
    setTimeout(() => {
      addLog('CHAD', '→ Moving to EXECUTION BAY', 'info');
      if (av) {
        av.moveAgent('chad', 535, 70, 'moving');
        av.activateBuilding(1, true);
      }
    }, 3000);
    
    setTimeout(() => {
      addLog('CHAD', '→ Generating proof-of-concept exploits', 'info');
      if (av) av.setAgentStatus('chad', 'working');
    }, 3700);
    
    setTimeout(() => {
      addLog('CHAD', '✓ PoC ready: Git exposure → source leak', 'success');
      addLog('CHAD', '✓ Estimated impact: LOW (public info only)', 'info');
    }, 4400);

    // Phase 7: Bob - Synthesis
    setTimeout(() => {
      addLog('BOB', '→ Consolidating all agent findings', 'info');
      if (av) {
        av.moveAgent('karen', 200, 200, 'moving');
        av.moveAgent('mallory', 250, 200, 'moving');
        av.moveAgent('eve', 300, 200, 'moving');
        av.moveAgent('alice', 350, 200, 'moving');
        av.moveAgent('chad', 400, 200, 'moving');
        av.moveAgent('bob', 310, 230, 'moving');
      }
    }, 4600);
    
    setTimeout(() => {
      addLog('BOB', '→ Generating final reconnaissance report', 'info');
      if (av) av.setAgentStatus('bob', 'working');
    }, 5200);

    // Phase 8: Complete
    setTimeout(() => {
      addLog('SYSTEM', '', 'info');
      addLog('SYSTEM', '╔══════════════════════════════════════╗', 'success');
      addLog('SYSTEM', '║  MISSION COMPLETE                    ║', 'success');
      addLog('SYSTEM', '╠══════════════════════════════════════╣', 'success');
      addLog('SYSTEM', '║  Duration: 5.8s                      ║', 'success');
      addLog('SYSTEM', '║  Agents deployed: 6/6                ║', 'success');
      addLog('SYSTEM', '║  Data points collected: 1,247        ║', 'success');
      addLog('SYSTEM', '║  Risk level: LOW                     ║', 'success');
      addLog('SYSTEM', '║  Next action: Generate PDF report    ║', 'success');
      addLog('SYSTEM', '╚══════════════════════════════════════╝', 'success');
      
      if (av) {
        [0, 1, 2, 3, 4, 5].forEach(i => av.activateBuilding(i, false));
        ['karen', 'chad', 'alice', 'bob', 'eve', 'mallory'].forEach(id => {
          av.setAgentStatus(id, 'idle');
        });
        setTimeout(() => {
          av.moveAgent('karen', 110, 160, 'idle');
          av.moveAgent('chad', 235, 130, 'idle');
          av.moveAgent('alice', 360, 165, 'idle');
          av.moveAgent('bob', 485, 135, 'idle');
          av.moveAgent('eve', 175, 285, 'idle');
          av.moveAgent('mallory', 425, 290, 'idle');
        }, 2000);
      }
      
      setMissionActive(false);
    }, 5800);
  };

  const desktopIcons: DesktopIcon[] = [
    { 
      id: 'computer', 
      name: 'My Computer', 
      icon: '💻', 
      x: 12, 
      y: 12,
      action: () => addLog('SYSTEM', 'My Computer opened', 'info')
    },
    { 
      id: 'agentville', 
      name: 'AgentVille.exe', 
      icon: '🤖', 
      x: 12, 
      y: 90,
      action: () => {
        addLog('SYSTEM', 'AgentVille.exe launched', 'success');
        bringToFront('control');
      }
    },
    { 
      id: 'network', 
      name: 'Network\nNeighborhood', 
      icon: '🌐', 
      x: 12, 
      y: 168,
      action: () => addLog('SYSTEM', 'Network Neighborhood - 4 agents online', 'info')
    },
    { 
      id: 'recycle', 
      name: 'Recycle Bin', 
      icon: '🗑️', 
      x: 12, 
      y: 246,
      action: () => addLog('SYSTEM', 'Recycle Bin is empty', 'info')
    },
  ];

  const handleIconDoubleClick = (icon: DesktopIcon) => {
    icon.action();
    setSelectedIcon(null);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden crt-monitor crt-scanlines crt-phosphor crt-noise crt-chroma select-none">
      {/* Desktop Background Pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: '#008080',
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px)`,
        }}
      />

      {/* Desktop Icons */}
      <div className="absolute inset-0 z-10">
        {desktopIcons.map((icon) => (
          <div
            key={icon.id}
            className="absolute desktop-icon"
            style={{ left: icon.x, top: icon.y }}
            onClick={() => setSelectedIcon(icon.id)}
            onDoubleClick={() => handleIconDoubleClick(icon)}
          >
            <div className="desktop-icon-image">
              {icon.icon}
            </div>
            <div className={`desktop-icon-label ${selectedIcon === icon.id ? 'selected' : ''}`}>
              {icon.name.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Windows */}
      <AnimatePresence>
        {windows.filter(w => !w.minimized).map((win) => (
          <motion.div
            key={win.id}
            drag={!win.maximized}
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ 
              x: win.x, 
              y: win.y, 
              opacity: 1, 
              scale: 1,
              transition: { duration: 0.12, ease: [0.2, 0, 0, 1] }
            }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
            style={{ 
              width: win.width, 
              height: win.height,
              zIndex: win.zIndex,
              position: 'absolute',
            }}
            className="win95-window"
            onMouseDown={() => bringToFront(win.id)}
            onDragEnd={(_, info) => {
              if (!win.maximized) {
                setWindows(w => w.map(w2 => 
                  w2.id === win.id 
                    ? { ...w2, x: Math.max(0, w2.x + info.offset.x), y: Math.max(0, w2.y + info.offset.y) }
                    : w2
                ));
              }
            }}
          >
            {/* Title Bar */}
            <div 
              className={`win95-titlebar ${activeWindow === win.id ? '' : 'win95-titlebar-inactive'}`}
              style={{ cursor: win.maximized ? 'default' : 'move' }}
            >
              <div className="win95-titlebar-text">
                <span className="mr-1">
                  {win.id === 'control' ? '⚙' : '🏘'}
                </span>
                {win.title}
              </div>
              <div className="flex">
                <button 
                  className="win95-title-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMinimize(win.id);
                  }}
                  aria-label="Minimize"
                >
                  <span className="win95-btn-minimize" />
                </button>
                <button 
                  className="win95-title-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMaximize(win.id);
                  }}
                  aria-label={win.maximized ? "Restore" : "Maximize"}
                >
                  <span className={win.maximized ? "text-[7px]" : "win95-btn-maximize"} style={win.maximized ? { fontSize: '8px', lineHeight: '1' } : {}}>
                    {win.maximized ? "❐" : ""}
                  </span>
                </button>
                <button 
                  className="win95-title-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(win.id);
                  }}
                  aria-label="Close"
                >
                  <span className="win95-btn-close" />
                </button>
              </div>
            </div>
            
            {/* Window Content */}
            <div className="absolute inset-[20px_3px_3px_3px] bg-[#c0c0c0] overflow-hidden">
              <div className="w-full h-full win95-border-inset bg-[#c0c0c0] p-[2px]">
                {win.id === 'control' && (
                  <div className="w-full h-full flex flex-col gap-[3px] text-[11px] bg-[#c0c0c0]">
                    {/* Menu Bar */}
                    <div className="flex gap-[1px] text-[11px] h-[18px] items-center px-[2px] select-none">
                      {['File', 'Edit', 'View', 'Help'].map(item => (
                        <span 
                          key={item}
                          className="px-[6px] py-[1px] hover:bg-[#000080] hover:text-white cursor-default"
                        >
                          <u>{item[0]}</u>{item.slice(1)}
                        </span>
                      ))}
                    </div>

                    {/* Log Display */}
                    <div className="flex-1 win95-border-inset bg-white relative overflow-hidden">
                      <div className="absolute inset-[2px] overflow-hidden bg-white">
                        <div className="h-full overflow-y-auto overflow-x-hidden p-[3px] font-mono text-[10px] leading-[13px] bg-white">
                          <div className="sticky top-0 bg-white z-10 pb-[2px] mb-[2px] border-b border-[#808080] flex gap-[8px] text-[#808080]">
                            <span className="w-[56px]">TIME</span>
                            <span className="w-[48px]">AGENT</span>
                            <span className="flex-1">MESSAGE</span>
                          </div>
                          {logs.map(log => (
                            <div key={log.id} className="flex gap-[8px] hover:bg-[#d6e7ff] cursor-default">
                              <span className="text-[#808080] w-[56px] shrink-0 tabular-nums">
                                {log.timestamp}
                              </span>
                              <span 
                                className="w-[48px] shrink-0 font-bold truncate"
                                style={{
                                  color: log.type === 'error' ? '#cc0000' 
                                    : log.type === 'success' ? '#008000'
                                    : log.type === 'warning' ? '#ff8000'
                                    : '#000080'
                                }}
                              >
                                {log.agent}
                              </span>
                              <span className="flex-1 text-black break-words">
                                {log.message}
                              </span>
                            </div>
                          ))}
                          <div className="h-[2px]" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Bar */}
                    <div className="h-[18px] flex gap-[2px]">
                      <div className="flex-1 win95-border-inset bg-[#c0c0c0] flex items-center px-[4px] text-[10px]">
                        <span className="flex items-center gap-[4px]">
                          <span className={`inline-block w-[8px] h-[8px] rounded-full ${missionActive ? 'bg-[#00ff00] animate-pulse' : 'bg-[#808080]'}`} />
                          {missionActive ? 'MISSION ACTIVE' : 'SYSTEM IDLE'}
                        </span>
                      </div>
                      <div className="w-[80px] win95-border-inset bg-[#c0c0c0] flex items-center justify-center text-[10px]">
                        {logs.length} events
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-[4px] pt-[1px]">
                      <button 
                        onClick={launchMission}
                        disabled={missionActive}
                        className="win95-button flex-1 h-[23px] text-[11px] font-bold disabled:opacity-60 disabled:cursor-default"
                      >
                        {missionActive ? (
                          <span className="flex items-center justify-center gap-[4px]">
                            <span className="inline-block w-[8px] h-[8px] bg-[#ff8000] animate-pulse" />
                            EXECUTING...
                          </span>
                        ) : (
                          '▶ Launch Mission'
                        )}
                      </button>
                      <button 
                        onClick={() => setLogs([])}
                        className="win95-button w-[60px] h-[23px] text-[11px]"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
                
                {win.id === 'town' && (
                  <div className="w-full h-full bg-[#008080] relative overflow-hidden">
                    <div className="absolute inset-[2px] win95-border-inset bg-[#008080] overflow-hidden">
                      <TownSquare />
                      
                      {/* Overlay Info */}
                      <div className="absolute top-[4px] left-[4px] right-[4px] flex justify-between pointer-events-none">
                        <div className="bg-black/70 text-[#00ff00] text-[9px] px-[4px] py-[2px] font-mono border border-[#00ff00]/30">
                          AGENTVILLE • POP: 4 • STATUS: ONLINE
                        </div>
                        <div className="bg-black/70 text-white text-[9px] px-[4px] py-[2px] font-mono border border-white/20">
                          {currentTime.toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Bottom HUD */}
                      <div className="absolute bottom-[4px] left-[4px] right-[4px] pointer-events-none">
                        <div className="bg-black/80 text-white text-[8px] px-[5px] py-[3px] font-mono border border-white/20 inline-block">
                          <span className="text-[#ffff00]">●</span> LIVE • 
                          <span className="text-[#00ffff] ml-[6px]">4 agents active</span> • 
                          <span className="text-[#ff00ff] ml-[6px]">0.3ms latency</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resize Handle */}
            {!win.maximized && (
              <div className="absolute bottom-[3px] right-[3px] w-[12px] h-[12px] cursor-nwse-resize opacity-60 hover:opacity-100 transition-opacity">
                <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#808080]">
                  <path d="M0 12 L12 0 M2 12 L12 2 M4 12 L12 4" stroke="currentColor" strokeWidth="1" fill="none" />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Start Menu */}
      <AnimatePresence>
        {showStartMenu && (
          <motion.div
            ref={startMenuRef}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.2, 0, 0, 1] }}
            className="start-menu"
          >
            <div className="start-menu-sidebar">
              <div className="start-menu-sidebar-text">
                Windows95
              </div>
            </div>
            <div className="start-menu-items">
              {[
                { icon: '📁', label: 'Programs', hasArrow: true },
                { icon: '📄', label: 'Documents', hasArrow: true },
                { icon: '⚙️', label: 'Settings', hasArrow: true },
                { divider: true },
                { icon: '🔍', label: 'Find' },
                { icon: '❓', label: 'Help' },
                { icon: '🏃', label: 'Run...' },
                { divider: true },
                { icon: '⏻', label: 'Shut Down...' },
              ].map((item, i) => 
                item.divider ? (
                  <div key={i} className="start-menu-separator" />
                ) : (
                  <div key={item.label} className="start-menu-item group">
                    <div className="start-menu-item-icon">{item.icon}</div>
                    <span className="flex-1">{item.label}</span>
                    {item.hasArrow && (
                      <span className="text-[10px] mr-[2px] opacity-60 group-hover:opacity-100">▶</span>
                    )}
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="win95-taskbar">
        <button 
          className={`win95-start-button ${showStartMenu ? 'active' : ''}`}
          onClick={() => setShowStartMenu(!showStartMenu)}
          aria-expanded={showStartMenu}
        >
          <span className="text-[13px] leading-none">⊞</span>
          <span className="tracking-tight">Start</span>
        </button>
        
        <div className="h-[22px] w-[2px] bg-[#808080] mx-[2px] shadow-[1px_0_0_white]" />
        
        <div className="flex-1 flex gap-[2px] h-full items-center min-w-0 px-[2px]">
          {windows.map(win => (
            <button
              key={win.id}
              onClick={() => {
                if (win.minimized || activeWindow !== win.id) {
                  bringToFront(win.id);
                } else {
                  toggleMinimize(win.id);
                }
              }}
              className={`win95-taskbar-button ${
                activeWindow === win.id && !win.minimized ? 'active' : ''
              }`}
              title={win.title}
            >
              <span className="truncate">
                {win.id === 'control' ? '⚙' : '🏘'} {win.title}
              </span>
            </button>
          ))}
        </div>

        <div className="win95-tray">
          <span className="text-[10px] tabular-nums">
            {currentTime.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </span>
        </div>
      </div>

      {/* Click outside to deselect icons */}
      <div 
        className="fixed inset-0 -z-10"
        onClick={() => setSelectedIcon(null)}
      />
    </div>
  );
}