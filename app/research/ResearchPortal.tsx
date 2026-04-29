"use client";

import { useMemo, useState } from "react";
import { Search, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REPORTS, Report } from "@/lib/data/research";
import { ResearchCategory, SubscribeSchema } from "@/lib/schemas";

const TABS: { value: ResearchCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "weekly", label: "Weekly Outlook" },
  { value: "route", label: "Route Guides" },
  { value: "reg", label: "Regulatory" },
  { value: "sp", label: "S&P Snapshots" },
  { value: "annual", label: "Annual" },
];

function Cover({ r }: { r: Report }) {
  return (
    <svg className="cv" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const result = SubscribeSchema.safeParse({ email });
    if (!result.success) {
      setSubStatus("error");
      setSubError(result.error.errors[0]?.message ?? "Geçersiz e-posta");
      return;
    }
    setSubStatus("ok");
    setSubError("");
  };

  return (
    <>
      <section className="research-toolbar">
        <div className="container">
          <div className="toolbar">
            <div className="search-box">
              <Search className="h-4 w-4 text-ink-fog" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search outlooks, routes, regulations…"
                aria-label="Search reports"
              />
            </div>
          </div>
          <Tabs value={cat} onValueChange={(v) => setCat(v as ResearchCategory)} className="mt-8">
            <TabsList className="!justify-start w-full">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}{" "}
                  <span className="ml-1.5 text-[11px] font-mono text-ink-fog data-[active=true]:text-accent-brass">
                    {counts[t.value]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      <section className="research-list">
        <div className="container">
          <div className="r-grid">
            {filtered.length ? (
              filtered.map((r) => (
                <article key={r.title} className={`r-card ${r.gated ? "gated-card" : ""}`}>
                  <div className="r-cover">
                    <Cover r={r} />
                    <span className="label">{r.label}</span>
                    {r.gated ? (
                      <span className="gated-badge">PRO</span>
                    ) : (
                      <span className="iss">{r.iss}</span>
                    )}
                    <h4 className="heading">{r.title.split(":")[0]}</h4>
                    {r.gated && (
                      <div className="lock-overlay">
                        <Lock className="h-7 w-7" strokeWidth={1.5} />
                        <div className="t">LEVANTER Pro</div>
                        <div className="b">Sign in or request access — desk clients automatic.</div>
                      </div>
                    )}
                  </div>
                  <div className="r-body">
                    <div className="meta">
                      <span className="cat">{r.catLabel}</span> · {r.date}
                    </div>
                    <h3>{r.title}</h3>
                    <p>{r.desc}</p>
                    <div className="r-foot">
                      <span>{r.read} min read</span>
                      <span className="read flex items-center gap-1">
                        {r.gated ? "Sign in" : "Read"} <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="r-empty">
                <h3>Nothing matches that yet.</h3>
                <p>Try a broader term or clear your filters.</p>
              </div>
            )}
          </div>

          <div className="subs">
            <div>
              <h3>The Bosphorus Brief — every Monday, 06:30 GMT.</h3>
              <p>
                Crude, clean, dry — what the desk is reading before they pick up the phone. Free, no
                spam, unsubscribe in one click.
              </p>
            </div>
            <form onSubmit={handleSubscribe} noValidate>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (subStatus !== "idle") setSubStatus("idle");
                }}
                aria-invalid={subStatus === "error"}
                aria-describedby={subStatus === "error" ? "sub-err" : undefined}
                required
                disabled={subStatus === "ok"}
              />
              <Button type="submit" disabled={subStatus === "ok"}>
                {subStatus === "ok" ? "Subscribed ✓" : "Subscribe"}
              </Button>
              {subStatus === "error" && (
                <p id="sub-err" className="text-xs text-state-negative w-full mt-1">
                  {subError}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
