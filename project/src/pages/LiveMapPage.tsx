import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Layers,
  Flame,
  Navigation,
  Eye,
  Camera,
  ShieldAlert,
  Brain,
  MapPin,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { RiskBadge, ScoreRing, Eyebrow } from '@/components/ui/Primitives';
import { AnimatedMapCanvas } from '@/components/AnimatedMapCanvas';
import { getLocationSafety, type LocationAnalysis } from '@/services/safety';
import { type IncidentMarker } from '@/data/content';
import { cn } from '@/lib/utils';

const layers = [
  { id: 'heat', label: 'Heatmap', icon: Flame, defaultOn: true },
  { id: 'incidents', label: 'Incidents', icon: ShieldAlert, defaultOn: true },
  { id: 'route', label: 'Safe Routes', icon: Navigation, defaultOn: true },
  { id: 'cctv', label: 'CCTV Coverage', icon: Camera, defaultOn: false },
  { id: 'vision', label: 'Visibility', icon: Eye, defaultOn: false },
];

const incidentTypeLabel: Record<string, string> = {
  theft: 'Theft',
  assault: 'Assault',
  nuisance: 'Nuisance',
  traffic: 'Traffic',
  harassment: 'Harassment',
};

export function LiveMapPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [layerState, setLayerState] = useState<Record<string, boolean>>(
    Object.fromEntries(layers.map((l) => [l.id, l.defaultOn])),
  );
  const [query, setQuery] = useState('Noida');
  const [analysis, setAnalysis] = useState<LocationAnalysis>(() => getLocationSafety('Noida'));
  const [searching, setSearching] = useState(false);

  const selectedInc = analysis.incidents.find((i) => i.id === selected);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredIncidents = normalizedQuery
    ? analysis.incidents.filter((inc) => {
        return [incidentTypeLabel[inc.type], inc.time, inc.type, inc.id]
          .some((field) => field.toLowerCase().includes(normalizedQuery));
      })
    : analysis.incidents;

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => {
      setAnalysis(getLocationSafety(query.trim() || 'Delhi'));
      setSelected(null);
      setSearching(false);
    }, 600);
  };

  const riskLevelLabel = analysis.riskLevel === 'low' ? 'Low risk' : analysis.riskLevel === 'moderate' ? 'Moderate risk' : 'High risk';

  return (
    <div className="relative min-h-screen pt-24">
      {/* Page header */}
      <div className="mx-auto max-w-7xl px-6 pt-8 md:px-10">
        <Eyebrow>Live Safety Map</Eyebrow>
        <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-display-md font-semibold tracking-tight text-ink">
              Real-time safety intelligence
            </h1>
            <p className="mt-3 max-w-xl text-ink-muted">
              Search any location. Sentinel scores the block, explains the signals, and flags the incidents near you.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search address or area..."
              className="w-full rounded-full border border-white/10 bg-bg-card py-3 pl-11 pr-28 text-sm text-ink placeholder:text-ink-faint outline-none transition-all focus:border-primary/50 focus:shadow-glow-sm"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
            >
              {searching ? 'Analyzing…' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Map + panels */}
      <div className="mx-auto mt-8 grid max-w-7xl gap-5 px-6 pb-20 md:px-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Map column */}
        <div className="relative">
          <div className="relative rounded-3xl border border-white/10 glass-card p-2 shadow-soft-lg">
            <AnimatedMapCanvas
              className="aspect-[4/3] w-full lg:aspect-[5/4]"
              interactive
              showRoute={layerState.route}
              showHeat={layerState.heat}
              incidents={filteredIncidents}
              markers={[analysis.mapMarker]}
              onSelect={setSelected}
            />

            {/* Map overlay chrome */}
            <div className="absolute left-5 top-5 flex items-center gap-2">
              <span className="glass rounded-lg px-2.5 py-1 text-[11px] font-medium text-ink-muted">
                Lower Manhattan · 22:47
              </span>
              <span className="glass flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium text-success">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                Live
              </span>
            </div>

            {/* Layer controls */}
            <div className="absolute bottom-5 left-5">
              <LayerControls layers={layers} state={layerState} onToggle={(id) => setLayerState((s) => ({ ...s, [id]: !s[id] }))} />
            </div>

            {/* Legend */}
            <div className="absolute bottom-5 right-5 glass rounded-xl p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Risk level</p>
              <div className="space-y-1.5">
                {[
                  { c: '#22C55E', l: 'Low' },
                  { c: '#F59E0B', l: 'Moderate' },
                  { c: '#EF4444', l: 'High' },
                  { c: '#B91C1C', l: 'Critical' },
                ].map((x) => (
                  <div key={x.l} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: x.c }} />
                    <span className="text-[11px] text-ink-muted">{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nearby incidents list */}
          <div className="mt-5 rounded-2xl border border-white/5 glass-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <MapPin className="h-4 w-4 text-primary" />
                Nearby incidents
              </h3>
              <span className="text-xs text-ink-faint">
                {filteredIncidents.length} within 1km{normalizedQuery ? ` · matching "${query.trim()}"` : ''}
              </span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {filteredIncidents.slice(0, 6).map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => setSelected(inc.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                    selected === inc.id
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5',
                  )}
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5">
                    <ShieldAlert className={cn('h-4 w-4', sevText(inc.severity))} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-ink">{incidentTypeLabel[inc.type]}</p>
                    <p className="truncate text-[11px] text-ink-faint">{inc.time}</p>
                  </div>
                  {inc.verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel: AI explanation */}
        <div className="space-y-5">
          {/* Safety score */}
          <div className="rounded-2xl border border-white/5 glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">Location Safety Score</h3>
                <p className="text-xs text-ink-faint">{analysis.region} · {analysis.estimate ? 'Prototype estimate' : 'Live analysis'}</p>
              </div>
              <span className="text-xs text-ink-faint">Updated 47s ago</span>
            </div>
            <div className="mt-5 flex items-center gap-6">
              <ScoreRing score={analysis.score} size={130} />
              <div className="flex-1">
                <RiskBadge level={analysis.riskLevel}>{riskLevelLabel}</RiskBadge>
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                  {analysis.displayName} · {analysis.horizon}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                  <span className="text-ink">Confidence {(analysis.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI explanation */}
          <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-primary/[0.06] to-transparent p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">AI Explanation</h3>
                <p className="text-xs text-ink-faint">Why this area got its score</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink">{analysis.summary}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {analysis.factors.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink">{f.label}</span>
                    <span className="text-[11px] font-semibold text-ink-faint">{f.value}%</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">{f.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Selected incident detail */}
          {selectedInc && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/5 glass-card p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Selected incident</h3>
                <RiskBadge level={selectedInc.severity}>{selectedInc.severity}</RiskBadge>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Type" value={incidentTypeLabel[selectedInc.type]} />
                <Row label="Reported" value={selectedInc.time} />
                <Row label="Coordinates" value={`${selectedInc.lat.toFixed(3)}, ${selectedInc.lng.toFixed(3)}`} />
                <Row label="Verified" value={selectedInc.verified ? 'Yes — endorsed' : 'Pending'} />
              </div>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/5 glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Recommendations</h3>
              <RiskBadge level={analysis.riskLevel}>{analysis.score >= 70 ? 'Safe' : analysis.score >= 45 ? 'Use caution' : 'Avoid if possible'}</RiskBadge>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              {analysis.recommendations.map((rec) => (
                <li key={rec} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  {rec}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
      <span className="text-ink-faint">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function LayerControls({
  layers,
  state,
  onToggle,
}: {
  layers: { id: string; label: string; icon: LucideIcon; defaultOn: boolean }[];
  state: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass-strong rounded-xl p-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-ink"
      >
        <Layers className="h-4 w-4 text-primary" />
        Layers
        <ChevronDown className={cn('ml-auto h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-1 space-y-0.5 p-1">
          {layers.map((l) => {
            const Icon = l.icon;
            const on = state[l.id];
            return (
              <button
                key={l.id}
                onClick={() => onToggle(l.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors',
                  on ? 'bg-primary/10 text-ink' : 'text-ink-faint hover:bg-white/5',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {l.label}
                <span className={cn('ml-auto h-3.5 w-6 rounded-full p-0.5 transition-colors', on ? 'bg-primary' : 'bg-white/10')}>
                  <span className={cn('block h-2.5 w-2.5 rounded-full bg-white transition-transform', on && 'translate-x-2.5')} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function sevText(level: string) {
  switch (level) {
    case 'low':
      return 'text-success';
    case 'moderate':
      return 'text-warning';
    case 'high':
      return 'text-danger';
    default:
      return 'text-red-300';
  }
}
