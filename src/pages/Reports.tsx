import { useMemo, useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useResearch } from '../context/ResearchContext';
import { SUPPORTED_SPECIES } from '../data/mockData';

export function Reports() {
  const { projects, records, addActivity, showToast } = useResearch();

  const [projectId, setProjectId] = useState(projects[0]?.id || 'all');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-11-17');
  const [species, setSpecies] = useState('all');
  const [format, setFormat] = useState<'summary' | 'detailed' | 'camera'>('summary');
  const [generatedAt, setGeneratedAt] = useState('2026-11-17 02:15');

  const selectedProject =
    projectId === 'all'
      ? null
      : projects.find((p) => p.id === projectId) || projects[0];

  const scopedRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchProj = projectId === 'all' || rec.projectId === projectId;
      const displaySpecies = rec.confirmedSpecies || rec.predictedSpecies;
      const matchSpecies = species === 'all' || displaySpecies === species;
      const recDate = rec.capturedAt.slice(0, 10);
      const matchStart = !startDate || recDate >= startDate;
      const matchEnd = !endDate || recDate <= endDate;
      return matchProj && matchSpecies && matchStart && matchEnd;
    });
  }, [records, projectId, species, startDate, endDate]);

  const reportMetrics = useMemo(() => {
    const totalAnalysed = selectedProject
      ? selectedProject.uploadedImages
      : projects.reduce((s, p) => s + p.uploadedImages, 0);
    const animalDetected = selectedProject
      ? selectedProject.observationsCount
      : projects.reduce((s, p) => s + p.observationsCount, 0);
    const emptyImages = Math.max(0, totalAnalysed - animalDetected - 120);

    const speciesMap: Record<string, number> = {};
    const cameraMap: Record<string, number> = {};
    let verified = 0;
    let corrected = 0;
    let pending = 0;

    scopedRecords.forEach((rec) => {
      const sp = rec.confirmedSpecies || rec.predictedSpecies;
      if (rec.detectionStatus === 'animal_detected') {
        speciesMap[sp] = (speciesMap[sp] || 0) + 1;
      }
      cameraMap[rec.cameraId] = (cameraMap[rec.cameraId] || 0) + 1;
      if (rec.verificationStatus === 'Verified') verified += 1;
      else if (rec.verificationStatus === 'Corrected') corrected += 1;
      else if (rec.verificationStatus === 'Needs Review') pending += 1;
    });

    return {
      totalAnalysed,
      animalDetected,
      emptyImages,
      speciesRows: Object.entries(speciesMap).map(([name, count]) => ({
        name,
        count,
      })),
      cameraRows: Object.entries(cameraMap).map(([cam, count]) => ({
        cam,
        count,
      })),
      verified,
      corrected,
      pending,
    };
  }, [selectedProject, projects, scopedRecords]);

  const handleGenerate = () => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setGeneratedAt(now);
    addActivity({
      type: 'report',
      title: 'Research report generated',
      detail: `${selectedProject?.name || 'All Projects'} (${startDate} to ${endDate})`,
    });
    showToast({
      type: 'success',
      title: 'Report preview updated',
      description: 'Structured wildlife monitoring summary is ready to export.',
    });
  };

  const handleDownloadCsv = () => {
    const header = [
      'Observation ID',
      'Filename',
      'Project',
      'Camera ID',
      'Captured At',
      'Predicted Species',
      'Confirmed Species',
      'Confidence (%)',
      'Verification Status',
      'Data Source',
    ];
    const rows = scopedRecords.map((r) => [
      r.id,
      r.filename,
      projects.find((p) => p.id === r.projectId)?.name || r.projectId,
      r.cameraId,
      r.capturedAt,
      r.predictedSpecies,
      r.confirmedSpecies || '',
      String(r.confidence),
      r.verificationStatus,
      r.isDemoData ? 'Demo Data' : 'Gemini Vision',
    ]);

    const csv = [header, ...rows]
      .map((line) =>
        line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wildlife_report_${projectId}_${startDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'CSV report downloaded',
      description: `Exported ${scopedRecords.length} observation record(s).`,
    });
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <DashboardLayout pageTitle="Research Reports">
      <div className="space-y-6">
        <div className="no-print">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#202B24]">
            Research Reports
          </h2>
          <p className="mt-1 text-sm text-[#788078]">
            Generate structured summaries of wildlife monitoring observations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="rounded-xl border border-[#E2E5DA] bg-white p-5 lg:col-span-4 no-print">
            <h3 className="font-display text-base font-semibold text-[#202B24]">
              Report Parameters
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="report-project"
                  className="block text-xs font-semibold text-[#202B24]"
                >
                  Select Project
                </label>
                <select
                  id="report-project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3 py-2 text-xs text-[#202B24] focus:border-[#244B35] focus:outline-none"
                >
                  <option value="all">All Monitoring Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="report-start"
                    className="block text-xs font-semibold text-[#202B24]"
                  >
                    Start Date
                  </label>
                  <input
                    id="report-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-2.5 py-2 text-xs text-[#202B24] focus:border-[#244B35] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="report-end"
                    className="block text-xs font-semibold text-[#202B24]"
                  >
                    End Date
                  </label>
                  <input
                    id="report-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-2.5 py-2 text-xs text-[#202B24] focus:border-[#244B35] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="report-species"
                  className="block text-xs font-semibold text-[#202B24]"
                >
                  Select Species
                </label>
                <select
                  id="report-species"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3 py-2 text-xs text-[#202B24] focus:border-[#244B35] focus:outline-none"
                >
                  <option value="all">All Species</option>
                  {SUPPORTED_SPECIES.map((sp) => (
                    <option key={sp.name} value={sp.name}>
                      {sp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="report-format"
                  className="block text-xs font-semibold text-[#202B24]"
                >
                  Report Format
                </label>
                <select
                  id="report-format"
                  value={format}
                  onChange={(e) =>
                    setFormat(
                      e.target.value as 'summary' | 'detailed' | 'camera'
                    )
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3 py-2 text-xs text-[#202B24] focus:border-[#244B35] focus:outline-none"
                >
                  <option value="summary">Ecological Summary Report</option>
                  <option value="detailed">Detailed Species Observation Log</option>
                  <option value="camera">Camera-Trap Effort &amp; Station Breakdown</option>
                </select>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#244B35] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1C3B2A]"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span>Generate Report</span>
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D8DDD0] bg-white px-3 py-2 text-xs font-semibold text-[#202B24] hover:bg-[#F5F6EF]"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintPdf}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D8DDD0] bg-white px-3 py-2 text-xs font-semibold text-[#202B24] hover:bg-[#F5F6EF]"
                  >
                    <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#E2E5DA] bg-white p-6 sm:p-8 lg:col-span-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E8DE] pb-5">
              <div>
                <p className="text-xs font-semibold text-[#547A50]">
                  Wildlife Monitoring &amp; Research Report
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-[#202B24]">
                  {selectedProject?.name || 'Consolidated Multi-Project Survey'}
                </h3>
                <p className="mt-1 text-xs text-[#788078]">
                  Location: {selectedProject?.location || 'All Active Reserve Sectors'} · Period:{' '}
                  <span className="tabular-nums">
                    {startDate} to {endDate}
                  </span>
                </p>
              </div>
              <div className="text-right text-xs text-[#788078]">
                <p>Generated {generatedAt}</p>
                <p className="mt-0.5 font-medium text-[#202B24]">
                  Includes Demo Baseline Data
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-[#FAFBF7] p-4">
                <p className="text-xs text-[#788078]">Total Images Analysed</p>
                <p className="mt-1 font-display text-xl font-bold text-[#202B24] tabular-nums">
                  {reportMetrics.totalAnalysed.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-[#FAFBF7] p-4">
                <p className="text-xs text-[#788078]">Animal-Detected Images</p>
                <p className="mt-1 font-display text-xl font-bold text-[#244B35] tabular-nums">
                  {reportMetrics.animalDetected.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-[#FAFBF7] p-4">
                <p className="text-xs text-[#788078]">Empty Images Filtered</p>
                <p className="mt-1 font-display text-xl font-bold text-[#4F574F] tabular-nums">
                  {reportMetrics.emptyImages.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-display text-sm font-semibold text-[#202B24]">
                  Species-Wise Observations (Session Records)
                </h4>
                <table className="mt-2.5 w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E8DE] text-[#788078]">
                      <th className="py-2 text-left">Species</th>
                      <th className="py-2 text-right">Observations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFF1E8]">
                    {reportMetrics.speciesRows.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-3 text-[#788078]">
                          No animal observations in selected filter range.
                        </td>
                      </tr>
                    ) : (
                      reportMetrics.speciesRows.map((row) => (
                        <tr key={row.name}>
                          <td className="py-2 font-medium text-[#202B24]">
                            {row.name}
                          </td>
                          <td className="py-2 text-right font-mono tabular-nums text-[#202B24]">
                            {row.count}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-display text-sm font-semibold text-[#202B24]">
                  Camera-Wise Observations
                </h4>
                <table className="mt-2.5 w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E8DE] text-[#788078]">
                      <th className="py-2 text-left">Camera Station</th>
                      <th className="py-2 text-right">Captures</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFF1E8]">
                    {reportMetrics.cameraRows.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-3 text-[#788078]">
                          No camera station records in selected filter range.
                        </td>
                      </tr>
                    ) : (
                      reportMetrics.cameraRows.map((row) => (
                        <tr key={row.cam}>
                          <td className="py-2 font-mono font-medium text-[#202B24]">
                            {row.cam}
                          </td>
                          <td className="py-2 text-right font-mono tabular-nums text-[#202B24]">
                            {row.count}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 border-t border-[#EFF1E8] pt-5">
              <h4 className="font-display text-sm font-semibold text-[#202B24]">
                Verification Summary
              </h4>
              <div className="mt-2.5 flex flex-wrap gap-6 text-xs text-[#4F574F]">
                <span>
                  Confirmed / Verified:{' '}
                  <strong className="font-mono text-[#244B35] tabular-nums">
                    {reportMetrics.verified}
                  </strong>
                </span>
                <span>
                  Researcher Corrected:{' '}
                  <strong className="font-mono text-[#547A50] tabular-nums">
                    {reportMetrics.corrected}
                  </strong>
                </span>
                <span>
                  Pending Review:{' '}
                  <strong className="font-mono text-[#9A6614] tabular-nums">
                    {reportMetrics.pending}
                  </strong>
                </span>
              </div>
              <p className="mt-3 text-[11px] text-[#788078]">
                Note: Observation counts represent individual camera-trap trigger images and do not equate to unique animal population estimates.
              </p>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
