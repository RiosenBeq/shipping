/**
 * Pointer flowmap (DESIGN-V2 §6.4): 128² RG half-float ping-pong, radius 0.06, dissipation
 * 0.96 per frame; the lens displaces footage by ≤ 0.012 uv along it. High tier, fine pointer
 * only; the lens switches it off inside calm zones and while motion is paused.
 */
import {
  GLSL3,
  HalfFloatType,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  RGFormat,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  type BufferGeometry,
  type WebGLRenderer,
} from "three";
import { FULLSCREEN_VERT } from "./glsl";

const SIZE = 128;
const SWIRL_SECONDS = 1.2;

const FRAG = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uPrev;
uniform vec2 uPoint;    // uv, y up
uniform vec2 uVel;      // uv / frame, clamped
uniform float uAspect;
uniform float uRadius;
uniform float uDissipation;
void main() {
  vec2 prev = texture(uPrev, vUv).rg * uDissipation;
  vec2 d = vUv - uPoint;
  d.x *= uAspect;
  float fall = exp(-dot(d, d) / (uRadius * uRadius));
  fragColor = vec4(clamp(prev + uVel * fall, -1.0, 1.0), 0.0, 1.0);
}
`;

export class Flowmap {
  private readonly targets: [WebGLRenderTarget, WebGLRenderTarget];
  private readonly material: ShaderMaterial;
  private readonly mesh: Mesh;
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private idx = 0;
  private last: Vector2 | null = null;
  private pending = new Vector2();
  private point = new Vector2(-10, -10);
  /** Seconds into the intro swirl (hero "surfacing"); < 0 when idle. */
  private swirl = -1;

  constructor(geometry: BufferGeometry) {
    const make = () =>
      new WebGLRenderTarget(SIZE, SIZE, {
        type: HalfFloatType,
        format: RGFormat,
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        depthBuffer: false,
      });
    this.targets = [make(), make()];
    this.material = new ShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uPrev: { value: null },
        uPoint: { value: this.point },
        uVel: { value: new Vector2() },
        uAspect: { value: 1 },
        uRadius: { value: 0.06 },
        uDissipation: { value: 0.96 },
      },
    });
    this.mesh = new Mesh(geometry, this.material);
    this.mesh.frustumCulled = false;
  }

  get texture() {
    return this.targets[this.idx].texture;
  }

  /** Pointer position in uv (0..1, y up). */
  move(u: number, v: number) {
    if (this.last) this.pending.add(new Vector2(u - this.last.x, v - this.last.y));
    this.last = new Vector2(u, v);
    this.point.set(u, v);
  }

  leave() {
    this.last = null;
  }

  /** Seed a soft swirl that settles over ~1.2 s (the hero's intro). */
  surface() {
    this.swirl = 0;
  }

  /** Advance one frame of `dt` seconds (dissipation 0.96 per 60 Hz frame, frame-rate independent). */
  step(renderer: WebGLRenderer, aspect: number, dt: number) {
    const u = this.material.uniforms;
    u.uDissipation.value = Math.pow(0.96, Math.max(0, dt) * 60);
    if (this.swirl >= 0 && this.swirl < SWIRL_SECONDS) {
      const t = this.swirl / SWIRL_SECONDS;
      const a = t * Math.PI * 3;
      this.point.set(0.62 + Math.cos(a) * 0.1, 0.5 + Math.sin(a) * 0.12);
      u.uVel.value
        .set(-Math.sin(a), Math.cos(a))
        .multiplyScalar(0.5 * (1 - t) * Math.min(2, dt * 60));
      this.swirl += dt;
    } else {
      u.uVel.value.copy(this.pending).multiplyScalar(6).clampLength(0, 1);
    }
    this.pending.set(0, 0);
    u.uAspect.value = aspect;
    u.uPrev.value = this.targets[this.idx].texture;
    const next = this.targets[1 - this.idx];
    renderer.setRenderTarget(next);
    renderer.render(this.mesh, this.camera);
    this.idx = 1 - this.idx;
  }

  dispose() {
    this.targets.forEach((t) => t.dispose());
    this.material.dispose();
  }
}
