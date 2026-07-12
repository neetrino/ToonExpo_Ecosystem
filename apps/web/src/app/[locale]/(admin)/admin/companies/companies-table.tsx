'use client';

import { useState } from 'react';

import { OpenInPortalButton } from '@/components/portal/open-in-portal-button';
import type { AdminCompanyRow } from '@/lib/admin/queries';
import { formatShortDate } from '@/lib/crm/format-crm-dates';

import { CompanyFormSheet } from './sheets/company-form-sheet';

type CompaniesTableProps = {
  locale: string;
  companies: AdminCompanyRow[];
  labels: {
    columns: {
      name: string;
      slug: string;
      members: string;
      projects: string;
      createdAt: string;
      actions: string;
    };
    edit: string;
    openInPortal: string;
    projectCounts: {
      draft: string;
      published: string;
      archived: string;
    };
  };
};

export function CompaniesTable({ locale, companies, labels }: CompaniesTableProps) {
  return (
    <div className="portal-table-wrap">
      <table className="portal-table">
        <thead>
          <tr>
            <th>{labels.columns.name}</th>
            <th>{labels.columns.slug}</th>
            <th>{labels.columns.members}</th>
            <th>{labels.columns.projects}</th>
            <th>{labels.columns.createdAt}</th>
            <th>{labels.columns.actions}</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <CompanyRow
              key={company.id}
              locale={locale}
              company={company}
              labels={labels}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type CompanyRowProps = {
  locale: string;
  company: AdminCompanyRow;
  labels: CompaniesTableProps['labels'];
};

function CompanyRow({ locale, company, labels }: CompanyRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const { projectsCount } = company;

  return (
    <tr>
      <td>{company.name}</td>
      <td>
        <code className="portal-code">{company.slug}</code>
      </td>
      <td>{company.membersCount}</td>
      <td>
        <span className="portal-counts">
          {labels.projectCounts.draft}: {projectsCount.draft} · {labels.projectCounts.published}:{' '}
          {projectsCount.published} · {labels.projectCounts.archived}: {projectsCount.archived}
        </span>
      </td>
      <td>{formatShortDate(company.createdAt, locale)}</td>
      <td>
        <div className="portal-actions">
          <OpenInPortalButton locale={locale} companyId={company.id} label={labels.openInPortal} />
          <button
            type="button"
            className="portal-btn portal-btn--ghost portal-btn--sm"
            onClick={() => setEditOpen(true)}
          >
            {labels.edit}
          </button>
        </div>
        <CompanyFormSheet
          locale={locale}
          mode="edit"
          open={editOpen}
          onClose={() => setEditOpen(false)}
          values={{
            companyId: company.id,
            name: company.name,
            slug: company.slug,
            description: company.description,
            logoUrl: company.logoUrl,
            phone: company.phone,
            email: company.email,
            website: company.website,
            city: company.city,
            address: company.address,
          }}
        />
      </td>
    </tr>
  );
}
