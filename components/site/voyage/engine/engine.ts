import * as THREE from "three";
import type { Voyage, VoyageInfo, VoyageOptions, VoyageQuality } from "../types";
import { createSharedUniforms } from "./glsl";
import { makeNoiseTexture, makeRippleTexture } from "./noise";
import { createFrameState, evaluate, type FrameState } from "./timeline";
import { createSky } from "./sky";
import { createOcean, MAX_WAKES, SEA_RADIUS } from "./ocean";
import { createLand } from "./land";
import { createLandmarks } from "./landmarks";
import { createWires } from "./wires";
import { createFleet } from "./ships";
import { createLights } from "./lights";
import { createBirds } from "./birds";
import { createPost } from "./post";
import { DEG, clamp } from "./math";

interface Tier {
  q: number;
  dprCap: number;
  samples: number;
  seaCols: number;
  seaRows: number;
  waves: number;
  cloudOct: number;
  taps: number;
  birds: number;
}

/** Quality tiers: DPR cap, MSAA on the scene target (high only), grid density, shader cost. */
const TIERS: Record<VoyageQuality, Tier> = {
  high: {
    q: 2,
    dprCap: 1.75,
    samples: 4,
    seaCols: 150,
    seaRows: 120,
    waves: 8,
    cloudOct: 4,
    taps: 3,
    birds: 9,
  },
  medium: {
    q: 1,
    dprCap: 1.25,
    samples: 0,
    seaCols: 110,
    seaRows: 86,
    waves: 7,
    cloudOct: 3,
    taps: 2,
    birds: 7,
  },
  low: {
    q: 0,
    dprCap: 1,
    samples: 0,
    seaCols: 76,
    seaRows: 60,
    waves: 6,
    cloudOct: 3,
    taps: 1,
    birds: 5,
  },
};

const NEAR = 1.5;
const FAR = 220000;

const dirFromAzEl = (az: number, el: number, out: THREE.Vector3): THREE.Vector3 =>
  out.set(
    Math.sin(az * DEG) * Math.cos(el * DEG),
    Math.sin(el * DEG),
    -Math.cos(az * DEG) * Math.cos(el * DEG)
  );

