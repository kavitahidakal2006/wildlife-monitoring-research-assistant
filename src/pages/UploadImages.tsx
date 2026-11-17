import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useResearch } from '../context/ResearchContext';
import { SelectedUploadFile, UploadZone } from '../components/UploadZone';
import { ASSET_IMAGES } from '../data/mockData';
import { DetectionStatus, WildlifeRecord } from '../types';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

async function fetchAssetAsDataUrl(assetPath: string): Promise<string> {
  const res = await fetch(assetPath);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to load sample asset'));
    reader.readAsDataURL(blob);
  });
}

export function UploadImages() {
  const [searchParams] = useSearchParams();
  const {
    projects,
    addAnalyzedRecords,
    addActivity,
    aiBackendConnected,
    refreshBackendHealth,
    showToast,
  } = useResearch();

  const initialProjectId =
    searchParams.get('project') || projects[0]?.id || 'proj-kabini';

  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];
  const [cameraId, setCameraId] = useState(
    selectedProject?.cameras[0] || 'CAM-K04'
  );

  const [files, setFiles] = useState<SelectedUploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [analysisSummary, setAnalysisSummary] = useState<{
    completed: number;
    failed: number;
    backendNotConnected: boolean;
    errorMessage?: string;
  } | null>(null);

  useEffect(() => {
    if (selectedProject && !selectedProject.cameras.includes(cameraId)) {
      setCameraId(selectedProject.cameras[0] || 'CAM-01');
    }
  }, [selectedProject, cameraId]);

  const handleAddFiles = async (incoming: File[]) => {
    const prepared: SelectedUploadFile[] = await Promise.all(
      incoming.map(async (file) => ({
        id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        filename: file.name,
        sizeBytes: file.size,
        mimeType: file.type || 'image/jpeg',
        previewUrl: await readFileAsDataUrl(file),
        status: 'queued' as const,
      }))
    );
    setFiles((prev) => [...prev, ...prepared]);
    setAnalysisSummary(null);
  };

  const handleLoadSampleBatch = async () => {
    const samples = [
      {
        filename: 'field_sample_tiger_01.jpg',
        path: ASSET_IMAGES.bengalTiger,
        sizeBytes: 412800,
      },
      {
        filename: 'field_sample_deer_02.jpg',
        path: ASSET_IMAGES.spottedDeer,
        sizeBytes: 386400,
      },
      {
        filename: 'field_sample_empty_03.jpg',
        path: ASSET_IMAGES.emptyTrail,
        sizeBytes: 298100,
      },
    ];

    const prepared: SelectedUploadFile[] = await Promise.all(
      samples.map(async (s) => ({
        id: `sample-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        filename: s.filename,
        sizeBytes: s.sizeBytes,
        mimeType: 'image/jpeg',
        previewUrl: await fetchAssetAsDataUrl(s.path),
        status: 'queued' as const,
      }))
    );
    setFiles((prev) => [...prev, ...prepared]);
    setAnalysisSummary(null);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleStartAnalysis = async () => {
    if (files.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setProgressPct(5);
    setAnalysisSummary(null);

    await refreshBackendHealth();

    let completedCount = 0;
    let failedCount = 0;
    let backendNotConnected = false;
    let firstError = '';
    const analyzedBatch: WildlifeRecord[] = [];

    for (let i = 0; i < files.length; i++) {
      const current = files[i];
      setFiles((prev) =>
        prev.map((item) =>
          item.id === current.id ? { ...item, status: 'analyzing' } : item
        )
      );

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: current.previewUrl,
            mimeType: current.mimeType,
            filename: current.filename,
          }),
        });

        const payload = (await res.json()) as {
          error?: string;
          code?: string;
          detectionStatus?: DetectionStatus;
          predictedSpecies?: string;
          confidence?: number;
          reviewRecommendation?: string;
          notes?: string;
        };

        if (!res.ok) {
          if (payload.code === 'BACKEND_NOT_CONNECTED') {
            backendNotConnected = true;
          }
          failedCount += 1;
          if (!firstError) {
            firstError = payload.error || 'Analysis failed';
          }
          setFiles((prev) =>
            prev.map((item) =>
              item.id === current.id
                ? {
                    ...item,
                    status: 'failed',
                    errorMessage:
                      payload.code === 'BACKEND_NOT_CONNECTED'
                        ? 'Backend Not Connected'
                        : payload.error || 'Analysis error',
                  }
                : item
            )
          );
        } else {
          completedCount += 1;
          const confidence = Math.max(0, Math.min(100, Number(payload.confidence ?? 0)));
          const detectionStatus: DetectionStatus =
            payload.detectionStatus || 'animal_detected';
          const predictedSpecies = payload.predictedSpecies || 'Unidentifiable';

          const record: WildlifeRecord = {
            id: `obs-${Date.now()}-${i}`,
            filename: current.filename,
            imageUrl: current.previewUrl,
            projectId: selectedProjectId,
            cameraId,
            capturedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            detectionStatus,
            predictedSpecies,
            confidence,
            processingStatus: 'completed',
            verificationStatus:
              detectionStatus === 'empty_frame'
                ? 'Empty Frame'
                : 'Needs Review',
            notes:
              payload.notes ||
              'Analysed automatically from uploaded camera-trap frame.',
            isDemoData: false,
            analysisSource: 'gemini_vision',
          };
          analyzedBatch.push(record);
          setFiles((prev) =>
            prev.map((item) =>
              item.id === current.id ? { ...item, status: 'completed' } : item
            )
          );
        }
      } catch (err) {
        failedCount += 1;
        firstError =
          err instanceof Error ? err.message : 'Network error during analysis';
        setFiles((prev) =>
          prev.map((item) =>
            item.id === current.id
              ? { ...item, status: 'failed', errorMessage: firstError }
              : item
          )
        );
      }

      setProgressPct(Math.round(((i + 1) / files.length) * 100));
    }

    if (analyzedBatch.length > 0) {
      addAnalyzedRecords(analyzedBatch);
      addActivity({
        type: 'analysis',
        title: `${analyzedBatch.length} image(s) analysed via AI`,
        detail: `${selectedProject?.name || 'Project'} · ${cameraId}`,
      });
      showToast({
        type: 'success',
        title: 'AI analysis completed',
        description: `${analyzedBatch.length} capture(s) ready for researcher verification.`,
      });
    } else if (backendNotConnected) {
      showToast({
        type: 'warning',
        title: 'AI Backend Not Connected',
        description: 'GEMINI_API_KEY is not configured. Review Demo Data in AI Analysis.',
      });
    } else if (failedCount > 0) {
      showToast({
        type: 'error',
        title: 'Analysis failed',
        description: firstError,
      });
    }

    setAnalysisSummary({
      completed: completedCount,
      failed: failedCount,
      backendNotConnected,
      errorMessage: firstError || undefined,
    });
    setIsProcessing(false);
  };

  const queuedCount = files.filter((f) => f.status === 'queued').length;
  const completedFilesCount = files.filter((f) => f.status === 'completed').length;

  return (
    <DashboardLayout pageTitle="Upload Images">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#202B24]">
              Upload Camera-Trap Images
            </h2>
            <p className="mt-1 text-sm text-[#788078]">
              Upload wildlife photographs to begin AI-powered analysis.
            </p>
          </div>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleLoadSampleBatch}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D8DDD0] bg-white px-3.5 py-2 text-xs font-semibold text-[#244B35] transition-colors hover:bg-[#FAFBF7] disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Load Sample Camera-Trap Batch</span>
          </button>
        </div>

        {aiBackendConnected === false && (
          <div className="flex items-start gap-3 rounded-xl border border-[#D99A3B]/40 bg-[#D99A3B]/10 p-4 text-xs text-[#6B460B]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#D99A3B]" aria-hidden="true" />
            <div>
              <p className="font-semibold">AI Backend Not Connected</p>
              <p className="mt-0.5">
                Live image analysis requires a configured server-side Gemini API key. Uploaded images can still be staged, and you can explore pre-loaded illustrative results in{' '}
                <Link to="/analysis" className="font-semibold underline">
                  AI Image Analysis (Demo Data)
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-[#E2E5DA] bg-white p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="upload-project"
                className="block text-xs font-semibold text-[#202B24]"
              >
                Monitoring Project
              </label>
              <select
                id="upload-project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={isProcessing}
                className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3.5 py-2.5 text-sm text-[#202B24] focus:border-[#244B35] focus:bg-white focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="upload-camera"
                className="block text-xs font-semibold text-[#202B24]"
              >
                Camera ID
              </label>
              <select
                id="upload-camera"
                value={cameraId}
                onChange={(e) => setCameraId(e.target.value)}
                disabled={isProcessing}
                className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3.5 py-2.5 font-mono text-sm text-[#202B24] focus:border-[#244B35] focus:bg-white focus:outline-none"
              >
                {(selectedProject?.cameras || ['CAM-01']).map((cam) => (
                  <option key={cam} value={cam}>
                    {cam}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <UploadZone
            files={files}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            disabled={isProcessing}
          />

          <div className="flex flex-col justify-between gap-4 border-t border-[#EFF1E8] pt-5 sm:flex-row sm:items-center">
            <div className="text-xs text-[#788078] tabular-nums">
              <span className="font-semibold text-[#202B24]">{files.length}</span>{' '}
              selected ·{' '}
              <span className="font-medium text-[#4F574F]">{queuedCount}</span>{' '}
              uploaded (awaiting analysis) ·{' '}
              <span className="font-medium text-[#244B35]">
                {completedFilesCount}
              </span>{' '}
              successfully analysed
            </div>

            <div className="flex items-center gap-3">
              {files.length > 0 && !isProcessing && (
                <button
                  type="button"
                  onClick={() => {
                    setFiles([]);
                    setAnalysisSummary(null);
                  }}
                  className="rounded-lg border border-[#D8DDD0] bg-white px-4 py-2.5 text-xs font-medium text-[#4F574F] hover:bg-[#F5F6EF]"
                >
                  Clear Queue
                </button>
              )}
              <button
                type="button"
                disabled={queuedCount === 0 || isProcessing}
                onClick={handleStartAnalysis}
                className="inline-flex items-center gap-2 rounded-lg bg-[#244B35] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1C3B2A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Analysing ({progressPct}%)...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    <span>Start AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#EAECE2]">
                <div
                  className="h-full rounded-full bg-[#244B35] transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-[#788078]">
                Processing camera-trap frames for animal detection and species identification...
              </p>
            </div>
          )}

          {analysisSummary && (
            <div
              className={`flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${
                analysisSummary.completed > 0
                  ? 'border-[#244B35]/25 bg-[#244B35]/6 text-[#202B24]'
                  : 'border-[#C65B4B]/35 bg-[#C65B4B]/8 text-[#7B281D]'
              }`}
            >
              <div className="flex items-start gap-2.5 text-xs">
                {analysisSummary.completed > 0 ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#244B35]" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#C65B4B]" />
                )}
                <div>
                  <p className="font-semibold">
                    {analysisSummary.completed > 0
                      ? `${analysisSummary.completed} image(s) analysed successfully.`
                      : analysisSummary.backendNotConnected
                        ? 'Backend Not Connected — live AI inference unavailable.'
                        : 'Image analysis could not complete.'}
                  </p>
                  {analysisSummary.errorMessage && (
                    <p className="mt-0.5 opacity-85">{analysisSummary.errorMessage}</p>
                  )}
                </div>
              </div>
              <Link
                to="/analysis"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#244B35] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1C3B2A] whitespace-nowrap shrink-0"
              >
                <span>View Analysis Results</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
