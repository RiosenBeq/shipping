"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Phone, Mail, Linkedin, MessageCircle, Search, X, SlidersHorizontal, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BROKERS, CLASS_LABEL, SECTOR_LABEL, brokerSlug } from "@/lib/data/brokers";
import {
  BrokerFilter,
  BrokerFilterSchema,
  Desk,
  Sector,
  VesselClassFilter,
} from "@/lib/schemas";

const SECTORS: Sector[] = ["crude", "clean", "chem", "bulk", "sp"];
const CLASSES: VesselClassFilter[] = ["VLCC", "Suezmax", "Aframax", "MR", "Cape", "Pmx"];
const DESKS: Desk[] = ["Istanbul", "London", "Singapore", "Houston"];

const INITIAL_FILTER: BrokerFilter = BrokerFilterSchema.parse({
  sectors: [],
  classes: [],
  desks: [],
  q: "",
  sort: "name",
});

export function BrokersDirectory() {
  const [filter, setFilter] = useState<BrokerFilter>(INITIAL_FILTER);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const toggle = <K extends "sectors" | "classes" | "desks">(key: K, value: BrokerFilter[K][number]) => {
    setFilter((prev) => {
      const set = new Set(prev[key] as string[]);
      if (set.has(value as string)) set.delete(value as string);
      else set.add(value as string);
      return { ...prev, [key]: Array.from(set) as BrokerFilter[K] };
    });
  };

  const clearAll = () => setFilter(INITIAL_FILTER);
  const hasFilters =
    filter.sectors.length > 0 || filter.classes.length > 0 || filter.desks.length > 0 || filter.q !== "";

  const filtered = useMemo(() => {
    const q = filter.q.toLowerCase();
    let arr = BROKERS.filter((b) => {
      if (filter.sectors.length && !b.sectors.some((s) => filter.sectors.includes(s))) return false;
      if (filter.classes.length && !b.classes.some((c) => filter.classes.includes(c))) return false;
      if (filter.desks.length && !filter.desks.includes(b.desk)) return false;
      if (q) {
        const blob = (b.name + " " + b.title + " " + b.desk + " " + b.tags.join(" ")).toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
    if (filter.sort === "name") arr = [...arr].sort((a, b) => a.name.localeCompare(b.name));
    if (filter.sort === "role") arr = [...arr].sort((a, b) => b.seniority - a.seniority);
    if (filter.sort === "desk") arr = [...arr].sort((a, b) => a.desk.localeCompare(b.desk));
    return arr;
  }, [filter]);

  const FilterPanel = (
    <>
      <div className="filter-group">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-fog pointer-events-none" />
          <Input
            value={filter.q}
            onChange={(e) => setFilter((p) => ({ ...p, q: e.target.value }))}
            placeholder="Search brokers, routes…"
            className="pl-9"
          />
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-h">Sector</div>
        {SECTORS.map((s) => (
          <label key={s} className="fopt">
            <Checkbox
              checked={filter.sectors.includes(s)}
              onCheckedChange={() => toggle("sectors", s)}
              id={`sector-${s}`}
            />
            <span>{SECTOR_LABEL[s]}</span>
          </label>
        ))}
      </div>
      <div className="filter-group">
        <div className="filter-h">Class</div>
        {CLASSES.map((c) => (
          <label key={c} className="fopt">
            <Checkbox
              checked={filter.classes.includes(c)}
              onCheckedChange={() => toggle("classes", c)}
              id={`class-${c}`}
            />
            <span>{CLASS_LABEL[c]}</span>
          </label>
        ))}
      </div>
      <div className="filter-group">
        <div className="filter-h">Desk</div>
        {DESKS.map((d) => (
          <label key={d} className="fopt">
            <Checkbox
              checked={filter.desks.includes(d)}
              onCheckedChange={() => toggle("desks", d)}
              id={`desk-${d}`}
            />
            <span>{d}</span>
          </label>
        ))}
      </div>
    </>
  );

  return (
    <section className="directory">
      <div className="container">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters((v) => !v)}
            className="w-full"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showMobileFilters ? "Hide filters" : "Show filters"}
          </Button>
        </div>

        <div className="directory-grid">
          <aside className={`filters ${showMobileFilters ? "block" : "hidden"} lg:block`}>{FilterPanel}</aside>

          <main>
            <div className="results-bar">
              <div className="count">
                <strong>{filtered.length}</strong> brokers{" "}
                {hasFilters && <span style={{ color: "var(--muted)" }}>of {BROKERS.length}</span>}
              </div>
              <Select
                value={filter.sort}
                onValueChange={(v: BrokerFilter["sort"]) => setFilter((p) => ({ ...p, sort: v }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort: Name</SelectItem>
                  <SelectItem value="role">Sort: Seniority</SelectItem>
                  <SelectItem value="desk">Sort: Desk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <div className="chips">
                {filter.sectors.map((s) => (
                  <span key={s} className="chip">
                    {SECTOR_LABEL[s]}{" "}
                    <button onClick={() => toggle("sectors", s)} aria-label={`Remove ${s}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filter.classes.map((c) => (
                  <span key={c} className="chip">
                    {CLASS_LABEL[c]}{" "}
                    <button onClick={() => toggle("classes", c)} aria-label={`Remove ${c}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filter.desks.map((d) => (
                  <span key={d} className="chip">
                    {d}{" "}
                    <button onClick={() => toggle("desks", d)} aria-label={`Remove ${d}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filter.q && (
                  <span className="chip">
                    &quot;{filter.q}&quot;{" "}
                    <button onClick={() => setFilter((p) => ({ ...p, q: "" }))} aria-label="Clear search">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button className="clear-all" onClick={clearAll}>
                  Clear all
                </button>
              </div>
            )}

            <div className="brokers-list">
              {filtered.length ? (
                filtered.map((b) => (
                  <article key={b.name} className="b-card">
                    <div className="b-avatar" style={{ background: b.color }}>
                      {b.initials}
                    </div>
                    <h3 className="nm">{b.name}</h3>
                    <p className="ti">{b.title}</p>
                    <div className="desk-loc">{b.desk}</div>
                    <div className="tags">
                      {b.tags.map((t) => (
                        <span key={t} className="tag">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="icons">
                      <a href="#" aria-label={`Phone ${b.name}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                      <a href="#" aria-label={`WhatsApp ${b.name}`}>
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      <a href="#" aria-label={`Email ${b.name}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                      <a href="#" aria-label={`LinkedIn ${b.name}`}>
                        <Linkedin className="h-4 w-4" />
                      </a>
                      <Link
                        href={`/brokers/${brokerSlug(b)}`}
                        aria-label={`View ${b.name} profile`}
                        style={{ marginLeft: "auto" }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="b-empty">
                  <h3>No brokers match.</h3>
                  <p>Try clearing a filter, or search by route code (e.g. &quot;TD3C&quot;).</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
