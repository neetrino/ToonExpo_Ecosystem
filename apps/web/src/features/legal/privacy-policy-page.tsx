import Image from 'next/image';
import type { ReactNode } from 'react';

import type { PrivacyPolicyCopy, PrivacyRichItem } from '@/features/legal/privacy-policy.types';

const CONTACT_EMAIL = 'info@bigprojects.am';
const LOGO_SRC =
  'https://optim.tildacdn.net/tild3963-3337-4133-b831-396565363139/-/resize/320x/-/format/webp/Screenshot_2026-09-2.png.webp';
const LOGO_WIDTH = 160;

const linkEmail = (text: string): ReactNode => {
  const index = text.indexOf(CONTACT_EMAIL);
  if (index < 0) {
    return text;
  }

  const before = text.slice(0, index);
  const after = text.slice(index + CONTACT_EMAIL.length);

  return (
    <>
      {before}
      <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:text-brand-hover">
        {CONTACT_EMAIL}
      </a>
      {after}
    </>
  );
};

const Paragraphs = ({ lines }: { lines: readonly string[] }): ReactNode => (
  <>
    {lines.map((line) => (
      <p key={line} className="text-sm leading-6 text-ink-navy">
        {linkEmail(line)}
      </p>
    ))}
  </>
);

const BulletList = ({ items }: { items: readonly PrivacyRichItem[] }): ReactNode => (
  <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-ink-navy">
    {items.map((item) => (
      <li key={item.title}>
        <span className="font-semibold">{item.title}</span>
        {item.body.length > 0 ? ` ${item.body}` : null}
      </li>
    ))}
  </ul>
);

const PointList = ({ items }: { items: readonly PrivacyRichItem[] }): ReactNode => (
  <div className="flex flex-col gap-2 text-sm leading-6 text-ink-navy">
    {items.map((item) => (
      <p key={item.title}>
        <span className="font-semibold">{item.title}</span> {item.body}
      </p>
    ))}
  </div>
);

/**
 * Locale-specific privacy policy body.
 */
export const PrivacyPolicyPage = ({ copy }: { copy: PrivacyPolicyCopy }): ReactNode => (
  <article className="page-container max-w-3xl py-12">
    <h1 className="font-brand text-3xl font-bold tracking-tight text-ink-navy sm:text-4xl">
      {copy.title}
    </h1>
    <Image
      src={LOGO_SRC}
      alt="TOON EXPO"
      width={LOGO_WIDTH}
      height={LOGO_WIDTH}
      unoptimized
      className="mt-6 h-auto w-40"
    />
    <div className="mt-6 flex flex-col gap-4">
      <Paragraphs lines={copy.intro} />
    </div>
    {copy.sections.map((section) => (
      <section key={section.title} className="mt-10 flex flex-col gap-3">
        <h2 className="font-brand text-xl font-bold text-ink-navy">{section.title}</h2>
        {section.paragraphs ? <Paragraphs lines={section.paragraphs} /> : null}
        {section.bullets ? <BulletList items={section.bullets} /> : null}
        {section.points ? <PointList items={section.points} /> : null}
        {section.note ? (
          <p className="text-sm leading-6 text-header-muted italic">{section.note}</p>
        ) : null}
        {section.trailing ? <Paragraphs lines={section.trailing} /> : null}
      </section>
    ))}
  </article>
);
