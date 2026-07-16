import type { JsonLdObject } from './json-ld';

type JsonLdScriptProps = {
  data: JsonLdObject;
};

/** Renders a single JSON-LD script block for public entity pages. */
export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      // Structured data is built from published entity fields only.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
