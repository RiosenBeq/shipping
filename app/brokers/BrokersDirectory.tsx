"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MessageCircle, Search, X, SlidersHorizontal, ArrowRight } from "lucide-react";
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
import { OFFICES, DESK_TO_OFFICE } from "@/lib/data/offices";
import { telUrl, whatsappUrl, mailUrl } from "@/lib/site";
import { trackConversion } from "@/lib/analytics";
import {
  BrokerFilter,
  BrokerFilterSchema,
  Desk,
  DeskSchema,
  Sector,
  SectorSchema,
  VesselClassFilter,
  VesselClassSchema,
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

/** Pre-select filters from links such as /brokers?sector=bulk or /brokers?desk=Istanbul. */
function filterFromSearch(search: string): BrokerFilter {
  const params = new URLSearchParams(search);
  const pick = <T,>(
    key: string,
    schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }
  ) =>
    params
      .getAll(key)
      .map((v) => schema.safeParse(v))
      .filter((r) => r.success)
      .map((r) => r.data as T);
  return {
    ...INITIAL_FILTER,
    sectors: pick<Sector>("sector", SectorSchema),
    classes: pick<VesselClassFilter>("class", VesselClassSchema),
    desks: pick<Desk>("desk", DeskSchema),
  };
}

export function BrokersDirectory() {
  const [filter, setFilter] = useState<BrokerFilter>(INITIAL_FILTER);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (window.location.search) setFilter(filterFromSearch(window.location.search));
  }, []);

  const toggle = <K extends "sectors" | "classes" | "desks">(
    key: K,
    value: BrokerFilter[K][number]
  ) => {
    setFilter((prev) => {
      const set = new Set(prev[key] as string[]);
      if (set.has(value as string)) set.delete(value as string);
      else set.add(value as string);
      return { ...prev, [key]: Array.from(set) as BrokerFilter[K] };
    });
  };

  const clearAll = () => setFilter(INITIAL_FILTER);
  const hasFilters =
    filter.sectors.length > 0 ||
    filter.classes.length > 0 ||
    filter.desks.length > 0 ||
    filter.q !== "";

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
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={filter.q}
            onChange={(e) => setFilter((p) => ({ ...p, q: e.target.value }))}
            placeholder="Search brokers, routes…"
            aria-label="Search brokers and routes"
            className="pl-9"
          />
        </div>
      </div>
      <fieldset className="filter-group">
        <legend className="filter-h">Sector</legend>
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
      </fieldset>
      <fieldset className="filter-group">
        <legend className="filter-h">Class</legend>
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
      </fieldset>
      <fieldset className="filter-group">
        <legend className="filter-h">Office</legend>
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
      </fieldset>
    </>
  );

  return (
    <section className="directory">
      <div className="container">
        {/* Mobile filter toggle */}
        <div className="mb-4 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters((v) => !v)}
            className="w-full"
            aria-expanded={showMobileFilters}
            aria-controls="broker-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showMobileFilters ? "Hide filters" : "Show filters"}
          </Button>
        </div>

        <div className="directory-grid">
          <div
            id="broker-filters"
            className={`filters ${showMobileFilters ? "block" : "hidden"} lg:block`}
            role="search"
            aria-label="Filter brokers"
          >
            {FilterPanel}
          </div>

          <div>
            <div className="results-bar">
              <div className="count" aria-live="polite">
                <strong>{filtered.length}</strong> brokers{" "}
                {hasFilters && <span style={{ color: "var(--muted)" }}>of {BROKERS.length}</span>}
              </div>
              <Select
                value={filter.sort}
                onValueChange={(v: BrokerFilter["sort"]) => setFilter((p) => ({ ...p, sort: v }))}
              >
                <SelectTrigger className="w-[180px]" aria-label="Sort brokers">
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
                    <button
                      type="button"
                      onClick={() => toggle("sectors", s)}
                      aria-label={`Remove ${SECTOR_LABEL[s]} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filter.classes.map((c) => (
                  <span key={c} className="chip">
                    {CLASS_LABEL[c]}{" "}
                    <button
                      type="button"
                      onClick={() => toggle("classes", c)}
                      aria-label={`Remove ${CLASS_LABEL[c]} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filter.desks.map((d) => (
                  <span key={d} className="chip">
                    {d}{" "}
                    <button
                      type="button"
                      onClick={() => toggle("desks", d)}
                      aria-label={`Remove ${d} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filter.q && (
                  <span className="chip">
                    &quot;{filter.q}&quot;{" "}
                    <button
                      type="button"
                      onClick={() => setFilter((p) => ({ ...p, q: "" }))}
                      aria-label="Clear search"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button type="button" className="clear-all" onClick={clearAll}>
                  Clear all
                </button>
              </div>
            )}

            <ul className="brokers-list">
              {filtered.length ? (
                filtered.map((b) => {
                  const office = OFFICES[DESK_TO_OFFICE[b.desk]];
                  const track = (channel: string) =>
                    trackConversion("contact_click", { channel, from: "/brokers" });
                  return (
                    <li key={b.name} className="b-card">
                      <div className="b-avatar" style={{ background: b.color }} aria-hidden="true">
                        {b.initials}
                      </div>
                      <h2 className="nm">
                        <Link href={`/brokers/${brokerSlug(b)}`}>{b.name}</Link>
                      </h2>
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
                        <a
                          href={telUrl(office.phone)}
                          aria-label={`Call the ${b.desk} desk for ${b.name}`}
                          onClick={() => track("phone")}
                        >
                          <Phone className="h-4 w-4" aria-hidden="true" />
                        </a>
                        <a
                          href={whatsappUrl(`Hi LEVANTER desk — I'd like to speak to ${b.name}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp the desk for ${b.name}`}
                          onClick={() => track("whatsapp")}
                        >
                          <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        </a>
                        <a
                          href={mailUrl(`Attn: ${b.name}`)}
                          aria-label={`Email the desk for ${b.name}`}
                          onClick={() => track("email")}
                        >
                          <Mail className="h-4 w-4" aria-hidden="true" />
                        </a>
                        <Link
                          href={`/brokers/${brokerSlug(b)}`}
                          aria-label={`View ${b.name}'s profile`}
                          style={{ marginLeft: "auto" }}
                        >
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="b-empty">
                  <h2>No brokers match.</h2>
                  <p>Try clearing a filter, or search by route code (e.g. &quot;TD3C&quot;).</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
