import { Eye } from 'lucide-react';
import { WildlifeRecord } from '../types';
import { ConfidenceMeter } from './ConfidenceMeter';
import { StatusBadge } from './StatusBadge';
import { WildlifeImage } from './WildlifeImage';

interface WildlifeCardProps {
  record: WildlifeRecord;
  projectName?: string;
  onViewDetails: (record: WildlifeRecord) => void;
}

export function WildlifeCard({
  record,
  projectName,
  onViewDetails,
}: WildlifeCardProps) {
  const displaySpecies = record.confirmedSpecies || record.predictedSpecies;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#E2E5DA] bg-white transition-colors hover:border-[#C2C9B8]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAECE2]">
        <WildlifeImage
          src={record.imageUrl}
          alt={`${displaySpecies} captured by ${record.cameraId}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-[#202B24] truncate">
            {displaySpecies}
          </h3>
          <StatusBadge status={record.verificationStatus} />
        </div>

        <p className="mt-1 text-xs text-[#788078] truncate">
          {record.cameraId}
          <span className="mx-1.5" aria-hidden="true">·</span>
          <span className="tabular-nums">{record.capturedAt}</span>
          {projectName && (
            <>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{projectName}</span>
            </>
          )}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-[#EFF1E8] pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#788078]">Confidence</span>
            <ConfidenceMeter score={record.confidence} showBar={false} />
          </div>
          <button
            type="button"
            onClick={() => onViewDetails(record)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#244B35] transition-colors hover:bg-[#244B35]/8"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </article>
  );
}
