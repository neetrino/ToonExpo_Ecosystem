import type { PublicApartmentDetail, PublicMediaAsset } from '@toonexpo/contracts';
import { isHttpUrl } from '@toonexpo/contracts';
import type { ApartmentStatus } from '@toonexpo/domain';
import Image from 'next/image';

import { FavoriteToggle } from '@/components/favorites/favorite-toggle';
import { ApartmentRequestButton } from '@/components/public-request/public-request-sheet';
import { Link } from '@/i18n/navigation';
import { LOGIN_PATH } from '@/lib/auth/constants';
import { formatAreaSqm } from '@/lib/catalog/format-area';
import { formatPriceAmd } from '@/lib/catalog/format-price';
import { CATALOG_IMAGE_HEIGHT, CATALOG_IMAGE_WIDTH } from '@/lib/catalog/image-dimensions';

type RequestPrefill = {
  name?: string;
  email?: string;
  phone?: string;
};

type ApartmentDetailLabels = {
  backToProject: string;
  rooms: string;
  areaSqm: string;
  floor: string;
  building: string;
  price: string;
  priceByRequest: string;
  priceHidden: string;
  priceLoginRequired: string;
  loginLink: string;
  gallery: string;
  matterport: string;
  noValue: string;
  statusLabels: Record<ApartmentStatus, string>;
};

type ApartmentFavoriteProps = {
  returnPath: string;
  initialFavorited: boolean;
  isBuyer: boolean;
  isAuthenticated: boolean;
};

type ApartmentDetailViewProps = {
  apartment: PublicApartmentDetail;
  locale: string;
  labels: ApartmentDetailLabels;
  prefill?: RequestPrefill;
  favorite: ApartmentFavoriteProps;
};

function statusBadgeClass(status: ApartmentStatus): string {
  return `catalog-badge catalog-badge--${status.toLowerCase()}`;
}

function ApartmentPriceBlock({
  apartment,
  locale,
  labels,
}: {
  apartment: PublicApartmentDetail;
  locale: string;
  labels: ApartmentDetailLabels;
}) {
  if (apartment.priceDisplay === 'AMOUNT') {
    return (
      <p className="catalog-apartment__price">
        <span className="catalog-apartment__meta-label">{labels.price}</span>
        {apartment.priceAmd !== null ? formatPriceAmd(apartment.priceAmd, locale) : labels.noValue}
      </p>
    );
  }

  if (apartment.priceDisplay === 'BY_REQUEST') {
    return <p className="catalog-apartment__price-msg">{labels.priceByRequest}</p>;
  }

  if (apartment.priceDisplay === 'LOGIN_REQUIRED') {
    return (
      <p className="catalog-apartment__price-msg">
        {labels.priceLoginRequired}{' '}
        <Link href={LOGIN_PATH} className="catalog-apartment__login-link">
          {labels.loginLink}
        </Link>
      </p>
    );
  }

  return <p className="catalog-apartment__price-msg">{labels.priceHidden}</p>;
}

function ApartmentGallery({
  media,
  apartmentCode,
  galleryLabel,
}: {
  media: PublicMediaAsset[];
  apartmentCode: string;
  galleryLabel: string;
}) {
  if (media.length === 0) {
    return null;
  }

  return (
    <section className="catalog-gallery">
      <h2 className="catalog-section-title">{galleryLabel}</h2>
      <div className="catalog-gallery__grid">
        {media.map((asset) => (
          <figure key={asset.id} className="catalog-gallery__item">
            <Image
              src={asset.url}
              alt={asset.alt ?? apartmentCode}
              width={CATALOG_IMAGE_WIDTH}
              height={CATALOG_IMAGE_HEIGHT}
              className="catalog-gallery__image"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}

export function ApartmentDetailView({
  apartment,
  locale,
  labels,
  prefill,
  favorite,
}: ApartmentDetailViewProps) {
  const projectHref = `/projects/${apartment.project.companySlug}/${apartment.project.slug}`;

  return (
    <article className="catalog-detail catalog-apartment">
      <nav className="catalog-apartment__breadcrumb" aria-label="breadcrumb">
        <Link href={projectHref} className="catalog-apartment__back">
          {labels.backToProject}
        </Link>
      </nav>

      <header className="catalog-detail__header">
        <h1 className="catalog-detail__title">{apartment.code}</h1>
        <p className="catalog-detail__company">{apartment.project.companyName}</p>
        <p className="catalog-apartment__context">
          {apartment.project.name} · {labels.building} {apartment.buildingName} · {labels.floor}{' '}
          {apartment.floorName}
        </p>
        <p className="catalog-apartment__meta">
          <span>
            {labels.rooms}: {apartment.rooms ?? labels.noValue}
          </span>
          <span>
            {labels.areaSqm}:{' '}
            {apartment.areaSqm !== null ? formatAreaSqm(apartment.areaSqm, locale) : labels.noValue}
          </span>
          <span className={statusBadgeClass(apartment.status)}>
            {labels.statusLabels[apartment.status]}
          </span>
        </p>
        <ApartmentPriceBlock apartment={apartment} locale={locale} labels={labels} />
        <div className="catalog-detail__actions catalog-apartment__actions">
          <ApartmentRequestButton
            locale={locale}
            projectId={apartment.project.id}
            projectName={apartment.project.name}
            apartmentId={apartment.id}
            apartmentCode={apartment.code}
            prefill={prefill}
          />
          <FavoriteToggle
            locale={locale}
            targetType="APARTMENT"
            targetId={apartment.id}
            returnPath={favorite.returnPath}
            initialFavorited={favorite.initialFavorited}
            isBuyer={favorite.isBuyer}
            isAuthenticated={favorite.isAuthenticated}
          />
          {apartment.matterportUrl && isHttpUrl(apartment.matterportUrl) ? (
            <a
              href={apartment.matterportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="catalog-request-btn catalog-apartment__matterport"
            >
              {labels.matterport}
            </a>
          ) : null}
        </div>
      </header>

      <ApartmentGallery
        media={apartment.media}
        apartmentCode={apartment.code}
        galleryLabel={labels.gallery}
      />
    </article>
  );
}
