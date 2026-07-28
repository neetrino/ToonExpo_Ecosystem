import { getTranslations } from 'next-intl/server';

import { BuilderContactsCard } from '@/features/catalog/components/builder-contacts-card';
import type { DeveloperProfile } from '@/features/catalog/data/developer-profiles';
import { cn } from '@/shared/ui/cn';

type DeveloperDetailContentProps = {
  profile: DeveloperProfile;
};

/**
 * Developer body — projects + contacts (hero already shows name / region / address).
 */
export const DeveloperDetailContent = async ({ profile }: DeveloperDetailContentProps) => {
  const t = await getTranslations('Catalog.developersPage');

  const links = [
    profile.websiteUrl ? { label: t('fields.website'), href: profile.websiteUrl } : null,
    profile.instagramUrl ? { label: t('fields.instagram'), href: profile.instagramUrl } : null,
    profile.facebookUrl ? { label: t('fields.facebook'), href: profile.facebookUrl } : null,
    profile.logoLinkUrl ? { label: t('fields.logo'), href: profile.logoLinkUrl } : null,
    profile.mediaMaterialsUrl
      ? { label: t('fields.mediaMaterials'), href: profile.mediaMaterialsUrl }
      : null,
    profile.promoMaterialsUrl
      ? { label: t('fields.promoMaterials'), href: profile.promoMaterialsUrl }
      : null,
  ].filter((row): row is { label: string; href: string } => row != null);

  return (
    <div className="page-container flex flex-col gap-10 pb-16 pt-12 sm:pt-16">
      {profile.content ? (
        <section>
          <h2 className="font-brand text-2xl font-bold tracking-[-0.02em] text-ink-navy">
            {t('sections.content')}
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-ink-navy">
            {profile.content}
          </p>
        </section>
      ) : null}

      <div>
        <h2 className="mb-5 font-brand text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] font-bold tracking-[-0.02em] text-ink-navy">
          {t('sections.currentProjects')}
        </h2>
        <div
          className={cn(
            'grid gap-10',
            'lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start xl:gap-14',
          )}
        >
          <ol className="min-w-0 list-decimal space-y-2 pl-5 text-base leading-relaxed text-ink-navy">
            {profile.currentProjects.map((projectName) => (
              <li key={projectName}>{projectName}</li>
            ))}
          </ol>

          <BuilderContactsCard
            className="lg:sticky lg:top-24"
            phone={profile.phone}
            email={profile.email}
            contactPerson={profile.contactPerson}
            projectCount={profile.projectCount}
            links={links}
          />
        </div>
      </div>
    </div>
  );
};
