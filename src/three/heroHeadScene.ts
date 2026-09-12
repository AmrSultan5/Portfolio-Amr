import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type StreamState = 'listening' | 'thinking' | 'streaming' | 'complete';

export interface HeroHeadHandle {
  setStreamState: (state: StreamState) => void;
  dispose: () => void;
}

// Motion envelope — camera framing is derived from these, so the head can never
// rotate or drift outside the frame.
const MAX_YAW = 0.34;
const MAX_PITCH = 0.18;
const BOB = 0.035;

// Skull is a rounded box rather than a sphere: it gives a genuinely flat front
// plane, which is what lets the visor and trim mount flush instead of
// intersecting a curve and poking out at the corners.
// Width:height ~0.74, close to a human head — at ~0.9 it read as a cube.
const SK_W = 1.74;
const SK_H = 2.34;
const SK_D = 1.64;
const SK_R = 0.32;
/** z of the flat front plane. */
const FACE = SK_D / 2;

/**
 * A humanoid robot head: flat-planed face, flush-mounted smoked visor, two
 * tracking lozenge eye lenses that blink, brow and vent trim, side transducer
 * pods and a neck collar.
 * Rendered onto `canvas`; the caller owns lifecycle (call dispose() on unmount).
 */
export function mountHeroHead(canvas: HTMLCanvasElement): HeroHeadHandle {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const motion = reduced ? 0 : 1;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  // Phones are pixel-dense but GPU-poor; 2x here costs 4x the fragments for no
  // visible gain at this element size.
  const dprCap = window.innerWidth < 768 ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(dprCap, window.devicePixelRatio || 1));
  renderer.setClearAlpha(0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const head = new THREE.Group();
  scene.add(head);

  // ---------------------------------------------------------------- environment
  const EW = 1024;
  const EH = 512;
  const envCv = document.createElement('canvas');
  envCv.width = EW;
  envCv.height = EH;
  const ex = envCv.getContext('2d')!;
  const sky = ex.createLinearGradient(0, 0, 0, EH);
  sky.addColorStop(0, '#FFFFFF');
  sky.addColorStop(0.42, '#DEE3EA');
  sky.addColorStop(0.52, '#A9AFB9');
  sky.addColorStop(1, '#2F333A');
  ex.fillStyle = sky;
  ex.fillRect(0, 0, EW, EH);
  const hot = ex.createRadialGradient(EW * 0.32, EH * 0.13, 20, EW * 0.32, EH * 0.13, EW * 0.58);
  hot.addColorStop(0, 'rgba(255,255,255,0.58)');
  hot.addColorStop(0.45, 'rgba(255,255,255,0.15)');
  hot.addColorStop(1, 'rgba(255,255,255,0)');
  ex.fillStyle = hot;
  ex.fillRect(0, 0, EW, EH);
  const envTex = new THREE.CanvasTexture(envCv);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromEquirectangular(envTex);
  scene.environment = envRT.texture;
  envTex.dispose();
  pmrem.dispose();
  if ('environmentIntensity' in scene) {
    (scene as unknown as { environmentIntensity: number }).environmentIntensity = 1.0;
  }

  // ------------------------------------------------------------------ materials
  const shell = new THREE.MeshPhysicalMaterial({
    color: '#23272F',
    metalness: 0.2,
    roughness: 0.38,
    clearcoat: 1,
    clearcoatRoughness: 0.28,
  });
  const visorMat = new THREE.MeshPhysicalMaterial({
    color: '#06080B',
    metalness: 0.45,
    roughness: 0.14,
    clearcoat: 1,
    clearcoatRoughness: 0.07,
  });
  const trim = new THREE.MeshStandardMaterial({
    color: '#98A0AB',
    metalness: 1,
    roughness: 0.3,
  });
  // Unlit: an emissive standard material without a bloom pass just reads as flat
  // pale paint. Basic + an additive halo below sells the light instead.
  // toneMapped:false keeps the blue vivid — ACES otherwise desaturates bright
  // unlit colours toward white.
  const lens = new THREE.MeshBasicMaterial({ color: '#7FD0FF', toneMapped: false });

  // Radial falloff used as an additive halo around each lens.
  const gcv = document.createElement('canvas');
  gcv.width = 128;
  gcv.height = 128;
  const gx = gcv.getContext('2d')!;
  const grd = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(150,205,255,0.95)');
  grd.addColorStop(0.32, 'rgba(75,160,250,0.34)');
  grd.addColorStop(1, 'rgba(60,140,240,0)');
  gx.fillStyle = grd;
  gx.fillRect(0, 0, 128, 128);
  const glowTex = new THREE.CanvasTexture(gcv);
  const glowMat = new THREE.MeshBasicMaterial({
    map: glowTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });

  const disposables: { dispose(): void }[] = [shell, visorMat, trim, lens, glowTex, glowMat];
  const track = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };

  // ---------------------------------------------------------------------- skull
  const skullGeo = track(new RoundedBoxGeometry(SK_W, SK_H, SK_D, 24, SK_R));
  {
    const p = skullGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      // Jaw: narrow below the cheekbones so the silhouette reads as a head.
      if (v.y < 0) {
        const t = Math.min(1, -v.y / (SK_H / 2));
        v.x *= 1 - 0.3 * t * t;
        v.z *= 1 - 0.16 * t * t;
        // Chin: pull the lower face back so it slopes instead of dropping flat.
        if (v.z > 0) v.z -= 0.17 * t * t * t;
      }
      // Crown: ease the very top inward.
      if (v.y > SK_H * 0.28) {
        const t = (v.y - SK_H * 0.28) / (SK_H * 0.22);
        v.x *= 1 - 0.07 * t * t;
        v.z *= 1 - 0.07 * t * t;
      }
      p.setXYZ(i, v.x, v.y, v.z);
    }
    skullGeo.computeVertexNormals();
  }
  head.add(new THREE.Mesh(skullGeo, shell));

  // ---------------------------------------------------------------- visor band
  // Flush-mounted: half embedded in the face plane, half proud.
  const visor = new THREE.Mesh(track(new RoundedBoxGeometry(1.02, 0.4, 0.12, 10, 0.1)), visorMat);
  visor.position.set(0, 0.34, FACE);
  head.add(visor);

  // Brow trim above the visor
  const brow = new THREE.Mesh(track(new RoundedBoxGeometry(1.0, 0.042, 0.05, 4, 0.019)), trim);
  brow.position.set(0, 0.64, FACE + 0.01);
  head.add(brow);

  // ----------------------------------------------------------------------- eyes
  // Lozenges, not circles — circular eyes read as cartoon googly eyes.
  const eyes = new THREE.Group();
  eyes.position.set(0, 0.34, FACE + 0.07);
  head.add(eyes);

  // The eyes group sits at FACE + 0.07; the visor's front face is at -0.01 in
  // group space. The halo goes just in front of the visor, the lens in front of
  // the halo, so the glow spills onto the visor rather than being swallowed by
  // the lens geometry.
  const eyeGeo = track(new RoundedBoxGeometry(0.33, 0.13, 0.05, 6, 0.063));
  const glowGeo = track(new THREE.PlaneGeometry(0.92, 0.54));
  const eyeUnits: { lens: THREE.Mesh; halo: THREE.Mesh }[] = [];
  for (const sx of [-1, 1]) {
    const halo = new THREE.Mesh(glowGeo, glowMat);
    halo.position.set(sx * 0.235, 0, 0.005);
    halo.renderOrder = 1;
    eyes.add(halo);

    const eye = new THREE.Mesh(eyeGeo, lens);
    eye.position.set(sx * 0.235, 0, 0.035);
    eye.renderOrder = 2;
    eyes.add(eye);

    eyeUnits.push({ lens: eye, halo });
  }

  // --------------------------------------------------------------- vent grille
  for (let i = 0; i < 3; i++) {
    const bar = new THREE.Mesh(
      track(new RoundedBoxGeometry(0.36 - i * 0.08, 0.03, 0.04, 3, 0.013)),
      trim,
    );
    bar.position.set(0, -0.46 - i * 0.095, FACE - 0.04 - i * 0.035);
    head.add(bar);
  }

  // ---------------------------------------------------------------- side pods
  const podGeo = track(new THREE.CylinderGeometry(0.21, 0.21, 0.14, 48));
  const podRingGeo = track(new THREE.TorusGeometry(0.21, 0.024, 16, 48));
  for (const sx of [-1, 1]) {
    const pod = new THREE.Mesh(podGeo, shell);
    pod.rotation.z = Math.PI / 2;
    pod.position.set(sx * (SK_W / 2 - 0.02), 0.24, -0.08);
    head.add(pod);

    const ring = new THREE.Mesh(podRingGeo, trim);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(sx * (SK_W / 2 + 0.05), 0.24, -0.08);
    head.add(ring);
  }

  // -------------------------------------------------------------- neck + collar
  const neck = new THREE.Mesh(track(new THREE.CylinderGeometry(0.46, 0.58, 0.36, 48)), shell);
  neck.position.set(0, -1.3, -0.06);
  head.add(neck);

  const collar = new THREE.Mesh(track(new THREE.TorusGeometry(0.47, 0.042, 16, 64)), trim);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, -1.19, -0.06);
  head.add(collar);

  // -------------------------------------------------------------------- lights
  scene.add(new THREE.HemisphereLight('#FFFFFF', '#C2C7D0', 0.6));
  const key = new THREE.DirectionalLight('#FFFFFF', 1.8);
  key.position.set(-2.2, 5.4, 4.6);
  scene.add(key);
  const fill = new THREE.DirectionalLight('#CFE2FF', 0.7);
  fill.position.set(5.2, 1.4, -2.4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight('#FFFFFF', 0.9);
  rim.position.set(-1.2, -2.4, -5.2);
  scene.add(rim);

  // -------------------------------------------------------------------- framing
  const SUBJ_W = SK_W + 0.6; // skull + side pods
  const SUBJ_H = SK_H + 0.5; // skull + neck
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Frame the widest *rotated* extent plus a margin, so turning never clips.
    const MARGIN = 1.16;
    const swept = (a: number, b: number, angle: number) =>
      a * Math.cos(angle) + b * Math.sin(angle);
    const subjectW = swept(SUBJ_W, SK_D, MAX_YAW) * MARGIN;
    const subjectH = (swept(SUBJ_H, SK_D, MAX_PITCH) + BOB * 2) * MARGIN;
    const vFov = (camera.fov * Math.PI) / 180;
    const distH = subjectH / 2 / Math.tan(vFov / 2);
    const distW = subjectW / 2 / Math.tan(vFov / 2) / camera.aspect;
    camera.position.set(0, 0.02, Math.max(distH, distW));
    camera.lookAt(0, -0.06, 0);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // -------------------------------------------------------------------- pointer
  let hasPointer = false;
  let mx = 0;
  let my = 0;
  const onMove = (e: PointerEvent) => {
    hasPointer = true;
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  // Stop rendering entirely once the hero scrolls away — otherwise a WebGL loop
  // keeps burning frames behind every section of the page.
  let onScreen = true;
  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
    },
    { rootMargin: '120px' },
  );
  io.observe(canvas);

  // ---------------------------------------------------------------------- loop
  let streamState: StreamState = 'listening';
  const clock = new THREE.Clock();
  let yaw = 0;
  let pitch = 0;
  let eyeX = 0;
  let eyeY = 0;
  let blink = 0; // 0 = open, 1 = shut
  let nextBlink = 2.5;
  let raf = 0;
  let stopped = false;

  const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (document.hidden || !onScreen) return;
    const t = clock.getElapsedTime();

    const idle = motion ? Math.sin(t * 0.4) * 0.14 : 0;
    const gx = hasPointer ? mx : Math.sin(t * 0.28) * 0.5;
    const gy = hasPointer ? my : Math.cos(t * 0.22) * 0.32;

    yaw += (clamp(gx * 0.32 + idle * 0.2, MAX_YAW) - yaw) * 0.045;
    pitch += (clamp(gy * 0.15, MAX_PITCH) - pitch) * 0.045;
    head.rotation.y = yaw;
    head.rotation.x = pitch;
    head.rotation.z = -yaw * 0.06;
    head.position.y = motion ? Math.sin(t * 0.6) * BOB : 0;

    // Eyes lead the head — they reach the target before the neck does.
    eyeX += (clamp(gx * 0.05, 0.045) - eyeX) * 0.1;
    eyeY += (clamp(-gy * 0.026, 0.024) - eyeY) * 0.1;

    // Blink: snap shut, ease open.
    if (motion && t > nextBlink) {
      blink = 1;
      nextBlink = t + 3 + Math.random() * 4.5;
    }
    blink += (0 - blink) * 0.2;

    const speaking = streamState === 'streaming' && motion;
    const thinking = streamState === 'thinking' && motion;

    const lid = Math.max(0.06, 1 - blink * 0.95);
    for (let i = 0; i < eyeUnits.length; i++) {
      const { lens: eye, halo } = eyeUnits[i];
      const sx = i === 0 ? -1 : 1;
      eye.position.x = sx * 0.235 + eyeX;
      eye.position.y = eyeY;
      eye.scale.y = lid;
      halo.position.x = sx * 0.235 + eyeX;
      halo.position.y = eyeY;
      halo.scale.y = Math.max(0.12, lid);
    }

    if (motion) {
      // Brightness rides the stream state; the halo carries most of the read.
      const base = speaking ? 1 : thinking ? 0.58 : 0.8;
      const flicker = speaking
        ? Math.abs(Math.sin(t * 7.5)) * 0.22
        : thinking
          ? Math.sin(t * 2.4) * 0.16
          : Math.sin(t * 1.2) * 0.06;
      const level = Math.min(1.15, base + flicker);
      lens.color.setRGB(0.26 + 0.3 * level, 0.66 + 0.24 * level, 1);
      glowMat.opacity = (0.42 + 0.5 * level) * Math.max(0.25, lid);
    }

    renderer.render(scene, camera);
  };
  renderer.render(scene, camera);
  tick();

  return {
    setStreamState(state) {
      streamState = state;
    },
    dispose() {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      renderer.dispose();
      envRT.dispose();
      for (const d of disposables) d.dispose();
    },
  };
}
