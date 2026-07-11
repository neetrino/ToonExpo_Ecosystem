import type {
  PublicApartment,
  PublicBuilding,
  PublicFloor,
  PublicProjectDetail,
} from '@toonexpo/contracts';
import type { ApartmentStatus } from '@toonexpo/domain';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { formatPriceAmd } from '@/lib/catalog/format-price';
import { getPublishedProjectBySlug } from '@/lib/catalog/queries';

type ProjectDetailPageProps = {
  params: Promise<{ locale: string; companySlug: string; projectSlug: string }>;
};

type TableLabels = {
  code: string;
  rooms: string;
  areaSqm: string;
  priceAmd: string;
  status: string;
  noValue: string;
};

function statusBadgeClass(status: ApartmentStatus): string {
  return `catalog-badge catalog-badge--${status.toLowerCase()}`;
}

function ApartmentTableRow({
  apartment,
  locale,
  tableLabels,
  statusLabel,
}: {
  apartment: PublicApartment;
  locale: string;
  tableLabels: TableLabels;
  statusLabel: string;
}) {
  return (
    <tr>
      <td>{apartment.code}</td>
      <td>{apartment.rooms ?? tableLabels.noValue}</td>
      <td>{apartment.areaSqm ?? tableLabels.noValue}</td>
      <td>
        {apartment.priceAmd !== null
          ? formatPriceAmd(apartment.priceAmd, locale)
          : tableLabels.noValue}
      </td>
      <td>
        <span className={statusBadgeClass(apartment.status)}>{statusLabel}</span>
      </td>
    </tr>
  );
}

function FloorBlock({
  floor,
  locale,
  tableLabels,
  statusLabels,
}: {
  floor: PublicFloor;
  locale: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
}) {
  return (
    <div className="catalog-floor">
      <h4 className="catalog-floor__title">{floor.name}</h4>
      <div className="catalog-table-wrap">
        <table className="catalog-table">
          <thead>
            <tr>
              <th>{tableLabels.code}</th>
              <th>{tableLabels.rooms}</th>
              <th>{tableLabels.areaSqm}</th>
              <th>{tableLabels.priceAmd}</th>
              <th>{tableLabels.status}</th>
            </tr>
          </thead>
          <tbody>
            {floor.apartments.map((apartment) => (
              <ApartmentTableRow
                key={apartment.id}
                apartment={apartment}
                locale={locale}
                tableLabels={tableLabels}
                statusLabel={statusLabels[apartment.status]}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BuildingBlock({
  building,
  locale,
  tableLabels,
  statusLabels,
}: {
  building: PublicBuilding;
  locale: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
}) {
  return (
    <section className="catalog-building">
      <h3 className="catalog-building__title">{building.name}</h3>
      {building.floors.map((floor) => (
        <FloorBlock
          key={floor.id}
          floor={floor}
          locale={locale}
          tableLabels={tableLabels}
          statusLabels={statusLabels}
        />
      ))}
    </section>
  );
}

function ProjectDetailView({
  project,
  locale,
  tableLabels,
  statusLabels,
  galleryLabel,
  buildingsLabel,
}: {
  project: PublicProjectDetail;
  locale: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
  galleryLabel: string;
  buildingsLabel: string;
}) {
  return (
    <article className="catalog-detail">
      <header className="catalog-detail__header">
        <h1 className="catalog-detail__title">{project.name}</h1>
        <p className="catalog-detail__company">{project.companyName}</p>
        {project.city || project.address ? (
          <p className="catalog-detail__location">
            {[project.city, project.address].filter(Boolean).join(' · ')}
          </p>
        ) : null}
        {project.description ? (
          <p className="catalog-detail__description">{project.description}</p>
        ) : null}
      </header>

      {project.media.length > 0 ? (
        <section className="catalog-gallery">
          <h2 className="catalog-section-title">{galleryLabel}</h2>
          <div className="catalog-gallery__grid">
            {project.media.map((asset) => (
              <figure key={asset.url} className="catalog-gallery__item">
                <Image
                  src={asset.url}
                  alt={asset.alt ?? project.name}
                  width={640}
                  height={400}
                  className="catalog-gallery__image"
                />
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {project.buildings.length > 0 ? (
        <section className="catalog-buildings">
          <h2 className="catalog-section-title">{buildingsLabel}</h2>
          {project.buildings.map((building) => (
            <BuildingBlock
              key={building.id}
              building={building}
              locale={locale}
              tableLabels={tableLabels}
              statusLabels={statusLabels}
            />
          ))}
        </section>
      ) : null}
    </article>
  );
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { locale, companySlug, projectSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('catalog');

  const project = await getPublishedProjectBySlug(companySlug, projectSlug);
  if (!project) {
    notFound();
  }

  const tableLabels: TableLabels = {
    code: t('detail.table.code'),
    rooms: t('detail.table.rooms'),
    areaSqm: t('detail.table.areaSqm'),
    priceAmd: t('detail.table.priceAmd'),
    status: t('detail.table.status'),
    noValue: t('detail.noValue'),
  };
  const statusLabels: Record<ApartmentStatus, string> = {
    AVAILABLE: t('apartmentStatus.AVAILABLE'),
    RESERVED: t('apartmentStatus.RESERVED'),
    SOLD: t('apartmentStatus.SOLD'),
  };

  return (
    <section className="catalog-page">
      <ProjectDetailView
        project={project}
        locale={locale}
        tableLabels={tableLabels}
        statusLabels={statusLabels}
        galleryLabel={t('detail.gallery')}
        buildingsLabel={t('detail.buildings')}
      />
    </section>
  );
}
