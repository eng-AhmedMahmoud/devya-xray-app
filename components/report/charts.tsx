'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ACCENT,
  ACCENT_MUTED,
  MATURITY_COLORS,
  SEVERITY_COLORS,
  effortColor,
} from '@/lib/ui';

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
  /** Findings-by-* / calibration / effort chart copy. */
  findings: string;
  overclaimed: string;
  calibrated: string;
  underclaimed: string;
  overallHealth: string;
  /** Maturity level display names, keyed 1–4, for cross-pillar legends. */
  maturity: Record<number, string>;
  /** Severity display names, keyed by SEVERITY key, for pie/legend copy. */
  severity: Record<string, string>;
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

/* -------------------------------------------------------------------------- */
/*  Shared chart primitives for the new views                                  */
/* -------------------------------------------------------------------------- */

const AXIS_TICK = { fill: '#A3A3A3', fontSize: 11 } as const;
const AXIS_TICK_SM = { fill: '#737373', fontSize: 10 } as const;
const GRID_STROKE = 'rgba(255,255,255,0.06)';

/** Frosted tooltip shell shared by every new chart. */
function TipShell({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink-850/95 p-2.5 text-[11px] shadow-xl backdrop-blur">
      {title && <div className="mb-1 font-medium text-ink-100">{title}</div>}
      <dl className="space-y-0.5 text-ink-300">{children}</dl>
    </div>
  );
}

function TipRow({ label, value, dot }: { label: string; value: React.ReactNode; dot?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-1.5">
        {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
        {label}
      </dt>
      <dd className="font-mono text-ink-100">{value}</dd>
    </div>
  );
}

/** Empty-state rail shared by the aggregate charts when there's no data. */
function ChartEmpty({ label, height = 200 }: { label: string; height?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-md border border-dashed border-white/10 text-[11px] text-ink-500"
      style={{ height }}
    >
      {label}
    </div>
  );
}

/* ------------------------- PillarCompareBar (health vs urgency) ------------ */

export type PillarCompareRow = {
  code: string;
  name: string;
  health: number;
  urgency: number;
};

export type PillarCompareProps = {
  data: PillarCompareRow[];
  animate?: boolean;
  strings?: ChartStrings;
};

function CompareTooltip({
  active,
  payload,
  strings,
}: {
  active?: boolean;
  payload?: Array<{ payload: PillarCompareRow }>;
  strings?: ChartStrings;
}) {
  if (!active || !payload?.length || !strings) return null;
  const p = payload[0].payload;
  return (
    <TipShell title={p.name}>
      <TipRow label={strings.health} value={`${p.health}%`} dot={ACCENT} />
      <TipRow label={strings.urgency} value={String(p.urgency)} dot={ACCENT_MUTED} />
    </TipShell>
  );
}

/**
 * Health % (bars) vs Urgency Index (line) per pillar in one composed view — the
 * "compare all pillars" chart. Print renders static (animate=false, no tooltip).
 */
export function PillarCompareBar({ data, animate = true, strings }: PillarCompareProps) {
  if (data.length === 0) return <ChartEmpty label={strings?.notScored ?? '—'} height={300} />;
  return (
    <div className="w-full" dir="ltr">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 12, bottom: 4, left: -8 }}>
            <defs>
              <linearGradient id="healthBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.85} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0.55} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis dataKey="code" tick={AXIS_TICK} axisLine={{ stroke: GRID_STROKE }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={AXIS_TICK_SM} axisLine={false} tickLine={false} width={34} />
            {strings && (
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={<CompareTooltip strings={strings} />}
              />
            )}
            <Bar
              dataKey="health"
              fill="url(#healthBar)"
              radius={[4, 4, 0, 0]}
              maxBarSize={38}
              isAnimationActive={animate}
            />
            <Line
              type="monotone"
              dataKey="urgency"
              stroke={ACCENT_MUTED}
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={{ r: 3, fill: ACCENT_MUTED, strokeWidth: 0 }}
              activeDot={{ r: 4, fill: '#FFFFFF' }}
              isAnimationActive={animate}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {strings && (
        <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[11px] text-ink-300">
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-3.5 rounded-sm" style={{ background: ACCENT }} />
            {strings.health}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-0 w-3.5 border-t-2 border-dashed" style={{ borderColor: ACCENT_MUTED }} />
            {strings.urgency}
          </li>
        </ul>
      )}
    </div>
  );
}

/* --------------------- MaturityAcrossPillars (stacked h-bar) --------------- */

