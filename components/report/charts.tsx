'use client';

import {
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { ACCENT, MATURITY_COLORS } from '@/lib/ui';

export type RadarProps = {
  data: { name: string; value: number }[];
  animate?: boolean;
};

export type DonutProps = {
  distribution: Record<string, number>;
  labels: Record<number, string>;
  animate?: boolean;
};

export function PillarRadar({ data, animate = true }: RadarProps) {
  return (
    <div className="h-[320px] w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.12)" />
          <PolarAngleAxis dataKey="name" tick={{ fill: '#A3A3A3', fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke={ACCENT}
            fill={ACCENT}
            fillOpacity={0.28}
            isAnimationActive={animate}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DistributionDonut({ distribution, labels, animate = true }: DonutProps) {
  const data = [1, 2, 3, 4].map((level) => ({
    name: labels[level] ?? String(level),
    value: distribution?.[String(level)] ?? 0,
    color: MATURITY_COLORS[level],
  }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="h-[200px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="85%"
              strokeWidth={0}
              paddingAngle={total > 0 ? 2 : 0}
              isAnimationActive={animate}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ink-300">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="flex-1 truncate">{d.name}</span>
            <span className="font-mono text-ink-400">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
