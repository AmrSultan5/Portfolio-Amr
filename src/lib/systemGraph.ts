/**
 * An interactive model of a production LLM system.
 *
 * Traffic pulses flow ingress -> router -> a model tier -> retrieval/guardrails
 * -> response. Clicking a node takes it offline; pathfinding then routes around
 * it and the node recovers after a few seconds. The redundancy is the point:
 * the graph is built so that no single node can sever ingress from response.
 *
 * Deliberately not a generic particle field — every node and edge means
 * something, and the one interaction available (break it) is the argument the
 * hero is making.
 */

export interface SystemGraphHandle {
  dispose: () => void;
}

interface NodeSpec {
  id: string;
  label: string;
  /** Normalised layout position, 0..1. */
  x: number;
  y: number;
  kind: 'edge' | 'router' | 'model' | 'service';
}

const NODES: NodeSpec[] = [
  { id: 'ingress', label: 'request', x: 0.06, y: 0.5, kind: 'edge' },
  { id: 'router', label: 'router', x: 0.27, y: 0.5, kind: 'router' },
  { id: 'haiku', label: 'haiku', x: 0.5, y: 0.17, kind: 'model' },
  { id: 'sonnet', label: 'sonnet', x: 0.5, y: 0.5, kind: 'model' },
  { id: 'opus', label: 'opus', x: 0.5, y: 0.83, kind: 'model' },
  { id: 'retrieval', label: 'retrieval', x: 0.73, y: 0.32, kind: 'service' },
  { id: 'guard', label: 'guardrails', x: 0.73, y: 0.68, kind: 'service' },
  { id: 'response', label: 'response', x: 0.94, y: 0.5, kind: 'edge' },
];

const EDGES: [string, string][] = [
  ['ingress', 'router'],
  ['router', 'haiku'],
  ['router', 'sonnet'],
  ['router', 'opus'],
  ['haiku', 'retrieval'],
  ['sonnet', 'retrieval'],
  ['opus', 'retrieval'],
  ['haiku', 'guard'],
  ['sonnet', 'guard'],
  ['opus', 'guard'],
  ['retrieval', 'response'],
  ['guard', 'response'],
];

/** Nodes the user cannot kill — without them there is no story to tell. */
const PROTECTED = new Set(['ingress', 'response']);

const DOWN_MS = 2800;
const INK = '20, 22, 26';
const ACCENT = '61, 155, 240';

interface RtNode extends NodeSpec {
  px: number;
  py: number;
  /** 0 = fully down, 1 = healthy. */
  health: number;
  downUntil: number;
  hover: number;
  pulseRing: number;
}

interface Pulse {
  path: string[];
  leg: number;
  t: number;
  speed: number;
}

