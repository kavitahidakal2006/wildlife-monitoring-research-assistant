import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  helper: string;
  icon: LucideIcon;
  tone?: 'default' | 'forest' | 'olive' | 'warning';
}

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'default',
}: StatCardProps) {
  const iconWrap =
    tone === 'forest'
      ? 'bg-[#244B35]/10 text-[#244B35]'
      : tone === 'olive'
        ? 'bg-[#547A50]/12 text-[#3D5E3A]'
        : tone === 'warning'
          ? 'bg-[#D99A3B]/15 text-[#9A6614]'
          : 'bg-[#F5F6EF] text-[#547A50]';

  return (
    <div className="rounded-xl border border-[#E2E5DA] bg-white p-5 transition-colors hover:border-[#C8CEBF]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#788078]">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-[#202B24] tabular-nums">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconWrap}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-xs text-[#788078]">{helper}</p>
    </div>
  );
}
