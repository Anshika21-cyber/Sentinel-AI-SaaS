import { useState, type MouseEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * RippleButton — a button/link wrapper that spawns a radial ripple from the
 * click point, like Material touch feedback but tuned for the dark theme.
 * Works on any element via `as`. Ripples are short-lived motion spans.
 */
interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function RippleButton({
  children,
  className,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'ghost';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const spawn = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now() + Math.random();
    setRipples((r) => [...r, { id, x, y, size }]);
    window.setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 650);
  };

  const base =
    'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0';

  const variants = {
    primary: 'bg-primary text-white shadow-glow-sm hover:shadow-glow',
    ghost: 'border border-white/10 bg-white/5 text-ink hover:bg-white/10',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={(e) => {
        spawn(e);
        onClick?.();
      }}
      className={cn(base, variants[variant], className)}
    >
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ opacity: 0.45, scale: 0 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="pointer-events-none absolute rounded-full bg-white/40"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
