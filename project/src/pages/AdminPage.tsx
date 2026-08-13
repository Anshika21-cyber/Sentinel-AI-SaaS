import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, RefreshCw, BadgeCheck, Ban, Clock, MapPin } from 'lucide-react';
import { Eyebrow, RiskBadge, Card } from '@/components/ui/Primitives';
import { useAuth } from '@/hooks/useAuth';
import { supabase, updateReportVerificationStatus, type VerificationStatus } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface AdminReport {
  id: string;
  title: string;
  area: string;
  category: string;
  severity: string;
  reporter: string;
  trust_score: number;
  verification_status: VerificationStatus;
  created_at: string;
}

const STATUSES: VerificationStatus[] = ['pending', 'verified', 'rejected'];
const FILTERS = ['All', ...STATUSES];

const statusLabel: Record<VerificationStatus, string> = {
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
};

const statusStyles: Record<VerificationStatus, string> = {
  pending: 'border-warning/40 bg-warning/10 text-warning',
  verified: 'border-success/40 bg-success/10 text-success',
  rejected: 'border-danger/40 bg-danger/10 text-danger',
};

const statusIcons: Record<VerificationStatus, typeof Clock> = {
  pending: Clock,
  verified: BadgeCheck,
  rejected: Ban,
};

export function AdminPage() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = profile?.role === 'admin';

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_reports')
      .select('id, title, area, category, severity, reporter, trust_score, verification_status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setNotice({ kind: 'error', text: `Failed to load reports: ${error.message}` });
    } else {
      setReports((data ?? []) as AdminReport[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchReports();
  }, [isAdmin]);

  const setStatus = async (report: AdminReport, status: VerificationStatus) => {
    if (!isAdmin) return;
    if (status === report.verification_status) return;

    setSavingId(report.id);
    setNotice(null);
    const { error } = await updateReportVerificationStatus(report.id, status);

    if (error) {
      setNotice({ kind: 'error', text: `Failed to update ${report.title || 'report'}: ${error.message}` });
    } else {
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, verification_status: status } : r)),
      );
      setNotice({ kind: 'success', text: `${report.title || 'Report'} marked ${statusLabel[status]}.` });
    }
    setSavingId(null);
  };

  const filtered = filter === 'All' ? reports : reports.filter((r) => r.verification_status === filter);

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen pt-24">
        <div className="mx-auto max-w-xl px-6 pt-16 md:px-10">
          <Card hover={false} className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-warning/15">
              <Lock className="h-6 w-6 text-warning" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Admins only</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
              Verification is managed by community moderators. If you think this is a mistake, contact an administrator.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-6 pt-8 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Moderation</Eyebrow>
            <h1 className="mt-4 text-display-md font-semibold tracking-tight text-ink">
              Report <span className="text-gradient-blue">verification</span>
            </h1>
            <p className="mt-3 max-w-xl text-ink-muted">
              Review community reports and set their verification status. Only the status column changes — trust scores and other fields are locked.
            </p>
          </div>
          <button onClick={fetchReports} className="btn-primary shrink-0">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {notice && (
          <div
            className={cn(
              'mt-6 rounded-2xl border px-4 py-3 text-sm',
              notice.kind === 'success'
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-danger/30 bg-danger/10 text-danger',
            )}
          >
            {notice.text}
          </div>
        )}

        {/* Status filter */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                filter === f
                  ? 'border-primary/40 bg-primary/10 text-ink'
                  : 'border-white/10 bg-white/5 text-ink-muted hover:text-ink',
              )}
            >
              {f}
              {f !== 'All' && (
                <span className="ml-1.5 text-ink-faint">{reports.filter((r) => r.verification_status === f).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Report list */}
        <div className="mt-6 space-y-4 pb-20">
          {loading ? (
            <p className="py-10 text-center text-sm text-ink-faint">Loading reports…</p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-faint">No reports match this filter.</p>
          ) : (
            filtered.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
              >
                <div className="rounded-2xl border border-white/5 glass-card p-5 transition-colors hover:border-white/10">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="chip">{r.category}</span>
                        <RiskBadge level={r.severity}>{r.severity}</RiskBadge>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                            statusStyles[r.verification_status],
                          )}
                        >
                          {statusLabel[r.verification_status]}
                        </span>
                      </div>
                      <h3 className="mt-2 truncate text-[15px] font-semibold leading-snug text-ink">
                        {r.title || 'Untitled report'}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {r.area || 'Unknown area'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5" /> Trust {r.trust_score}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {r.created_at
                            ? new Date(r.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                            : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {STATUSES.map((status) => {
                        const Icon = statusIcons[status];
                        const isActive = r.verification_status === status;
                        const isSaving = savingId === r.id;
                        return (
                          <button
                            key={status}
                            onClick={() => setStatus(r, status)}
                            disabled={isActive || isSaving || savingId !== null}
                            className={cn(
                              'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all',
                              isActive
                                ? statusStyles[status]
                                : 'border-white/10 bg-white/5 text-ink-muted hover:text-ink',
                              isSaving && 'opacity-60',
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {statusLabel[status]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
