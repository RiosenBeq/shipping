"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { REPORTS, Report, reportSlug } from "@/lib/data/research";
import { ResearchCategory, SubscribeSchema } from "@/lib/schemas";
import { siteConfig } from "@/lib/site";
import { trackConversion } from "@/lib/analytics";

const FILTERS: { value: ResearchCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "weekly", label: "Weekly Outlook" },
  { value: "route", label: "Route Guides" },
  { value: "reg", label: "Regulatory" },
  { value: "sp", label: "S&P Snapshots" },
  { value: "annual", label: "Annual" },
];

function Cover({ r }: { r: Report }) {
  return (
    <svg
      className="cv"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="400" height="300" fill={r.coverColor} />
      <g stroke="rgba(241,236,220,0.06)" strokeWidth="0.4">
        <line x1="0" y1="60" x2="400" y2="60" />
        <line x1="0" y1="120" x2="400" y2="120" />
        <line x1="0" y1="180" x2="400" y2="180" />
        <line x1="0" y1="240" x2="400" y2="240" />
      </g>
      <path
        d="M 30 220 L 75 200 L 120 210 L 165 175 L 210 165 L 255 185 L 300 145 L 345 125 L 380 100"
        stroke={r.coverAccent}
        strokeWidth="1.5"
        fill="none"
        opacity="0.85"
      />
      <circle cx="380" cy="100" r="3" fill={r.coverAccent} />
    </svg>
  );
}

export function ResearchPortal() {
  const [cat, setCat] = useState<ResearchCategory>("all");
  const [q, setQ] = useState("");
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "ok" | "error">("idle");
  const [subError, setSubError] = useState("");

  const counts = useMemo(() => {
    const counts: Record<ResearchCategory, number> = {
      all: REPORTS.length,
      weekly: 0,
      route: 0,
      reg: 0,
      sp: 0,
      annual: 0,
    };
    REPORTS.forEach((r) => {
      counts[r.cat] += 1;
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return REPORTS.filter((r) => {
      if (cat !== "all" && r.cat !== cat) return false;
      if (ql && !(r.title + r.desc + r.label).toLowerCase().includes(ql)) return false;
      return true;
    });
  }, [cat, q]);

  // No mailing-list backend yet — validate the email and open the visitor's mail
  // client with a pre-filled request; the desk adds them to the list by hand.
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const result = SubscribeSchema.safeParse({ email });
    if (!result.success) {
      setSubStatus("error");
      setSubError(result.error.errors[0]?.message ?? "Enter a valid email address");
      return;
    }
    setSubStatus("ok");
    setSubError("");
    trackConversion("subscribe_request");
    const subject = "Subscribe — Bosphorus Brief";
    const body = `Please add this email to the Bosphorus Brief mailing list:\n\n${result.data.email}`;
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <section className="research-toolbar" aria-label="Filter research">
        <div className="container">
          <div className="toolbar">
            <div className="search-box">
              <Search className="h-4 w-4" aria-hidden="true" style={{ color: "var(--muted)" }} />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search outlooks, routes, regulations…"
                aria-label="Search reports"
              />
            </div>
          </div>
          <div className="filter-buttons mt-8" role="group" aria-label="Report category">
            {FILTERS.map((t) => (
              <button
                key={t.value}
                type="button"
                aria-pressed={cat === t.value}
                onClick={() => setCat(t.value)}
              >
                {t.label}
                <span className="count">{counts[t.value]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="research-list" aria-label="Reports">
        <div className="container">
          <p className="sr-only" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "report" : "reports"} shown
          </p>
          <div className="r-grid">
            {filtered.length ? (
              filtered.map((r) => (
                <Link
                  key={r.title}
                  href={`/research/${reportSlug(r)}`}
                  className={`r-card ${r.gated ? "gated-card" : ""}`}
                >
                  <div className="r-cover" aria-hidden="true">
                    <Cover r={r} />
                    <span className="label">{r.label}</span>
                    {r.gated ? (
                      <span className="gated-badge">PRO</span>
                    ) : (
                      <span className="iss">{r.iss}</span>
                    )}
                    <span className="heading">{r.title.split(":")[0]}</span>
                    {r.gated && (
                      <div className="lock-overlay">
                        <Lock className="h-7 w-7" strokeWidth={1.5} />
                        <div className="t">LEVANTER Pro</div>
                        <div className="b">Public summary · full report on request</div>
                      </div>
                    )}
                  </div>
                  <div className="r-body">
                    <div className="meta">
                      <span className="cat">{r.catLabel}</span> · {r.date}
                    </div>
                    <h2 className="r-title">{r.title}</h2>
                    <p>{r.desc}</p>
                    <div className="r-foot">
                      <span>
                        {r.read} min read{r.gated ? " · Pro" : ""}
                      </span>
                      <span className="read flex items-center gap-1">
                        {r.gated ? "Summary" : "Read"}{" "}
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="r-empty">
                <h2 className="r-title">Nothing matches that yet.</h2>
                <p>Try a broader term or clear your filters.</p>
              </div>
            )}
          </div>

          <div className="subs">
            <div>
              <h2 className="subs-title">
                The Bosphorus Brief — the desk&apos;s market note by email.
              </h2>
              <p>
                Crude, clean, dry — what the desk is reading before they pick up the phone. Free. We
                add you by hand; reply &ldquo;unsubscribe&rdquo; at any time to leave.
              </p>
            </div>
            <form onSubmit={handleSubscribe} noValidate>
              <Input
                type="email"
                placeholder="you@company.com"
                aria-label="Email address"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (subStatus !== "idle") setSubStatus("idle");
                }}
                aria-invalid={subStatus === "error"}
                aria-describedby={subStatus === "error" ? "sub-err" : undefined}
                required
              />
              <Button type="submit">
                {subStatus === "ok" ? "Email draft opened" : "Request to join"}
              </Button>
              {subStatus === "error" && (
                <p id="sub-err" className="mt-1 w-full text-xs text-state-negative" role="alert">
                  {subError}
                </p>
              )}
              {subStatus === "ok" && (
                <p className="mt-1 w-full text-xs" style={{ color: "var(--muted)" }} role="status">
                  Your email app should open with the request — press send. Nothing opened? Email{" "}
                  {siteConfig.email}.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
