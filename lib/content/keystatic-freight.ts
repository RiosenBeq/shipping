/**
 * The "Freight calculator data" singleton (content/freight.json) for /keystatic, kept in
 * its own module and spread into keystatic.config.ts (`...freightSingletons` in the
 * singletons, `...freightNavigation` in the sidebar). Field order is the key order
 * Keystatic writes; the zod schema in freight-schema.ts checks the same shape (and the
 * references between ports, passages, distances and presets) at test and build time.
 * How to use it: docs/CMS.md → "Navlun hesaplayıcı".
 */
import { fields, singleton } from "@keystatic/core";
import {
  CLASS_SLUGS,
  ETS_SCOPES,
  FREIGHT_PATH,
  FUELS,
  FUEL_LONG_LABELS,
  PORT_REGIONS,
  PORT_REGION_LABELS,
  type ClassSlug,
  type EtsScope,
} from "@/lib/freight/constants";
import { SLUG_PATTERN } from "./options";

const required = { isRequired: true } as const;

const CLASS_LABELS: Record<ClassSlug, string> = {
  vlcc: "VLCC",
  suezmax: "Suezmax",
  aframax: "Aframax / LR2",
  lr1: "LR1",
  mr: "MR",
  vlgc: "VLGC",
  mgc: "MGC",
  handysize: "Handysize gas carrier",
  pressurised: "Pressurised LPG",
};

const ETS_SCOPE_LABELS: Record<EtsScope, string> = {
  auto: "Auto — from the ports (50% in or out of the EU, 100% between EU ports and at berth)",
  "0": "0% (no EU calls)",
  "50": "50%",
  "100": "100%",
};

const select = <T extends string>(
  label: string,
  values: readonly T[],
  labels: Record<T, string>,
  defaultValue: T,
  description?: string
) =>
  fields.select({
    label,
    description,
    defaultValue,
    options: values.map((value) => ({ value, label: labels[value] })),
  });

const number = (label: string, min: number, max: number, step: number, description?: string) =>
  fields.number({ label, description, step, validation: { isRequired: true, min, max } });

const integer = (label: string, min: number, max: number, description?: string) =>
  fields.integer({ label, description, validation: { isRequired: true, min, max } });

const portId = (label: string, description = "A port id from the Ports list, e.g. cpc.") =>
  fields.text({
    label,
    description,
    validation: {
      isRequired: true,
      pattern: { regex: SLUG_PATTERN, message: "A port id: lowercase letters, digits, hyphens." },
    },
  });

const price = (label: string) =>
  fields.object(
    {
      price: number("Price ($/t)", 1, 10_000, 0.5),
      asOf: fields.date({
        label: "As of",
        description: "The day the price was checked. Shown next to it on the calculator.",
        validation: required,
      }),
    },
    { label, layout: [6, 6] }
  );

