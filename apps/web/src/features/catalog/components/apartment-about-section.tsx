type ApartmentAboutSectionProps = {
  title: string;
  description: string | null;
  emptyLabel: string;
};

/**
 * Listing prose block — Lovable “About this home”.
 */
export const ApartmentAboutSection = ({
  title,
  description,
  emptyLabel,
}: ApartmentAboutSectionProps) => {
  const body = description?.trim();

  return (
    <section className="py-10">
      <h2 className="mb-4 font-brand text-2xl font-bold tracking-tight text-ink-navy">{title}</h2>
      <p className="text-base leading-relaxed text-ink-navy/80">{body || emptyLabel}</p>
    </section>
  );
};
