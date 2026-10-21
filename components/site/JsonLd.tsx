/**
 * Inline JSON-LD script tag. Pass any schema.org payload (or array of them).
 * Renders as <script type="application/ld+json"> with the payload serialised;
 * null entries in an array are dropped.
 */
export function JsonLd({ data }: { data: object | (object | null)[] }) {
  // Helpers return null for blocks that must not be published yet.
  const payload = Array.isArray(data) ? data.filter(Boolean) : data;
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
