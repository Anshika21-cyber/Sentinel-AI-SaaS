import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, CheckCircle2, Brain, X } from 'lucide-react';

/**
 * FloatingNotifications — a stack of auto-dismissing toast cards that slide
 * in from the bottom-right. Each one mimics a real Sentinel safety event.
 * They cycle on a timer so the app always feels alive, and dismiss on click.
 */

type NotifKind = 'alert' | 'prediction' | 'resolve' | 'confidence';

interface Notif {
  id: number;
  kind: NotifKind;
  title: string;
  body: string;
  area: string;
}

const seed: Notif[] = [
  { id: 1, kind: 'alert', title: 'Risk spike detected', body: 'Predicted risk up 41% in the next 6h.', area: 'Mill Rd · Junction 7' },
  { id: 2, kind: 'prediction', title: 'New hotspot forecast', body: '3 incidents clustering within 400m / 72h.', area: 'Kennington Cross' },
  { id: 3, kind: 'confidence', title: 'AI confidence rising', body: 'Model confidence reached 94.3% across 312 zones.', area: 'Citywide' },
  { id: 4, kind: 'resolve', title: 'Alert cleared', body: 'Streetlight outage resolved by city operations.', area: 'Lantern Ave · Block 14' },
  { id: 5, kind: 'alert', title: 'Route rerouted', body: 'Safest path updated — risk cut by 73%.', area: 'Wellington St corridor' },
  { id: 6, kind: 'prediction', title: 'Verified report filed', body: 'Phone-snatch pattern confirmed at Junction 7.', area: 'Mill Rd · Junction 7' },
];

const config: Record<NotifKind, { icon: typeof Brain; color: string; ring: string }> = {
  alert: { icon: ShieldAlert, color: 'text-danger', ring: 'bg-danger/15' },
  prediction: { icon: TrendingUp, color: 'text-warning', ring: 'bg-warning/15' },
  resolve: { icon: CheckCircle2, color: 'text-success', ring: 'bg-success/15' },
  confidence: { icon: Brain, color: 'text-primary', ring: 'bg-primary/15' },
};

export function FloatingNotifications() {
  const [visible, setVisible] = useState<Notif[]>([]);
  const counter = useRef(0);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const interval = window.setInterval(() => {
      const next = (counter.current + 1) % seed.length;
      counter.current = next;
      const notif = { ...seed[next], id: Date.now() };
      setVisible((v) => [...v.slice(-2), notif]);
    }, 5200);
    // Show one shortly after mount
    const initial = window.setTimeout(() => {
      setVisible([{ ...seed[0], id: Date.now() }]);
    }, 1800);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(initial);
    };
  }, [enabled]);

  const dismiss = (id: number) => setVisible((v) => v.filter((n) => n.id !== id));

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40 flex w-[330px] max-w-[calc(100vw-3rem)] flex-col gap-3">
      <AnimatePresence>
        {visible.map((n) => {
          const c = config[n.kind];
          const Icon = c.icon;
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="pointer-events-auto"
            >
              <NotifCard notif={n} icon={Icon} color={c.color} ring={c.ring} onDismiss={() => dismiss(n.id)} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Toggle to pause/resume */}
      {visible.length === 0 && (
        <button
          onClick={() => setEnabled((e) => !e)}
          className="pointer-events-auto self-end rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-ink-faint transition-colors hover:text-ink"
        >
          {enabled ? 'Notifications on' : 'Notifications off'}
        </button>
      )}
    </div>
  );
}

function NotifCard({
  notif,
  icon: Icon,
  color,
  ring,
  onDismiss,
}: {
  notif: Notif;
  icon: typeof Brain;
  color: string;
  ring: string;
  onDismiss: () => void;
}) {
  return (
    <div className="glass-strong relative overflow-hidden rounded-2xl p-4 shadow-soft-lg">
      {/* progress bar — auto dismiss hint */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-primary/60"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 6, ease: 'linear' }}
      />
      <div className="flex items-start gap-3">
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${ring}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{notif.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{notif.body}</p>
          <p className="mt-1.5 text-[11px] font-medium text-ink-faint">{notif.area}</p>
        </div>
        <button onClick={onDismiss} className="shrink-0 text-ink-faint transition-colors hover:text-ink" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
