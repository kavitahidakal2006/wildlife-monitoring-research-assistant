import { ArrowUpRight, Calendar, Camera, FolderTree, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MonitoringProject, WildlifeRecord } from '../types';
import { ConfidenceMeter } from './ConfidenceMeter';
import { StatusBadge } from './StatusBadge';
import { WildlifeImage } from './WildlifeImage';

interface ObservationDetailModalProps {
  record: WildlifeRecord | null;
  projects: MonitoringProject[];
  onClose: () => void;
}

export function ObservationDetailModal({
  record,
  projects,
  onClose,
}: ObservationDetailModalProps) {
  const navigate = useNavigate();
  if (!record) return null;

  const project = projects.find((p) => p.id === record.projectId);
  const displaySpecies = record.confirmedSpecies || record.predictedSpecies;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#202B24]/50 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="observation-detail-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#E2E5DA] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E8DE] px-6 py-4">
          <div>
            <h2
              id="observation-detail-title"
              className="font-display text-lg font-semibold text-[#202B24]"
            >
              Observation Details · {displaySpecies}
            </h2>
            <p className="text-xs text-[#788078]">
              {record.filename}
              <span className="mx-1.5" aria-hidden="true">·</span>
              {record.isDemoData
                ? 'Illustrative Demo Data'
                : 'Analysed via Gemini Vision'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#788078] transition-colors hover:bg-[#F5F6EF] hover:text-[#202B24]"
            aria-label="Close observation details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="overflow-hidden rounded-xl border border-[#E5E8DE] bg-[#EAECE2]">
              <WildlifeImage
                src={record.imageUrl}
                alt={`${displaySpecies} camera-trap photograph`}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <p className="mt-2.5 text-xs text-[#788078]">
              Note: Each image represents a single camera-trap observation event, not a unique individual animal count.
            </p>
          </div>

          <div className="space-y-4 md:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#788078]">
                Verification Status
              </span>
              <StatusBadge status={record.verificationStatus} />
            </div>

            <div className="space-y-2.5 border-t border-[#EFF1E8] pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#788078]">AI Prediction</span>
                <span className="font-medium text-[#202B24]">
                  {record.predictedSpecies}
                </span>
              </div>
              {record.confirmedSpecies && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#788078]">Confirmed Species</span>
                  <span className="font-semibold text-[#244B35]">
                    {record.confirmedSpecies}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#788078]">Confidence Score</span>
                <ConfidenceMeter score={record.confidence} />
              </div>
            </div>

            <div className="space-y-2 border-t border-[#EFF1E8] pt-3 text-xs text-[#4F574F]">
              <div className="flex items-center gap-2">
                <FolderTree className="h-3.5 w-3.5 text-[#788078]" aria-hidden="true" />
                <span>{project?.name || 'Unassigned Project'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="h-3.5 w-3.5 text-[#788078]" aria-hidden="true" />
                <span className="font-mono tabular-nums">{record.cameraId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[#788078]" aria-hidden="true" />
                <span className="tabular-nums">{record.capturedAt}</span>
              </div>
            </div>

            <div className="border-t border-[#EFF1E8] pt-3">
              <p className="text-xs font-medium text-[#788078]">
                Field & AI Notes
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#202B24]">
                {record.notes}
              </p>
              {record.reviewNotes && (
                <p className="mt-2 text-xs leading-relaxed text-[#244B35]">
                  Reviewer note: {record.reviewNotes}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/review?id=${record.id}`);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#244B35] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1C3B2A]"
              >
                <span>Open in Image Review</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
