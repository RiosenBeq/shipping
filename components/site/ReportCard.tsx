import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { reportDateIso, type Report } from "@/lib/data/research";
import { cn } from "@/lib/utils";

/**
 * A post teaser without a cover (paper ground): desk and format, title, dek, date and
 * reading time; the whole card is the link (to /blog/<slug>). Pages with room for covers use
 * the blog's PostCard instead.
 */
export function ReportCard({ report, className }: { report: Report; className?: string }) {
  return (
    <article className={cn("h-full", className)}>
      <Link href={report.href} className="ip-report">
        <p className="t-label acc">
          {report.desk === "lpg" ? "LPG" : report.desk === "both" ? "Tankers · LPG" : "Tankers"}
          <span aria-hidden="true"> · </span>
          <span className="text-slate">{report.catLabel}</span>
        </p>
        <h3 className="t-card">{report.title}</h3>
        <p className="ip-report__desc">{report.desc}</p>
        <span className="ip-report__meta">
          <time dateTime={reportDateIso(report.date).slice(0, 10)} className="t-data">
            {report.date}
          </time>
          <span aria-hidden="true">·</span>
          {report.gated ? (
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Full report on request
            </span>
          ) : (
            <span>{report.read} min read</span>
          )}
          <span className="ip-report__arrow" aria-hidden="true">
            <ArrowRight />
          </span>
        </span>
      </Link>
    </article>
  );
}
