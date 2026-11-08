import * as THREE from "three";

/** LEVANTER brand palette plus the extra sea tones allowed by the brief (sRGB hex). */
export const BRAND = {
  navy: 0x0a1f33,
  navyDeep: 0x051624,
  navySoft: 0x13304a,
  brass: 0xb8893a,
  brassInk: 0x8a6420,
  brassLight: 0xd9b071,
  sand: 0xf3efe4,
  line: 0xe4ddcc,
  slate: 0x4a5e6e,
  fog: 0xa9b6bf,
  page: 0xfbfaf7,
  teal: 0x1b4d5c,
  deepSea: 0x0e3454,
  foam: 0x8aa6b0,
  paper: 0xf2ebdd,
  ink: 0x0b0f0d,
} as const;

/** Linear working-space colour from an sRGB hex (ColorManagement converts on setHex). */
export function lin(hex: number, scale = 1): THREE.Color {
  return new THREE.Color().setHex(hex).multiplyScalar(scale);
}

/** Raw sRGB components (0..1), for the post pass which grades in display space. */
export function srgb(hex: number): THREE.Vector3 {
  return new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);
}
