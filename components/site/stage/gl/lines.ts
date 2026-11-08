/**
 * `P-lines` (DESIGN-V2 §6.3): the active class's lines plan in brass hairlines (α .55, the
 * design waterline α .9) with a light ribbon travelling along the waterline every 1.6 s.
 * Camera fov 18°, yaw ±12° with the pointer and a slight idle bob; switching class morphs the
 * hull in 700 ms (ease-swell) by interpolating the class parameters.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  GLSL3,
  LinearSRGBColorSpace,
  LineSegments,
  MathUtils,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
} from "three";
import { morphAt, type ShipClassSlug } from "../lines/classes";
import { buildLines } from "../lines/geometry";

const VERT = /* glsl */ `
in float alpha;
in float ribbon;
out float vA;
out float vR;
uniform float uFocus;   // view-space distance to the hull's centre
uniform float uDepth;   // half the hull's depth range
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  // Depth cue: the far side of the hull recedes, so the lines read as a solid form.
  float far = smoothstep(-uDepth, uDepth, -mv.z - uFocus);
  vA = alpha * mix(1.0, 0.4, far);
  vR = ribbon;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
in float vA;
in float vR;
out vec4 fragColor;
uniform vec3 uColor;
uniform vec3 uRibbon;
uniform float uTime;
uniform float uOpacity;
void main() {
  float r = 0.0;
  if (vR >= 0.0) {
    float d = abs(fract(vR - uTime / 1.6 + 0.5) - 0.5);
    r = exp(-d * d / 0.0025) * 1.6;
  }
  fragColor = vec4(uColor * vA * 1.35 * uOpacity + uRibbon * r * uOpacity, 1.0);
}
`;

/** A colour as raw sRGB numbers: the stage's targets hold display values, not linear light. */
export function raw(hex: number) {
  return new Color().setRGB(
    ((hex >> 16) & 255) / 255,
    ((hex >> 8) & 255) / 255,
    (hex & 255) / 255,
    LinearSRGBColorSpace
  );
}

export class LinesPlate {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(18, 2, 0.5, 400);
  private readonly material: ShaderMaterial;
  private readonly mesh: LineSegments;
  private from: ShipClassSlug = "vlgc";
  private to: ShipClassSlug = "vlgc";
  private morphStart = -1;
  private built = false;
  private yaw = 0;
  private yawTarget = 0;

  constructor() {
    this.material = new ShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uColor: { value: raw(0xd9b071) },
        uRibbon: { value: raw(0xf6e3b4) },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uFocus: { value: 50 },
        uDepth: { value: 4 },
      },
    });
    this.mesh = new LineSegments(new BufferGeometry(), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  /** Ask for a class; a change starts the 700 ms morph (instantly with reduced motion). */
  setClass(slug: ShipClassSlug, now: number, instant: boolean) {
    if (!this.built) {
      this.from = this.to = slug;
      this.rebuild(now);
      return;
    }
    if (slug === this.to) return;
    // Morph from wherever the hull is now: restart from the current target.
    this.from = this.to;
    this.to = slug;
    this.morphStart = instant ? -1 : now;
    if (instant) this.from = slug;
    this.rebuild(now);
  }

  get morphing() {
    return this.morphStart >= 0;
  }

  private rebuild(now: number) {
    const elapsed = this.morphStart >= 0 ? now - this.morphStart : 1e9;
    const m = morphAt(this.from, this.to, elapsed);
    const g = buildLines(m.params, m.kitFrom, m.kitTo, m.kitMix);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(g.position, 3));
    geo.setAttribute("alpha", new BufferAttribute(g.alpha, 1));
    geo.setAttribute("ribbon", new BufferAttribute(g.ribbon, 1));
    this.mesh.geometry.dispose();
    this.mesh.geometry = geo;
    this.built = true;
    if (m.done) this.morphStart = -1;
  }

  /** Pointer x in −1..1 across the viewport (0 = centre); null = no pointer. */
  pointer(x: number | null) {
    this.yawTarget = x == null ? 0 : MathUtils.clamp(x, -1, 1) * 12;
  }

  /** Advance the morph, the yaw easing and the camera for a rect of this aspect. */
  update(now: number, seconds: number, aspect: number, animate: boolean) {
    if (this.morphStart >= 0) this.rebuild(now);
    this.yaw += (this.yawTarget - this.yaw) * (animate ? 0.06 : 1);
    this.material.uniforms.uTime.value = seconds;
    // Frame a ~10-unit hull: 3/4 view from forward of the port beam, slightly above.
    const bob = animate ? Math.sin(seconds * 0.6) * 0.25 : 0;
    const az = MathUtils.degToRad(68 + this.yaw);
    const el = MathUtils.degToRad(17 + bob);
    this.camera.aspect = aspect;
    const vfov = MathUtils.degToRad(this.camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    // The hull's ~10 units fill ~85% of the slot's width (or its height on tall slots).
    const dist = Math.max(5.2 / Math.tan(hfov / 2), 2.1 / Math.tan(vfov / 2));
    this.camera.position.set(
      Math.cos(el) * Math.cos(az) * dist,
      Math.sin(el) * dist + 0.4,
      Math.cos(el) * Math.sin(az) * dist
    );
    this.camera.lookAt(0, 0.35, 0);
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uFocus.value = dist;
    this.material.uniforms.uDepth.value = 3.2;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
