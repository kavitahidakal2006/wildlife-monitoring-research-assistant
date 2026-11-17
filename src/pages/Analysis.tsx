import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  ScanSearch,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useResearch } from '../context/ResearchContext';
import { ConfidenceMeter } from '../components/ConfidenceMeter';
import { StatusBadge } from '../components/StatusBadge';
import { WildlifeImage } from '../components/WildlifeImage';
import { EmptyState } from '../components/EmptyState';

type AnalysisFilter = 'all' | 'high_confidence' | 'needs_review' | 'failed';

export function Analysis() {
  const { records, projects } = useResearch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<AnalysisFilter>('all');

  const summary = useMemo(() => {
    const total = records.length;
    const processing = records.filter(
      (r) => r.processingStatus === 'processing' || r.processingStatus === 'queued'
    ).length;
    const completed = records.filter((r) => r.processingStatus === 'completed').length;
    const failed = records.filter((r) => r.processingStatus === 'failed').length;
    return { total, processing, completed, failed };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (filter === 'failed') return rec.processingStatus === 'failed';
      if (filter === 'high_confidence') {
        return rec.processingStatus === 'completed' && rec.confidence >= 85;
      }
      if (filter === 'needs_review') {
        return (
          rec.processingStatus === 'completed' &&
          (rec.confidence < 85 || rec.verificationStatus === 'Needs Review')
        );
      }
      return true;
    });
  }, [records, filter]);

  return (
    <DashboardLayout pageTitle="AI Image Analysis">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#202B24]">
              AI Image Analysis
            </h2>
            <p className="mt-1 text-sm text-[#788078]">
              Inspect animal detection results, species predictions, confidence scores, and review recommendations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="rounded-lg bg-[#244B35] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1C3B2A] whitespace-nowrap shrink-0"
          >
            Upload More Images
          </button>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-[#E2E5DA] bg-white px-4 py-3 text-xs text-[#4F574F]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#547A50]" aria-hidden="true" />
          <p>
            Records labeled <span className="font-semibold text-[#202B24]">Demo Data</span> are illustrative sample predictions for prototype demonstration. Newly uploaded images processed via the connected AI service are marked <span className="font-semibold text-[#244B35]">Gemini Vision</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-[#E2E5DA] bg-white p-4">
            <div className="flex items-center justify-between text-xs text-[#788078]">
              <span>Total Submitted</span>
              <ScanSearch className="h-4 w-4 text-[#244B35]" aria-hidden="true" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#202B24] tabular-nums">
              {summary.total}
            </p>
          </div>
          <div className="rounded-xl border border-[#E2E5DA] bg-white p-4">
            <div className="flex items-center justify-between text-xs text-[#788078]">
              <span>Processing</span>
              <Clock className="h-4 w-4 text-[#D99A3B]" aria-hidden="true" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#202B24] tabular-nums">
              {summary.processing}
            </p>
          </div>
          <div className="rounded-xl border border-[#E2E5DA] bg-white p-4">
            <div className="flex items-center justify-between text-xs text-[#788078]">
              <span>Completed</span>
              <CheckCircle2 className="h-4 w-4 text-[#244B35]" aria-hidden="true" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#202B24] tabular-nums">
              {summary.completed}
            </p>
          </div>
          <div className="rounded-xl border border-[#E2E5DA] bg-white p-4">
            <div className="flex items-center justify-between text-xs text-[#788078]">
              <span>Failed</span>
              <XCircle className="h-4 w-4 text-[#C65B4B]" aria-hidden="true" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#202B24] tabular-nums">
              {summary.failed}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E2E5DA] bg-white p-1.5 w-fit">
          {(
            [
              { id: 'all', label: 'All Results' },
              { id: 'high_confidence', label: 'High Confidence' },
              { id: 'needs_review', label: 'Requires Review' },
              { id: 'failed', label: 'Failed' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-[#244B35] text-white'
                  : 'text-[#4F574F] hover:bg-[#F5F6EF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState
            icon={ScanSearch}
            title="No analysis records match this filter"
            description="Try switching the status filter or upload new camera-trap photographs."
            actionLabel="Show All Results"
            onAction={() => setFilter('all')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredRecords.map((rec) => {
              const projName =
                projects.find((p) => p.id === rec.projectId)?.name || 'Survey';
              const recommendation =
                rec.processingStatus === 'failed'
                  ? 'Failed processing — inspect original file'
                  : rec.confidence >= 85
                    ? 'High-confidence prediction · Spot check recommended'
                    : 'Requires researcher verification';

              const recommendationTone =
                rec.processingStatus === 'failed'
                  ? 'text-[#A33E30] bg-[#C65B4B]/10'
                  : rec.confidence >= 85
                    ? 'text-[#244B35] bg-[#244B35]/8'
                    : 'text-[#9A6614] bg-[#D99A3B]/14';

              const detectionText =
                rec.detectionStatus === 'animal_detected'
                  ? 'Animal detected'
                  : rec.detectionStatus === 'empty_frame'
                    ? 'No animal detected (Empty frame)'
                    : rec.detectionStatus === 'human_or_vehicle'
                      ? 'Human or vehicle detected'
                      : 'Unclear / low visibility';

              return (
                <article
                  key={rec.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-[#E2E5DA] bg-white sm:flex-row"
                >
                  <div className="relative aspect-[4/3] w-full shrink-0 bg-[#EAECE2] sm:w-52 sm:aspect-auto">
                    <WildlifeImage
                      src={rec.imageUrl}
                      alt={rec.filename}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-display text-sm font-semibold text-[#202B24] truncate">
                            {rec.filename}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-[#788078] truncate">
                            {projName} · {rec.cameraId} ·{' '}
                            {rec.isDemoData ? 'Demo Data' : 'Gemini Vision'}
                          </p>
                        </div>
                        <StatusBadge
                          status={
                            rec.processingStatus === 'failed'
                              ? 'failed'
                              : rec.confidence >= 85
                                ? 'High Confidence'
                                : 'Requires Review'
                          }
                        />
                      </div>

                      <dl className="mt-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <dt className="text-[#788078]">Detection</dt>
                          <dd className="font-medium text-[#202B24]">
                            {detectionText}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-[#788078]">Predicted Species</dt>
                          <dd className="font-semibold text-[#244B35]">
                            {rec.predictedSpecies}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-[#788078]">Confidence</dt>
                          <dd>
                            <ConfidenceMeter score={rec.confidence} />
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="mt-4 space-y-3 border-t border-[#EFF1E8] pt-3">
                      <div
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${recommendationTone}`}
                      >
                        {rec.processingStatus === 'failed' ? (
                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                        ) : rec.confidence >= 85 ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">{recommendation}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#788078]">
                          Status: {rec.verificationStatus}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/review?id=${rec.id}`)}
                          className="rounded-lg bg-[#244B35] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1C3B2A]"
                        >
                          Review Prediction
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
