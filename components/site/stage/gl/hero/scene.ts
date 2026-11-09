/**
 * `P-hero` — "Lines to light" (docs/STAGE.md §4): the VLCC lines plan in brass hairlines with
 * light trails along the hull, a translucent glass hull with a brass rim filling in as the hero
 * scrolls, a breathing bathymetric-contour sea, bloom. The camera orbits bow → profile → stern
 * quarter over p 0 → 1 and rises to a top-down chart at p 1–1.3 (choreo.ts).
 *
 * A lazy chunk of its own: the compositor imports it the first time a P-hero window is on
 * screen. It renders one frame for (progress, time, draw) into a target the compositor owns
 * (the lens adds the aperture, calm zones, vignette, grain and the tide wipe) and never reads
 * the page. Passes: scene (sky, contour sea, glass hull, dust) → lines (MAX blend) → bloom ¼
 * (+ ⅛ on high/medium) → merge into the target.
 */
import {
  AddEquation,
  BufferAttribute,
  BufferGeometry,
  Color,
  CustomBlending,
  DoubleSide,
  GLSL3,
  HalfFloatType,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  MathUtils,
  Matrix4,
  MaxEquation,
  Mesh,
  OneFactor,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  SrcColorFactor,
  UnsignedByteType,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderTarget,
  ZeroFactor,
  type IUniform,
  type ShaderMaterialParameters,
  type WebGLRenderer,
} from "three";
import { choreo } from "./choreo";
import {
  buildHullSurface,
  buildLinesPlan,
  hullSpec,
  waterlinePolyline,
  waterplaneUniforms,
} from "./hull";
import * as S from "./shaders";

/** Plate detail per stage tier; portrait phones get their own, lighter set. */
export type HeroTier = "high" | "medium" | "phone";

export const HERO_TIERS: Record<
  HeroTier,
  { octaves: number; dust: number; bloomB: boolean; nu: number; detail: number }
> = {
  high: { octaves: 5, dust: 1400, bloomB: true, nu: 128, detail: 1 },
  medium: { octaves: 4, dust: 800, bloomB: true, nu: 112, detail: 1 },
  phone: { octaves: 4, dust: 500, bloomB: false, nu: 96, detail: 0.7 },
};

export interface HeroFrame {
  /** Smoothed hero scroll progress, 0..1.3. */
  progress: number;
  /** Stage clock (s): frozen while motion is paused. */
  time: number;
  /** Draw-in 0..1.2 (1.2 = every line drawn). */
  draw: number;
}

export interface HeroPlate {
  resize(bufferW: number, bufferH: number, dpr: number): void;
  render(f: HeroFrame, target: WebGLRenderTarget): void;
  stats(): { segments: number; hullTris: number; dust: number; halfFloat: boolean };
  dispose(): void;
}

const DEG = Math.PI / 180;
type Uniforms = Record<string, IUniform>;

const ADD = {
  blending: CustomBlending,
  blendEquation: AddEquation,
  blendSrc: OneFactor,
  blendDst: OneFactor,
} as const;
const MUL = {
  blending: CustomBlending,
  blendEquation: AddEquation,
  blendSrc: ZeroFactor,
  blendDst: SrcColorFactor,
} as const;
const MAX = {
  blending: CustomBlending,
  blendEquation: MaxEquation,
  blendSrc: OneFactor,
  blendDst: OneFactor,
} as const;

function mat(
  frag: string,
  uniforms: Uniforms,
  extra: ShaderMaterialParameters = {}
): ShaderMaterial {
  return new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: S.FULLSCREEN_VERT,
    fragmentShader: frag,
    uniforms,
    depthTest: false,
    depthWrite: false,
    ...extra,
  });
}

