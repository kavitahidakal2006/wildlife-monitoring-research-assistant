import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Edit3,
  EyeOff,
  FileText,
  Images,
  PawPrint,
  ScanSearch,
  Upload,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useResearch } from '../context/ResearchContext';
import {
  DASHBOARD_DEMO_TOTALS,
  SPECIES_DISTRIBUTION_DEMO,
  TREND_DATA_DAILY,
  TREND_DATA_MONTHLY,
  TREND_DATA_WEEKLY,
} from '../data/mockData';
import { StatCard } from '../components/StatCard';
import { ObservationTable } from '../components/ObservationTable';
import { ObservationDetailModal } from '../components/ObservationDetailModal';
import { WildlifeRecord } from '../types';

export function Dashboard() {
  const { projects, records, activities } = useResearch();
  const navigate = useNavigate();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [trendGranularity, setTrendGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeRecord, setActiveRecord] = useState<WildlifeRecord | null>(null);

  const projectFactor = useMemo(() => {
    if (selectedProjectId === 'all') return 1;
    const index = projects.findIndex((p) => p.id === selectedProjectId);
    if (index === 0) return 0.51;
    if (index === 1) return 0.32;
    return 0.17;
  }, [selectedProjectId, projects]);

  const dateFactor = dateRange === '7d' ? 0.28 : dateRange === '30d' ? 0.68 : 1;

  const extraLiveCount = records.filter((r) => !r.isDemoData).length;
  const extraLiveAnimals = records.filter(
    (r) => !r.isDemoData && r.detectionStatus === 'animal_detected'
  ).length;
  const extraLiveEmpty = records.filter(
    (r) => !r.isDemoData && r.detectionStatus === 'empty_frame'
  ).length;
  const pendingReviewDelta =
    records.filter((r) => r.verificationStatus === 'Needs Review').length - 4;

  const kpiStats = useMemo(() => {
    const scale =
      selectedProjectId === 'all' && dateRange === 'all'
        ? 1
        : projectFactor * dateFactor;

    return {
      totalAnalysed:
        Math.round(DASHBOARD_DEMO_TOTALS.totalAnalysed * scale) + extraLiveCount,
      animalsDetected:
        Math.round(DASHBOARD_DEMO_TOTALS.animalsDetected * scale) + extraLiveAnimals,
      emptyImages:
        Math.round(DASHBOARD_DEMO_TOTALS.emptyImages * scale) + extraLiveEmpty,
      pendingVerification: Math.max(
        0,
        Math.round(DASHBOARD_DEMO_TOTALS.pendingVerification * scale) +
          pendingReviewDelta
      ),
    };
  }, [
    selectedProjectId,
    dateRange,
    projectFactor,
    dateFactor,
    extraLiveCount,
    extraLiveAnimals,
    extraLiveEmpty,
    pendingReviewDelta,
  ]);

  const trendSeries = useMemo(() => {
    const base =
      trendGranularity === 'daily'
        ? TREND_DATA_DAILY
        : trendGranularity === 'weekly'
          ? TREND_DATA_WEEKLY
          : TREND_DATA_MONTHLY;
    return base.map((item) => ({
      ...item,
      observations: Math.max(2, Math.round(item.observations * projectFactor)),
      verified: Math.max(1, Math.round(item.verified * projectFactor)),
    }));
  }, [trendGranularity, projectFactor]);

  const recentRecords = useMemo(() => {
    const filtered =
      selectedProjectId === 'all'
        ? records
        : records.filter((r) => r.projectId === selectedProjectId);
    return filtered.slice(0, 6);
  }, [records, selectedProjectId]);

  const workflowSteps = [
    { label: 'Upload', to: '/upload' },
    { label: 'Detect', to: '/analysis' },
    { label: 'Identify', to: '/analysis' },
    { label: 'Verify', to: '/review' },
    { label: 'Analyse', to: '/analytics' },
    { label: 'Report', to: '/reports' },
  ];

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-6">
        <section className="flex flex-col justify-between gap-4 rounded-xl border border-[#E2E5DA] bg-white p-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#202B24]">
              Good morning, Researcher!
            </h2>
            <p className="mt-1 text-sm text-[#788078]">
              Here&apos;s an overview of your wildlife monitoring activities.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-[#788078]">
              <span className="font-medium text-[#244B35]">Workflow:</span>
              {workflowSteps.map((step, idx) => (
                <span key={step.label} className="inline-flex items-center gap-1.5">
                  <Link
                    to={step.to}
                    className="font-medium text-[#4F574F] underline-offset-2 hover:text-[#244B35] hover:underline"
                  >
                    {step.label}
                  </Link>
                  {idx < workflowSteps.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-[#A6B77A]" aria-hidden="true" />
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Filter by monitoring project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3 py-2 text-xs font-medium text-[#202B24] focus:border-[#244B35] focus:outline-none"
            >
              <option value="all">All Monitoring Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by date range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | 'all')}
              className="rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3 py-2 text-xs font-medium text-[#202B24] focus:border-[#244B35] focus:outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time (Demo Baseline)</option>
            </select>

            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#244B35] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1C3B2A] whitespace-nowrap shrink-0"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>Upload Images</span>
            </button>
          </div>
        </section>

        <section aria-label="Key monitoring metrics">
          <div className="mb-2.5 flex items-center justify-between text-xs text-[#788078]">
            <span>Summary Metrics</span>
            <span>Illustrative demonstration data · Baseline 2,450 frames</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Images Analysed"
              value={kpiStats.totalAnalysed}
              helper="Demo baseline + live analysed captures"
              icon={Images}
              tone="forest"
            />
            <StatCard
              label="Animals Detected"
              value={kpiStats.animalsDetected}
              helper="Frames containing wildlife observations"
              icon={PawPrint}
              tone="olive"
            />
            <StatCard
              label="Empty Images"
              value={kpiStats.emptyImages}
              helper="Wind, foliage, or shadow false triggers"
              icon={EyeOff}
              tone="default"
            />
            <StatCard
              label="Pending Verification"
              value={kpiStats.pendingVerification}
              helper="Queued for human researcher confirmation"
              icon={AlertCircle}
              tone="warning"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-[#E2E5DA] bg-white p-5 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-semibold text-[#202B24]">
                  Wildlife Observation Trends
                </h3>
                <p className="text-xs text-[#788078]">
                  Recorded animal observations vs. verified entries (Sample Data)
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-[#F5F6EF] p-1">
                {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setTrendGranularity(period)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                      trendGranularity === period
                        ? 'bg-white text-[#202B24] shadow-sm'
                        : 'text-[#788078] hover:text-[#202B24]'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendSeries}
                  margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                >
                  <CartesianGrid stroke="#EFF1E8" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#788078', fontSize: 12 }}
                    axisLine={{ stroke: '#E2E5DA' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#788078', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E5DA',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="observations"
                    name="Observations"
                    stroke="#244B35"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#244B35' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="verified"
                    name="Verified"
                    stroke="#A6B77A"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#A6B77A' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E5DA] bg-white p-5 lg:col-span-5">
            <div>
              <h3 className="font-display text-base font-semibold text-[#202B24]">
                Species Distribution
              </h3>
              <p className="text-xs text-[#788078]">
                Proportion of sample observations by species
              </p>
            </div>

            <div className="mt-2 grid grid-cols-1 items-center gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SPECIES_DISTRIBUTION_DEMO}
                      dataKey="count"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={2}
                    >
                      {SPECIES_DISTRIBUTION_DEMO.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E5DA',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="space-y-2 text-xs">
                {SPECIES_DISTRIBUTION_DEMO.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-2 text-[#202B24] truncate">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="font-mono font-medium text-[#4F574F] tabular-nums">
                      {item.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="rounded-xl border border-[#E2E5DA] bg-white p-5 xl:col-span-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-semibold text-[#202B24]">
                  Recent Observations
                </h3>
                <p className="text-xs text-[#788078]">
                  Latest camera-trap captures (sample &amp; live session records)
                </p>
              </div>
              <Link
                to="/observations"
                className="text-xs font-semibold text-[#244B35] hover:underline whitespace-nowrap"
              >
                View all observations
              </Link>
            </div>

            <ObservationTable
              records={recentRecords}
              onViewRecord={setActiveRecord}
              compact
            />
          </div>

          <div className="rounded-xl border border-[#E2E5DA] bg-white p-5 xl:col-span-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-[#202B24]">
                Recent Activity
              </h3>
              <span className="text-xs text-[#788078]">Workspace Log</span>
            </div>

            <ul className="divide-y divide-[#EFF1E8]">
              {activities.slice(0, 6).map((act) => {
                const Icon =
                  act.type === 'upload'
                    ? Camera
                    : act.type === 'analysis'
                      ? ScanSearch
                      : act.type === 'correction'
                        ? Edit3
                        : act.type === 'report'
                          ? FileText
                          : CheckCircle2;
                return (
                  <li key={act.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F6EF] text-[#244B35]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#202B24]">
                        {act.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#788078]">{act.detail}</p>
                      <p className="mt-1 text-[11px] text-[#9AA39A]">{act.timestamp}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>

      <ObservationDetailModal
        record={activeRecord}
        projects={projects}
        onClose={() => setActiveRecord(null)}
      />
    </DashboardLayout>
  );
}