const freight = singleton({
  label: "Freight calculator data",
  path: "content/freight",
  format: { data: "json" },
  previewUrl: FREIGHT_PATH,
  schema: {
    notice: fields.text({
      label: "Note next to the reference prices",
      description:
        "Short, e.g. “Example values — update in the admin.” or “Desk reference prices, Rotterdam–Fujairah–Singapore average.”",
      validation: required,
    }),
    sources: fields.text({
      label: "Sources and method",
      description: "How distances and costs were set. Shown under “How the estimate is built”.",
      multiline: true,
      validation: required,
    }),
    staleAfterDays: integer(
      "Flag prices older than (days)",
      1,
      365,
      "A price whose “as of” date is older than this gets a warning on the calculator (“… days ago, check it”)."
    ),
    fuels: fields.object(
      {
        vlsfo: price(FUEL_LONG_LABELS.vlsfo),
        mgo: price(FUEL_LONG_LABELS.mgo),
        hsfo: price(FUEL_LONG_LABELS.hsfo),
      },
      {
        label: "Bunker prices",
        description:
          "Reference prices the calculator opens with ($/t). Visitors can type their own; update these and their dates regularly.",
      }
    ),
    ets: fields.object(
      {
        euaPrice: number("EUA price (€ per t CO₂)", 0, 1_000, 0.01),
        euaAsOf: fields.date({ label: "EUA price as of", validation: required }),
        eurUsd: number("EUR/USD", 0.1, 5, 0.0001, "Dollars per euro, to price EUAs in dollars."),
        eurUsdAsOf: fields.date({ label: "EUR/USD as of", validation: required }),
        phaseIn: integer(
          "Phase-in (%)",
          0,
          100,
          "Share of the year’s emissions surrendered: 40% for 2024, 70% for 2025, 100% from 2026."
        ),
      },
      { label: "EU ETS", layout: [6, 6, 6, 6, 12] }
    ),
    defaults: fields.object(
      {
        class: select("Ship class the calculator opens with", CLASS_SLUGS, CLASS_LABELS, "aframax"),
        weatherMargin: number("Weather margin (%)", 0, 50, 0.5, "Added to sea time."),
        addressCommission: number("Address commission (%)", 0, 20, 0.25),
        brokerage: number("Brokerage (%)", 0, 20, 0.25),
        extraHours: number(
          "Allowance per port call (hours)",
          0,
          240,
          1,
          "Notice time, berthing and paperwork, added when port time is worked out from a cargo rate."
        ),
        fillLimit: number("Filling limit, gas carriers (%)", 50, 100, 0.5),
        etsScope: select("EU ETS scope", ETS_SCOPES, ETS_SCOPE_LABELS, "auto"),
      },
      { label: "Calculator defaults", layout: [12, 4, 4, 4, 6, 6, 12] }
    ),
    classes: fields.array(
      fields.object(
        {
          slug: select("Class", CLASS_SLUGS, CLASS_LABELS, "aframax"),
          label: fields.text({ label: "Name on the calculator", validation: required }),
          dwt: integer("Deadweight (t)", 500, 600_000),
          capacity: integer(
            "Cargo capacity",
            100,
            600_000,
            "Tonnes for tankers, cbm for gas carriers."
          ),
          speedLaden: number("Speed laden (kn)", 1, 30, 0.1),
          speedBallast: number("Speed in ballast (kn)", 1, 30, 0.1),
          consLaden: number("Consumption laden (t/day)", 0, 400, 0.5),
          consBallast: number("Consumption in ballast (t/day)", 0, 400, 0.5),
          consPort: number("Consumption in port, working cargo (t/day)", 0, 200, 0.5),
          consIdle: number("Consumption idle / waiting (t/day)", 0, 200, 0.5),
          fuel: fields.select({
            label: "Main fuel",
            defaultValue: "vlsfo",
            options: FUELS.map((value) => ({ value, label: FUEL_LONG_LABELS[value] })),
          }),
          sizeFactor: number(
            "Port and passage cost factor",
            0.01,
            10,
            0.05,
            "Port and passage costs are entered for an Aframax-size ship (1.0); e.g. VLCC 2.4, MR 0.55."
          ),
          portDays: number("Port days per call", 0, 60, 0.25),
          cargoRate: integer("Cargo rate (t/h)", 1, 100_000, "For port time worked out from the rate."),
          demurrage: integer("Demurrage rate ($/day)", 0, 1_000_000, "Example value."),
          cargo: integer("Default cargo (t)", 1, 1_000_000),
          grade: fields.text({
            label: "Gas cargo (gas carriers)",
            description:
              "A key from LPG converter cargoes, e.g. propane, ammonia. Leave empty for tankers.",
          }),
          freight: number("Example freight ($/t)", 0, 10_000, 0.05, "Example value the page opens with."),
          open: portId("Typical lane: open position"),
          load: portId("Typical lane: load port"),
          discharge: portId("Typical lane: discharge port"),
        },
        {
          layout: [4, 8, 4, 4, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 6, 6, 4, 4, 4],
        }
      ),
      {
        label: "Class presets",
        description:
          "The ship particulars each class opens with, and its typical lane (used when a class guide links here). Visitors can change any figure for their own calculation.",
        itemLabel: (props) =>
          `${props.fields.label.value || props.fields.slug.value} — ${props.fields.load.value} → ${props.fields.discharge.value}`,
      }
    ),
    ports: fields.array(
      fields.object(
        {
          id: fields.text({
            label: "Id",
            description: "Used in distances and presets, e.g. aliaga. Do not change it once used.",
            validation: {
              isRequired: true,
              pattern: { regex: SLUG_PATTERN, message: "Lowercase letters, digits and hyphens." },
            },
          }),
          name: fields.text({ label: "Name", validation: required }),
          country: fields.text({
            label: "Country code",
            description: "Two letters, e.g. TR.",
            validation: {
              isRequired: true,
              pattern: { regex: /^[A-Z]{2}$/, message: "Two capital letters, e.g. TR." },
            },
          }),
          region: fields.select({
            label: "Region",
            defaultValue: "east-med",
            options: PORT_REGIONS.map((value) => ({ value, label: PORT_REGION_LABELS[value] })),
          }),
          lat: number("Latitude", -90, 90, 0.01),
          lon: number("Longitude", -180, 180, 0.01),
          eu: fields.checkbox({
            label: "EU / EEA port (EU ETS)",
            description: "Voyages in or out count 50%, between EU ports and at berth 100%.",
          }),
          mgoAtBerth: fields.checkbox({
            label: "0.10% S fuel at berth (MGO)",
            description: "ECA ports (the Mediterranean, North Sea, North America), EU ports, Türkiye.",
          }),
          cost: integer(
            "Port costs, Aframax-size call ($)",
            0,
            10_000_000,
            "Dues, pilotage, towage and agency. Scaled by each class's cost factor."
          ),
          note: fields.text({
            label: "Note (optional)",
            description: "Shown when the port is picked, e.g. a compliance point.",
            multiline: true,
          }),
        },
        { layout: [4, 8, 3, 3, 3, 3, 6, 6, 12, 12] }
      ),
      {
        label: "Ports",
        itemLabel: (props) =>
          `${props.fields.name.value || "New port"} (${props.fields.id.value}) — $${props.fields.cost.value ?? "?"}`,
      }
    ),
    passages: fields.array(
      fields.object(
        {
          id: fields.text({
            label: "Id",
            description: "Used in distances, e.g. suez. Do not change it once used.",
            validation: {
              isRequired: true,
              pattern: { regex: SLUG_PATTERN, message: "Lowercase letters, digits and hyphens." },
            },
          }),
          name: fields.text({ label: "Name", validation: required }),
          costLaden: integer("Cost laden, Aframax-size ($)", 0, 100_000_000),
          costBallast: integer("Cost in ballast, Aframax-size ($)", 0, 100_000_000),
          days: number("Waiting and delay (days)", 0, 60, 0.25),
          note: fields.text({ label: "Note (optional)", multiline: true }),
        },
        { layout: [4, 8, 4, 4, 4, 12] }
      ),
      {
        label: "Passages (straits and canals)",
        description:
          "Costs and expected waiting for each transit. The calculator switches them on for routes that pass them; visitors can switch them off or change the figures.",
        itemLabel: (props) => `${props.fields.name.value || "New passage"} (${props.fields.id.value})`,
      }
    ),
    distances: fields.array(
      fields.object(
        {
          from: portId("From"),
          to: portId("To"),
          nm: integer("Distance (nm)", 0, 30_000),
          via: fields.text({
            label: "Via (optional)",
            description: "Route note shown with the distance, e.g. Suez, Cape of Good Hope.",
          }),
          passages: fields.text({
            label: "Passages on this route (optional)",
            description: "Passage ids in sailing order from “From”, separated by commas, e.g. turkish-straits, gibraltar.",
          }),
          eca: integer(
            "ECA share (%)",
            0,
            100,
            "Part of the route inside SOx Emission Control Areas, where the ship burns MGO."
          ),
        },
        { layout: [4, 4, 4, 5, 5, 2] }
      ),
      {
        label: "Distances",
        description:
          "Port-to-port sea distances. Each pair once: the calculator reads it both ways. Two routes for one pair (e.g. via Suez and via the Cape) are two rows with a different “via”.",
        itemLabel: (props) =>
          `${props.fields.from.value} ↔ ${props.fields.to.value} · ${props.fields.nm.value ?? "?"} nm${props.fields.via.value ? ` · ${props.fields.via.value}` : ""}`,
      }
    ),
  },
});

/** Spread into `singletons` in keystatic.config.ts. */
export const freightSingletons = { freight };

/** Spread into `ui.navigation` in keystatic.config.ts: a "Tools" group in the sidebar. */
export const freightNavigation = { Tools: ["freight" as const] };
