import { Eye } from 'lucide-react';
import { WildlifeRecord } from '../types';
import { ConfidenceMeter } from './ConfidenceMeter';
import { StatusBadge } from './StatusBadge';
import { WildlifeImage } from './WildlifeImage';

interface ObservationTableProps {
  records: WildlifeRecord[];
  onViewRecord: (record: WildlifeRecord) => void;
  compact?: boolean;
}

export function ObservationTable({
  records,
  onViewRecord,
  compact = false,
}: ObservationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#E5E8DE] text-xs font-semibold text-[#788078]">
            <th className="py-3 pr-4">Capture</th>
            <th className="px-3 py-3">Species</th>
            <th className="px-3 py-3">Camera ID</th>
            <th className="px-3 py-3">Observation Date</th>
            <th className="px-3 py-3">Confidence</th>
            <th className="px-3 py-3">Status</th>
            <th className="py-3 pl-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EFF1E8] text-sm">
          {records.map((rec) => {
            const displaySpecies = rec.confirmedSpecies || rec.predictedSpecies;
            return (
              <tr
                key={rec.id}
                className="transition-colors hover:bg-[#FAFBF7]"
              >
                <td className={compact ? 'py-2.5 pr-4' : 'py-3 pr-4'}>
                  <div className="flex items-center gap-3">
                    <WildlifeImage
                      src={rec.imageUrl}
                      alt={`${displaySpecies} capture`}
                      className="h-10 w-14 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[#202B24] max-w-[140px]">
                        {rec.filename}
                      </p>
                      <p className="text-[11px] text-[#788078]">
                        {rec.isDemoData ? 'Demo Data' : 'Live Upload'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 font-medium text-[#202B24]">
                  {displaySpecies}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-[#4F574F] tabular-nums">
                  {rec.cameraId}
                </td>
                <td className="px-3 py-2.5 text-xs text-[#788078] tabular-nums whitespace-nowrap">
                  {rec.capturedAt}
                </td>
                <td className="px-3 py-2.5">
                  <ConfidenceMeter score={rec.confidence} />
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={rec.verificationStatus} />
                </td>
                <td className="py-2.5 pl-3 text-right">
                  <button
                    type="button"
                    onClick={() => onViewRecord(rec)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E5DA] bg-white px-2.5 py-1.5 text-xs font-medium text-[#244B35] transition-colors hover:bg-[#244B35] hover:text-white whitespace-nowrap"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
