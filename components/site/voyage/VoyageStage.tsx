"use client";

import { useEffect, useRef } from "react";
import { anchorsFromSections, nearestScene, progressAt, type SceneAnchor } from "./progress";
import { hasFastWebGL, pickQuality, readDeviceHints, renderDpr } from "./quality";
import { VOYAGE_SCENES, type Voyage, type VoyageQuality, type VoyageSceneId } from "./types";

const SCENE_ATTR = "data-voyage-scene";
const SCENE_IDS = new Set<string>(VOYAGE_SCENES.map((s) => s.id));

/** `?voyage=1` forces the live stage (software WebGL in tests); `?voyage=0` keeps the static one. */
function forcedMode(): "on" | "off" | null {
  const v = new URLSearchParams(window.location.search).get("voyage");
  return v === "1" ? "on" : v === "0" ? "off" : null;
}

function windowSections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(`[${SCENE_ATTR}]`)).filter((el) =>
    SCENE_IDS.has(el.getAttribute(SCENE_ATTR) ?? "")
  );
}

/**
 * The homepage's fixed backdrop: a live three.js sea journey (the Bosphorus at
 * first light → open water → under the bridge → dusk → night) that follows the
 * scroll position, framed by chart hairlines and a horizon line.
 *
 * Sections opt in with `data-voyage-scene="<scene id>"` and a transparent
 * background; every other section is an opaque sheet that slides over the
 * stage. The engine (three.js) is imported once the page is idle and only on
 * devices that can run it; everyone else keeps the static painted backdrop,
 * which is also what the server renders.
 *
 * Nothing renders while the tab is hidden or no window section is on screen.
 * With reduced motion the sea is a still image per scene: no ambient
 * animation and no camera flight between scenes.
 */
