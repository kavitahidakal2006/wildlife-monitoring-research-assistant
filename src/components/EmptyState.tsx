import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D3D8CA] bg-white/70 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#244B35]/8 text-[#244B35]">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-[#202B24]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-[#788078]">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center rounded-lg bg-[#244B35] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1C3B2A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#244B35]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