export function mountSystemGraph(canvas: HTMLCanvasElement): SystemGraphHandle {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const ctx = canvas.getContext('2d')!;

  const nodes = new Map<string, RtNode>();
  for (const n of NODES) {
    nodes.set(n.id, { ...n, px: 0, py: 0, health: 1, downUntil: 0, hover: 0, pulseRing: 0 });
  }

  const adj = new Map<string, string[]>();
  for (const [a, b] of EDGES) {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a)!.push(b);
  }

  let w = 0;
  let h = 0;
  let dpr = 1;

  const layout = () => {
    const rect = canvas.getBoundingClientRect();
    w = rect.width || 1;
    h = rect.height || 1;
    dpr = Math.min(window.innerWidth < 768 ? 1.5 : 2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const padX = Math.min(46, w * 0.07);
    const padY = Math.min(40, h * 0.12);
    for (const n of nodes.values()) {
      n.px = padX + n.x * (w - padX * 2);
      n.py = padY + n.y * (h - padY * 2);
    }
  };
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(canvas);

  const alive = (id: string) => nodes.get(id)!.health > 0.45;

  /** Random healthy path from ingress to response, or null if fully severed. */
  const findPath = (): string[] | null => {
    const walk = (id: string, seen: Set<string>): string[] | null => {
      if (id === 'response') return [id];
      const next = (adj.get(id) ?? []).filter((n) => !seen.has(n) && alive(n));
      // Shuffle so repeated runs spread across the tiers.
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      for (const n of next) {
        seen.add(n);
        const rest = walk(n, seen);
        if (rest) return [id, ...rest];
        seen.delete(n);
      }
      return null;
    };
    return walk('ingress', new Set(['ingress']));
  };

  const pulses: Pulse[] = [];
  const MAX_PULSES = 16;

  let mx = -999;
  let my = -999;
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  };
  const onLeave = () => {
    mx = -999;
    my = -999;
  };

  const nodeAt = (x: number, y: number) => {
    for (const n of nodes.values()) {
      if (Math.hypot(n.px - x, n.py - y) < 26) return n;
    }
    return null;
  };

  const onClick = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const n = nodeAt(e.clientX - r.left, e.clientY - r.top);
    if (!n || PROTECTED.has(n.id) || n.downUntil > performance.now()) return;
    n.downUntil = performance.now() + DOWN_MS;
    n.pulseRing = 1;
  };

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onClick);

  let onScreen = true;
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { rootMargin: '120px' });
  io.observe(canvas);

  const drawNode = (n: RtNode, now: number) => {
    const down = n.health < 0.99;
    const baseR = n.kind === 'edge' ? 7 : n.kind === 'router' ? 10.5 : 9;
    const r = baseR + n.hover * 3;

    // Failure ring
    if (n.pulseRing > 0.01) {
      ctx.beginPath();
      ctx.arc(n.px, n.py, r + (1 - n.pulseRing) * 30, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(214,92,82,${n.pulseRing * 0.55})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Health halo
    if (n.health > 0.5) {
      const g = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, r * 4.2);
      g.addColorStop(0, `rgba(${ACCENT},${0.16 * n.health + n.hover * 0.14})`);
      g.addColorStop(1, `rgba(${ACCENT},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.px, n.py, r * 4.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(n.px, n.py, r, 0, Math.PI * 2);
    ctx.fillStyle = down
      ? `rgba(${INK},${0.18 + n.health * 0.5})`
      : `rgba(${INK},0.92)`;
    ctx.fill();

    // Live core
    if (n.health > 0.6) {
      ctx.beginPath();
      ctx.arc(n.px, n.py, r * 0.36, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT},${0.55 + 0.35 * Math.sin(now / 620 + n.px)})`;
      ctx.fill();
    } else {
      // Offline cross-tick
      ctx.strokeStyle = 'rgba(214,92,82,0.75)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(n.px - 3.4, n.py - 3.4);
      ctx.lineTo(n.px + 3.4, n.py + 3.4);
      ctx.moveTo(n.px + 3.4, n.py - 3.4);
      ctx.lineTo(n.px - 3.4, n.py + 3.4);
      ctx.stroke();
    }

    ctx.font = `500 ${n.kind === 'edge' ? 10.5 : 11}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.08em';
    ctx.fillStyle = down
      ? 'rgba(188,84,74,0.9)'
      : `rgba(78,84,96,${0.72 + n.hover * 0.28})`;
    ctx.fillText(n.label.toUpperCase(), n.px, n.py + r + 17);
    ctx.letterSpacing = '0px';
  };

  let raf = 0;
  let last = performance.now();
  let spawnAcc = 0;
  let stopped = false;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!onScreen || document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min(64, now - last);
    last = now;

    ctx.clearRect(0, 0, w, h);

    // --- node state
    let hovered: RtNode | null = null;
    for (const n of nodes.values()) {
      const isDown = n.downUntil > now;
      const target = isDown ? 0 : 1;
      n.health += (target - n.health) * (isDown ? 0.28 : 0.055);
      n.pulseRing = Math.max(0, n.pulseRing - dt / 900);
      const near = Math.hypot(n.px - mx, n.py - my) < 26;
      if (near && !PROTECTED.has(n.id)) hovered = n;
      n.hover += ((near ? 1 : 0) - n.hover) * 0.18;
    }
    canvas.style.cursor = hovered ? 'pointer' : 'default';

    // --- edges
    for (const [a, b] of EDGES) {
      const na = nodes.get(a)!;
      const nb = nodes.get(b)!;
      const strength = Math.min(na.health, nb.health);
      ctx.beginPath();
      ctx.moveTo(na.px, na.py);
      ctx.lineTo(nb.px, nb.py);
      ctx.strokeStyle = `rgba(${INK},${0.08 + strength * 0.14})`;
      ctx.lineWidth = 1.1;
      ctx.setLineDash(strength < 0.5 ? [3, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // --- pulses
    if (!reduced) {
      spawnAcc += dt;
      const interval = 420;
      while (spawnAcc > interval) {
        spawnAcc -= interval;
        if (pulses.length < MAX_PULSES) {
          const path = findPath();
          if (path) pulses.push({ path, leg: 0, t: 0, speed: 0.0016 + Math.random() * 0.0011 });
        }
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const from = nodes.get(p.path[p.leg])!;
        const to = nodes.get(p.path[p.leg + 1]);
        if (!to) {
          pulses.splice(i, 1);
          continue;
        }
        // A node failing mid-flight drops the request — visible, and honest.
        if (to.health < 0.45) {
          pulses.splice(i, 1);
          continue;
        }
        p.t += p.speed * dt;
        if (p.t >= 1) {
          p.t = 0;
          p.leg++;
          if (p.leg >= p.path.length - 1) {
            const end = nodes.get('response')!;
            end.hover = Math.min(1, end.hover + 0.25);
            pulses.splice(i, 1);
            continue;
          }
        }
        const e = p.t * p.t * (3 - 2 * p.t);
        const x = from.px + (to.px - from.px) * e;
        const y = from.py + (to.py - from.py) * e;

        const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, `rgba(${ACCENT},0.85)`);
        g.addColorStop(1, `rgba(${ACCENT},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 2.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT},0.98)`;
        ctx.fill();
      }
    }

    for (const n of nodes.values()) drawNode(n, now);
  };
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onClick);
    },
  };
}