export type MaturityAcrossRow = {
  code: string;
  name: string;
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  total: number;
};

export type MaturityAcrossProps = {
  data: MaturityAcrossRow[];
  animate?: boolean;
  strings?: ChartStrings;
};

function StackTooltip({
  active,
  payload,
  strings,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string; payload: MaturityAcrossRow }>;
  strings?: ChartStrings;
}) {
  if (!active || !payload?.length || !strings) return null;
  const row = payload[0].payload;
  return (
    <TipShell title={row.name}>
      {payload
        .filter((p) => p.value > 0)
        .map((p) => {
          const level = Number(p.dataKey.replace('l', ''));
          return (
            <TipRow
              key={p.dataKey}
              label={strings.maturity[level] ?? p.dataKey}
              value={p.value}
              dot={p.color}
            />
          );
        })}
    </TipShell>
  );
}

/**
 * One horizontal stacked bar per pillar showing the count at each maturity level
 * (1–4) across all pillars in a single view. Legend + tooltips.
 */
export function MaturityAcrossPillars({ data, animate = true, strings }: MaturityAcrossProps) {
  const hasAny = data.some((d) => d.total > 0);
  if (!hasAny) return <ChartEmpty label={strings?.notScored ?? '—'} height={280} />;
  return (
    <div className="w-full" dir="ltr">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
            barCategoryGap="22%"
          >
            <CartesianGrid horizontal={false} stroke={GRID_STROKE} />
            <XAxis type="number" tick={AXIS_TICK_SM} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="code"
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            {strings && (
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={<StackTooltip strings={strings} />}
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
      {strings && (
        <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-ink-300">
          {[1, 2, 3, 4].map((l) => (
            <li key={l} className="flex items-center gap-1.5">
              <span
                className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] font-mono text-[9px] font-semibold text-ink-950"
                style={{ background: MATURITY_COLORS[l] }}
              >
                {l}
              </span>
              {strings.maturity[l] ?? l}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --------------------------- CalibrationBar (diverging) -------------------- */

export type CalibrationRow = {
  code: string;
  name: string;
  /** Positive → overclaimed count (plots right). */
  over: number;
  /** Negative → underclaimed count (plots left). */
  under: number;
  calibrated: number;
};

export type CalibrationProps = {
  data: CalibrationRow[];
  animate?: boolean;
  strings?: ChartStrings;
};

const OVER_COLOR = '#EF4444'; // red-ish — claimed higher than verified
const UNDER_COLOR = '#10B981'; // green-ish — sold themselves short

function CalibrationTooltip({
  active,
  payload,
  strings,
}: {
  active?: boolean;
  payload?: Array<{ payload: CalibrationRow }>;
  strings?: ChartStrings;
}) {
  if (!active || !payload?.length || !strings) return null;
  const p = payload[0].payload;
  return (
    <TipShell title={p.name}>
      <TipRow label={strings.overclaimed} value={p.over} dot={OVER_COLOR} />
      <TipRow label={strings.calibrated} value={p.calibrated} dot={ACCENT_MUTED} />
      <TipRow label={strings.underclaimed} value={Math.abs(p.under)} dot={UNDER_COLOR} />
    </TipShell>
  );
}

/**
 * Diverging bar per pillar: underclaimed left (green), overclaimed right (red),
 * zero line in the middle. Visualizes claim-vs-verified calibration across
 * pillars. Degrades to an empty rail if the payload carries no deltas at all.
 */
export function CalibrationBar({ data, animate = true, strings }: CalibrationProps) {
  const magnitude = Math.max(1, ...data.map((d) => Math.max(d.over, Math.abs(d.under))));
  const hasAny = data.some((d) => d.over !== 0 || d.under !== 0);
  if (!hasAny) return <ChartEmpty label={strings?.calibrated ?? '—'} height={280} />;
  return (
    <div className="w-full" dir="ltr">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            stackOffset="sign"
            margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
            barCategoryGap="26%"
          >
            <CartesianGrid horizontal={false} stroke={GRID_STROKE} />
            <XAxis
              type="number"
              domain={[-magnitude, magnitude]}
              tick={AXIS_TICK_SM}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tickFormatter={(v: number) => String(Math.abs(v))}
            />
            <YAxis
              type="category"
              dataKey="code"
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <ReferenceLine x={0} stroke="rgba(255,255,255,0.18)" />
            {strings && (
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={<CalibrationTooltip strings={strings} />}
              />
            )}
            <Bar dataKey="under" stackId="c" fill={UNDER_COLOR} isAnimationActive={animate} radius={[4, 0, 0, 4]} />
            <Bar dataKey="over" stackId="c" fill={OVER_COLOR} isAnimationActive={animate} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {strings && (
        <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-ink-300">
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: UNDER_COLOR }} />
            {strings.underclaimed}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: OVER_COLOR }} />
            {strings.overclaimed}
          </li>
        </ul>
      )}
    </div>
  );
}

/* ------------------------------ Categorical helpers ------------------------ */

export type CountRow = { key: string; count: number };

/** Simple keyed bar (findings by severity / effort / pillar). Colors injected. */
type KeyedBarProps = {
  data: CountRow[];
  colorOf: (key: string) => string;
  /** Full label — shown in the tooltip (and on the axis unless axisLabelOf set). */
  labelOf: (key: string) => string;
  /** Short axis label (e.g. pillar code) when the full label would crowd. */
  axisLabelOf?: (key: string) => string;
  animate?: boolean;
  strings?: ChartStrings;
  /** Tooltip unit noun (e.g. "findings"). */
  unit?: string;
  height?: number;
};

function KeyedBarTooltip({
  active,
  payload,
  labelOf,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ payload: CountRow & { color: string } }>;
  labelOf: (key: string) => string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <TipShell>
      <TipRow label={labelOf(p.key)} value={`${p.count}${unit ? ` ${unit}` : ''}`} dot={p.color} />
    </TipShell>
  );
}

function KeyedBar({
  data,
  colorOf,
  labelOf,
  axisLabelOf,
  animate = true,
  strings,
  unit,
  height = 240,
}: KeyedBarProps) {
  if (data.length === 0) return <ChartEmpty label={strings?.notScored ?? '—'} height={height} />;
  const axisLabel = axisLabelOf ?? labelOf;
  const rows = data.map((d) => ({ ...d, color: colorOf(d.key), label: axisLabel(d.key) }));
  return (
    <div className="w-full" dir="ltr">
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={{ stroke: GRID_STROKE }} tickLine={false} interval={0} />
            <YAxis tick={AXIS_TICK_SM} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
            {strings && (
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={<KeyedBarTooltip labelOf={labelOf} unit={unit} />}
              />
            )}
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={54} isAnimationActive={animate}>
              {rows.map((r, i) => (
                <Cell key={i} fill={r.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* --------------------------------- SeverityPie ---------------------------- */

export type SeverityPieProps = {
  data: CountRow[];
  animate?: boolean;
  strings?: ChartStrings;
};

function SeverityTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ payload: { key: string; count: number; color: string; label: string } }>;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
  return (
    <TipShell>
      <TipRow label={p.label} value={`${p.count} · ${pct}%`} dot={p.color} />
    </TipShell>
  );
}

/** Findings by severity donut, colored with SEVERITY_COLORS. */
export function SeverityPie({ data, animate = true, strings }: SeverityPieProps) {
  const [active, setActive] = useState<number | null>(null);
  if (data.length === 0)
    return <ChartEmpty label={strings?.findings ? `0 ${strings.findings}` : '—'} height={210} />;
  const rows = data.map((d) => ({
    ...d,
    color: SEVERITY_COLORS[d.key] ?? '#A3A3A3',
    label: strings?.severity[d.key] ?? d.key,
  }));
  const total = rows.reduce((s, d) => s + d.count, 0);
  return (
    <div>
      <div className="relative h-[210px] w-full" dir="ltr">
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-white">{total}</span>
          <span className="text-[10px] uppercase tracking-wide text-ink-500">
            {strings?.findings ?? ''}
          </span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="count"
              nameKey="label"
              innerRadius="58%"
              outerRadius="86%"
              strokeWidth={0}
              paddingAngle={total > 0 ? 2 : 0}
              isAnimationActive={animate}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {rows.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.color}
                  fillOpacity={active == null || active === i ? 1 : 0.35}
                  style={{ transition: 'fill-opacity 0.15s ease' }}
                />
              ))}
            </Pie>
            {strings && <Tooltip content={<SeverityTooltip total={total} />} />}
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ink-300">
        {rows.map((d, i) => {
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <li
              key={i}
              className="flex items-center gap-1.5"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="flex-1 truncate">{d.label}</span>
              <span className="font-mono text-ink-400">
                {d.count}
                <span className="text-ink-600"> · {pct}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------------------------- EffortBar ----------------------------- */

export type EffortBarProps = {
  data: CountRow[];
  animate?: boolean;
  strings?: ChartStrings;
};

/** Findings by effort t-shirt size (XS→XL), silver ramp. */
export function EffortBar({ data, animate = true, strings }: EffortBarProps) {
  return (
    <KeyedBar
      data={data}
      colorOf={effortColor}
      labelOf={(k) => k}
      animate={animate}
      strings={strings}
      unit={strings?.findings}
    />
  );
}

/* ------------------------------- FindingsByPillar ------------------------- */

export type FindingsByPillarRow = { code: string; name: string; count: number };

export type FindingsByPillarProps = {
  data: FindingsByPillarRow[];
  animate?: boolean;
  strings?: ChartStrings;
};

/** Finding counts per pillar (silver bars, keyed by pillar code). */
export function FindingsByPillar({ data, animate = true, strings }: FindingsByPillarProps) {
  const nameByCode = new Map(data.map((d) => [d.code, d.name]));
  return (
    <KeyedBar
      data={data.map((d) => ({ key: d.code, count: d.count }))}
      colorOf={() => ACCENT}
      labelOf={(k) => nameByCode.get(k) ?? k}
      axisLabelOf={(k) => k}
      animate={animate}
      strings={strings}
      unit={strings?.findings}
      height={240}
    />
  );
}

/* ---------------------------------- OverallGauge -------------------------- */

export type OverallGaugeProps = {
  /** Overall health %, 0–100. */
  value: number;
  animate?: boolean;
  strings?: ChartStrings;
};

/**
 * Radial gauge for the overall Health %. A silver arc over an ink track, with
 * the number centered. Presentational-only (no tooltip needed).
 */
export function OverallGauge({ value, animate = true, strings }: OverallGaugeProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const data = [{ name: 'health', value: v, fill: 'url(#gaugeArc)' }];
  return (
    <div className="w-full" dir="ltr">
      <div className="relative mx-auto h-[200px] w-full max-w-[280px]">
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-6">
          <span className="text-4xl font-semibold text-white">{v}%</span>
          <span className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-500">
            {strings?.overallHealth ?? strings?.health ?? ''}
          </span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="72%"
            outerRadius="100%"
            data={data}
            startAngle={220}
            endAngle={-40}
          >
            <defs>
              <linearGradient id="gaugeArc" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={ACCENT_MUTED} />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: 'rgba(255,255,255,0.06)' }}
              dataKey="value"
              cornerRadius={12}
              isAnimationActive={animate}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* -------------------------------- EffortByTimeline ------------------------ */

export type EffortByTimelineRow = Record<string, number | string>;

export type EffortByTimelineProps = {
  data: EffortByTimelineRow[];
  /** Effort sizes present, in order (XS…XL). */
  efforts: string[];
  /** Timeline bucket display labels keyed by raw timeline string. */
  labelOf: (timeline: string) => string;
  animate?: boolean;
  strings?: ChartStrings;
};

function TimelineTooltip({
  active,
  payload,
  label,
  labelOf,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
  labelOf: (t: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <TipShell title={labelOf(String(label))}>
      {payload
        .filter((p) => p.value > 0)
        .map((p) => (
          <TipRow key={p.dataKey} label={p.dataKey} value={p.value} dot={p.color} />
        ))}
    </TipShell>
  );
}

/** Stacked bar of roadmap effort sizes across the timeline buckets. */
export function EffortByTimeline({
  data,
  efforts,
  labelOf,
  animate = true,
  strings,
}: EffortByTimelineProps) {
  const hasAny = data.some((row) => efforts.some((e) => (row[e] as number) > 0));
  if (!hasAny) return <ChartEmpty label={strings?.notScored ?? '—'} height={260} />;
  return (
    <div className="w-full" dir="ltr">
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -12 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis
              dataKey="timeline"
              tick={AXIS_TICK}
              axisLine={{ stroke: GRID_STROKE }}
              tickLine={false}
              tickFormatter={(t: string) => labelOf(t)}
              interval={0}
            />
            <YAxis tick={AXIS_TICK_SM} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
            {strings && (
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={<TimelineTooltip labelOf={labelOf} />}
              />
            )}
            {efforts.map((e, i) => (
              <Bar
                key={e}
                dataKey={e}
                stackId="t"
                fill={effortColor(e)}
                isAnimationActive={animate}
                radius={
                  i === 0
                    ? [0, 0, 4, 4]
                    : i === efforts.length - 1
                      ? [4, 4, 0, 0]
                      : 0
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-ink-300">
        {efforts.map((e) => (
          <li key={e} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: effortColor(e) }} />
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}
