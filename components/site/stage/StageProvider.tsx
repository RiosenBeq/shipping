import * as React from "react";
import { mirrorFocal, objectPosition } from "./compose";
import { PLATES, plateFrame, type PlatePoster } from "./plates";
import { StageClient } from "./StageClient";
import type { PlateFrame, PlateId } from "./types";

type Style = React.CSSProperties & Record<`--${string}`, string | number>;

/** React 18 knows `fetchpriority` only lowercase; the App Router's canary React knows `fetchPriority`. */
const fetchPriorityProp = (v: "high" | "low" | "auto") =>
  (typeof (React as unknown as { use?: unknown }).use === "function"
    ? { fetchPriority: v }
    : { fetchpriority: v }) as Record<string, string>;

function Poster({ poster, priority }: { poster: PlatePoster; priority: boolean }) {
  const sizes = "100vw";
  // Media library posters are one file of unknown width: no `w` descriptors to guess.
  const one = poster.avif === poster.webp;
  const landscapeAvif = poster.avifSmall
    ? `${poster.avifSmall} ${poster.smallWidth ?? 800}w, ${poster.avif} ${poster.width}w`
    : one
      ? poster.avif
      : `${poster.avif} ${poster.width}w`;
  const landscapeWebp = poster.webpSmall
    ? `${poster.webpSmall} ${poster.smallWidth ?? 800}w, ${poster.webp} ${poster.width}w`
    : one
      ? poster.webp
      : `${poster.webp} ${poster.width}w`;
  return (
    <picture>
      {poster.avifPortrait && (
        <source media="(max-aspect-ratio: 4/5)" type="image/avif" srcSet={poster.avifPortrait} />
      )}
      {poster.webpPortrait && (
        <source media="(max-aspect-ratio: 4/5)" type="image/webp" srcSet={poster.webpPortrait} />
      )}
      {!one && <source type="image/avif" srcSet={landscapeAvif} sizes={sizes} />}
      {!one && <source type="image/webp" srcSet={landscapeWebp} sizes={sizes} />}
      {/* eslint-disable-next-line @next/next/no-img-element -- art-directed <picture>, fixed layer */}
      <img
        src={poster.webp}
        alt=""
        width={poster.width}
        height={poster.height}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        {...fetchPriorityProp(priority ? "high" : "auto")}
      />
    </picture>
  );
}

export interface StageProviderProps {
  /**
   * The plates this page shows, in page order. Their graded posters are server-rendered (the
   * first one eagerly, `fetchpriority="high"`: it is the LCP candidate); later ones load as
   * their windows approach. Every plate a <StageWindow> uses must be listed.
   */
  plates: PlateId[];
  /** Chart frame hairlines and the horizon line over the stage (desktop). Default true. */
  frame?: boolean;
}

/**
 * The Stage (DESIGN-V2 §2, §6): one fixed layer behind the page that windows show through.
 * Mount it once per page, before the content. Server-renders poster mode (graded posters,
 * static procedural images, CSS grain and vignette) so the page is finished without
 * JavaScript or WebGL; on capable devices the WebGL compositor loads after the LCP and fades
 * in over the poster once it has a decoded frame. A server component: the media manifest
 * stays on the server, the client gets only each plate's framing. Contract: docs/STAGE.md.
 */
export function StageProvider({ plates, frame = true }: StageProviderProps) {
  const unique = Array.from(new Set(plates));
  const first = unique[0] ?? "none";
  const frames: Partial<Record<PlateId, PlateFrame>> = {};
  for (const id of unique) frames[id] = plateFrame(id);
  return (
    <StageClient plates={frames} first={first} ground={PLATES[first].ground} frame={frame}>
      {unique.map((id) => {
        const def = PLATES[id];
        // Graded posters of flipX clips are already mirrored: mirror the focal point too.
        const [fx, fy] = objectPosition(mirrorFocal(def.focal, def.flipX)).split(" ");
        const [px, py] = objectPosition(mirrorFocal(def.focalPhone, def.flipX)).split(" ");
        const style: Style = { "--fx": fx, "--fy": fy, "--fx-phone": px, "--fy-phone": py };
        // Media library footage: what the runtime plays itself if WebGL cannot draw it
        // (another site without CORS consent), and the grade it shows it through.
        const media = def.video
          ? {
              "data-video": def.video.src,
              ...(def.video.phone ? { "data-video-phone": def.video.phone } : {}),
              ...(def.video.remote ? { "data-remote": "" } : {}),
              ...(def.poster ? {} : { "data-no-poster": "" }),
              ...(def.flipX ? { "data-flip": "" } : {}),
            }
          : {};
        return (
          <div
            key={id}
            className="stage__layer"
            data-stage-layer={id}
            data-kind={def.kind}
            data-state={id === first ? "a" : "off"}
            data-grade={def.grade}
            {...media}
            style={style}
          >
            {def.poster && <Poster poster={def.poster} priority={id === first} />}
          </div>
        );
      })}
    </StageClient>
  );
}
