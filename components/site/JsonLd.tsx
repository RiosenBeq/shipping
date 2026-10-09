/**
 * Inline JSON-LD script tag. Pass any schema.org payload (or array of them).
 * Renders as <script type="application/ld+json"> with the payload serialised.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
