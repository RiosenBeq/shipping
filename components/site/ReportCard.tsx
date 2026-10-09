import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { reportDateIso, reportSlug, type Report } from "@/lib/data/research";

export function ReportCard({ report }: { report: Report }) {
  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-line bg-white p-6 transition-colors hover:border-navy/40">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brass-ink">
        <span>{report.desk === "lpg" ? "LPG" : "Tankers"}</span>
        <span aria-hidden="true" className="text-line">
          /
        </span>
        <span className="text-slate">{report.catLabel}</span>
      </p>
      <h3 className="mt-3 font-display text-xl leading-snug text-navy">
        <Link href={`/research/${reportSlug(report)}`} className="after:absolute after:inset-0">
          {report.title}
        </Link>
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-slate">{report.desc}</p>
      <p className="mt-auto flex items-center justify-between pt-5 text-xs text-slate">
        <time dateTime={reportDateIso(report.date).slice(0, 10)}>{report.date}</time>
        <span className="flex items-center gap-1 font-medium text-navy group-hover:text-brass-ink">
          {report.gated ? "Summary" : `${report.read} min read`}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </p>
    </article>
  );
}
