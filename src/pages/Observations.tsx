import { useEffect, useMemo, useState } from 'react';
import { Binoculars, Info, LayoutGrid, List, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useResearch } from '../context/ResearchContext';
import { ObservationTable } from '../components/ObservationTable';
import { WildlifeCard } from '../components/WildlifeCard';
import { ObservationDetailModal } from '../components/ObservationDetailModal';
import { EmptyState } from '../components/EmptyState';
import { VerificationStatus, WildlifeRecord } from '../types';

export function Observations() {
  const [searchParams] = useSearchParams();
  const { records, projects } = useResearch();

  const [speciesQuery, setSpeciesQuery] = useState(searchParams.get('q') || '');
  const [projectFilter, setProjectFilter] = useState(
    searchParams.get('project') || 'all'
  );
  const [cameraFilter, setCameraFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>(
    'all'
  );
  const [dateFilter, setDateFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [selectedRecord, setSelectedRecord] = useState<WildlifeRecord | null>(
    null
  );

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSpeciesQuery(q);
    const proj = searchParams.get('project');
    if (proj) setProjectFilter(proj);
  }, [searchParams]);

  const allCameras = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.cameras.forEach((c) => set.add(c)));
    records.forEach((r) => set.add(r.cameraId));
    return Array.from(set).sort();
  }, [projects, records]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const displaySpecies = (
        rec.confirmedSpecies || rec.predictedSpecies
      ).toLowerCase();
      const q = speciesQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        displaySpecies.includes(q) ||
        rec.cameraId.toLowerCase().includes(q) ||
        rec.filename.toLowerCase().includes(q);

      const matchesProject =
        projectFilter === 'all' || rec.projectId === projectFilter;
      const matchesCamera =
        cameraFilter === 'all' || rec.cameraId === cameraFilter;
      const matchesStatus =
        statusFilter === 'all' || rec.verificationStatus === statusFilter;
      const matchesDate =
        !dateFilter || rec.capturedAt.startsWith(dateFilter);

      return (
        matchesSearch &&
        matchesProject &&
        matchesCamera &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    records,
    speciesQuery,
    projectFilter,
    cameraFilter,
    statusFilter,
    dateFilter,
  ]);

  const resetFilters = () => {
    setSpeciesQuery('');
    setProjectFilter('all');
    setCameraFilter('all');
    setStatusFilter('all');
    setDateFilter('');
  };

  return (
    <DashboardLayout pageTitle="Wildlife Observations">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#202B24]">
              Wildlife Observations
            </h2>
            <p className="mt-1 text-sm text-[#788078]">
              Search and inspect camera-trap photographic observations across projects and camera stations.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-[#EAECE2] p-1 w-fit">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-[#202B24] shadow-sm'
                  : 'text-[#4F574F]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-[#202B24] shadow-sm'
                  : 'text-[#4F574F]'
              }`}
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Table</span>
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-[#E2E5DA] bg-white px-4 py-3 text-xs text-[#4F574F]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#547A50]" aria-hidden="true" />
          <p>
            Each entry corresponds to a single camera-trap photograph observation, not a unique individual animal population count.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E2E5DA] bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#788078]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={speciesQuery}
              onChange={(e) => setSpeciesQuery(e.target.value)}
              placeholder="Search by species..."
              aria-label="Search by species"
              className="w-full rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] py-2 pr-3 pl-9 text-xs text-[#202B24] focus:border-[#244B35] focus:bg-white focus:outline-none"
            />
          </div>

          <select
            aria-label="Filter by project"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3 py-2 text-xs text-[#202B24] focus:border-[#244B35] focus:outline-none"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by camera"
            value={cameraFilter}
            onChange={(e) => setCameraFilter(e.target.value)}
            className="rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3 py-2 font-mono text-xs text-[#202B24] focus:border-[#244B35] focus:outline-none"
          >
            <option value="all">All Cameras</option>
            {allCameras.map((cam) => (
              <option key={cam} value={cam}>
                {cam}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by verification status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | VerificationStatus)
            }
            className="rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3 py-2 text-xs text-[#202B24] focus:border-[#244B35] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Corrected">Corrected</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Unidentifiable">Unidentifiable</option>
            <option value="Empty Frame">Empty Frame</option>
          </select>

          <input
            type="date"
            aria-label="Filter by observation date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3 py-2 text-xs text-[#202B24] focus:border-[#244B35] focus:outline-none"
          />
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState
            icon={Binoculars}
            title="No wildlife observations match your filters"
            description="Clear one or more filters to view all recorded camera-trap observations."
            actionLabel="Reset Filters"
            onAction={resetFilters}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((rec) => (
              <WildlifeCard
                key={rec.id}
                record={rec}
                projectName={
                  projects.find((p) => p.id === rec.projectId)?.name
                }
                onViewDetails={setSelectedRecord}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#E2E5DA] bg-white p-5">
            <ObservationTable
              records={filteredRecords}
              onViewRecord={setSelectedRecord}
            />
          </div>
        )}
      </div>

      <ObservationDetailModal
        record={selectedRecord}
        projects={projects}
        onClose={() => setSelectedRecord(null)}
      />
    </DashboardLayout>
  );
}