export function createHeroPlate(
  renderer: WebGLRenderer,
  { tier, phone }: { tier: HeroTier; phone: boolean }
): HeroPlate {
  const T = HERO_TIERS[tier];
  const spec = hullSpec("vlcc");
  const plan = buildLinesPlan(spec, T.detail);
  const surf = buildHullSurface(spec, T.nu, 30);
  const wp = waterplaneUniforms(spec);
  const [xs, xb] = wp.wl0;

  const half =
    renderer.extensions.has("EXT_color_buffer_float") ||
    renderer.extensions.has("EXT_color_buffer_half_float");
  const rtOpts = {
    type: half ? HalfFloatType : UnsignedByteType,
    depthBuffer: false,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
  };
  // No depth anywhere: every draw is blended and order-sorted.
  const sceneRT = new WebGLRenderTarget(1, 1, rtOpts);
  const linesRT = new WebGLRenderTarget(1, 1, rtOpts);
  const qA = new WebGLRenderTarget(1, 1, rtOpts);
  const qA2 = new WebGLRenderTarget(1, 1, rtOpts);
  const qB = new WebGLRenderTarget(1, 1, rtOpts);
  const qB2 = new WebGLRenderTarget(1, 1, rtOpts);
  const targets = [sceneRT, linesRT, qA, qA2, qB, qB2];

  const camera = new PerspectiveCamera(28, 1, 0.1, 400);
  const scene = new Scene();
  const linesScene = new Scene();
  const tri = new BufferGeometry();
  tri.setAttribute(
    "position",
    new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
  );
  const geometries: BufferGeometry[] = [tri];
  const materials: ShaderMaterial[] = [];
  const own = <M extends ShaderMaterial>(m: M) => (materials.push(m), m);

  const sun = new Vector3();
  const key = new Vector3();

  // Sky + deep sea behind everything.
  const bgMat = own(
    mat(S.BG_FRAG, {
      uInvVP: { value: new Matrix4() },
      uCam: { value: new Vector3() },
      uSun: { value: sun },
      uDawn: { value: 1 },
    })
  );
  const bg = new Mesh(tri, bgMat);
  bg.frustumCulled = false;
  bg.renderOrder = -10;
  scene.add(bg);

  // The contour sea (additive over the sky; nothing inside the waterplane).
  const seaU: Uniforms = {
    uTime: { value: 0 },
    uPhase: { value: 0 },
    uN: { value: 22 },
    uLineA: { value: 0.2 },
    uIdxA: { value: 0.42 },
    uWrap: { value: 0.1 },
    uRipple: { value: 0 },
    uRipT: { value: 0 },
    uGlow: { value: 1 },
    uWarm: { value: 1 },
    uFocus: { value: 15 },
    uCoC: { value: 4 },
    uDpr: { value: 1 },
    uFog: { value: 48 },
    uFade: { value: 1 },
    uScale: { value: 0.085 },
    uSun: { value: sun },
    uWLP: { value: waterlinePolyline(spec).map(([x, y]) => new Vector2(x, y)) },
    uWL0: { value: new Vector4(...wp.wl0) },
    uWL1: { value: new Vector4(...wp.wl1) },
    uWL2: { value: new Vector2(...wp.wl2) },
  };
  const seaMat = own(
    new ShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: S.SEA_VERT,
      fragmentShader: S.SEA_FRAG,
      uniforms: seaU,
      defines: { OCTAVES: T.octaves },
      depthWrite: false,
      depthTest: false,
      ...ADD,
    })
  );
  const seaGeo = new PlaneGeometry(260, 260, 1, 1);
  seaGeo.rotateX(-Math.PI / 2);
  geometries.push(seaGeo);
  const sea = new Mesh(seaGeo, seaMat);
  sea.frustumCulled = false;
  sea.renderOrder = 0;
  scene.add(sea);

  // Glass hull: multiply (the body shades what is behind) then additive (rim, reflections).
  const hullGeo = new BufferGeometry();
  hullGeo.setAttribute("position", new BufferAttribute(surf.position, 3));
  hullGeo.setAttribute("normal", new BufferAttribute(surf.normal, 3));
  hullGeo.setIndex(new BufferAttribute(surf.index, 1));
  geometries.push(hullGeo);
  const glassU: Uniforms = {
    uFill: { value: 0 },
    uFront: { value: 0 },
    uDir: { value: -1 },
    uTime: { value: 0 },
    uSun: { value: sun },
    uKey: { value: key },
  };
  const glass = (frag: string, blend: typeof ADD | typeof MUL) =>
    own(
      new ShaderMaterial({
        glslVersion: GLSL3,
        vertexShader: S.GLASS_VERT,
        fragmentShader: frag,
        uniforms: glassU,
        side: DoubleSide,
        depthWrite: false,
        depthTest: false,
        ...blend,
      })
    );
  const shade = new Mesh(hullGeo, glass(S.GLASS_SHADE_FRAG, MUL));
  const light = new Mesh(hullGeo, glass(S.GLASS_LIGHT_FRAG, ADD));
  shade.renderOrder = 1;
  light.renderOrder = 2;
  scene.add(shade, light);

  // Dust / plankton in depth.
  const dustU: Uniforms = {
    uTime: { value: 0 },
    uDpr: { value: 1 },
    uFocus: { value: 15 },
    uCoC: { value: 4 },
    uSize: { value: 1.5 },
    uAlpha: { value: 0.5 },
  };
  if (T.dust) {
    const n = T.dust;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n * 4);
    let s = 1234.5;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rnd() - 0.5) * 60;
      pos[i * 3 + 1] = -2.5 + Math.pow(rnd(), 1.6) * 9;
      pos[i * 3 + 2] = (rnd() - 0.5) * 44;
      for (let k = 0; k < 4; k++) seed[i * 4 + k] = rnd();
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new BufferAttribute(seed, 4));
    geometries.push(g);
    const dust = new Points(
      g,
      own(
        new ShaderMaterial({
          glslVersion: GLSL3,
          vertexShader: S.DUST_VERT,
          fragmentShader: S.DUST_FRAG,
          uniforms: dustU,
          depthWrite: false,
          depthTest: false,
          ...ADD,
        })
      )
    );
    dust.frustumCulled = false;
    dust.renderOrder = 3;
    scene.add(dust);
  }

  // The lines plan: one instanced quad per segment, MAX-blended into its own target.
  const lg = new InstancedBufferGeometry();
  lg.setAttribute(
    "position",
    new BufferAttribute(new Float32Array([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0]), 3)
  );
  lg.setIndex([0, 1, 2, 0, 2, 3]);
  lg.setAttribute("iA", new InstancedBufferAttribute(plan.A, 3));
  lg.setAttribute("iB", new InstancedBufferAttribute(plan.B, 3));
  lg.setAttribute("iN", new InstancedBufferAttribute(plan.N, 3));
  lg.setAttribute("iM", new InstancedBufferAttribute(plan.M, 4));
  lg.setAttribute("iR", new InstancedBufferAttribute(plan.R, 2));
  lg.setAttribute("iS", new InstancedBufferAttribute(plan.S, 2));
  lg.setAttribute("iV", new InstancedBufferAttribute(plan.V, 2));
  lg.instanceCount = plan.count;
  geometries.push(lg);
  const linesU: Uniforms = {
    uRes: { value: new Vector2(1, 1) },
    uDpr: { value: 1 },
    uFocus: { value: 15 },
    uCoC: { value: 4 },
    uGlowPx: { value: 3 },
    uGlowA: { value: 0.3 },
    uTime: { value: 0 },
    uDraw: { value: 1.2 },
    uGain: { value: 1 },
    uBack: { value: 0.5 },
    uTrail: { value: 1 },
    uRibbon: { value: 1 },
    uFront: { value: 0 },
    uFill: { value: 0 },
    uDir: { value: -1 },
    uFade: { value: 1 },
  };
  const lines = new Mesh(
    lg,
    own(
      new ShaderMaterial({
        glslVersion: GLSL3,
        vertexShader: S.LINES_VERT,
        fragmentShader: S.LINES_FRAG,
        uniforms: linesU,
        depthWrite: false,
        depthTest: false,
        ...MAX,
      })
    )
  );
  lines.frustumCulled = false;
  linesScene.add(lines);

  // Fullscreen passes.
  const fsCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const downM = own(mat(S.DOWN_FRAG, { uTex: { value: null }, uTexel: { value: new Vector2() } }));
  const blurM = own(mat(S.BLUR_FRAG, { uTex: { value: null }, uDir: { value: new Vector2() } }));
  const mergeM = own(
    mat(S.MERGE_FRAG, {
      uScene: { value: sceneRT.texture },
      uLines: { value: linesRT.texture },
      uBloomA: { value: qA.texture },
      uBloomB: { value: qB.texture },
      uBloomAK: { value: 0.8 },
      uBloomBK: { value: 0.6 },
    })
  );
  const fs = new Mesh(tri, downM);
  fs.frustumCulled = false;
  const pass = (m: ShaderMaterial, target: WebGLRenderTarget) => {
    fs.material = m;
    renderer.setRenderTarget(target);
    renderer.render(fs, fsCam);
  };
  const down = (src: WebGLRenderTarget, srcW: number, srcH: number, dst: WebGLRenderTarget) => {
    downM.uniforms.uTex.value = src.texture;
    downM.uniforms.uTexel.value.set(1 / srcW, 1 / srcH);
    pass(downM, dst);
  };
  const blur = (a: WebGLRenderTarget, b: WebGLRenderTarget, w: number, h: number) => {
    blurM.uniforms.uTex.value = a.texture;
    blurM.uniforms.uDir.value.set(1 / w, 0);
    pass(blurM, b);
    blurM.uniforms.uTex.value = b.texture;
    blurM.uniforms.uDir.value.set(0, 1 / h);
    pass(blurM, a);
  };

  let W = 1;
  let H = 1;
  let dpr = 1;
  const tgt = new Vector3();
  const savedClear = new Color();

  return {
    resize(w, h, d) {
      W = Math.max(1, Math.round(w));
      H = Math.max(1, Math.round(h));
      dpr = d;
      sceneRT.setSize(W, H);
      linesRT.setSize(W, H);
      const aw = Math.max(1, W >> 2);
      const ah = Math.max(1, H >> 2);
      qA.setSize(aw, ah);
      qA2.setSize(aw, ah);
      qB.setSize(Math.max(1, W >> 3), Math.max(1, H >> 3));
      qB2.setSize(Math.max(1, W >> 3), Math.max(1, H >> 3));
      camera.aspect = W / H;
    },

    render({ progress, time, draw }, target) {
      const p = progress;
      const { cam, look } = choreo(p, phone);

      // Camera: orbit about the hull; the lens shift keeps it in the free side of the layout.
      const az = cam.az * DEG;
      const el = cam.el * DEG;
      tgt.set(0, cam.ly, 0);
      camera.position
        .set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az))
        .multiplyScalar(cam.dist)
        .add(tgt);
      camera.up.set(0, 1, 0);
      camera.lookAt(tgt);
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
      camera.projectionMatrix.elements[8] = -cam.sx;
      camera.projectionMatrix.elements[9] = -cam.sy;
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
      camera.updateMatrixWorld();

      // Light: a low dawn sun that half-follows the orbit (stays behind the hull), a brass key.
      const sAz = (216 + 0.5 * (cam.az - 22)) * DEG;
      const sEl = 4 * DEG;
      sun.set(Math.cos(sEl) * Math.cos(sAz), Math.sin(sEl), Math.cos(sEl) * Math.sin(sAz));
      const kAz = (cam.az + 38) * DEG;
      const kEl = 38 * DEG;
      key.set(Math.cos(kEl) * Math.cos(kAz), Math.sin(kEl), Math.cos(kEl) * Math.sin(kAz));

      const intro = MathUtils.smoothstep(draw, 0.0, 0.7);
      const coc = look.coc * dpr;
      const focus = cam.dist;

      bgMat.uniforms.uInvVP.value.multiplyMatrices(
        camera.matrixWorld,
        camera.projectionMatrixInverse
      );
      bgMat.uniforms.uCam.value.copy(camera.position);
      bgMat.uniforms.uDawn.value = look.dawn * (0.4 + 0.6 * intro);

      seaU.uTime.value = time;
      seaU.uPhase.value = 0.3 * Math.sin(time * 0.21) + p * 1.4;
      seaU.uN.value = look.N;
      seaU.uLineA.value = look.lineA;
      seaU.uIdxA.value = look.idxA;
      seaU.uWrap.value = look.wrap;
      seaU.uRipple.value = look.ripple;
      seaU.uRipT.value = time * 0.85 + p * 18.0;
      seaU.uGlow.value = look.glow * intro;
      seaU.uWarm.value = look.warm;
      seaU.uFocus.value = focus;
      seaU.uCoC.value = coc;
      seaU.uDpr.value = dpr;
      seaU.uFade.value = intro;

      const front = MathUtils.lerp(xb + 0.6, xs - 0.6, look.front);
      glassU.uFill.value = look.fill * look.hull;
      glassU.uFront.value = front;
      glassU.uTime.value = time;

      dustU.uTime.value = time;
      dustU.uDpr.value = dpr;
      dustU.uFocus.value = focus;
      dustU.uCoC.value = coc;
      dustU.uAlpha.value = look.dust * 0.55 * intro;

      linesU.uRes.value.set(W, H);
      linesU.uDpr.value = dpr;
      linesU.uFocus.value = focus;
      linesU.uCoC.value = coc * 0.6;
      linesU.uGlowPx.value = 3.2 * dpr;
      linesU.uGlowA.value = 0.32 * look.glow;
      linesU.uTime.value = time;
      linesU.uDraw.value = draw;
      linesU.uGain.value = look.gain;
      linesU.uBack.value = look.back;
      linesU.uTrail.value = look.trail;
      linesU.uRibbon.value = look.ribbon;
      linesU.uFront.value = front;
      linesU.uFill.value = look.fill;
      linesU.uFade.value = look.hull;

      const autoClear = renderer.autoClear;
      const clearAlpha = renderer.getClearAlpha();
      renderer.getClearColor(savedClear);
      renderer.autoClear = false;
      renderer.setClearColor(0x000000, 1);
      renderer.setRenderTarget(sceneRT);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(linesRT);
      renderer.clear();
      renderer.render(linesScene, camera);

      const aw = qA.width;
      const ah = qA.height;
      down(linesRT, W, H, qA);
      blur(qA, qA2, aw, ah);
      if (T.bloomB) {
        down(qA, aw, ah, qB);
        blur(qB, qB2, qB.width, qB.height);
      }
      mergeM.uniforms.uBloomAK.value = look.bloomA;
      mergeM.uniforms.uBloomBK.value = T.bloomB ? look.bloomB : 0;
      pass(mergeM, target);
      renderer.setClearColor(savedClear, clearAlpha);
      renderer.autoClear = autoClear;
    },

    stats: () => ({
      segments: plan.count,
      hullTris: surf.index.length / 3,
      dust: T.dust,
      halfFloat: half,
    }),

    dispose() {
      for (const rt of targets) rt.dispose();
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
    },
  };
}
