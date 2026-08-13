import type { ReactNode } from 'react';

const CITE_HOVER: Record<string, string> = {
  indigo: 'hover:text-indigo-600 hover:decoration-indigo-400',
  red: 'hover:text-red-600 hover:decoration-red-400',
  zinc: 'hover:text-zinc-500 hover:decoration-zinc-500',
};

export function Cite({
  href,
  children,
  accent = 'indigo',
}: {
  href: string;
  children: ReactNode;
  accent?: keyof typeof CITE_HOVER;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-zinc-900 underline underline-offset-2 decoration-zinc-300 transition-colors ${CITE_HOVER[accent]}`}
    >
      {children}
    </a>
  );
}

export function DonutChart({
  segments,
  size = 200,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  const r = 75;
  const circ = 2 * Math.PI * r;
  let offset = -circ / 4;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 200 200">
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const el = (
            <circle
              key={i}
              cx={100}
              cy={100}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="24"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              className="transition-all duration-700"
            />
          );
          offset += dash;
          return el;
        })}
        <circle cx={100} cy={100} r="58" className="fill-[#fafafa]" />
      </svg>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[13px] text-zinc-500">
              {seg.label} <span className="font-semibold text-zinc-700">{seg.value}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HBar({
  data,
  unit = '',
}: {
  data: { label: string; value: number; color: string }[];
  unit?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-4">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1.5">
            <span className="text-sm text-zinc-700 font-medium">{d.label}</span>
            <span className="text-sm font-bold text-zinc-900">
              {d.value.toLocaleString()}
              {unit}
            </span>
          </div>
          <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VBar({
  data,
  unit = '',
}: {
  data: { label: string; value: number; color: string }[];
  unit?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-3 h-48">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
          <span className="text-[11px] font-bold text-zinc-700 mb-2">
            {d.value}
            {unit}
          </span>
          <div
            className="w-full rounded-t-md transition-all duration-700"
            style={{ height: `${(d.value / max) * 100}%`, backgroundColor: d.color, minHeight: '4px' }}
          />
          <span className="text-[10px] text-zinc-500 mt-2 text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function BubbleChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-4">
      {data.map((d, i) => {
        const size = 40 + (d.value / max) * 80;
        return (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-full transition-all duration-500 hover:scale-110"
            style={{ width: size, height: size, backgroundColor: d.color + '18', border: `2px solid ${d.color}` }}
          >
            <span className="text-[10px] font-bold" style={{ color: d.color }}>
              {d.value}%
            </span>
            <span className="text-[8px] text-zinc-500 leading-none mt-0.5">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function BigNum({
  value,
  label,
  href,
  sub,
  size = 'lg',
}: {
  value: string;
  label: string;
  href?: string;
  sub?: string;
  size?: 'sm' | 'lg';
}) {
  const inner = (
    <div className="text-center">
      <div
        className={`${size === 'sm' ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'} font-serif font-bold text-zinc-900 tracking-tight leading-none`}
      >
        {value}
      </div>
      <div className={`${size === 'sm' ? 'text-[11px] mt-2' : 'text-sm mt-3'} text-zinc-500 leading-relaxed`}>{label}</div>
      {sub && <div className="text-[11px] text-zinc-400 mt-1">{sub}</div>}
    </div>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
        {inner}
      </a>
    );
  }
  return inner;
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-2 border-zinc-900 pl-6 py-2 my-10">
      <p className="text-lg sm:text-xl font-serif text-zinc-800 leading-relaxed italic">{children}</p>
    </blockquote>
  );
}

export function Sources({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 pt-4 border-t border-zinc-100">
      <p className="text-[11px] text-zinc-400 leading-relaxed">{children}</p>
    </div>
  );
}
