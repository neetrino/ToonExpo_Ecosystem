import type { BuilderCompanyMemberRow } from '@/lib/builder/company-queries';
import type { PlatformRole } from '@toonexpo/domain';

type CompanyTeamSectionProps = {
  members: BuilderCompanyMemberRow[];
  labels: {
    title: string;
    empty: string;
    columns: {
      name: string;
      email: string;
      role: string;
      joinedAt: string;
    };
    roles: Record<PlatformRole, string>;
  };
  formatDate: (date: Date) => string;
};

export function CompanyTeamSection({ members, labels, formatDate }: CompanyTeamSectionProps) {
  return (
    <section className="portal-section">
      <h3 className="portal-page__subtitle">{labels.title}</h3>

      {members.length === 0 ? (
        <p className="portal-empty">{labels.empty}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>{labels.columns.name}</th>
                <th>{labels.columns.email}</th>
                <th>{labels.columns.role}</th>
                <th>{labels.columns.joinedAt}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{labels.roles[member.role] ?? member.role}</td>
                  <td>{formatDate(member.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
