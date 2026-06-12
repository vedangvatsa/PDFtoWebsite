import type { RankedCity } from '@/app/report/page';

function PageHeader({ title, pageNum }: { title: string; pageNum: number }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#71717A' }}>{title}</span>
        <span style={{ fontSize: 8, color: '#71717A' }}>JUNE 2026</span>
      </div>
      <hr className="section-rule" />
    </>
  );
}

function PageFooter({ pageNum }: { pageNum: number }) {
  return (
    <div style={{ position: 'absolute', bottom: 24, left: 32, right: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <hr className="section-rule" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
      <span style={{ fontSize: 7, color: '#a1a1aa', paddingTop: 8 }}>cvin.bio/report</span>
      <span style={{ fontSize: 8, fontWeight: 600, color: '#71717A', fontVariantNumeric: 'tabular-nums', paddingTop: 8 }}>{pageNum}</span>
    </div>
  );
}

function RankingTable({ cities, columns, startRank = 1 }: {
  cities: RankedCity[];
  columns: { key: string; label: string; width?: string; render: (c: RankedCity, i: number) => React.ReactNode }[];
  startRank?: number;
}) {
  return (
    <table className="report-table" style={{ marginTop: 12 }}>
      <thead>
        <tr>
          <th style={{ width: 28, textAlign: 'center' }}>#</th>
          {columns.map(col => (
            <th key={col.key} style={{ width: col.width }}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cities.map((city, i) => (
          <tr key={city.slug} style={{ background: i % 2 === 1 ? '#fafafa' : 'transparent' }}>
            <td className="rank-cell">{startRank + i}</td>
            {columns.map(col => (
              <td key={col.key}>{col.render(city, i)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Overall Ranking (2 pages) ── */
export function ReportOverallRanking({ cities }: { cities: RankedCity[] }) {
  const first25 = cities.slice(0, 25);
  const second25 = cities.slice(25, 50);

  const columns = [
    {
      key: 'city', label: 'CITY', width: '25%',
      render: (c: RankedCity) => (
        <span style={{ fontWeight: 600 }}>{c.emoji} {c.name}</span>
      ),
    },
    {
      key: 'country', label: 'COUNTRY', width: '15%',
      render: (c: RankedCity) => <span style={{ color: '#52525b' }}>{c.country}</span>,
    },
    {
      key: 'score', label: 'SCORE',  width: '18%',
      render: (c: RankedCity) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{c.nomad_score}</span>
          <div className="bar-track" style={{ width: 60 }}>
            <div className="bar-fill" style={{ width: `${c.nomad_score}%`, background: '#09090B' }} />
          </div>
        </div>
      ),
    },
    {
      key: 'cost', label: 'COST/MO', width: '12%',
      render: (c: RankedCity) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
          ${c.cost.monthly_total.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'internet', label: 'INTERNET', width: '12%',
      render: (c: RankedCity) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {c.internet.download_mbps.toFixed(0)} Mbps
        </span>
      ),
    },
    {
      key: 'weather', label: 'WEATHER', width: '10%',
      render: (c: RankedCity) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{c.weatherScore}</span>
      ),
    },
  ];

  return (
    <>
      <div className="report-page" style={{ padding: 32, position: 'relative' }}>
        <PageHeader title="Overall Ranking" pageNum={4} />
        <RankingTable cities={first25} columns={columns} startRank={1} />
        <PageFooter pageNum={4} />
      </div>
      <div className="report-page" style={{ padding: 32, position: 'relative' }}>
        <PageHeader title="Overall Ranking (continued)" pageNum={5} />
        <RankingTable cities={second25} columns={columns} startRank={26} />
        <PageFooter pageNum={5} />
      </div>
    </>
  );
}
