import { setRequestLocale } from 'next-intl/server';

type BuyerPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BuyerAccountPage({ params }: BuyerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Buyer area</h1>
      <p className="mt-2 text-[var(--te-muted)]">Protected shell placeholder for Sprint 0.</p>
    </section>
  );
}