export function VoyageStage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const horizonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const horizon = horizonRef.current;
    if (!root || !canvas || !horizon) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forced = forcedMode();
    let engine: Voyage | null = null;
    let quality: VoyageQuality | null = null;
    let anchors: SceneAnchor[] = [];
    let progress = -1;
    let running = false;
    let disposed = false;
    let scrollFrame = 0;
    let measureFrame = 0;
    const onScreen = new Set<Element>();

    const visible = () => !document.hidden && onScreen.size > 0;
    /** Repaint a still frame when the loop is off but the stage can be seen. */
    const refresh = () => {
      if (engine && !running && visible()) engine.renderOnce();
    };

    // ---- scroll → progress ------------------------------------------------
    const applyScroll = () => {
      scrollFrame = 0;
      const p = progressAt(window.scrollY, anchors);
      const scene = nearestScene(p);
      if (root.dataset.scene !== scene.id) {
        root.dataset.scene = scene.id;
        root.dataset.tone = scene.tone;
      }
      const next = reduceMotion.matches ? scene.at : p;
      if (next === progress) return;
      progress = next;
      if (!engine) return;
      engine.setProgress(progress);
      refresh();
    };
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(applyScroll);
    };

    const measure = () => {
      measureFrame = 0;
      const sy = window.scrollY;
      anchors = anchorsFromSections(
        windowSections().map((el) => {
          const r = el.getBoundingClientRect();
          return {
            id: el.getAttribute(SCENE_ATTR) as VoyageSceneId,
            top: r.top + sy,
            height: r.height,
          };
        }),
        window.innerHeight
      );
      applyScroll();
    };
    const scheduleMeasure = () => {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(measure);
    };

    // ---- run / pause ------------------------------------------------------
    const updateRunning = () => {
      if (!engine) return;
      const want = visible() && !reduceMotion.matches;
      if (want !== running) {
        running = want;
        if (want) engine.start();
        else engine.stop();
      }
      refresh();
    };

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) onScreen.add(e.target);
        else onScreen.delete(e.target);
      }
      updateRunning();
    });

    // ---- sizing -------------------------------------------------------------
    const resize = () => {
      if (!engine || !quality) return;
      const w = root.clientWidth;
      const h = root.clientHeight;
      engine.setSize(w, h, renderDpr(w, h, window.devicePixelRatio || 1, quality));
      refresh();
    };
    // The stage is 100lvh tall, so mobile URL-bar show/hide doesn't resize it.
    const stageObserver = new ResizeObserver(() => {
      resize();
      scheduleMeasure();
    });
    // Layout shifts (fonts, images, streamed content) move the section anchors.
    const pageObserver = new ResizeObserver(scheduleMeasure);

    // ---- engine lifecycle -----------------------------------------------------
    const placeHorizon = (y: number | null) => {
      if (y == null || y < 0 || y > root.clientHeight) {
        horizon.style.opacity = "0";
        return;
      }
      horizon.style.opacity = "";
      horizon.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };

    const fail = () => {
      engine?.dispose();
      engine = null;
      running = false;
      root.dataset.state = "static";
      horizon.style.transform = "";
      horizon.style.opacity = "";
    };

    const build = async () => {
      const mod = await import("./engine");
      if (disposed || !quality) return;
      engine?.dispose();
      running = false;
      let first = true;
      const next = mod.createVoyage({
        canvas,
        quality,
        reducedMotion: reduceMotion.matches,
        onFrame: (f) => {
          placeHorizon(f.horizonY);
          if (first) {
            first = false;
            root.dataset.state = "live";
          }
        },
      });
      engine = next;
      next.setProgress(Math.max(0, progress));
      resize();
      next.renderOnce();
      updateRunning();
    };

    const boot = () => {
      if (disposed || !quality) return;
      // Software WebGL would crawl: those visitors keep the static backdrop.
      if (forced !== "on" && !hasFastWebGL()) return;
      build().catch(fail);
    };

    const onMotionChange = () => {
      applyScroll();
      if (engine) build().catch(fail);
    };
    const onVisibility = () => updateRunning();
    const onLost = () => {
      if (!engine) return;
      engine.stop();
      running = false;
    };
    // The engine rebuilds its GPU state in its own listener; resume after it.
    const onRestored = () => {
      window.setTimeout(() => {
        resize();
        updateRunning();
      }, 0);
    };

    // ---- start ----------------------------------------------------------------
    measure();
    windowSections().forEach((el) => io.observe(el));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", onMotionChange);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    stageObserver.observe(root);
    pageObserver.observe(document.body);

    quality =
      forced === "off"
        ? null
        : forced === "on"
          ? (pickQuality(readDeviceHints()) ?? "low")
          : pickQuality(readDeviceHints());

    let idle = 0;
    let timer = 0;
    if (quality) {
      // After the page is interactive: the stage is decoration, never the LCP.
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(boot, { timeout: 2500 });
      } else {
        timer = window.setTimeout(boot, 1200);
      }
    }

    return () => {
      disposed = true;
      if (idle) window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (measureFrame) window.cancelAnimationFrame(measureFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleMeasure);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      io.disconnect();
      stageObserver.disconnect();
      pageObserver.disconnect();
      engine?.dispose();
      engine = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="voyage-stage"
      data-scene="hero"
      data-tone="light"
      data-state="static"
      aria-hidden="true"
    >
      {/* Static painted backdrop per scene: what the server renders, and what
          visitors without fast WebGL (or saving data) keep. */}
      <div className="voyage-backdrop">
        {VOYAGE_SCENES.map((s) => (
          <i key={s.id} data-for={s.id} />
        ))}
      </div>
      <canvas ref={canvasRef} className="voyage-canvas" />
      <div className="voyage-grain" />
      <div className="voyage-chart">
        <i className="voyage-chart__top" />
        <i className="voyage-chart__start" />
        <i className="voyage-chart__end" />
        <span className="voyage-plus voyage-plus--top-start" />
        <span className="voyage-plus voyage-plus--top-end" />
      </div>
      <div ref={horizonRef} className="voyage-horizon">
        <span className="voyage-plus voyage-plus--start" />
        <span className="voyage-plus voyage-plus--end" />
      </div>
    </div>
  );
}
