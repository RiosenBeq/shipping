import type { CreateVoyage } from "../types";
import { createEngine } from "./engine";

export { VOYAGE_SCENES } from "../types";

/** LEVANTER "Voyage", take A — "Oil on linen". */
export const createVoyage: CreateVoyage = (opts) => createEngine(opts);