export function createEngine(opts: VoyageOptions): Voyage {
  const quality: VoyageQuality = opts.quality ?? "high";
  const tier = TIERS[quality];
  const reduced = opts.reducedMotion === true;
  const canvas = opts.canvas;

  // AA is spent where it matters: MSAA on the scene target (high tier). The canvas
  // only ever receives the full-screen post triangle, so it needs neither AA nor depth.
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  renderer.info.autoReset = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x0a1f33, 1);
  const floatOK =
    renderer.extensions.has("EXT_color_buffer_float") ||
    renderer.extensions.has("EXT_color_buffer_half_float");

  const noise = makeNoiseTexture();
  const ripple = makeRippleTexture();
  ripple.texture.anisotropy = Math.min(
    tier.q === 2 ? 8 : tier.q === 1 ? 4 : 2,
    renderer.capabilities.getMaxAnisotropy()
  );
  const shared = createSharedUniforms(noise);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, NEAR, FAR);
  camera.rotation.order = "YXZ";

  const sky = createSky(shared, tier.cloudOct);
  const ocean = createOcean(shared, ripple.texture, tier.seaCols, tier.seaRows, tier.waves);
  const land = createLand(shared, tier.q);
  const marks = createLandmarks(shared, tier.q);
  const wires = createWires(marks.wires, shared);
  const fleet = createFleet(shared);
  const shipMatrices =
    fleet.mesh.material instanceof THREE.ShaderMaterial
      ? (fleet.mesh.material.uniforms.uShipM.value as THREE.Matrix4[])
      : [];
  const lights = createLights(fleet.ships, shipMatrices, marks.towerTops, tier.q);
  const birds = createBirds(shared, tier.birds);
  scene.add(
    sky.mesh,
    ocean.mesh,
    land,
    marks.mesh,
    wires.mesh,
    fleet.mesh,
    lights.mesh,
    birds.mesh
  );
  const post = createPost(noise, tier.taps);

  let cssW = 1;
  let cssH = 1;
  let dpr = 1;
  let target = 0;
  let progress = 0;
  let time = 12;
  let running = false;
  let raf = 0;
  let last = 0;
  let lost = false;
  let resumeAfterRestore = false;
  let disposed = false;
  const state: FrameState = createFrameState();

  const makeRT = (): THREE.WebGLRenderTarget =>
    new THREE.WebGLRenderTarget(
      Math.max(1, Math.round(cssW * dpr)),
      Math.max(1, Math.round(cssH * dpr)),
      {
        type: floatOK ? THREE.HalfFloatType : THREE.UnsignedByteType,
        samples: dpr > 1.4 ? Math.min(tier.samples, 2) : tier.samples,
        depthBuffer: true,
        stencilBuffer: false,
      }
    );
  let rt = makeRT();
  post.material.uniforms.tScene.value = rt.texture;

  const tmpV = new THREE.Vector3();
  const sunDir = shared.uSunDir.value;

  function applyCamera(): void {
    const c = state.cam;
    const sway = reduced ? 0 : 1;
    camera.position.copy(c.pos);
    camera.position.y += sway * 0.16 * Math.sin(time * 0.43);
    const yaw = c.yaw + sway * 0.0011 * Math.sin(time * 0.21);
    const pitch = c.pitch + sway * 0.0006 * Math.sin(time * 0.33 + 1);
    camera.rotation.set(pitch, -yaw, 0, "YXZ");
    camera.updateMatrixWorld();
    // vertical lens shift: horizon lands at c.hz from the top while verticals stay vertical
    const aspect = cssW / cssH;
    const tv = Math.tan(c.vfov / 2);
    const p12 = -(1 - 2 * c.hz) - Math.tan(c.pitch) / tv;
    const top = NEAR * tv * (1 + p12);
    const bottom = -NEAR * tv * (1 - p12);
    const right = NEAR * tv * aspect;
    camera.projectionMatrix.makePerspective(-right, right, top, bottom, NEAR, FAR);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    camera.fov = (c.vfov * 180) / Math.PI;
    camera.aspect = aspect;
    shared.uPixAng.value = c.vfov / cssH;
    const alphaMax = clamp(Math.atan(tv * (1 - p12)) - c.pitch + 7 * DEG, 10 * DEG, 88 * DEG);
    const half = Math.atan(tv * aspect) + 9 * DEG;
    ocean.update(camera.position, yaw, half, alphaMax);
  }

  function applyLook(): void {
    const L = state.look;
    const u = shared;
    u.uTime.value = time;
    u.uNight.value = L.night;
    dirFromAzEl(L.sunAz, L.sunEl, sunDir);
    u.uSunCol.value.copy(L.sunCol).multiplyScalar(L.sunI);
    dirFromAzEl(L.moonAz, L.moonEl, u.uMoonDir.value);
    u.uMoonCol.value.copy(L.moonCol).multiplyScalar(L.moonI);
    u.uZenith.value.copy(L.zenith);
    u.uSkyMid.value.copy(L.mid);
    u.uSkyHor.value.copy(L.hor);
    u.uGlow.value.copy(L.glow);
    u.uAnti.value.copy(L.anti);
    u.uSkyShape.value.set(L.glowW, L.glowA, L.antiA, L.horSharp);
    u.uFog.value.set(L.fogD, L.fogH, L.fogMax, L.hazeEl);
    u.uHazeTint.value.copy(L.hazeTint);
    dirFromAzEl(L.keyAz, L.keyEl, u.uKeyDir.value);
    u.uKeyCol.value.copy(L.keyCol).multiplyScalar(L.keyI);
    u.uAmbTop.value.copy(L.ambTop);
    u.uAmbLow.value.copy(L.ambLow);

    const su = sky.material.uniforms;
    (su.uCloud.value as THREE.Vector4).set(L.cloudCov, L.cloudSoft, L.cloudAmt, L.cloudScale);
    (su.uCloudLit.value as THREE.Color).copy(L.cloudLit);
    (su.uCloudShade.value as THREE.Color).copy(L.cloudShade);
    (su.uSunDisc.value as THREE.Vector4).set(L.sunR * DEG, 1, 0, 0);
    (su.uSunDiscCol.value as THREE.Color).copy(L.sunDisc).multiplyScalar(2.4);
    (su.uMoonDisc.value as THREE.Vector4).set(0.55 * DEG, Math.min(1, L.moonI * 1.5), 0, 0);
    su.uStars.value = L.stars;

    const ou = ocean.material.uniforms;
    ou.uWaveAmp.value = L.waveAmp;
    (ou.uSea.value as THREE.Vector4).set(L.ripple, L.glitter, L.foam, 0);
    (ou.uSeaDeep.value as THREE.Color).copy(L.seaDeep);
    (ou.uSeaBody.value as THREE.Color).copy(L.seaBody);
    (ou.uSeaSSS.value as THREE.Color).copy(L.seaSSS);
    (ou.uFoamCol.value as THREE.Color).copy(L.foamCol);

    const lu = lights.material.uniforms;
    lu.uLights.value = L.lights;
    lu.uTime.value = time;
    (lu.uRes.value as THREE.Vector2).set(cssW, cssH);
    lu.uStreak.value = 5 + L.waveAmp * 5;
    (wires.material.uniforms.uRes.value as THREE.Vector2).set(cssW, cssH);

    // gulls by day, in the upper-right of the frame (away from the headline)
    const bu = birds.material.uniforms;
    bu.uBirds.value = clamp(1 - L.lights * 2.2, 0, 1);
    const yaw = state.cam.yaw;
    const fx = Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const D = 150;
    const side = Math.tan(state.cam.vfov / 2) * (cssW / cssH) * D * 0.42;
    const up = Math.tan(state.cam.vfov / 2) * D * 0.55;
    (bu.uFlock.value as THREE.Vector3).set(
      camera.position.x + fx * D - fz * side,
      camera.position.y + up,
      camera.position.z + fz * D + fx * side
    );

    const pu = post.material.uniforms;
    (pu.uFx.value as THREE.Vector4).set(L.smear, 0.075, 0.03, L.vignette);
    (pu.uFx2.value as THREE.Vector4).set(0.32 + L.night * 0.25, 0.16, L.exposure, 0.92);
    pu.uGrainT.value = reduced ? 0 : time;
  }

  const wakeOrder: number[] = [];
  function applyShips(): void {
    fleet.update(time, state.look.waveAmp);
    const ou = ocean.material.uniforms;
    const A = ou.uShipA.value as THREE.Vector4[];
    const B = ou.uShipB.value as THREE.Vector4[];
    wakeOrder.length = 0;
    fleet.ships.forEach((s, i) => {
      if (Math.hypot(s.x - camera.position.x, s.z - camera.position.z) < 9000) wakeOrder.push(i);
    });
    wakeOrder.sort((a, b) => {
      const sa = fleet.ships[a];
      const sb = fleet.ships[b];
      return (
        Math.hypot(sa.x - camera.position.x, sa.z - camera.position.z) -
        Math.hypot(sb.x - camera.position.x, sb.z - camera.position.z)
      );
    });
    let n = 0;
    for (const i of wakeOrder) {
      if (n >= MAX_WAKES) break;
      const s = fleet.ships[i];
      const e = s.matrix.elements;
      A[n].set(e[12], e[14], s.heading, s.model.L * s.scale);
      B[n].set(
        s.model.B * s.scale,
        s.anchored ? 0.4 : s.speed,
        s.anchored ? 0.35 : 1,
        s.model.F * s.scale
      );
      n++;
    }
    ou.uShipN.value = n;
  }

  /** Projected far sea horizon in CSS px from the top; null when it is off-screen. */
  function horizonY(): number | null {
    if (cssH <= 1) return null;
    const yaw = -camera.rotation.y;
    tmpV.set(
      camera.position.x + Math.sin(yaw) * SEA_RADIUS,
      0,
      camera.position.z - Math.cos(yaw) * SEA_RADIUS
    );
    tmpV.project(camera);
    const y = (1 - (tmpV.y * 0.5 + 0.5)) * cssH;
    return y >= 0 && y <= cssH ? y : null;
  }

  function render(): void {
    if (lost || disposed) return;
    evaluate(progress, cssW / cssH, state);
    applyCamera();
    applyLook();
    applyShips();
    sky.update(camera);
    renderer.info.reset();
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(post.scene, post.camera);
    opts.onFrame?.({ horizonY: horizonY(), progress });
  }

  function tick(now: number): void {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    if (!reduced) time += dt;
    // critically damped follow of the scroll position
    const k = 1 - Math.exp(-dt * 5.5);
    progress += (target - progress) * k;
    if (Math.abs(target - progress) < 1e-5) progress = target;
    render();
  }

  const onLost = (e: Event): void => {
    e.preventDefault();
    resumeAfterRestore = running;
    stopLoop();
    lost = true;
  };
  const onRestored = (): void => {
    lost = false;
    rt.dispose();
    rt = makeRT();
    post.material.uniforms.tScene.value = rt.texture;
    noise.needsUpdate = true;
    ripple.texture.needsUpdate = true;
    if (resumeAfterRestore) startLoop();
    else render();
  };
  canvas.addEventListener("webglcontextlost", onLost, false);
  canvas.addEventListener("webglcontextrestored", onRestored, false);

  function startLoop(): void {
    if (running || lost || disposed) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
  function stopLoop(): void {
    running = false;
    cancelAnimationFrame(raf);
  }

  return {
    setProgress(p: number) {
      target = clamp(Number.isFinite(p) ? p : 0, 0, 1);
      if (!running) progress = target;
    },
    setSize(w: number, h: number, ratio: number) {
      cssW = Math.max(1, Math.floor(w));
      cssH = Math.max(1, Math.floor(h));
      dpr = clamp(Number.isFinite(ratio) ? ratio : 1, 0.5, tier.dprCap);
      renderer.setPixelRatio(dpr);
      renderer.setSize(cssW, cssH, false);
      rt.dispose();
      rt = makeRT();
      post.material.uniforms.tScene.value = rt.texture;
      (post.material.uniforms.uRes.value as THREE.Vector2).set(
        Math.round(cssW * dpr),
        Math.round(cssH * dpr)
      );
      post.material.uniforms.uDpr.value = dpr;
    },
    setTime(seconds: number) {
      time = Number.isFinite(seconds) ? seconds : 12;
    },
    start: startLoop,
    stop: stopLoop,
    renderOnce() {
      progress = target;
      render();
    },
    getHorizonY: horizonY,
    info(): VoyageInfo {
      const i = renderer.info;
      return {
        calls: i.render.calls,
        triangles: i.render.triangles,
        programs: i.programs?.length ?? 0,
        textures: i.memory.textures,
        geometries: i.memory.geometries,
      };
    },
    dispose() {
      if (disposed) return;
      stopLoop();
      disposed = true;
      canvas.removeEventListener("webglcontextlost", onLost, false);
      canvas.removeEventListener("webglcontextrestored", onRestored, false);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const m = o.material as THREE.Material | THREE.Material[];
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m.dispose();
        }
      });
      post.scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
      noise.dispose();
      ripple.texture.dispose();
      rt.dispose();
      renderer.dispose();
    },
  };
}
