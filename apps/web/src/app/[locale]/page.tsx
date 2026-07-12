import { setRequestLocale } from 'next-intl/server';

import { HomeHero } from './home-hero';
import { HomeNewestProjects } from './home-newest-projects';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HomeHero />
      <HomeNewestProjects />
    </>
  );
}
