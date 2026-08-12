import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FileText,
  Siren,
  Flame,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Bell,
} from 'lucide-react';
import { Eyebrow, Reveal, RiskBadge, StaggerGroup, StaggerItem } from '@/components/ui/Primitives';
import { weeklyIncidents, type ReportItem } from '@/data/content';
import { computeAreaRisk, computeForecast } from '@/lib/riskEngine';
import { useCountUp } from '@/lib/useCountUp';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function DashboardPage() {
  const [reportsData, setReportsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const { data, error } = await supabase.from('reports').select('*');
      if (error) {
        console.error('Error fetching dashboard reports:', error);
        return;
      }
      if (data) {
        setReportsData(data);
      }
    };
    fetchDashboardStats();
  }, []);

  const totalReports = reportsData.length;
  const verifiedReports = reportsData.filter(
    (r) => r.verified === true || (r.trust_score ?? r.trustScore ?? 50) >= 70
  ).length;

  const distinctAreas = new Set(
    reportsData
      .map((r) => (r.area || '').trim().toLowerCase())
      .filter((a) => a.length > 0)
  ).size;

  const avgTrustScore =
    reportsData.length > 0
      ? Math.round(
          reportsData.reduce(
            (acc, r) => acc + Number(r.trust_score ?? r.trustScore ?? 50),
            0
          ) / reportsData.length
        )
      : 0;

  const areaRisks = computeAreaRisk(reportsData as ReportItem[]);

  const severityCounts = reportsData.reduce(
    (acc, r) => {
      const sev = (r.severity || 'low').toLowerCase();
      if (sev === 'moderate') acc.moderate += 1;
      else if (sev === 'high') acc.high += 1;
      else acc.low += 1;
      return acc;
    },
    { low: 0, moderate: 0, high: 0 },
  );

  const totalSeverityCount = severityCounts.low + severityCounts.moderate + severityCounts.high;
  const lowPercent = totalSeverityCount === 0 ? 0 : Math.round((severityCounts.low / totalSeverityCount) * 100);
  const moderatePercent = totalSeverityCount === 0 ? 0 : Math.round((severityCounts.moderate / totalSeverityCount) * 100);
  const highPercent = totalSeverityCount === 0 ? 0 : 100 - lowPercent - moderatePercent;

  const riskDistributionData = [
    { name: 'Low', value: lowPercent, color: '#22C55E' },
    { name: 'Moderate', value: moderatePercent, color: '#F59E0B' },
    { name: 'High', value: highPercent, color: '#EF4444' },
  ];

  const liveKpis = [
    {
      id: 'total-reports',
      label: 'Total Reports',
      value: totalReports,
      suffix: '',
      icon: FileText,
    },
    {
      id: 'verified-reports',
      label: 'Verified Reports',
      value: verifiedReports,
      suffix: '',
      icon: CheckCircle2,
    },
    {
      id: 'areas-covered',
      label: 'Areas Covered',
      value: distinctAreas,
      suffix: '',
      icon: MapPin,
    },
    {
      id: 'avg-trust-score',
      label: 'Avg Trust Score',
      value: avgTrustScore,
      suffix: '',
      icon: Gauge,
    },
  ];

  return (
    <div className="relative min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-6 pt-8 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Analytics Dashboard</Eyebrow>
            <h1 className="mt-4 text-display-md font-semibold tracking-tight text-ink">
              The city, in <span className="text-gradient-blue">real time</span>.
            </h1>
            <p className="mt-3 max-w-xl text-ink-muted">
              KPIs, predicted hotspots, and a live activity feed — the same surface our analysts use every shift.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-ink-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-success" />
              </span>
              Live · 22:47
            </span>
            <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-muted hover:text-ink">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl space-y-5 px-6 pb-20 md:px-10">
        {/* KPI cards */}
        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {liveKpis.map((k) => {
            const Icon = k.icon;
            return (
              <StaggerItem key={k.id}>
                <KpiCard icon={<Icon className="h-5 w-5 text-primary" />} label={k.label} value={k.value} suffix={k.suffix} />
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* Charts row 1 */}
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1.1fr]">
          {/* Weekly incidents vs predicted */}
          <Reveal>
            <div className="card h-full p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Incidents vs. predictions</h3>
                  <p className="mt-1 text-xs text-ink-faint">Last 7 days · actual vs. 6h forecast</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-ink-muted">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Actual
                  </span>
                  <span className="flex items-center gap-1.5 text-ink-muted">
                    <span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Predicted
                  </span>
                </div>
              </div>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyIncidents} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} width={40} />
                    <Tooltip />
                    <Area type="monotone" dataKey="predicted" stroke="#06B6D4" strokeWidth={2} strokeDasharray="4 4" fill="url(#gPred)" />
                    <Area type="monotone" dataKey="incidents" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gActual)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4">
            {/* Risk distribution donut */}
            <Reveal delay={1}>
              <div className="card h-full p-6">
              <h3 className="text-sm font-semibold text-ink">Risk distribution</h3>
              <p className="mt-1 text-xs text-ink-faint">Based on actual Supabase report severity</p>
              <div className="relative mt-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskDistributionData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} stroke="none">
                      {riskDistributionData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <DonutCenter value={totalSeverityCount} label="Reports" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {riskDistributionData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-ink-muted">{d.name}</span>
                    <span className="ml-auto font-semibold text-ink">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

            {/* Live Risk Score */}
            <Reveal delay={2}>
              <div className="card h-full p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">Live Risk Score</h3>
                    <p className="mt-1 text-xs text-ink-faint">Signal-weighted forecast with reliability and time context</p>
                  </div>
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Live Data
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  {areaRisks.length === 0 ? (
                    <p className="text-xs text-ink-faint">No reports yet to compute activity risk.</p>
                  ) : (
                    areaRisks.map((areaRisk) => {
                      const forecast = computeForecast(areaRisk);
                      const scoreClasses =
                        areaRisk.score < 34
                          ? 'border-success/30 bg-success/10 text-success'
                          : areaRisk.score <= 66
                          ? 'border-warning/30 bg-warning/10 text-warning'
                          : 'border-danger/30 bg-danger/10 text-danger';

                      return (
                        <div key={areaRisk.area} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink">{areaRisk.area}</p>
                              <p className="mt-1 text-[11px] text-ink-faint">{areaRisk.reportCount} report{areaRisk.reportCount !== 1 ? 's' : ''}</p>
                            </div>
                            <span className={cn('rounded-full border px-2 py-1 text-xs font-semibold', scoreClasses)}>
                              {areaRisk.score}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-ink-faint">
                            <span>{areaRisk.breakdown}</span>
                            <span className="text-ink flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              {forecast.forecastScore}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Predicted hotspots */}
        <Reveal>
          <div className="card h-full p-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Flame className="h-4 w-4 text-warning" />
                Predicted hotspots
              </h3>
              <span className="text-xs text-ink-faint">Next 6h</span>
            </div>
            <div className="mt-5 space-y-3">
              {areaRisks.length === 0 ? (
                <p className="text-xs text-ink-faint">No hotspot data available yet.</p>
              ) : (
                areaRisks.map((areaRisk, i) => {
                  const severityLevel = areaRisk.score < 34 ? 'low' : areaRisk.score <= 66 ? 'moderate' : 'high';
                  const badgeColor =
                    severityLevel === 'high'
                      ? 'bg-danger/10 text-danger'
                      : severityLevel === 'moderate'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-success/10 text-success';

                  return (
                    <motion.div
                      key={areaRisk.area}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                    >
                      <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg', badgeColor)}>
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{areaRisk.area}</p>
                        <p className="mt-0.5 text-xs text-ink-faint">{areaRisk.breakdown}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink">{areaRisk.score}</p>
                        <RiskBadge level={severityLevel}>{severityLevel}</RiskBadge>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  suffix = '',
  delta,
  up = true,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  up?: boolean;
}) {
  const { ref, display } = useCountUp(value, 1600, suffix === '%' ? 1 : 0);
  return (
    <div ref={ref} className="card spotlight glow-ring p-5" onMouseMove={spotlightMove}>
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">{icon}</div>
        {delta !== undefined ? (
          <span className={cn('flex items-center gap-1 text-xs font-semibold', up ? 'text-success' : 'text-warning')}>
            {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {delta > 0 ? '+' : ''}
            {delta}
            {suffix === '%' ? '%' : ''}
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Live Data
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-ink tnum">
        {display}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-ink-muted">{label}</p>
    </div>
  );
}

function DonutCenter({ value, label }: { value: number; label: string }) {
  const { display } = useCountUp(value, 1400, 0);
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-2xl font-semibold text-ink tnum">{display}</span>
      <span className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</span>
    </div>
  );
}

function spotlightMove(e: MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
}
