import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  BadgeCheck,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Flame,
  Filter,
  ImagePlus,
  X,
  ThumbsUp,
  MapPin,
  Clock,
  Activity,
} from 'lucide-react';
import { Eyebrow, RiskBadge, Card } from '@/components/ui/Primitives';
import { type ReportItem, type RiskLevel } from '@/data/content';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { groupReportsByArea } from '@/lib/riskEngine';

const categories = ['All', 'Theft', 'Harassment', 'Nuisance', 'Lighting', 'Traffic', 'Suspicious'] as const;

interface TrendingArea {
  area: string;
  severity: RiskLevel;
  trend: 'up' | 'down';
  change: string;
  recentCount: number;
}

export function CommunityPage() {
  const [filter, setFilter] = useState('All');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [trendingAreas, setTrendingAreas] = useState<TrendingArea[]>([]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return;
    }

    if (data) {
      type ReportWithDate = ReportItem & { createdAt: Date };

      const rawReports = data.map((item: any): ReportWithDate => {
        const trustScore = item.trust_score ?? item.trustScore ?? 50;
        const verified = typeof item.verified === 'boolean' ? item.verified : trustScore >= 70;
        const createdAt = item.created_at ? new Date(item.created_at) : new Date();

        return {
          id: item.id ? String(item.id) : Math.random().toString(),
          title: item.title || '',
          area: item.area || '',
          category: item.category || 'Theft',
          severity: item.severity || 'low',
          trustScore: Number(trustScore),
          reporter: item.reporter || 'Community Member',
          time: createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          verified,
          endorsements: item.endorsements ?? 0,
          photo: item.photo_url || item.photo || 'https://images.pexels.com/photos/2168974/pexels-photo-2168974.jpeg?auto=compress&cs=tinysrgb&w=900',
          description: item.description || item.title || '',
          createdAt,
        };
      });

      const buildTrendingAreas = () => {
        const now = Date.now();
        const recent24h = new Date(now - 24 * 60 * 60 * 1000);
        const previous24h = new Date(now - 48 * 60 * 60 * 1000);

        const areaSummaries = groupReportsByArea(rawReports);
        const areaCounts: Record<string, { recent: number; previous: number }> = {};

        rawReports.forEach((report) => {
          const areaName = report.area?.trim() || 'Unknown Area';
          if (!areaCounts[areaName]) {
            areaCounts[areaName] = { recent: 0, previous: 0 };
          }

          if (report.createdAt >= recent24h) {
            areaCounts[areaName].recent += 1;
          } else if (report.createdAt >= previous24h) {
            areaCounts[areaName].previous += 1;
          }
        });

        return Object.entries(areaSummaries)
          .map(([area, summary]) => {
            const counts = areaCounts[area] || { recent: 0, previous: 0 };
            if (counts.recent === 0) {
              return null;
            }

            const percentChange = counts.previous === 0
              ? null
              : Math.round(((counts.recent - counts.previous) / counts.previous) * 100);
            const change = counts.previous === 0
              ? 'new'
              : `${percentChange! >= 0 ? '+' : ''}${percentChange}%`;
            const trend: 'up' | 'down' = counts.previous === 0 || counts.recent >= counts.previous ? 'up' : 'down';

            return {
              area,
              severity: summary.severity,
              trend,
              change,
              recentCount: counts.recent,
            };
          })
          .filter((item): item is TrendingArea => item !== null)
          .sort((a, b) => b.recentCount - a.recentCount || a.area.localeCompare(b.area))
          .slice(0, 5);
      };

      setTrendingAreas(buildTrendingAreas());

      const mapped: ReportItem[] = rawReports.map(({ createdAt, ...r }, _, arr) => {
        const otherCount = arr.filter(
          (other) => other.id !== r.id && (other.area || '').trim().toLowerCase() === (r.area || '').trim().toLowerCase()
        ).length;

        let explanation = 'New report — awaiting cross-validation';
        if (otherCount > 0) {
          explanation = `Cross-validated with ${otherCount} other report${otherCount > 1 ? 's' : ''} in this area`;
        }

        return {
          ...r,
          explanation,
        };
      });

      setReportsList(mapped);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = filter === 'All' ? reportsList : reportsList.filter((r) => r.category === filter);

  return (
    <div className="relative min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-6 pt-8 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Community Reports</Eyebrow>
            <h1 className="mt-4 text-display-md font-semibold tracking-tight text-ink">
              Reports weighted by <span className="text-gradient-blue">reputation</span>, not volume.
            </h1>
            <p className="mt-3 max-w-xl text-ink-muted">
              One trusted local outweighs a hundred anonymous flags. Every report carries a verifiable trust score.
            </p>
          </div>
          <button onClick={() => setUploadOpen(true)} className="btn-primary shrink-0">
            <Upload className="h-4 w-4" />
            Upload report
          </button>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-7xl gap-8 px-6 pb-20 md:px-10 lg:grid-cols-[1fr_320px]">
        {/* Reports feed */}
        <div>
          {/* Filter chips */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 shrink-0 text-ink-faint" />
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={cn(
                  'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                  filter === c
                    ? 'border-primary/40 bg-primary/10 text-ink'
                    : 'border-white/10 bg-white/5 text-ink-muted hover:text-ink',
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Report cards */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((r, i) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <ReportCard report={r} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Trending areas */}
          <Card hover={false}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Flame className="h-4 w-4 text-warning" />
              Trending areas
            </h3>
            <div className="mt-4 space-y-3">
              {trendingAreas.map((a) => (
                <div key={a.area} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-ink">{a.area}</p>
                    <RiskBadge level={a.severity}>{a.severity}</RiskBadge>
                  </div>
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs font-semibold',
                      a.trend === 'up' ? 'text-danger' : 'text-success',
                    )}
                  >
                    {a.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {a.change}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Trust explainer */}
          <Card hover={false} className="bg-gradient-to-b from-primary/[0.06] to-transparent">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-ink">How trust scores work</h3>
            </div>
            <ul className="mt-4 space-y-3 text-xs text-ink-muted">
              {[
                'Verified reports earn the reporter reputation over time.',
                'Endorsements from high-trust users carry more weight.',
                'Anonymous reports are deprioritized — never amplified.',
                'Scores update as the community validates or flags content.',
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-success" />
                  {t}
                </li>
              ))}
            </ul>
          </Card>

          {/* Recent activity mini */}
          <Card hover={false}>
            <h3 className="text-sm font-semibold text-ink">Recent reports</h3>
            <div className="mt-4 space-y-3">
              {reportsList.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <img src={r.photo} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink">{r.title}</p>
                    <p className="truncate text-[11px] text-ink-faint">{r.area}</p>
                  </div>
                  <span className="text-[11px] text-ink-faint">{r.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Upload modal */}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={fetchReports} />
    </div>
  );
}

function ReportCard({ report }: { report: ReportItem }) {
  const [endorsed, setEndorsed] = useState(false);
  const endorseCount = report.endorsements + (endorsed ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 glass-card transition-all hover:border-white/10 hover:shadow-soft-lg">
      <div className="grid sm:grid-cols-[200px_1fr]">
        {/* Photo */}
        <div className="relative h-48 overflow-hidden sm:h-full">
          <img src={report.photo} alt={report.title} className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r" />
          <div className="absolute left-3 top-3">
            <RiskBadge level={report.severity}>{report.severity}</RiskBadge>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="chip mb-2">{report.category}</span>
              <h3 className="text-[15px] font-semibold leading-snug text-ink">{report.title}</h3>
            </div>
            {report.verified && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[11px] font-semibold text-success">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
          </div>

          <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{report.description}</p>

          {/* Explanation badge */}
          {report.explanation && (
            <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>{report.explanation}</span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-faint">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {report.area}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {report.time}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-gradient-to-br from-primary to-secondary" />
              {report.reporter}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
            {/* Trust score */}
            <div className="flex items-center gap-2">
              <div className="relative grid h-9 w-9 place-items-center">
                <svg width="36" height="36" className="-rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke={report.trustScore >= 70 ? '#22C55E' : report.trustScore >= 60 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 15}
                    strokeDashoffset={2 * Math.PI * 15 - (report.trustScore / 100) * 2 * Math.PI * 15}
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-ink">{report.trustScore}</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-ink">Trust score</p>
                <p className="text-[10px] text-ink-faint">
                  {report.trustScore >= 80 ? 'High reputation' : report.trustScore >= 70 ? 'Verified' : report.trustScore >= 60 ? 'Moderate' : 'Low · pending'}
                </p>
              </div>
            </div>

            {/* Endorse */}
            <button
              onClick={() => setEndorsed((e) => !e)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all',
                endorsed
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-white/10 bg-white/5 text-ink-muted hover:text-ink',
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              {endorseCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('Theft');
  const [severity, setSeverity] = useState('moderate');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('report-photos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        alert(`Storage upload error: ${uploadError.message}`);
        setPhotoPreview(null);
        setPhotoUrl(null);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('report-photos')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        setPhotoUrl(publicUrlData.publicUrl);
        setPhotoPreview(publicUrlData.publicUrl);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(`Upload failed: ${err?.message || err}`);
      setPhotoPreview(null);
      setPhotoUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // 1. Query existing reports in the same area within last 48 hours
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: existingAreaReports } = await supabase
        .from('reports')
        .select('*')
        .ilike('area', area.trim())
        .gte('created_at', fortyEightHoursAgo);

      // 2. Compute credibility score
      let computedTrustScore = 50;
      const matchCount = existingAreaReports ? existingAreaReports.length : 0;

      if (matchCount === 1) {
        computedTrustScore += 15;
      } else if (matchCount >= 2) {
        computedTrustScore += 25;
      }

      const hasCategoryMatch = existingAreaReports?.some(
        (r: any) => (r.category || '').toLowerCase() === category.toLowerCase()
      );
      if (hasCategoryMatch) {
        computedTrustScore += 10;
      }

      computedTrustScore = Math.min(95, computedTrustScore);

      // 3. Set verified status
      const isVerified = computedTrustScore >= 70;

      // 4. Insert into database with computed values
      const { error } = await supabase.from('reports').insert([
        {
          title,
          area,
          category,
          severity,
          photo_url: photoUrl || '',
          trust_score: computedTrustScore,
          verified: isVerified,
        },
      ]);

      if (error) {
        console.error('Submit report error:', error);
        alert(`Failed to submit report: ${error.message}`);
      } else {
        setTitle('');
        setArea('');
        setCategory('Theft');
        setSeverity('moderate');
        setPhotoPreview(null);
        setPhotoUrl(null);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Error inserting report:', err);
      alert(`Error inserting report: ${err?.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 glass-strong p-6 shadow-soft-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Upload a report</h2>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-sm text-ink-muted">Your report enters the trust engine. Verified accounts carry more weight.</p>

            {/* Photo upload */}
            <div className="mt-5">
              <label className="text-xs font-medium uppercase tracking-wider text-ink-faint">Photo evidence</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {photoPreview ? (
                <div className="relative mt-2 overflow-hidden rounded-xl">
                  <img src={photoPreview} alt="preview" className="h-44 w-full object-cover" />
                  <button
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-ink-faint transition-colors hover:border-primary/40 hover:text-ink-muted"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">{uploading ? 'Uploading...' : 'Click to attach a photo'}</span>
                </button>
              )}
            </div>

            {/* Title */}
            <div className="mt-5">
              <label className="text-xs font-medium uppercase tracking-wider text-ink-faint">What happened</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the incident..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-ink outline-none focus:border-primary/50"
              />
            </div>

            {/* Area */}
            <div className="mt-4">
              <label className="text-xs font-medium uppercase tracking-wider text-ink-faint">Location / area</label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Lantern Ave · Block 14"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-ink outline-none focus:border-primary/50"
              />
            </div>

            {/* Category + severity */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-ink-faint">Category</label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['Theft', 'Harassment', 'Nuisance', 'Lighting'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={cn(
                        'rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all',
                        category === c ? 'border-primary/40 bg-primary/10 text-ink' : 'border-white/10 bg-white/5 text-ink-faint',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-ink-faint">Severity</label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['low', 'moderate', 'high'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={cn(
                        'rounded-lg border px-2.5 py-1 text-[11px] font-medium capitalize transition-all',
                        severity === s ? 'border-primary/40 bg-primary/10 text-ink' : 'border-white/10 bg-white/5 text-ink-faint',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 btn-primary w-full"
              onClick={handleSubmit}
              disabled={submitting || uploading}
            >
              <Upload className="h-4 w-4" />
              {submitting ? 'Submitting...' : 'Submit report'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

