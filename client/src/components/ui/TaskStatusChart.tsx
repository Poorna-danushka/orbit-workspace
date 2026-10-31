import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface TaskStatusDatum {
  name: string;
  value: number;
}

type ChartVariant = 'admin' | 'workspace';

const COLORS: Record<ChartVariant, string[]> = {
  admin: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
  workspace: ['#10b981', '#3b82f6', '#f59e0b', '#6b7280'],
};

export default function TaskStatusChart({
  data,
  variant,
}: {
  data: TaskStatusDatum[];
  variant: ChartVariant;
}) {
  const isAdmin = variant === 'admin';
  if (!data.length) {
    return (
      <div
        className={
          isAdmin
            ? 'flex h-[250px] items-center justify-center text-gray-500'
            : 'flex h-[240px] items-center justify-center text-sm text-gray-600'
        }
      >
        No task data yet{isAdmin ? '.' : ''}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={isAdmin ? 250 : 240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={isAdmin ? 50 : 60}
          outerRadius={isAdmin ? 85 : 90}
          paddingAngle={isAdmin ? 4 : 5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={isAdmin ? `${entry.name}-${index}` : index}
              fill={COLORS[variant][index % COLORS[variant].length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isAdmin ? '#0d0f14' : '#111',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          }}
        />
        <Legend
          formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
