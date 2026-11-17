import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FolderTree,
  HelpCircle,
  SkipForward,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useResearch } from '../context/ResearchContext';
import {
  ADDITIONAL_CLASSIFICATIONS,
  SUPPORTED_SPECIES,
} from '../data/mockData';
import { ConfidenceMeter } from '../components/ConfidenceMeter';
import { StatusBadge } from '../components/StatusBadge';
import { WildlifeImage } from '../components/WildlifeImage';
import { EmptyState } from '../components/EmptyState';

export function ReviewImages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    records,
    projects,
    confirmPrediction,
    correctSpecies,
    markUnidentifiable,
    showToast,
  } = useResearch();

  const [queueMode, setQueueMode] = useState<'pending' | 'all'>('pending');
  const [zoomed, setZoomed] = useState(false);
  const [correctingOpen, setCorrectingOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string>(
    SUPPORTED_SPECIES[0].name
  );
  const [reviewNote, setReviewNote] = useState('');

  const reviewQueue = useMemo(() => {
    const requestedId = searchParams.get('id');
    if (queueMode === 'pending') {
      const pending = records.filter(
        (r) => r.verificationStatus === 'Needs Review'
      );
      if (requestedId && !pending.some((r) => r.id === requestedId)) {
        const requested = records.find((r) => r.id === requestedId);
        return requested ? [requested, ...pending] : pending;
      }
      return pending;
    }
    return records;
  }, [records, queueMode, searchParams]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const requestedId = searchParams.get('id');
    if (requestedId) {
      const idx = reviewQueue.findIndex((r) => r.id === requestedId);
      if (idx >= 0) {
        setCurrentIndex(idx);
      }
    }
  }, [searchParams, reviewQueue]);

  useEffect(() => {
    if (currentIndex >= reviewQueue.length && reviewQueue.length > 0) {
      setCurrentIndex(0);
    }
  }, [reviewQueue.length, currentIndex]);

  const currentRecord = reviewQueue[currentIndex] || null;

  useEffect(() => {
    if (currentRecord) {
      setSelectedSpecies(
        SUPPORTED_SPECIES.some((s) => s.name === currentRecord.predictedSpecies)
          ? currentRecord.predictedSpecies
          : SUPPORTED_SPECIES[0].name
      );
      setReviewNote(currentRecord.reviewNotes || '');
      setCorrectingOpen(false);
    }
  }, [currentRecord]);

  const advanceNext = () => {
    if (reviewQueue.length <= 1) return;
    const nextIdx = (currentIndex + 1) % reviewQueue.length;
    setCurrentIndex(nextIdx);
    const nextId = reviewQueue[nextIdx]?.id;
    if (nextId) setSearchParams({ id: nextId });
  };

  const goPrevious = () => {
    if (reviewQueue.length <= 1) return;
    const prevIdx =
      (currentIndex - 1 + reviewQueue.length) % reviewQueue.length;
    setCurrentIndex(prevIdx);
    const prevId = reviewQueue[prevIdx]?.id;
    if (prevId) setSearchParams({ id: prevId });
  };

  const handleConfirm = () => {
    if (!currentRecord) return;
    confirmPrediction(currentRecord.id);
    if (queueMode === 'all') {
      advanceNext();
    }
  };

  const handleSaveCorrection = () => {
    if (!currentRecord) return;
    correctSpecies(currentRecord.id, selectedSpecies, reviewNote);
    setCorrectingOpen(false);
    if (queueMode === 'all') {
      advanceNext();
    }
  };

  const handleUnidentifiable = () => {
    if (!currentRecord) return;
    markUnidentifiable(currentRecord.id);
    if (queueMode === 'all') {
      advanceNext();
    }
  };

  const handleSkip = () => {
    if (!currentRecord) return;
    showToast({
      type: 'info',
      title: 'Skipped for later',
      description: `${currentRecord.filename} remains in the review queue.`,
    });
    advanceNext();
  };

  const projectName =
    projects.find((p) => p.id === currentRecord?.projectId)?.name ||
    'Monitoring Project';

  const verifiedCount = records.filter(
    (r) =>
      r.verificationStatus === 'Verified' || r.verificationStatus === 'Corrected'
  ).length;

  return (
    <DashboardLayout pageTitle="Image Review">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#202B24]">
              Review AI Predictions
            </h2>
            <p className="mt-1 text-sm text-[#788078]">
              Verify AI-generated wildlife identifications before adding them to confirmed observations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-[#EAECE2] p-1">
              <button
                type="button"
                onClick={() => {
                  setQueueMode('pending');
                  setCurrentIndex(0);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  queueMode === 'pending'
                    ? 'bg-white text-[#202B24] shadow-sm'
                    : 'text-[#4F574F]'
                }`}
              >
                Pending Review (
                {records.filter((r) => r.verificationStatus === 'Needs Review').length}
                )
              </button>
              <button
                type="button"
                onClick={() => {
                  setQueueMode('all');
                  setCurrentIndex(0);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  queueMode === 'all'
                    ? 'bg-white text-[#202B24] shadow-sm'
                    : 'text-[#4F574F]'
                }`}
              >
                All Captures ({records.length})
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E5DA] bg-white px-5 py-3">
          <div className="flex items-center gap-4 text-xs text-[#4F574F]">
            <span className="font-medium tabular-nums">
              {reviewQueue.length > 0
                ? `Image ${currentIndex + 1} of ${reviewQueue.length}`
                : 'Queue Complete'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {verifiedCount} of {records.length} session captures confirmed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrevious}
              disabled={reviewQueue.length <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-[#D8DDD0] bg-white px-3 py-1.5 text-xs font-medium text-[#202B24] hover:bg-[#F5F6EF] disabled:opacity-45"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span>Previous Image</span>
            </button>
            <button
              type="button"
              onClick={advanceNext}
              disabled={reviewQueue.length <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-[#D8DDD0] bg-white px-3 py-1.5 text-xs font-medium text-[#202B24] hover:bg-[#F5F6EF] disabled:opacity-45"
            >
              <span>Next Image</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {!currentRecord ? (
          <EmptyState
            icon={Check}
            title="All pending predictions have been verified"
            description="Every capture in your review queue has been confirmed, corrected, or flagged. Switch to All Captures to revisit previous frames."
            actionLabel="View All Captures"
            onAction={() => setQueueMode('all')}
          />
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            <div className="flex flex-col overflow-hidden rounded-xl border border-[#E2E5DA] bg-white lg:col-span-7">
              <div className="flex items-center justify-between border-b border-[#EFF1E8] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#202B24]">
                    {currentRecord.filename}
                  </p>
                  <p className="text-[11px] text-[#788078]">
                    {currentRecord.isDemoData
                      ? 'Demo Data · Illustrative Sample'
                      : 'Gemini Vision Analysis'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setZoomed((z) => !z)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E5DA] px-2.5 py-1.5 text-xs font-medium text-[#4F574F] hover:bg-[#F5F6EF]"
                >
                  {zoomed ? (
                    <>
                      <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Reset Fit</span>
                    </>
                  ) : (
                    <>
                      <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Inspect 1.35x</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative flex-1 overflow-hidden bg-[#1D2620]">
                <WildlifeImage
                  src={currentRecord.imageUrl}
                  alt={`${currentRecord.predictedSpecies} camera-trap frame`}
                  className={`h-full min-h-[360px] w-full object-cover transition-transform duration-300 ${
                    zoomed ? 'scale-135 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-[#E2E5DA] bg-white p-6 lg:col-span-5">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-[#EFF1E8] pb-4">
                  <div>
                    <p className="text-xs text-[#788078]">Predicted Species</p>
                    <h3 className="mt-1 font-display text-2xl font-bold text-[#202B24]">
                      {currentRecord.confirmedSpecies ||
                        currentRecord.predictedSpecies}
                    </h3>
                    {currentRecord.confirmedSpecies &&
                      currentRecord.confirmedSpecies !==
                        currentRecord.predictedSpecies && (
                        <p className="mt-0.5 text-xs text-[#788078]">
                          Original AI prediction: {currentRecord.predictedSpecies}
                        </p>
                      )}
                  </div>
                  <StatusBadge status={currentRecord.verificationStatus} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#788078]">Confidence Score</span>
                    <ConfidenceMeter score={currentRecord.confidence} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#788078]">Animal Detection</span>
                    <span className="font-medium text-[#202B24]">
                      {currentRecord.detectionStatus === 'animal_detected'
                        ? 'Animal detected'
                        : currentRecord.detectionStatus === 'empty_frame'
                          ? 'Empty frame'
                          : currentRecord.detectionStatus === 'human_or_vehicle'
                            ? 'Human / Vehicle'
                            : 'Unclear'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[#EFF1E8] pt-4 text-xs text-[#4F574F]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#788078]">
                      <FolderTree className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Project</span>
                    </span>
                    <span className="font-medium text-[#202B24] truncate max-w-[200px]">
                      {projectName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#788078]">
                      <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Camera ID</span>
                    </span>
                    <span className="font-mono font-medium text-[#202B24] tabular-nums">
                      {currentRecord.cameraId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#788078]">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Capture Date &amp; Time</span>
                    </span>
                    <span className="font-mono text-[#202B24] tabular-nums">
                      {currentRecord.capturedAt}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-[#FAFBF7] p-3.5 text-xs">
                  <p className="font-semibold text-[#202B24]">
                    AI Processing Details
                  </p>
                  <p className="mt-1 leading-relaxed text-[#4F574F]">
                    {currentRecord.notes}
                  </p>
                </div>

                {correctingOpen && (
                  <div className="space-y-3 rounded-xl border border-[#244B35]/25 bg-[#F5F6EF]/70 p-4">
                    <label
                      htmlFor="correct-species-select"
                      className="block text-xs font-semibold text-[#202B24]"
                    >
                      Select Correct Species
                    </label>
                    <select
                      id="correct-species-select"
                      value={selectedSpecies}
                      onChange={(e) => setSelectedSpecies(e.target.value)}
                      className="w-full rounded-lg border border-[#D8DDD0] bg-white px-3 py-2 text-sm text-[#202B24] focus:border-[#244B35] focus:outline-none"
                    >
                      <optgroup label="Supported Wildlife Species">
                        {SUPPORTED_SPECIES.map((sp) => (
                          <option key={sp.name} value={sp.name}>
                            {sp.name} ({sp.scientificName})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Other Frame Classifications">
                        {ADDITIONAL_CLASSIFICATIONS.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    <input
                      type="text"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Optional field verification note..."
                      className="w-full rounded-lg border border-[#D8DDD0] bg-white px-3 py-2 text-xs text-[#202B24] focus:border-[#244B35] focus:outline-none"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrectingOpen(false)}
                        className="rounded-lg border border-[#D8DDD0] bg-white px-3 py-1.5 text-xs font-medium text-[#4F574F]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCorrection}
                        className="rounded-lg bg-[#244B35] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1C3B2A]"
                      >
                        Save Corrected Result
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-2.5 border-t border-[#EFF1E8] pt-5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244B35] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1C3B2A]"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Confirm Prediction</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCorrectingOpen((o) => !o)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#244B35] bg-white px-4 py-2.5 text-xs font-semibold text-[#244B35] transition-colors hover:bg-[#244B35]/6"
                >
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                  <span>Correct Species</span>
                </button>

                <button
                  type="button"
                  onClick={handleUnidentifiable}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D8DDD0] bg-white px-4 py-2 text-xs font-medium text-[#4F574F] transition-colors hover:bg-[#F5F6EF]"
                >
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Mark as Unidentifiable</span>
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D8DDD0] bg-white px-4 py-2 text-xs font-medium text-[#4F574F] transition-colors hover:bg-[#F5F6EF]"
                >
                  <SkipForward className="h-4 w-4" aria-hidden="true" />
                  <span>Skip for Later</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
