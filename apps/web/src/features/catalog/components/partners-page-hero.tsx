import Image from 'next/image';

import { cn } from '@/shared/ui/cn';

/** Figma photo node `1:643`. */
const PARTNERS_HERO_IMAGE_SRC = '/demo/partner-facade.webp';

type PartnersPageHeroProps = {
  title: string;
  description: string;
};

/**
 * Full-bleed partners list hero — Figma `1:643` with existing page copy.
 */
export const PartnersPageHero = ({ title, description }: PartnersPageHeroProps) => {
  return (
    <section className="relative isolate flex min-h-[min(52vh,28rem)] flex-col bg-canvas sm:min-h-[min(56vh,32rem)]">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <Image
          src={PARTNERS_HERO_IMAGE_SRC}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/25 to-transparent" />
      </div>

      <div
        className={cn(
          'page-container relative flex w-full flex-1 flex-col justify-end',
          'pt-[clamp(6.25rem,4.75rem+3.5vw,9.5rem)] pb-[clamp(2.5rem,2rem+2vw,4rem)]',
        )}
      >
        <div className="flex max-w-3xl flex-col gap-[clamp(0.75rem,0.4rem+1.2vw,1.25rem)]">
          <h1
            className={cn(
              'font-brand font-bold text-on-dark',
              'text-[clamp(2rem,1.05rem+3.8vw,3.75rem)]',
              'leading-[1.05] tracking-[-0.025em]',
              'text-balance',
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              'max-w-xl text-on-dark/95',
              'text-[clamp(0.9375rem,0.82rem+0.45vw,1.125rem)]',
              'leading-[1.55]',
              'text-pretty',
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};
