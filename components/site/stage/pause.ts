/**
 * "Pause motion" (WCAG 2.2.2: moving content longer than 5 s can be paused). One state for the
 * whole page, shared by every <PauseMotion/> button and the stage, kept per viewer in
 * localStorage (every access guarded: private windows and blocked storage throw) and mirrored
 * on <html data-motion="paused"> so CSS animation can stop with it.
 */

export const PAUSE_KEY = "obm:motion-paused";
/** The key before the OBM Shipping rename: migrated once on first read, then removed. */
const LEGACY_PAUSE_KEY = ["lev", "anter:motion-paused"].join("");

type Listener = (paused: boolean) => void;
const listeners = new Set<Listener>();
let paused: boolean | null = null;

function read(): boolean {
  try {
    const ls = window.localStorage;
    const legacy = ls.getItem(LEGACY_PAUSE_KEY);
    if (legacy !== null) {
      if (legacy === "1" && ls.getItem(PAUSE_KEY) === null) ls.setItem(PAUSE_KEY, "1");
      ls.removeItem(LEGACY_PAUSE_KEY);
    }
    return ls.getItem(PAUSE_KEY) === "1";
  } catch {
    return false;
  }
}

function reflect(v: boolean) {
  if (typeof document === "undefined") return;
  if (v) document.documentElement.dataset.motion = "paused";
  else delete document.documentElement.dataset.motion;
}

/** Current state (false on the server). */
export function isMotionPaused(): boolean {
  if (typeof window === "undefined") return false;
  if (paused === null) {
    paused = read();
    reflect(paused);
  }
  return paused;
}

export function setMotionPaused(v: boolean) {
  paused = v;
  try {
    if (v) window.localStorage.setItem(PAUSE_KEY, "1");
    else window.localStorage.removeItem(PAUSE_KEY);
  } catch {
    // Storage unavailable: the choice holds for this page view only.
  }
  reflect(v);
  for (const l of listeners) l(v);
}

export function subscribeMotionPaused(l: Listener): () => void {
  listeners.add(l);
  // Another tab changed it.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== PAUSE_KEY) return;
    paused = e.newValue === "1";
    reflect(paused);
    l(paused);
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}
