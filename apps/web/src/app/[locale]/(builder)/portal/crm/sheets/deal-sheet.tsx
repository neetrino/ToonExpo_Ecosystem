'use client';

import type { DealStage, RequestSource } from '@toonexpo/domain';
import { SideSheet } from '@toonexpo/ui';

import type { ProjectApartmentGroup } from '@/lib/crm/apartment-link-queries';
import type { CompanyMemberOption } from '@/lib/crm/member-queries';
import type { DealDetailApartment } from '@/lib/crm/deal-queries';

import { DealSheetActivities } from './deal-sheet-activities';
import { DealSheetApartments } from './deal-sheet-apartments';
import { DealSheetContact, DealSheetHeader } from './deal-sheet-sections';

export type SerializableDealDetail = {
  id: string;
  stage: DealStage;
  source: RequestSource;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  hasBuyerLink: boolean;
  message: string | null;
  projectId: string | null;
  assigneeUserId: string | null;
  createdAt: string;
  apartments: DealDetailApartment[];
  activities: Array<{
    id: string;
    type: 'COMMENT' | 'FOLLOW_UP' | 'STATUS_CHANGE';
    body: string;
    createdAt: string;
    authorName: string | null;
  }>;
};

type DealSheetProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  deal: SerializableDealDetail;
  members: CompanyMemberOption[];
  apartmentGroups: ProjectApartmentGroup[];
  labels: {
    title: string;
    unnamedContact: string;
    source: Record<RequestSource, string>;
    createdAtLabel: string;
    contact: {
      title: string;
      phone: string;
      email: string;
      buyerLinked: string;
      message: string;
      noValue: string;
    };
    apartments: {
      title: string;
      empty: string;
      emptyHint: string;
      link: string;
      unlink: string;
      project: string;
      apartment: string;
      noValue: string;
      status: Record<'AVAILABLE' | 'RESERVED' | 'SOLD', string>;
      price: string;
      priceAtRequest: (value: string) => string;
    };
    activities: {
      title: string;
      empty: string;
      comment: string;
      followUp: string;
      submitComment: string;
      submitFollowUp: string;
      nextFollowUpAt: string;
      types: Record<'COMMENT' | 'FOLLOW_UP' | 'STATUS_CHANGE', string>;
      noAuthor: string;
    };
  };
};

export function DealSheet({
  locale,
  open,
  onClose,
  deal,
  members,
  apartmentGroups,
  labels,
}: DealSheetProps) {
  const title = deal.contactName ?? labels.unnamedContact;

  return (
    <SideSheet title={labels.title.replace('{name}', title)} open={open} onClose={onClose}>
      <div className="crm-deal-sheet">
        <DealSheetHeader
          locale={locale}
          dealId={deal.id}
          stage={deal.stage}
          source={deal.source}
          contactName={deal.contactName}
          createdAtLabel={labels.createdAtLabel}
          assigneeUserId={deal.assigneeUserId}
          members={members}
          sourceLabel={labels.source[deal.source]}
          unnamedContact={labels.unnamedContact}
        />
        <DealSheetContact
          contactPhone={deal.contactPhone}
          contactEmail={deal.contactEmail}
          hasBuyerLink={deal.hasBuyerLink}
          message={deal.message}
          labels={labels.contact}
        />
        <DealSheetApartments
          locale={locale}
          dealId={deal.id}
          projectId={deal.projectId}
          apartments={deal.apartments}
          apartmentGroups={apartmentGroups}
          labels={{
            ...labels.apartments,
            price: (value) => labels.apartments.price.replace('{value}', value),
            priceAtRequest: labels.apartments.priceAtRequest,
          }}
        />
        <DealSheetActivities
          locale={locale}
          dealId={deal.id}
          activities={deal.activities}
          labels={labels.activities}
          formatDateTime={(iso) =>
            new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
              new Date(iso),
            )
          }
        />
      </div>
    </SideSheet>
  );
}
