import Link from "next/link";
import { reportDateIso, reportSlug, type Report } from "@/lib/data/research";
import { cn } from "@/lib/utils";

/** Research note teaser: the whole `.uv-card` is the link. */
export function ReportCard({ report, className }: { report: Report; className?: string }) {
  return (
    <article className={cn("h-full", className)}>
      <Link href={`/research/${reportSlug(report)}`} className="uv-card h-full">
        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brass-ink">
          <span>{report.desk === "lpg" ? "LPG" : "Tankers"}</span>
          <span className="h-3 w-px bg-line" aria-hidden="true" />
          <span className="text-slate">{report.catLabel}</span>
        </p>
        {/* kit title, set in the display serif for an editorial feel */}
        <h3 className="uv-card__title font-display !text-[1.3rem] !font-medium !leading-snug">
          {report.title}
        </h3>
        <p className="text-[15px] leading-relaxed text-slate">{report.desc}</p>
        <span className="uv-card__meta flex flex-wrap items-center gap-x-2 gap-y-1 pr-10 pt-4">
          <time dateTime={reportDateIso(report.date).slice(0, 10)} className="font-mono text-xs">
            {report.date}
          </time>
          <span aria-hidden="true">·</span>
          <span>{report.gated ? "Summary" : `${report.read} min read`}</span>
        </span>
        <span className="uv-card__arrow" aria-hidden="true" />
      </Link>
    </article>
  );
}
