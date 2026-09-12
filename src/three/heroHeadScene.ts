import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type StreamState = 'listening' | 'thinking' | 'streaming' | 'complete';

export interface HeroHeadHandle {
  setStreamState: (state: StreamState) => void;
  dispose: () => void;
}

// Motion envelope — camera framing is derived from these, so the head can never
// rotate or drift outside the frame.
const MAX_YAW = 0.36;
const MAX_PITCH = 0.18;
const BOB = 0.035;

// Head silhouette as a lathe profile: [radius, height] from crown to chin.
// Authoring the profile directly is the only reliable way to get a domed crown
// and a defined chin — sculpting a sphere with ad-hoc falloffs yields an egg.
const PROFILE: [number, number][] = [
  [0.001, 1.2],
  [0.24, 1.16],
  [0.46, 1.07],
  [0.63, 0.94],
  [0.75, 0.77],
  [0.82, 0.55],
  [0.85, 0.3],
  [0.84, 0.04],
  [0.79, -0.23],
  [0.69, -0.47],
  [0.55, -0.68],
  [0.39, -0.84],
  [0.21, -0.94],
  [0.001, -0.99],
];

/** Narrower than it is deep, like a head. */
const W = 0.92;
const D = 1.04;

/**
 * Deforms a point on the unit sphere into the head silhouette: a tall dome
 * cranium elongated at the back, tapering through the cheekbones to a narrow
 * chin. Mutates and returns `v`.
 *
 * Every surface piece (skull, visor, jaw plate) is built from this same
 * function, which is what lets the panels conform exactly instead of
 * intersecting the shell and poking through at the edges.
 */
/**
 * Sculpts the lathed body of revolution into a head: narrower across than
 * deep, flatter at the face, with a brow ridge and cheek hollow. Mutates `v`.
 */
function deform(v: THREE.Vector3): THREE.Vector3 {
  v.x *= W;
  v.z *= D;

  const y = v.y;
  if (v.z > 0) {
    // Face: pull the front plane flatter than the revolution gives.
    v.z *= 0.88;
    // Brow ridge above the eye line, so the front catches a highlight.
    const brow = 1 - Math.abs(y - 0.3) / 0.32;
    if (brow > 0) v.z += 0.05 * brow * brow;
    // Cheek hollow below it.
    const cheek = 1 - Math.abs(y + 0.16) / 0.3;
    if (cheek > 0) v.z -= 0.03 * cheek * cheek;
    // Chin slopes back rather than jutting.
    if (y < -0.45) {
      const t = Math.min(1, (-y - 0.45) / 0.54);
      v.z -= 0.1 * t * t;
    }
  } else {
    // Cranium: extend the back of the skull.
    v.z *= 1.16;
  }
  return v;
}

/** Lathes PROFILE into a solid of revolution, then sculpts it into a head. */
function buildHeadGeometry(segments = 128): THREE.BufferGeometry {
  const pts = PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
  let g: THREE.BufferGeometry = new THREE.LatheGeometry(pts, segments);

  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    deform(v.fromBufferAttribute(p, i));
    p.setXYZ(i, v.x, v.y, v.z);
  }

  // The lathe duplicates vertices at its start/end seam with distinct UVs, so
  // computeVertexNormals leaves a hard shading crease down the head. Dropping
  // the UVs lets mergeVertices weld that seam into smooth, continuous normals.
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  g.computeVertexNormals();
  return g;
}

/**
 * A matte-black humanoid robot head. Rendered onto `canvas`; the caller owns
 * lifecycle (call dispose() on unmount).
 */
