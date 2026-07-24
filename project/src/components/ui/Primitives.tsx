import { type ReactNode, useRef, type ElementType } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCountUp } from '@/lib/useCountUp';

// --- Section wrapper --------------------------------------------------------

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export function Section({ id, children, className, as: Tag = 'section' }: SectionProps) {
  return (
    <Tag id={id} className={cn('relative mx-auto w-full max-w-7xl px-6 py-24 md:px-10', className)}>
      {children}
    </Tag>
  );
}

// --- Eyebrow ----------------------------------------------------------------

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('section-eyebrow', className)}>
      <span className="h-px w-6 bg-gradient-to-r from-primary to-secondary" />
      {children}
    </div>
  );
}

// --- Reveal on scroll -------------------------------------------------------

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  return (
    <MotionTag
      variants={revealVariants}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/** Stagger container + child — for grids that should cascade in. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// --- Gradient text ----------------------------------------------------------

export function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('text-gradient-blue', className)}>{children}</span>;
}

// --- Stat counter (animated, real count-up) ---------------------------------

export function StatCounter({
  value,
  decimals = 0,
  suffix = '',
  label,
  prefix = '',
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
  prefix?: string;
}) {
  const { ref, display } = useCountUp(value, 1800, decimals);
  return (
    <div ref={ref} className="flex flex-col">
      <span className="text-4xl font-semibold tracking-tight text-ink tnum md:text-5xl">
        {prefix}
        {display}
        {suffix}
      </span>
      <span className="mt-2 text-sm text-ink-muted">{label}</span>
    </div>
  );
}

// --- Badge ------------------------------------------------------------------

const riskColors: Record<string, string> = {
  low: 'text-success bg-success/10 border-success/30',
  moderate: 'text-warning bg-warning/10 border-warning/30',
  high: 'text-danger bg-danger/10 border-danger/30',
  critical: 'text-red-300 bg-red-900/30 border-red-700/40',
};

export function RiskBadge({ level, children }: { level: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        riskColors[level] ?? riskColors.moderate,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

// --- Score ring -------------------------------------------------------------

export function ScoreRing({
  score,
  size = 120,
  stroke = 8,
  label = 'Safety',
  animate = true,
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  animate?: boolean;
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#22C55E' : score >= 45 ? '#F59E0B' : '#EF4444';
  const localRef = useRef<HTMLDivElement>(null);
  const inView = useInView(localRef, { once: true, margin: '-40px' });

  return (
    <div ref={localRef} className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={animate && inView ? { strokeDashoffset: offset } : { strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <AnimatedNumber value={score} active={inView} />
        <span className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</span>
      </div>
    </div>
  );
}

function AnimatedNumber({ value, active }: { value: number; active: boolean }) {
  const { display } = useCountUp(active ? value : 0, 1400, 0);
  return (
    <span className="text-2xl font-semibold tnum" style={{ color: value >= 70 ? '#22C55E' : value >= 45 ? '#F59E0B' : '#EF4444' }}>
      {display}
    </span>
  );
}

// --- Card (with cursor spotlight + gradient ring on hover) ------------------

export function Card({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        'card p-6',
        hover && 'spotlight glow-ring transition-transform duration-300 hover:-translate-y-1',
        className,
      )}
      onMouseMove={(e) => {
        if (!hover) return;
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }}
    >
      {children}
    </div>
  );
}
