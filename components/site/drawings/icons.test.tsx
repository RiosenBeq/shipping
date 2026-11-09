import * as React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { DrawnIcon } from "./icons";

// Vitest compiles TSX with the classic runtime (React.createElement); Next uses the automatic
// one, so the components do not import React themselves. The icons build their glyphs when the
// module loads: import it once React is global.
(globalThis as { React?: typeof React }).React = React;
const icons = await import("./icons");

const ALL = Object.entries(icons).filter(([k]) => k.endsWith("Icon")) as [string, DrawnIcon][];

describe("business icons", () => {
  it("are the set the site uses", () => {
    expect(ALL.map(([k]) => k).sort()).toEqual([
      "AmmoniaIcon",
      "AnchorIcon",
      "CleanIcon",
      "CoaIcon",
      "CrudeIcon",
      "InquiryIcon",
      "LpgIcon",
      "OfficesIcon",
      "SpotIcon",
      "StraitsIcon",
      "TankerIcon",
      "TimeCharterIcon",
    ]);
  });

  it.each(ALL)("%s drops in where a lucide icon was", (_, Icon) => {
    const html = renderToStaticMarkup(<Icon aria-hidden="true" strokeWidth={1.25} className="x" />);
    expect(html).toMatch(/^<svg [^>]*viewBox="0 0 24 24"/);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('stroke-width="1.25"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toMatch(/class="dw-icon dw-icon--[a-z]+ x"/);
    expect(html.length).toBeLessThan(900);
  });
});
