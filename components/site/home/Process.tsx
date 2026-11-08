import { StageAperture, StageWindow, calm, type PlateId } from "@/components/site/stage";
import type { HomeView } from "./types";

type Style = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * 5 · How we work — the showreel aperture (DESIGN-V2 §7.5). Starts on paper:
 * "— How we work" and the h2 over a 16:9 rounded aperture 62% wide on the reel
 * (dusk). Desktop: pinned 220vh — over the first 45% the aperture grows to
 * full bleed (radius 28 → 0) while the heading fades and rises out; over the
 * rest the four steps light up one by one in a night glass band with a
 * progress hairline filling between them (all CSS, from the stage's
 * `--stage-pin`). The window's ground turns dark once the reel fills the
 * screen (HomeMotion). Phones: no pin; the card widens from 88% to full width
 * as it crosses the viewport, the steps follow as a vertical list on night.
 */
export function Process({ view, id, plate }: { view: HomeView; id: string; plate: PlateId }) {
  const { process } = view;
  return (
    <StageWindow
      id={id}
      plate={plate}
      ground="light"
      className="h-process h-pinned"
      aria-labelledby="process-title"
      data-ground-at="0.42"
      data-ground-from="light"
      data-ground-to="dark"
      data-fab-hide=""
    >
      <div className="h-process__pin h-sticky">
        <header className="h-process__head h-edge">
          <p className="t-sub">{process.sub}</p>
          <h2 id="process-title" className="t-display">
            {process.title}
          </h2>
        </header>
        <div className="h-process__reel">
          <StageAperture ground="light" className="h-process__ap" />
          <div className="h-process__band on-night h-edge">
            <div className="h-process__glass" {...calm(0.5)}>
              <ol className="h-steps">
                {process.steps.map((s, i) => (
                  <li key={s.title} className="h-step" style={{ "--i": i } as Style}>
                    <span className="t-data h-step__n" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="t-card">{s.title}</h3>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
              <span className="h-steps__line" aria-hidden="true">
                <i />
              </span>
            </div>
          </div>
        </div>
      </div>
    </StageWindow>
  );
}
