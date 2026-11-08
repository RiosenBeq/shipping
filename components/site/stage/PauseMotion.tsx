"use client";

import { useEffect, useState } from "react";
import { isMotionPaused, setMotionPaused, subscribeMotionPaused } from "./pause";

/**
 * "Pause motion" (WCAG 2.2.2, DESIGN-V2 §6.5): stops the stage's video, grain, ping and
 * ribbons and every CSS animation keyed to `html[data-motion="paused"]`. All instances on a
 * page share one state, remembered per viewer. The visible label is the action ("Pause motion"
 * / "Play motion"), so no `aria-pressed` on top of it.
 */
export function PauseMotion({
  className,
  labels = { pause: "Pause motion", play: "Play motion" },
}: {
  className?: string;
  labels?: { pause: string; play: string };
}) {
  // Server and first client render agree (not paused); the stored choice applies after mount.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    setPaused(isMotionPaused());
    return subscribeMotionPaused(setPaused);
  }, []);
  return (
    <button
      type="button"
      className={className ? `stage-pause ${className}` : "stage-pause"}
      onClick={() => setMotionPaused(!paused)}
    >
      <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        {paused ? (
          <path d="M3 1.8v8.4L10.2 6z" fill="currentColor" />
        ) : (
          <>
            <rect x="2" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" />
            <rect x="7.4" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" />
          </>
        )}
      </svg>
      <span>{paused ? labels.play : labels.pause}</span>
    </button>
  );
}
