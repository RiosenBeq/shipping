import { Results, fmt } from "../lib/calc";
import { RouteData } from "../lib/data";

type Props = {
  route: RouteData;
  distance: number;
  speed: number;
  results: Results;
  vesselLabel: string;
};

export function VoyageTimeline({ route, distance, speed, results, vesselLabel }: Props) {
  const className = vesselLabel.split(" — ")[0];
  return (
    <div className="section-block">
      <h2 className="results-h">
        Voyage profile
        <span className="meta">
          {className} · {speed} kn · {fmt(distance)} nm
        </span>
      </h2>
      <div className="timeline">
        <div className="tl-seg port">
          <div className="tl-label">Load</div>
          <div className="tl-port">{route.load}</div>
          <div className="tl-meta">2.0 days · port costs incl.</div>
        </div>
        <div className="tl-seg steam">
          <div className="tl-label">Laden Passage</div>
          <div className="tl-port">{fmt(distance)} nm</div>
          <div className="tl-meta">
            {results.seaDays.toFixed(1)} days · {speed} kn
          </div>
        </div>
        <div className="tl-seg port">
          <div className="tl-label">Discharge</div>
          <div className="tl-port">{route.disch}</div>
          <div className="tl-meta">2.0 days · port costs incl.</div>
        </div>
        <div className="tl-seg idle">
          <div className="tl-label">Reposition / Buffer</div>
          <div className="tl-port">+ 0.5 d</div>
          <div className="tl-meta">contingency</div>
        </div>
      </div>
    </div>
  );
}
