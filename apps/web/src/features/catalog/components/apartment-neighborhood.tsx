type NeighborhoodStat = {
  label: string;
  value: string;
};

type ApartmentNeighborhoodProps = {
  title: string;
  stats: NeighborhoodStat[];
};

/**
 * Figma neighborhood score cards — four soft brand tiles.
 */
export const ApartmentNeighborhood = ({ title, stats }: ApartmentNeighborhoodProps) => (
  <section className="py-10">
    <h2 className="font-brand text-2xl font-bold tracking-tight text-ink-navy">{title}</h2>
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl bg-band-mist/40 p-4">
          <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">
            {stat.label}
          </p>
          <p className="mt-2 font-brand text-2xl font-bold text-brand-deep">{stat.value}</p>
        </div>
      ))}
    </div>
  </section>
);
