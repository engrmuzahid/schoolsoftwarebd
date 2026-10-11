/**
 * Google-এর structured data (schema.org) — পেজে <script type="application/ld+json">
 *   <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', ... }} />
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // '<' escape — লেখার ভেতরে </script> থাকলেও পেজ ভাঙবে না
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
