/**
 * PLACEHOLDER engine — replaced by the chosen prototype. Implements the
 * contract with a gradient sky and a gently moving sea so the stage, scroll
 * mapping and overlays can be exercised end to end.
 */
import * as THREE from "three";
import type { CreateVoyage, Voyage, VoyageInfo } from "../types";

export { VOYAGE_SCENES } from "../types";

const KEYS = [
  { at: 0, sky: ["#e6e0d2", "#ecdcc0"], sea: "#1c3949", y: 6, pitch: 0.1 },
  { at: 0.28, sky: ["#e3e3dc", "#e2dac6"], sea: "#1e3c4e", y: 40, pitch: -0.12 },
  { at: 0.52, sky: ["#e9dfca", "#e1b273"], sea: "#2b3b45", y: 12, pitch: 0.04 },
  { at: 0.76, sky: ["#0a1a2b", "#b98256"], sea: "#10202f", y: 10, pitch: 0.02 },
  { at: 1, sky: ["#03101b", "#0f2a40"], sea: "#061522", y: 8, pitch: 0.0 },
];

export const createVoyage: CreateVoyage = ({ canvas, reducedMotion, onFrame }) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 20000);

  const skyTop = new THREE.Color();
  const skyLow = new THREE.Color();
  const seaCol = new THREE.Color();
  const fog = new THREE.Fog(0xffffff, 200, 6000);
  scene.fog = fog;

  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(40000, 40000, 160, 160),
    new THREE.MeshBasicMaterial({ color: 0x1c3949 })
  );
  sea.rotation.x = -Math.PI / 2;
  scene.add(sea);
  const base = (sea.geometry.attributes.position.array as Float32Array).slice();

  let progress = 0;
  let time = 0;
  let width = 1;
  let height = 1;
  let raf = 0;
  let last = 0;

  const ease = (u: number) => u * u * (3 - 2 * u);
  const frameAt = (p: number) => {
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++;
    const a = KEYS[i];
    const b = KEYS[i + 1];
    const u = ease(Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at))));
    skyTop.set(a.sky[0]).lerp(new THREE.Color(b.sky[0]), u);
    skyLow.set(a.sky[1]).lerp(new THREE.Color(b.sky[1]), u);
    seaCol.set(a.sea).lerp(new THREE.Color(b.sea), u);
    camera.position.set(0, a.y + (b.y - a.y) * u, 0);
    camera.rotation.set(-(a.pitch + (b.pitch - a.pitch) * u) * 0.25, 0, 0);
  };

  const horizonY = () => {
    const v = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    v.y = 0;
    v.normalize().multiplyScalar(1e6).add(camera.position).setY(0).project(camera);
    return (1 - (v.y * 0.5 + 0.5)) * height;
  };

  const draw = () => {
    frameAt(progress);
    scene.background = skyLow;
    fog.color.copy(skyLow);
    (sea.material as THREE.MeshBasicMaterial).color.copy(seaCol);
    if (!reducedMotion) {
      const pos = sea.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 2] =
          Math.sin(base[i] * 0.02 + time) * 0.6 + Math.cos(base[i + 1] * 0.03 + time * 0.7) * 0.4;
      }
      pos.needsUpdate = true;
    }
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    onFrame?.({ horizonY: horizonY(), progress });
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (last) time += Math.min(0.05, (now - last) / 1000);
    last = now;
    draw();
  };

  const voyage: Voyage = {
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
    },
    setSize(w, h, dpr) {
      width = w;
      height = h;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 1 ? 62 : 45;
      camera.updateProjectionMatrix();
    },
    setTime(s) {
      time = s;
    },
    start() {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    renderOnce: draw,
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
      voyage.stop();
      sea.geometry.dispose();
      (sea.material as THREE.Material).dispose();
      renderer.dispose();
      void width;
    },
  };
  return voyage;
};
