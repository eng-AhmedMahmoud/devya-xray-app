'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ACCENT, ACCENT_MUTED, MATURITY_COLORS } from '@/lib/ui';

/* -------------------------------------------------------------------------- */
/*  Shared strings (localized copy is threaded in from the parent so charts    */
/*  stay presentational and print-safe).                                       */
/* -------------------------------------------------------------------------- */

export type ChartStrings = {
  verified: string;
  selfReported: string;
  health: string;
  urgency: string;
  scored: string;
  total: string;
  practices: string;
  ofPillar: string;
  notScored: string;
};

/* --------------------------------- Radar ---------------------------------- */

export type RadarPoint = {
  name: string;
  /** Verified health % (may be null when a pillar isn't scored yet). */
  value: number | null;
  /** Self-reported health % — drives the second overlay ring when present. */
  self?: number | null;
  urgency?: number | null;
  scored?: number | null;
};

export type RadarProps = {
  data: RadarPoint[];
  animate?: boolean;
  /** Render the self-reported overlay ring + legend when self data exists. */
  showSelf?: boolean;
  strings?: ChartStrings;
};

function RadarTooltip({
  active,
  payload,
  strings,
}: {
  active?: boolean;
  payload?: Array<{ payload: RadarPoint }>;
  strings?: ChartStrings;
}) {
  if (!active || !payload?.length || !strings) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-850/95 p-2.5 text-[11px] shadow-xl backdrop-blur">
      <div className="font-medium text-ink-100">{p.name}</div>
      <dl className="mt-1 space-y-0.5 text-ink-300">
        <Row
          label={strings.verified}
          value={p.value == null ? strings.notScored : `${p.value}%`}
          dot={ACCENT}
        />
        {p.self != null && (
          <Row label={strings.selfReported} value={`${p.self}%`} dot={ACCENT_MUTED} />
        )}
        {p.urgency != null && <Row label={strings.urgency} value={String(p.urgency)} />}
        {p.scored != null && <Row label={strings.scored} value={String(p.scored)} />}
      </dl>
    </div>
  );
}

function Row({ label, value, dot }: { label: string; value: string; dot?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-1.5">
        {dot && (
          <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
        )}
        {label}
      </dt>
      <dd className="font-mono text-ink-100">{value}</dd>
    </div>
  );
}

export function PillarRadar({
  data,
  animate = true,
  showSelf = false,
  strings,
}: RadarProps) {
  // recharts drops points whose value is null from the polygon; coerce to 0 so
  // the axis still renders every pillar (the tooltip shows the real state).
  const chartData = data.map((d) => ({
    ...d,
    value: d.value ?? 0,
    self: d.self ?? null,
  }));
  const hasSelf = showSelf && data.some((d) => d.self != null);

  return (
    <div className="w-full" dir="ltr">
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="70%">
            <defs>
              <linearGradient id="radarVerified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="rgba(255,255,255,0.12)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#A3A3A3', fontSize: 11 }} />
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={5}
              tick={{ fill: '#525252', fontSize: 9 }}
              axisLine={false}
              stroke="rgba(255,255,255,0.06)"
            />
            {hasSelf && (
              <Radar
                name="self"
                dataKey="self"
                stroke={ACCENT_MUTED}
                strokeDasharray="4 3"
                strokeWidth={1.5}
                fill={ACCENT_MUTED}
                fillOpacity={0.08}
                dot={{ r: 2, fill: ACCENT_MUTED, strokeWidth: 0 }}
                isAnimationActive={animate}
              />
            )}
            <Radar
              name="verified"
              dataKey="value"
              stroke="url(#radarVerified)"
              strokeWidth={2}
              fill={ACCENT}
              fillOpacity={0.24}
              dot={{ r: 3, fill: '#FFFFFF', stroke: ACCENT, strokeWidth: 1 }}
              activeDot={{ r: 4, fill: '#FFFFFF' }}
              isAnimationActive={animate}
            />
            {strings && (
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
                content={<RadarTooltip strings={strings} />}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {hasSelf && strings && (
        <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[11px] text-ink-300">
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-3.5 rounded-sm" style={{ background: ACCENT }} />
            {strings.verified}
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="h-0 w-3.5 border-t-2 border-dashed"
              style={{ borderColor: ACCENT_MUTED }}
            />
            {strings.selfReported}
          </li>
        </ul>
      )}
    </div>
  );
}

/* --------------------------------- Donut ---------------------------------- */

export type DonutProps = {
  distribution: Record<string, number>;
  labels: Record<number, string>;
  animate?: boolean;
  strings?: ChartStrings;
};

function DonutTooltip({
  active,
  payload,
  total,
  strings,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; color: string } }>;
  total: number;
  strings?: ChartStrings;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const pct = total > 0 ? Math.round((p.value / total) * 100) : 0;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-850/95 p-2.5 text-[11px] shadow-xl backdrop-blur">
      <div className="flex items-center gap-1.5 font-medium text-ink-100">
        <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
        {p.name}
      </div>
      <div className="mt-1 font-mono text-ink-300">
        {p.value} {strings?.practices ?? ''} · {pct}%
      </div>
    </div>
  );
}