export function mountHeroHead(canvas: HTMLCanvasElement): HeroHeadHandle {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const motion = reduced ? 0 : 1;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const dprCap = window.innerWidth < 768 ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(dprCap, window.devicePixelRatio || 1));
  renderer.setClearAlpha(0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
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
  sky.addColorStop(0.45, '#E2E6EC');
  sky.addColorStop(0.55, '#AEB4BE');
  sky.addColorStop(1, '#33373D');
  ex.fillStyle = sky;
  ex.fillRect(0, 0, EW, EH);
  const hot = ex.createRadialGradient(EW * 0.3, EH * 0.14, 20, EW * 0.3, EH * 0.14, EW * 0.6);
  hot.addColorStop(0, 'rgba(255,255,255,0.6)');
  hot.addColorStop(0.45, 'rgba(255,255,255,0.16)');
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
  // Uniform satin black: a soft sheen that describes the form without becoming
  // a mirror. A painted-on visor was tried and dropped — the lathe's UVs wrap
  // the texture around the sides rather than across the face, and the head now
  // carries no UVs at all so its seam could be welded.
  const shell = new THREE.MeshPhysicalMaterial({
    color: '#1A1D22',
    metalness: 0.2,
    roughness: 0.5,
    clearcoat: 0.4,
    clearcoatRoughness: 0.45,
  });
  const seamMat = new THREE.MeshStandardMaterial({
    color: '#2B2F35',
    metalness: 0.85,
    roughness: 0.42,
  });
  // One plane per eye with the core and its bloom baked into a single texture.
  // Layering a separate halo plane over a lens mesh left visible rectangular
  // edges where the planes met.
  const GW = 512;
  const GH = 256;
  const gcv = document.createElement('canvas');
  gcv.width = GW;
  gcv.height = GH;
  const gx = gcv.getContext('2d')!;
  const bloom = gx.createRadialGradient(GW / 2, GH / 2, 4, GW / 2, GH / 2, GH / 2);
  bloom.addColorStop(0, 'rgba(150,205,255,0.55)');
  bloom.addColorStop(0.34, 'rgba(70,155,250,0.20)');
  bloom.addColorStop(1, 'rgba(60,140,240,0)');
  gx.fillStyle = bloom;
  gx.fillRect(0, 0, GW, GH);
  // Bright core slit
  const r = GH * 0.1;
  const cw = GW * 0.62;
  const ch = GH * 0.2;
  gx.fillStyle = 'rgba(224,244,255,0.98)';
  gx.beginPath();
  gx.roundRect((GW - cw) / 2, (GH - ch) / 2, cw, ch, r);
  gx.fill();
  gx.filter = 'blur(6px)';
  gx.drawImage(gcv, 0, 0);
  gx.filter = 'none';
  const glowTex = new THREE.CanvasTexture(gcv);
  const glowMat = new THREE.MeshBasicMaterial({
    map: glowTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    toneMapped: false,
  });

  const disposables: { dispose(): void }[] = [shell, seamMat, glowTex, glowMat];
  const track = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };

  // ---------------------------------------------------------------------- skull
  const skullGeo = track(buildHeadGeometry(144));
  const skull = new THREE.Mesh(skullGeo, shell);
  head.add(skull);
  skull.updateMatrixWorld(true);

  // Deliberately no visor or jaw panels: conforming caps read as painted
  // stripes with hard edges. The head is one continuous matte volume, and the
  // eye slits are the only break in it.

  // ------------------------------------------------------------------ eye slits
  // Placed by raycasting the deformed shell, so they sit exactly on the surface
  // whatever the silhouette maths does.
  const eyes = new THREE.Group();
  head.add(eyes);

  const ray = new THREE.Raycaster();
  const eyeGeo = track(new THREE.PlaneGeometry(0.62, 0.31));
  const eyeUnits: THREE.Mesh[] = [];

  for (const sx of [-1, 1]) {
    const dir = new THREE.Vector3(sx * 0.34, 0.22, 1).normalize();
    // Fire inward from outside the head: a ray cast from the centre hits only
    // back faces, which FrontSide materials don't report.
    ray.set(dir.clone().multiplyScalar(6), dir.clone().negate());
    const hit = ray.intersectObject(skull, false)[0];
    const point = hit ? hit.point.clone() : dir.clone().multiplyScalar(0.95);
    const normal = hit?.face ? hit.face.normal.clone().normalize() : dir.clone();

    // The offset has to clear the surface curvature across the plane's own
    // width, or the ends sink into the shell and it renders as a half-moon.
    const eye = new THREE.Mesh(eyeGeo, glowMat);
    eye.position.copy(point).addScaledVector(normal, 0.05);
    eye.lookAt(point.clone().addScaledVector(normal, 1.05));
    eye.renderOrder = 2;
    eyes.add(eye);
    eyeUnits.push(eye);
  }

  // ------------------------------------------------------------------ neck
  const neck = new THREE.Mesh(track(new THREE.CylinderGeometry(0.34, 0.46, 0.5, 64)), shell);
  neck.position.set(0, -1.18, -0.1);
  head.add(neck);

  const collar = new THREE.Mesh(track(new THREE.TorusGeometry(0.36, 0.03, 16, 64)), seamMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, -1.0, -0.1);
  head.add(collar);

  // -------------------------------------------------------------------- lights
  scene.add(new THREE.HemisphereLight('#FFFFFF', '#B9BFC9', 0.5));

  // Key, high and slightly to camera-left.
  const key = new THREE.DirectionalLight('#FFFFFF', 2.0);
  key.position.set(-2.4, 4.4, 5.0);
  scene.add(key);

  // Frontal fill. Without this the face sits in its own shadow: every other
  // light here is side or back, so the visor and the brow had nothing to
  // catch and the head read as a featureless silhouette.
  const front = new THREE.DirectionalLight('#F2F6FF', 1.25);
  front.position.set(0.6, 0.9, 6);
  scene.add(front);

  // Rims separate the matte black head from the light page.
  const rimL = new THREE.DirectionalLight('#FFFFFF', 1.5);
  rimL.position.set(-4.4, -0.6, -3.2);
  scene.add(rimL);
  const rimR = new THREE.DirectionalLight('#E8F1FF', 1.25);
  rimR.position.set(4.4, 0.4, -3.6);
  scene.add(rimR);

  // -------------------------------------------------------------------- framing
  const maxR = Math.max(...PROFILE.map(([r]) => r));
  const SUBJ_W = maxR * W * 2 + 0.1;
  const SUBJ_H = PROFILE[0][1] - PROFILE[PROFILE.length - 1][1] + 0.62;
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const MARGIN = 1.16;
    const swept = (a: number, b: number, angle: number) =>
      a * Math.cos(angle) + b * Math.sin(angle);
    const subjectW = swept(SUBJ_W, D * 2, MAX_YAW) * MARGIN;
    const subjectH = (swept(SUBJ_H, D * 2, MAX_PITCH) + BOB * 2) * MARGIN;
    const vFov = (camera.fov * Math.PI) / 180;
    const distH = subjectH / 2 / Math.tan(vFov / 2);
    const distW = subjectW / 2 / Math.tan(vFov / 2) / camera.aspect;
    camera.position.set(0, 0.04, Math.max(distH, distW));
    camera.lookAt(0, -0.08, 0);
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

  let onScreen = true;
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
  }, { rootMargin: '120px' });
  io.observe(canvas);

  // ---------------------------------------------------------------------- loop
  let streamState: StreamState = 'listening';
  const clock = new THREE.Clock();
  let yaw = 0;
  let pitch = 0;
  let blink = 0;
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

    if (motion && t > nextBlink) {
      blink = 1;
      nextBlink = t + 3 + Math.random() * 4.5;
    }
    blink += (0 - blink) * 0.2;

    const speaking = streamState === 'streaming' && motion;
    const thinking = streamState === 'thinking' && motion;

    const lid = Math.max(0.05, 1 - blink * 0.96);
    for (const eye of eyeUnits) eye.scale.y = lid;

    if (motion) {
      const base = speaking ? 1 : thinking ? 0.58 : 0.8;
      const flicker = speaking
        ? Math.abs(Math.sin(t * 7.5)) * 0.22
        : thinking
          ? Math.sin(t * 2.4) * 0.16
          : Math.sin(t * 1.2) * 0.06;
      const level = Math.min(1.15, base + flicker);
      glowMat.opacity = (0.5 + 0.5 * level) * Math.max(0.22, lid);
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
