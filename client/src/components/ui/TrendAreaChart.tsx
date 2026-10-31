import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TrendDatum {
  name: string;
  value: number;
}

type TrendVariant = 'admin' | 'dashboard';

export default function TrendAreaChart({
  data,
  variant,
}: {
  data: TrendDatum[];
  variant: TrendVariant;
}) {
  const isAdmin = variant === 'admin';
  const fillId = isAdmin ? 'adminGrowthFill' : 'memberTasksFill';

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minWidth={0}
      minHeight={isAdmin ? 220 : 210}
      initialDimension={isAdmin ? { width: 400, height: 248 } : { width: 320, height: 235 }}
    >
      <AreaChart data={data} margin={{ top: isAdmin ? 12 : 14, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ob-primary)" stopOpacity={isAdmin ? 0.28 : 0.3} />
            <stop offset="100%" stopColor="var(--ob-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--ob-border)" strokeDasharray="4 5" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--ob-text-muted)', fontSize: isAdmin ? 12 : 11 }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--ob-text-muted)', fontSize: 11 }}
          allowDecimals={false}
          width={34}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--ob-surface)',
            border: '1px solid var(--ob-border-2)',
            borderRadius: 12,
            color: 'var(--ob-text)',
          }}
          labelStyle={{ color: 'var(--ob-text-muted)' }}
          itemStyle={isAdmin ? { color: 'var(--ob-primary)' } : undefined}
        />
        <Area
          type="monotone"
          dataKey="value"
          name={isAdmin ? 'New accounts' : 'Tasks due'}
          stroke="var(--ob-primary)"
          strokeWidth={3}
          fill={`url(#${fillId})`}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