export function DistributionDonut({
  distribution,
  labels,
  animate = true,
  strings,
}: DonutProps) {
  const [active, setActive] = useState<number | null>(null);
  const data = [1, 2, 3, 4].map((level) => ({
    name: labels[level] ?? String(level),
    value: distribution?.[String(level)] ?? 0,
    color: MATURITY_COLORS[level],
  }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="relative h-[210px] w-full" dir="ltr">
        {/* Center label — total scored practices. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-white">{total}</span>
          <span className="text-[10px] uppercase tracking-wide text-ink-500">
            {strings?.total ?? ''}
          </span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="86%"
              strokeWidth={0}
              paddingAngle={total > 0 ? 2 : 0}
              isAnimationActive={animate}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.color}
                  fillOpacity={active == null || active === i ? 1 : 0.35}
                  style={{ transition: 'fill-opacity 0.15s ease' }}
                />
              ))}
            </Pie>
            {strings && (
              <Tooltip content={<DonutTooltip total={total} strings={strings} />} />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ink-300">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <li
              key={i}
              className="flex items-center gap-1.5"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <span
                className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] font-mono text-[9px] font-semibold text-ink-950"
                style={{ background: d.color }}
              >
                {i + 1}
              </span>
              <span className="flex-1 truncate">{d.name}</span>
              <span className="font-mono text-ink-400">
                {d.value}
                <span className="text-ink-600"> · {pct}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* --------------------------- Maturity stacked bar -------------------------- */

export type MaturityBarProps = {
  /** One row: the distribution to visualize as a single stacked bar. */
  distribution: Record<string, number>;
  labels: Record<number, string>;
  animate?: boolean;
  strings?: ChartStrings;
};

function BarTooltip({
  active,
  payload,
  labels,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  labels: Record<number, string>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-850/95 p-2.5 text-[11px] shadow-xl backdrop-blur">
      {payload
        .filter((p) => p.value > 0)
        .map((p) => {
          const level = Number(p.dataKey.replace('l', ''));
          return (
            <div key={p.dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-ink-300">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                {labels[level] ?? p.dataKey}
              </span>
              <span className="font-mono text-ink-100">{p.value}</span>
            </div>
          );
        })}
    </div>
  );
}

/**
 * Compact single-row stacked bar of practice maturity by level — a second data
 * view per pillar next to the donut. Degrades to an empty rail when nothing is
 * scored.
 */
export function MaturityBar({
  distribution,
  labels,
  animate = true,
  strings,
}: MaturityBarProps) {
  const row = {
    name: 'x',
    l1: distribution?.['1'] ?? 0,
    l2: distribution?.['2'] ?? 0,
    l3: distribution?.['3'] ?? 0,
    l4: distribution?.['4'] ?? 0,
  };
  const total = row.l1 + row.l2 + row.l3 + row.l4;
  if (total === 0) {
    return (
      <div className="flex h-10 items-center justify-center rounded-md border border-dashed border-white/10 text-[11px] text-ink-500">
        {strings?.notScored ?? '—'}
      </div>
    );
  }
  return (
    <div className="w-full" dir="ltr">
      <div className="h-14 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={[row]}
            margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
            barCategoryGap={0}
          >
            <XAxis type="number" hide domain={[0, total]} />
            <YAxis type="category" dataKey="name" hide />
            {strings && (
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={<BarTooltip labels={labels} />}
              />
            )}
            {[1, 2, 3, 4].map((l) => (
              <Bar
                key={l}
                dataKey={`l${l}`}
                stackId="m"
                fill={MATURITY_COLORS[l]}
                isAnimationActive={animate}
                radius={l === 1 ? [4, 0, 0, 4] : l === 4 ? [0, 4, 4, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
