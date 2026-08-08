import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  MapPin,
  Circle,
  Clock,
  Gauge,
  Brain,
  Route as RouteIcon,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Locate,
} from 'lucide-react';
import { Eyebrow, RiskBadge, Reveal } from '@/components/ui/Primitives';
import { AnimatedMapCanvas } from '@/components/AnimatedMapCanvas';
import { getRouteLocation, getRouteOptions } from '@/services/safety';
import { cn } from '@/lib/utils';

export function RoutePlannerPage() {
  const [origin, setOrigin] = useState('Noida');
  const [destination, setDestination] = useState('Gurugram');
  const [activeId, setActiveId] = useState('safest');
  const [planning, setPlanning] = useState(false);

  const originLocation = useMemo(() => getRouteLocation(origin), [origin]);
  const destinationLocation = useMemo(() => getRouteLocation(destination), [destination]);
  const routeOptions = useMemo(() => getRouteOptions(origin, destination), [origin, destination]);
  const originSupported = Boolean(originLocation);
  const destinationSupported = Boolean(destinationLocation);
  const routeUnavailable = !originSupported || !destinationSupported || routeOptions.length === 0;
  const active = routeOptions.length > 0 ? routeOptions.find((r) => r.id === activeId) ?? routeOptions[0] : null;

  const plan = () => {
    setPlanning(true);
    setTimeout(() => setPlanning(false), 1000);
  };

  return (
    <div className="relative min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-6 pt-8 md:px-10">
        <Eyebrow>Route Planner</Eyebrow>
        <h1 className="mt-4 text-display-md font-semibold tracking-tight text-ink">
          The fastest path isn't always the <span className="text-gradient-blue">smartest</span>.
        </h1>
        <p className="mt-3 max-w-xl text-ink-muted">
          Sentinel balances minutes against risk. Pick a start and end — get three routes, each with a reason.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-7xl gap-5 px-6 pb-20 md:px-10 lg:grid-cols-[1fr_1.3fr]">
        {/* Left: inputs + route cards */}
        <div className="space-y-5">
          {/* Input card */}
          <div className="rounded-2xl border border-white/5 glass-card p-6">
            <div className="space-y-4">
              <Field
                icon={<Circle className="h-4 w-4 text-success" />}
                label="Current location"
                value={origin}
                onChange={setOrigin}
              />
              <div className="ml-5 h-6 border-l border-dashed border-white/15" />
              <Field
                icon={<MapPin className="h-4 w-4 text-danger" />}
                label="Destination"
                value={destination}
                onChange={setDestination}
              />
            </div>

            <button onClick={plan} className="mt-6 btn-primary w-full">
              {planning ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  />
                  Calculating safest routes...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Plan route
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-between text-xs text-ink-faint">
              <button className="flex items-center gap-1.5 transition-colors hover:text-ink-muted">
                <Locate className="h-3.5 w-3.5" /> Use my location
              </button>
              <span>3 routes found</span>
            </div>
          </div>

          {/* Route options */}
          <div className="space-y-3">
            {routeOptions.map((r) => {
              const isActive = r.id === activeId;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveId(r.id)}
                  className={cn(
                    'w-full rounded-2xl border p-5 text-left transition-all',
                    isActive
                      ? 'border-primary/40 bg-primary/[0.06] shadow-glow-sm'
                      : 'border-white/5 glass-card hover:border-white/10',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ background: r.color, boxShadow: `0 0 10px ${r.color}` }} />
                      <span className="text-sm font-semibold text-ink">{r.label}</span>
                      <span className="chip">{r.badge}</span>
                    </div>
                    <RiskBadge level={r.riskLevel}>{r.risk}% risk</RiskBadge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <Metric icon={<RouteIcon className="h-3.5 w-3.5" />} label="Distance" value={r.distance} />
                    <Metric icon={<Clock className="h-3.5 w-3.5" />} label="Time" value={`${r.duration} min`} />
                    <Metric icon={<Gauge className="h-3.5 w-3.5" />} label="Risk" value={`${r.risk}%`} />
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 border-t border-white/5 pt-4">
                          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                            <Navigation className="h-3.5 w-3.5" /> Via
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {r.via.map((v, i) => (
                              <span key={v} className="flex items-center gap-1.5">
                                <span className="rounded-lg bg-white/5 px-2 py-1 text-[11px] text-ink-muted">{v}</span>
                                {i < r.via.length - 1 && <ArrowRight className="h-3 w-3 text-ink-faint" />}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: map + AI reasoning */}
        <div className="space-y-5">
          <div className="relative rounded-3xl border border-white/10 glass-card p-2 shadow-soft-lg">
            <AnimatedMapCanvas
              className="aspect-[4/3] w-full"
              showRoute={!routeUnavailable}
              showHeat={!routeUnavailable}
              routes={routeUnavailable ? [] : routeOptions}
              markers={
                routeUnavailable
                  ? []
                  : [
                      { x: originLocation!.mapX, y: originLocation!.mapY, label: originLocation!.label, color: '#22C55E' },
                      { x: destinationLocation!.mapX, y: destinationLocation!.mapY, label: destinationLocation!.label, color: '#EF4444' },
                    ]
              }
            />
            <div className="absolute left-5 top-5 flex items-center gap-2">
              <span className="glass rounded-lg px-2.5 py-1 text-[11px] font-medium text-ink-muted">
                {origin}
              </span>
              <ArrowRight className="h-3 w-3 text-ink-faint" />
              <span className="glass rounded-lg px-2.5 py-1 text-[11px] font-medium text-ink-muted">
                {destination}
              </span>
            </div>
          </div>

          {routeUnavailable ? (
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-center text-sm text-ink-muted">
              <p className="font-semibold text-ink">Location not supported in prototype</p>
              <p className="mt-2">Please enter one of the supported Delhi NCR locations to see route safety details.</p>
            </div>
          ) : active ? (
            <Reveal>
              <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-primary/[0.07] to-transparent p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-ink">AI Reasoning · {active.label}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink">{active.reasoning}</p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <ReasoningStat
                  icon={<ShieldCheck className="h-4 w-4 text-success" />}
                  label="Safer than fastest"
                  value={`${Math.round((1 - active.risk / 44) * 100)}%`}
                />
                <ReasoningStat
                  icon={<Clock className="h-4 w-4 text-primary" />}
                  label="Added time"
                  value={`${active.duration - 12} min`}
                />
                <ReasoningStat
                  icon={<AlertTriangle className="h-4 w-4 text-warning" />}
                  label="Segments flagged"
                  value={active.id === 'safest' ? '0' : active.id === 'balanced' ? '1' : '3'}
                />
              </div>

              {/* Factor breakdown */}
              <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Decision signals</p>
                <div className="mt-3 space-y-2.5">
                  {[
                    { label: 'Lighting coverage', value: active.id === 'safest' ? 92 : active.id === 'balanced' ? 70 : 38 },
                    { label: 'CCTV presence', value: active.id === 'safest' ? 88 : active.id === 'balanced' ? 54 : 22 },
                    { label: 'Foot traffic (22:00+)', value: active.id === 'safest' ? 76 : active.id === 'balanced' ? 58 : 31 },
                  ].map((s, i) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-muted">{s.label}</span>
                        <span className="text-ink-faint">{s.value}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: i * 0.08 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="mt-5 btn-ghost w-full">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Navigate with this route
              </button>
            </div>
          </Reveal>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-center text-sm text-ink-muted">
            <p className="font-semibold text-ink">Enter both supported locations to see route details.</p>
            <p className="mt-2">If a location is unsupported, the prototype will show a support notice.</p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-3.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5">{icon}</div>
      <div className="flex-1">
        <label className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">{label}</label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink-faint focus:border-primary/50"
        />
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] p-2.5">
      <div className="flex items-center gap-1.5 text-ink-faint">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function ReasoningStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
      <div className="mx-auto flex justify-center">{icon}</div>
      <p className="mt-1.5 text-base font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-faint">{label}</p>
    </div>
  );
}
