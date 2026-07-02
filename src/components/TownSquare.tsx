'use client';
/**
 * TownSquare.tsx - Fixed for demo
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Application, Container, Graphics, Text, TextStyle, FederatedPointerEvent } from 'pixi.js';

// ---------------------------------------------------------------------------
// Self-contained types
// ---------------------------------------------------------------------------
export type AgentStatus = 'idle' | 'working' | 'talking' | 'sleeping' | 'walking';

interface TownSquareProps {
  agents?: any[];
  stations?: any[];
  onAgentClick?: (agent: any) => void;
  onStationClick?: (station: any) => void;
}

interface SelectedEntity {
  kind: 'agent' | 'station';
  id: string;
}

interface ScreenTag {
  id: string;
  x: number;
  y: number;
  label: string;
}

const CANVAS_W = 800;
const CANVAS_H = 500;
const AGENT_RADIUS = 10;
const TAG_SYNC_INTERVAL_MS = 100;

const STATUS_EMOJI: Record<AgentStatus, string> = {
  idle: '🙂',
  working: '⚙️',
  talking: '💬',
  sleeping: '💤',
  walking: '🚶',
};

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------
function buildStation(station: any): Container {
  const root = new Container();
  root.label = `station-${station.id}`;
  root.position.set(station.x, station.y);
  root.eventMode = 'static';
  root.cursor = 'pointer';

  const base = new Graphics();
  base.label = 'base';
  base.roundRect(0, 0, station.width, station.height, 6)
    .fill({ color: station.color, alpha: 1 })
    .stroke({ width: 2, color: 0x2b2b2b, alpha: 0.6 });
  root.addChild(base);

  const glow = new Graphics();
  glow.label = 'glow';
  glow.roundRect(-4, -4, station.width + 8, station.height + 8, 9)
    .fill({ color: 0xffe066, alpha: 0 });
  root.addChild(glow);

  const icon = new Text({
    text: station.icon,
    style: new TextStyle({ fontSize: 22 }),
  });
  icon.label = 'icon';
  icon.anchor.set(0.5);
  icon.position.set(station.width / 2, station.height / 2 - 6);
  root.addChild(icon);

  const nameLabel = new Text({
    text: station.name,
    style: new TextStyle({ fontSize: 10, fill: 0x2b2b2b, fontFamily: 'monospace' }),
  });
  nameLabel.label = 'nameLabel';
  nameLabel.anchor.set(0.5, 0);
  nameLabel.position.set(station.width / 2, station.height - 14);
  root.addChild(nameLabel);

  const progressBg = new Graphics();
  progressBg.label = 'progressBg';
  progressBg.roundRect(4, station.height + 2, station.width - 8, 5, 2)
    .fill({ color: 0x1a1a1a, alpha: 0.25 });
  root.addChild(progressBg);

  const progressBar = new Graphics();
  progressBar.label = 'progressBar';
  const barWidth = Math.max(0, (station.width - 8) * clamp01(station.progress || 0));
  progressBar.roundRect(4, station.height + 2, barWidth, 5, 2)
    .fill({ color: 0x4caf50, alpha: 0.9 });
  root.addChild(progressBar);

  const statusLight = new Graphics();
  statusLight.label = 'statusLight';
  statusLight.circle(station.width - 8, 8, 4)
    .fill({ color: station.active ? 0x4caf50 : 0x9e9e9e });
  root.addChild(statusLight);

  return root;
}

function updateStationWork(root: Container, station: any, glowPhase: number) {
  const glow = root.getChildByLabel('glow') as Graphics | null;
  if (glow) {
    const alpha = station.active ? 0.15 + 0.15 * Math.sin(glowPhase) : 0;
    glow.alpha = alpha;
  }

  const progressBar = root.getChildByLabel('progressBar') as Graphics | null;
  if (progressBar) {
    const barWidth = Math.max(0, (station.width - 8) * clamp01(station.progress || 0));
    progressBar.clear();
    progressBar.roundRect(4, station.height + 2, barWidth, 5, 2)
      .fill({ color: 0x4caf50, alpha: 0.9 });
  }

  const statusLight = root.getChildByLabel('statusLight') as Graphics | null;
  if (statusLight) {
    statusLight.clear();
    statusLight.circle(station.width - 8, 8, 4)
      .fill({ color: station.active ? 0x4caf50 : 0x9e9e9e });
  }
}

function buildAgent(agent: any): Container {
  const root = new Container();
  root.label = `agent-${agent.id}`;
  root.position.set(agent.x, agent.y);
  root.eventMode = 'static';
  root.cursor = 'pointer';

  const shadow = new Graphics();
  shadow.label = 'shadow';
  shadow.ellipse(0, AGENT_RADIUS * 1.8, AGENT_RADIUS * 0.9, AGENT_RADIUS * 0.35)
    .fill({ color: 0x000000, alpha: 0.2 });
  root.addChild(shadow);

  const body = new Graphics();
  body.label = 'body';
  body.roundRect(-AGENT_RADIUS * 0.7, 0, AGENT_RADIUS * 1.4, AGENT_RADIUS * 1.6, 4)
    .fill({ color: agent.color })
    .stroke({ width: 1.5, color: 0x2b2b2b, alpha: 0.5 });
  root.addChild(body);

  const head = new Graphics();
  head.label = 'head';
  head.circle(0, -AGENT_RADIUS * 0.4, AGENT_RADIUS)
    .fill({ color: 0xffe0bd })
    .stroke({ width: 1.5, color: 0x2b2b2b, alpha: 0.5 });
  root.addChild(head);

  const initials = new Text({
    text: agent.name.slice(0, 2).toUpperCase(),
    style: new TextStyle({ fontSize: 8, fill: 0x2b2b2b, fontWeight: 'bold' }),
  });
  initials.label = 'initials';
  initials.anchor.set(0.5);
  initials.position.set(0, -AGENT_RADIUS * 0.4);
  root.addChild(initials);

  return root;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TownSquare({
  agents = [],
  stations = [],
  onAgentClick,
  onStationClick,
}: TownSquareProps) {
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const worldRef = useRef<Container | null>(null);
  const agentNodesRef = useRef<Map<string, Container>>(new Map());
  const stationNodesRef = useRef<Map<string, Container>>(new Map());
  const agentsRef = useRef<any[]>(agents);
  const stationsRef = useRef<any[]>(stations);
  const [selected, setSelected] = useState<SelectedEntity | null>(null);
  const [tags, setTags] = useState<ScreenTag[]>([]);

  useEffect(() => { agentsRef.current = agents; }, [agents]);
  useEffect(() => { stationsRef.current = stations; }, [stations]);

  const handleAgentSelect = useCallback((agent: any) => {
    setSelected({ kind: 'agent', id: agent.id });
    onAgentClick?.(agent);
  }, [onAgentClick]);

  const handleStationSelect = useCallback((station: any) => {
    setSelected({ kind: 'station', id: station.id });
    onStationClick?.(station);
  }, [onStationClick]);

    // Pixi setup
  useEffect(() => {
    let destroyed = false;
    const app = new Application();

    const initPixi = async () => {
      try {
        await app.init({
          width: CANVAS_W,
          height: CANVAS_H,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
        });

        if (destroyed || !canvasHostRef.current) {
          app.destroy(true, { children: true });
          return;
        }

        // Clear previous content and append canvas
        canvasHostRef.current.innerHTML = '';
        canvasHostRef.current.appendChild(app.canvas as HTMLCanvasElement);

        appRef.current = app;

        const world = new Container();
        world.label = 'world';
        app.stage.addChild(world);
        worldRef.current = world;

        // Build stations
        const stationLayer = new Container();
        stationLayer.label = 'stationLayer';
        world.addChild(stationLayer);

        for (const station of stationsRef.current) {
          const node = buildStation(station);
          node.on('pointerdown', (e: FederatedPointerEvent) => {
            e.stopPropagation();
            const latest = stationsRef.current.find((s: any) => s.id === station.id);
            if (latest) handleStationSelect(latest);
          });
          stationLayer.addChild(node);
          stationNodesRef.current.set(station.id, node);
        }

        // Build agents
        const agentLayer = new Container();
        agentLayer.label = 'agentLayer';
        world.addChild(agentLayer);

        for (const agent of agentsRef.current) {
          const node = buildAgent(agent);
          node.on('pointerdown', (e: FederatedPointerEvent) => {
            e.stopPropagation();
            const latest = agentsRef.current.find((a: any) => a.id === agent.id);
            if (latest) handleAgentSelect(latest);
          });
          agentLayer.addChild(node);
          agentNodesRef.current.set(agent.id, node);
        }

        // Ticker
        let elapsed = 0;
        app.ticker.add((ticker) => {
          elapsed += ticker.deltaMS / 1000;

          for (const agent of agentsRef.current) {
            const node = agentNodesRef.current.get(agent.id);
            if (!node) continue;
            const bobAmount = agent.status === 'walking' ? 3 : 1.2;
            const bobSpeed = agent.status === 'sleeping' ? 1.2 : 2.4;
            node.y = agent.y + Math.sin(elapsed * bobSpeed + hashSeed(agent.id)) * bobAmount;
          }

          for (const station of stationsRef.current) {
            const node = stationNodesRef.current.get(station.id);
            if (!node) continue;
            updateStationWork(node, station, elapsed * 3 + hashSeed(station.id));
          }
        });
      } catch (error) {
        console.error("PixiJS initialization failed:", error);
      }
    };

    initPixi();

    return () => {
      destroyed = true;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      agentNodesRef.current.clear();
      stationNodesRef.current.clear();
      worldRef.current = null;
    };
  }, [handleAgentSelect, handleStationSelect]);

  // Sync positions
  useEffect(() => {
    for (const agent of agents) {
      const node = agentNodesRef.current.get(agent.id);
      if (!node) continue;
      node.x = agent.x;
    }
  }, [agents]);

    // Status tags useEffect (your existing one)
  useEffect(() => {
    const interval = window.setInterval(() => {
      const app = appRef.current;
      if (!app) return;
      const nextTags: ScreenTag[] = [];
      for (const agent of agentsRef.current) {
        const node = agentNodesRef.current.get(agent.id);
        if (!node) continue;
        const globalPos = node.getGlobalPosition();
        nextTags.push({
          id: agent.id,
          x: globalPos.x,
          y: globalPos.y - AGENT_RADIUS * 2.6,
          label: `${initialsFor(agent.name)}: ${STATUS_EMOJI[agent.status as AgentStatus] || '❓'}`,
        });
      }
      setTags(nextTags);
    }, TAG_SYNC_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  // Calculate dialogue entry - MUST be inside the function before return
  const dialogueEntry = getDialogueEntry(selected, agents, stations);

  return (
    <div
      className="town-square-root"
      style={{
        position: 'relative',
        width: CANVAS_W,
        height: CANVAS_H + 90,
      }}
    >
      {/* Canvas Container */}
      <div
        ref={canvasHostRef}
        className="town-square-canvas-host"
        style={{
          position: 'relative',
          width: CANVAS_W,
          height: CANVAS_H,
          overflow: 'hidden',
          background: '#008080',
        }}
      >
        {/* Loading indicator */}
        {tags.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontSize: '18px',
              fontFamily: 'monospace',
              zIndex: 10,
            }}
          >
            Loading Town Square...
          </div>
        )}

        {/* Status Tags */}
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="town-square-status-tag"
            style={{
              position: 'absolute',
              left: tag.x,
              top: tag.y,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              background: '#ffffff',
              border: '1px solid #2b2b2b',
              borderRadius: 3,
              padding: '1px 5px',
              fontFamily: 'monospace',
              fontSize: 11,
              whiteSpace: 'nowrap',
              boxShadow: '1px 1px 0 rgba(0,0,0,0.25)',
              zIndex: 20,
            }}
          >
            {tag.label}
          </div>
        ))}
      </div>

      {/* Win95 Dialogue Panel */}
      <div
        className="town-square-dialogue-panel"
        style={{
          marginTop: 6,
          height: 84,
          background: '#c0c0c0',
          border: '2px solid #808080',
          borderTopColor: '#ffffff',
          borderLeftColor: '#ffffff',
          borderRightColor: '#404040',
          borderBottomColor: '#404040',
          padding: 8,
          fontFamily: 'monospace',
          fontSize: 13,
          color: '#000000',
          overflowY: 'auto',
        }}
      >
        {dialogueEntry ? (
          <>
            <strong>
              [{dialogueEntry.name}] ({dialogueEntry.role})
            </strong>{' '}
            — {dialogueEntry.detail}
          </>
        ) : (
          <span style={{ color: '#555' }}>
            Click an agent or station to see details here.
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function initialsFor(name: string): string {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000;
  return h / 1000;
}

interface DialogueEntry {
  name: string;
  role: string;
  detail: string;
}

function getDialogueEntry(selected: SelectedEntity | null, agents: any[], stations: any[]): DialogueEntry | null {
  if (!selected) return null;

  if (selected.kind === 'agent') {
    const agent = agents.find((a: any) => a.id === selected.id);
    if (!agent) return null;
    return {
      name: agent.name,
      role: agent.role || 'Agent',
      detail: agent.currentLine || `status: ${agent.status}`,
    };
  }

  const station = stations.find((s: any) => s.id === selected.id);
  if (!station) return null;

  return {
    name: station.name,
    role: 'station',
    detail: station.active ? `in use — ${Math.round((station.progress || 0) * 100)}%` : 'idle',
  };
}