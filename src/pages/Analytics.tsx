import { useMemo, useState } from 'react';
import { Award, Binoculars, Info, Layers } from 'lucide-react';
import {
  Bar,
  BarChart,
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
  CAMERA_OBSERVATION_BAR_DEMO,
  SPECIES_ANALYTICS_SUMMARY_DEMO,
  SPECIES_DISTRIBUTION_DEMO,
  SUPPORTED_SPECIES,
  TREND_DATA_WEEKLY,
} from '../data/mockData';
import { StatCard } from '../components/StatCard';

export function Analytics() {
  const { projects } = useResearch();

  const [projectFilter, setProjectFilter] = useState('all');
  const [dateRange, setDateRange] = useState<'30d' | '90d' | 'all'>('90d');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  const scaleFactor = useMemo(() => {
    let f = projectFilter === 'all' ? 1 : projectFilter === 'proj-kabini' ? 0.55 : 0.35;
    if (dateRange === '30d') f *= 0.48;
    return f;
  }, [projectFilter, dateRange]);

  const filteredSpeciesSummary = useMemo(() => {
    return SPECIES_ANALYTICS_SUMMARY_DEMO.filter(
      (row) => speciesFilter === 'all' || row.species === speciesFilter
    ).map((row) => ({
      ...row,
      observations: Math.max(1, Math.round(row.observations * scaleFactor)),
    }));
  }, [speciesFilter, scaleFactor]);

  const totalAnimalObservations = useMemo(
    () => filteredSpeciesSummary.reduce((sum, r) => sum + r.observations, 0),
    [filteredSpeciesSummary]
  );

  const topSpecies = filteredSpeciesSummary[0]?.species || 'Spotted Deer';

  const cameraBars = useMemo(() => {
    return CAMERA_OBSERVATION_BAR_DEMO.map((c) => ({
      ...c,
      observations: Math.max(4, Math.round(c.observations * scaleFactor)),
    }));
  }, [scaleFactor]);

  const trendSeries = useMemo(() => {
    return TREND_DATA_WEEKLY.map((t) => ({
      ...t,
      observations: Math.max(5, Math.round(t.observations * scaleFactor)),
    }));
  }, [scaleFactor]);

  return (
    <DashboardLayout pageTitle="Species Analytics">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#202B24]">
              Species Analytics
            </h2>
            <p className="mt-1 text-sm text-[#788078]">
              Explore wildlife observations and monitoring patterns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Filter analytics by project"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="rounded-lg border border-[#D8DDD0] bg-white px-3 py-2 text-xs font-medium text-[#202B24] focus:border-[#244B35] focus:outline-none"
            >
              <option value="all">All Monitoring Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter analytics by date range"
              value={dateRange}
              onChange={(e) =>
                setDateRange(e.target.value as '30d' | '90d' | 'all')
              }
              className="rounded-lg border border-[#D8DDD0] bg-white px-3 py-2 text-xs font-medium text-[#202B24] focus:border-[#244B35] focus:outline-none"
            >
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">Full Study Period</option>
            </select>

            <select
              aria-label="Filter analytics by species"
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="rounded-lg border border-[#D8DDD0] bg-white px-3 py-2 text-xs font-medium text-[#202B24] focus:border-[#244B35] focus:outline-none"
            >
              <option value="all">All Supported Species</option>
              {SUPPORTED_SPECIES.map((sp) => (
                <option key={sp.name} value={sp.name}>
                  {sp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-[#E2E5DA] bg-white px-4 py-3 text-xs text-[#4F574F]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#547A50]" aria-hidden="true" />
          <p>
            Analytics are based on recorded image observations. Multiple photographs may represent the same animal. Metrics below reflect illustrative demonstration data.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Total Species Observed"
            value={filteredSpeciesSummary.length}
            helper="Supported wildlife taxa recorded in dataset"
            icon={Layers}
            tone="forest"
          />
          <StatCard
            label="Total Animal Observations"
            value={totalAnimalObservations}
            helper="Image-level detection events (Demo Data)"
            icon={Binoculars}
            tone="olive"
          />
          <StatCard
            label="Most Frequently Observed Species"
            value={topSpecies}
            helper="Highest camera-trap encounter frequency"
            icon={Award}
            tone="warning"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-[#E2E5DA] bg-white p-5 lg:col-span-5">
            <h3 className="font-display text-base font-semibold text-[#202B24]">
              Species Distribution
            </h3>
            <p className="text-xs text-[#788078]">
              Share of sample photographic observations
            </p>
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SPECIES_DISTRIBUTION_DEMO}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={88}
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
          </div>

          <div className="rounded-xl border border-[#E2E5DA] bg-white p-5 lg:col-span-7">
            <h3 className="font-display text-base font-semibold text-[#202B24]">
              Observation Trends
            </h3>
            <p className="text-xs text-[#788078]">
              Weekly observation activity across active transects (Sample Data)
            </p>
            <div className="mt-4 h-64 w-full">
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
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-[#E2E5DA] bg-white p-5 lg:col-span-5">
            <h3 className="font-display text-base font-semibold text-[#202B24]">
              Camera-Wise Observations
            </h3>
            <p className="text-xs text-[#788078]">
              Total wildlife triggers per camera station (Sample Data)
            </p>
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cameraBars}
                  margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                >
                  <CartesianGrid stroke="#EFF1E8" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="camera"
                    tick={{ fill: '#4F574F', fontSize: 11 }}
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
                  <Bar
                    dataKey="observations"
                    name="Observations"
                    fill="#547A50"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E5DA] bg-white p-5 lg:col-span-7">
            <h3 className="font-display text-base font-semibold text-[#202B24]">
              Species-Wise Summary Table
            </h3>
            <p className="text-xs text-[#788078]">
              Supported species observation breakdown (Sample Data)
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E8DE] font-semibold text-[#788078]">
                    <th className="py-2.5 pr-3">Species</th>
                    <th className="px-3 py-2.5 text-right">Observations</th>
                    <th className="px-3 py-2.5 text-right">Avg Confidence</th>
                    <th className="px-3 py-2.5 text-right">Verified %</th>
                    <th className="py-2.5 pl-3 text-right">Peak Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFF1E8]">
                  {filteredSpeciesSummary.map((row) => (
                    <tr key={row.species} className="hover:bg-[#FAFBF7]">
                      <td className="py-2.5 pr-3">
                        <p className="font-semibold text-[#202B24]">
                          {row.species}
                        </p>
                        <p className="italic text-[#788078]">
                          {row.scientificName}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-medium text-[#202B24] tabular-nums">
                        {row.observations}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-[#4F574F] tabular-nums">
                        {row.avgConfidence}%
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-[#244B35] tabular-nums">
                        {row.verifiedPct}%
                      </td>
                      <td className="py-2.5 pl-3 text-right font-mono text-[#788078] tabular-nums">
                        {row.peakWindow}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
