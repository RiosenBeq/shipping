import { createElement, Fragment, type ReactNode } from "react";
import Link from "next/link";
import { Tag, type RenderableTreeNode } from "@markdoc/markdoc";
import type { Node } from "@markdoc/markdoc";
import { transformBody } from "@/lib/blog/markdoc";

/** HTML attribute names Markdoc emits → React prop names. */
const PROPS: Record<string, string> = {
  class: "className",
  tabindex: "tabIndex",
  colspan: "colSpan",
  rowspan: "rowSpan",
  for: "htmlFor",
};

const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//");

/**
 * Render a Markdoc tree as React. Internal links become next/link (prefetch,
 * client navigation); everything else is the plain element Markdoc chose in
 * lib/blog/markdoc.ts (callouts, pull quotes, tables, figures).
 */
function render(node: RenderableTreeNode): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") return null;
  if (typeof node === "string" || typeof node === "number") return node;
  if (Array.isArray(node)) return createElement(Fragment, null, ...node.map(render));
  if (!Tag.isTag(node)) return null;
  const { name, attributes = {}, children = [] } = node;
  const kids = children.map(render);
  if (!name) return createElement(Fragment, null, ...kids);
  const props: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(attributes)) {
    if (v === undefined || v === null || v === false) continue;
    props[PROPS[k] ?? k] = v;
  }
  if (name === "a" && typeof props.href === "string" && isInternal(props.href)) {
    const { href, ...rest } = props as { href: string };
    return createElement(Link, { href, ...rest }, ...kids);
  }
  return createElement(name, props, ...kids);
}

/** A post's Markdoc body in the serif reading column. */
export function ArticleBody({ ast }: { ast: Node }) {
  return <div className="bl-prose">{render(transformBody(ast))}</div>;
}
