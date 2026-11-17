import { useMemo, useState } from 'react';
import {
  Calendar,
  Camera,
  FolderKanban,
  Images,
  MapPin,
  PawPrint,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useResearch } from '../context/ResearchContext';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { EmptyState } from '../components/EmptyState';
import { MonitoringProject, ProjectStatus } from '../types';

interface ProjectsProps {
  openCreateOnMount?: boolean;
}

export function Projects({ openCreateOnMount = false }: ProjectsProps) {
  const { projects, records } = useResearch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ProjectStatus>('All');
  const [createOpen, setCreateOpen] = useState(openCreateOnMount);
  const [selectedProject, setSelectedProject] = useState<MonitoringProject | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const matchesStatus =
        statusFilter === 'All' || proj.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        proj.name.toLowerCase().includes(q) ||
        proj.location.toLowerCase().includes(q) ||
        proj.description.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [projects, searchQuery, statusFilter]);

  return (
    <DashboardLayout pageTitle="Monitoring Projects">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#202B24]">
              Monitoring Projects
            </h2>
            <p className="mt-1 text-sm text-[#788078]">
              Organise your wildlife monitoring activities in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#244B35] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1C3B2A] whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Create New Project</span>
          </button>
        </div>

        <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#E2E5DA] bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#788078]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects or reserve regions..."
              className="w-full rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] py-2 pr-3 pl-9 text-xs text-[#202B24] placeholder:text-[#788078] focus:border-[#244B35] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-[#F5F6EF] p-1">
            {(['All', 'Active', 'Paused', 'Completed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-white text-[#202B24] shadow-sm'
                    : 'text-[#788078] hover:text-[#202B24]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No monitoring projects found"
            description="Adjust your search filter or create a new wildlife monitoring project to start organising camera-trap grids."
            actionLabel="Create New Project"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="flex flex-col justify-between rounded-xl border border-[#E2E5DA] bg-white p-5 transition-colors hover:border-[#C2C9B8]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base font-semibold text-[#202B24]">
                      {project.name}
                    </h3>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium shrink-0 ${
                        project.status === 'Active'
                          ? 'bg-[#244B35]/10 text-[#244B35]'
                          : project.status === 'Paused'
                            ? 'bg-[#D99A3B]/15 text-[#9A6614]'
                            : 'bg-[#788078]/12 text-[#4F574F]'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-[#547A50]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{project.location}</span>
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-[#788078]">
                    {project.description}
                  </p>
                </div>

                <div className="mt-5 space-y-4 border-t border-[#EFF1E8] pt-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-[#FAFBF7] p-2">
                      <Camera className="mx-auto h-3.5 w-3.5 text-[#547A50]" aria-hidden="true" />
                      <p className="mt-1 font-mono text-sm font-semibold text-[#202B24] tabular-nums">
                        {project.cameras.length}
                      </p>
                      <p className="text-[11px] text-[#788078]">Cameras</p>
                    </div>
                    <div className="rounded-lg bg-[#FAFBF7] p-2">
                      <Images className="mx-auto h-3.5 w-3.5 text-[#547A50]" aria-hidden="true" />
                      <p className="mt-1 font-mono text-sm font-semibold text-[#202B24] tabular-nums">
                        {project.uploadedImages.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-[#788078]">Images</p>
                    </div>
                    <div className="rounded-lg bg-[#FAFBF7] p-2">
                      <PawPrint className="mx-auto h-3.5 w-3.5 text-[#547A50]" aria-hidden="true" />
                      <p className="mt-1 font-mono text-sm font-semibold text-[#202B24] tabular-nums">
                        {project.observationsCount.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-[#788078]">Observations</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#788078] tabular-nums">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Created {project.createdAt}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="rounded-lg border border-[#D8DDD0] bg-white px-3 py-1.5 text-xs font-semibold text-[#244B35] transition-colors hover:bg-[#244B35] hover:text-white"
                    >
                      View Project
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#202B24]/50 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-xl border border-[#E2E5DA] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#EFF1E8] pb-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#202B24]">
                  {selectedProject.name}
                </h3>
                <p className="mt-0.5 text-xs text-[#547A50]">
                  {selectedProject.location} · Created {selectedProject.createdAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="rounded-lg p-1.5 text-[#788078] hover:bg-[#F5F6EF]"
                aria-label="Close project details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#4F574F]">
              {selectedProject.description}
            </p>

            <div className="mt-4">
              <p className="text-xs font-semibold text-[#202B24]">
                Registered Camera Units ({selectedProject.cameras.length})
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedProject.cameras.map((cam) => (
                  <span
                    key={cam}
                    className="rounded-md border border-[#E2E5DA] bg-[#FAFBF7] px-2.5 py-1 font-mono text-xs text-[#202B24]"
                  >
                    {cam}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-[#FAFBF7] p-3 text-xs text-[#788078]">
              Recent session records in workspace:{' '}
              <span className="font-semibold text-[#202B24] tabular-nums">
                {records.filter((r) => r.projectId === selectedProject.id).length}
              </span>{' '}
              captures available for review.
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const id = selectedProject.id;
                  setSelectedProject(null);
                  navigate(`/upload?project=${id}`);
                }}
                className="rounded-lg border border-[#D8DDD0] bg-white px-4 py-2 text-xs font-semibold text-[#202B24] hover:bg-[#F5F6EF]"
              >
                Upload Images to Project
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = selectedProject.id;
                  setSelectedProject(null);
                  navigate(`/observations?project=${id}`);
                }}
                className="rounded-lg bg-[#244B35] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1C3B2A]"
              >
                View Project Observations
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
