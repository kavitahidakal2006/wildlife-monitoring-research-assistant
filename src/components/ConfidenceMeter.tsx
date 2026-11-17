interface ConfidenceMeterProps {
  score: number;
  showBar?: boolean;
}

export function ConfidenceMeter({ score, showBar = true }: ConfidenceMeterProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const barColor =
    clamped >= 85
      ? 'bg-[#244B35]'
      : clamped >= 65
        ? 'bg-[#D99A3B]'
        : 'bg-[#C65B4B]';

  const textColor =
    clamped >= 85
      ? 'text-[#244B35]'
      : clamped >= 65
        ? 'text-[#9A6614]'
        : 'text-[#A33E30]';

  return (
    <div className="flex items-center gap-2.5">
      {showBar && (
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E5E8DE]">
          <div
            className={`h-full rounded-full transition-all duration-200 ${barColor}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
      )}
      <span className={`font-mono text-xs font-medium tabular-nums ${textColor}`}>
        {clamped}%
      </span>
    </div>
  );
}
