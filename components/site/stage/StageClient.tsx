"use client";

import { useEffect, useRef } from "react";
import { CALM_MAX } from "./calm";
import { StageRuntime } from "./runtime";
import type { Ground, PlateFrame, PlateId } from "./types";

/**
 * The stage's client half: the fixed layers around the server-rendered posters, and the DOM
 * runtime that drives them (and, once loaded, the WebGL compositor). Rendered by
 * StageProvider; not used directly.
 */
export function StageClient({
  plates,
  first,
  ground,
  frame,
  children,
}: {
  plates: Partial<Record<PlateId, PlateFrame>>;
  first: PlateId;
  ground: Ground;
  frame: boolean;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const platesRef = useRef(plates);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const rt = new StageRuntime({
      root,
      canvas,
      frame: frameRef.current,
      plates: platesRef.current,
      load: () => import("./gl/compositor").then((m) => m.createCompositor),
    });
    rt.start();
    return () => rt.dispose();
  }, []);

  return (
    <>
      <div
        ref={rootRef}
        className="stage"
        data-mode="poster"
        data-a={first}
        data-ground={ground}
        aria-hidden="true"
      >
        <div className="stage__posters">{children}</div>
        <canvas ref={canvasRef} className="stage__canvas" />
        <div className="stage__calm">
          {Array.from({ length: CALM_MAX }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <div className="stage__vignette" />
        <div className="stage__grain" />
        <i className="stage__tide" />
      </div>
      {frame && (
        <div ref={frameRef} className="stage-frame" aria-hidden="true">
          <i className="stage-frame__top" />
          <i className="stage-frame__start" />
          <i className="stage-frame__end" />
          <span className="stage-plus stage-plus--top-start" />
          <span className="stage-plus stage-plus--top-end" />
          <div className="stage-frame__horizon">
            <span className="stage-plus stage-plus--start" />
            <span className="stage-plus stage-plus--end" />
          </div>
        </div>
      )}
    </>
  );
}
