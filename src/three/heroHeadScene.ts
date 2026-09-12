import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type StreamState = 'listening' | 'thinking' | 'streaming' | 'complete';

export interface HeroHeadHandle {
  setStreamState: (state: StreamState) => void;
  dispose: () => void;
}

const EYE_HEX = '#3D9BF0';

// Motion envelope — the resize() framing is derived from these, so the head can
// never rotate or drift outside the frame.
const MAX_YAW = 0.34;
const MAX_PITCH = 0.2;
const BOB = 0.04;

/**
 * A soft-cornered "monolith" head: architectural, not a literal robot toy.
 * Rendered onto `canvas`; the caller owns lifecycle (call dispose() on unmount).
 */
export function mountHeroHead(canvas: HTMLCanvasElement): HeroHeadHandle {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const motion = reduced ? 0 : 1;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearAlpha(0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const head = new THREE.Group();
  scene.add(head);

  // Blurred studio environment: a soft sky-to-floor gradient with one hot
  // highlight, so the clearcoat picks up a believable falloff instead of a
  // hard rectangle reflection.
  // 1024x512 — at 512x256 the PMREM mips are coarse enough that the highlight
  // resolves as visible blocks on the clearcoat.
  const EW = 1024;
  const EH = 512;
  const envCv = document.createElement('canvas');
  envCv.width = EW;
  envCv.height = EH;
  const ex = envCv.getContext('2d')!;
  const sky = ex.createLinearGradient(0, 0, 0, EH);
  sky.addColorStop(0, '#FFFFFF');
  sky.addColorStop(0.42, '#DCE1E8');
  sky.addColorStop(0.52, '#A6ACB6');
  sky.addColorStop(1, '#33373D');
  ex.fillStyle = sky;
  ex.fillRect(0, 0, EW, EH);
  // Broad, low-contrast key. A small hot spot reflects as a hard-edged white
  // chip on a near-mirror surface, which reads as a rendering glitch.
  const hot = ex.createRadialGradient(EW * 0.33, EH * 0.12, 20, EW * 0.33, EH * 0.12, EW * 0.6);
  hot.addColorStop(0, 'rgba(255,255,255,0.55)');
  hot.addColorStop(0.45, 'rgba(255,255,255,0.14)');
  hot.addColorStop(1, 'rgba(255,255,255,0)');
  ex.fillStyle = hot;
  ex.fillRect(0, 0, EW, EH);
  const envTex = new THREE.CanvasTexture(envCv);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;

  // Prefilter through PMREM so reflections are blurred per-roughness instead of
  // sampling the raw texture (which is what produced the hard specular edge).
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromEquirectangular(envTex);
  scene.environment = envRT.texture;
  envTex.dispose();
  pmrem.dispose();
  if ('environmentIntensity' in scene) (scene as unknown as { environmentIntensity: number }).environmentIntensity = 1.05;

  const piano = new THREE.MeshPhysicalMaterial({
    color: '#0B0B0E',
    metalness: 0.25,
    roughness: 0.34,
    clearcoat: 1,
    clearcoatRoughness: 0.3,
  });
  const lens = new THREE.MeshStandardMaterial({
    color: '#08192B',
    emissive: new THREE.Color(EYE_HEX),
    emissiveIntensity: 1.5,
    roughness: 0.26,
  });

  // Shell: a soft-cornered monolith, crowned slightly at the front so the
  // highlight has somewhere to travel as the head turns.
  const SW = 2.46;
  const SH = 3.34;
  const SD = 1.44;
  // 20 segments — at 9 the crown deformation below leaves visible faceting
  // bands across the front under a glossy clearcoat.
  const shellGeo = new RoundedBoxGeometry(SW, SH, SD, 20, 0.6);
  const sp = shellGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i);
    const y = sp.getY(i);
    const z = sp.getZ(i);
    if (z > 0) {
      const fx = 1 - (x / (SW / 2)) * (x / (SW / 2)) * 0.5;
      const fy = 1 - (y / (SH / 2)) * (y / (SH / 2)) * 0.5;
      const w = Math.min(1, z / (SD / 2));
      const crown = 0.72 + 0.4 * fx * fx * fy;
      sp.setZ(i, z * (1 + (crown - 1) * w * w));
    }
  }
  shellGeo.computeVertexNormals();
  const shell = new THREE.Mesh(shellGeo, piano);
  head.add(shell);
  const FRONT = (SD / 2) * 1.08;

  // The only feature: one light line across the face.
  const voice = new THREE.Group();
  voice.position.set(0, 0.12, FRONT - 0.02);
  head.add(voice);
  const voiceBars: THREE.Mesh[] = [];
  const NB = 13;
  for (let i = 0; i < NB; i++) {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.05, 5, 12), lens);
    b.position.x = (i - (NB - 1) / 2) * 0.085;
    voice.add(b);
    voiceBars.push(b);
  }

  scene.add(new THREE.HemisphereLight('#FFFFFF', '#C9CDD4', 0.7));
  // Dialled well back — the PMREM environment now does most of the shaping, and
  // a strong directional on a clearcoat surface just stamps a hard hot pixel.
  const key = new THREE.DirectionalLight('#FFFFFF', 1.5);
  key.position.set(-1.8, 7.2, 4.4);
  scene.add(key);
  const fill = new THREE.DirectionalLight('#D6E8FF', 0.9);
  fill.position.set(6, 2, -4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight('#FFFFFF', 0.7);
  rim.position.set(0, -3, -6);
  scene.add(rim);

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Frame the head at its widest *rotated* extent, not its rest size — at max
    // yaw the depth swings into the silhouette, and framing the rest pose clips
    // the corners. Plus a margin so the head sits in space instead of filling it.
    const MARGIN = 1.24;
    const swept = (a: number, b: number, angle: number) =>
      a * Math.cos(angle) + b * Math.sin(angle);
    const subjectW = swept(SW, SD, MAX_YAW) * MARGIN;
    const subjectH = (swept(SH, SD, MAX_PITCH) + BOB * 2) * MARGIN;
    const vFov = (camera.fov * Math.PI) / 180;
    const distH = subjectH / 2 / Math.tan(vFov / 2);
    const distW = subjectW / 2 / Math.tan(vFov / 2) / camera.aspect;
    camera.position.set(0, 0.06, Math.max(distH, distW));
    camera.lookAt(0, 0.02, 0);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  let hasPointer = false;
  let mx = 0;
  let my = 0;
  const onMove = (e: PointerEvent) => {
    hasPointer = true;
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  let streamState: StreamState = 'listening';

  const clock = new THREE.Clock();
  let yaw = 0;
  let pitch = 0;
  let sacX = 0;
  let sacY = 0;
  let sacTX = 0;
  let sacTY = 0;
  let nextSac = 3;
  let raf = 0;
  let sacTimeout: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (document.hidden) return;
    const t = clock.getElapsedTime();
    const idle = motion ? Math.sin(t * 0.42) * 0.16 : 0;
    const gx = hasPointer ? mx : Math.sin(t * 0.3) * 0.5;
    const gy = hasPointer ? my : Math.cos(t * 0.24) * 0.3;

    // Slow damping for a calm, deliberate turn, clamped to the motion envelope
    // the camera framing was derived from.
    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
    yaw += (clamp(gx * 0.34 + idle * 0.22, MAX_YAW) - yaw) * 0.045;
    pitch += (clamp(gy * 0.18, MAX_PITCH) - pitch) * 0.045;
    head.rotation.y = yaw;
    head.rotation.x = pitch;
    head.rotation.z = -yaw * 0.07;
    head.position.y = motion ? Math.sin(t * 0.62) * BOB : 0;

    if (motion && t > nextSac) {
      sacTX = (Math.random() - 0.5) * 1.4;
      sacTY = (Math.random() - 0.5) * 0.8;
      nextSac = t + 2.4 + Math.random() * 4;
      sacTimeout = setTimeout(() => {
        sacTX = 0;
        sacTY = 0;
      }, 320);
    }
    sacX += (sacTX - sacX) * 0.22;
    sacY += (sacTY - sacY) * 0.22;

    const ox = gx * 0.2 + sacX * 0.04;
    const oy = -gy * 0.12 + sacY * 0.03;
    voice.position.x += (ox - voice.position.x) * 0.1;
    voice.position.y += (0.12 + oy - voice.position.y) * 0.1;

    const speaking = streamState === 'streaming' && motion;
    const thinking = streamState === 'thinking' && motion;
    for (let i = 0; i < voiceBars.length; i++) {
      const u = i / (voiceBars.length - 1);
      const edge = 1 - Math.abs(u - 0.5) * 1.35;
      let amp: number;
      if (speaking) amp = (0.35 + Math.abs(Math.sin(t * 6.5 + i * 0.62)) * 4.2) * edge;
      else if (thinking) amp = (0.28 + Math.abs(Math.sin(t * 2.1 - i * 0.4)) * 0.8) * edge;
      else amp = 0.2 + 0.06 * edge;
      voiceBars[i].scale.y += (Math.max(0.18, amp) - voiceBars[i].scale.y) * 0.2;
    }
    if (motion) lens.emissiveIntensity = (speaking ? 2.1 : thinking ? 1.5 : 1.15) + Math.sin(t * 1.5) * 0.12;

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
      if (sacTimeout) clearTimeout(sacTimeout);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      renderer.dispose();
      shellGeo.dispose();
      piano.dispose();
      lens.dispose();
      envRT.dispose();
      voiceBars.forEach((b) => b.geometry.dispose());
    },
  };
}
