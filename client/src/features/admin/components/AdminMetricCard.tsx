import type { LucideIcon } from 'lucide-react';

type AdminMetricCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
  detail?: string;
};

export default function AdminMetricCard({
  label,
  value,
  icon: Icon,
  tone,
  detail,
}: AdminMetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#11131b] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        <Icon className={`h-5 w-5 ${tone}`} />
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {detail !== undefined && <div className="mt-2 text-xs text-gray-500">{detail}</div>}
    </div>
  );
}
