import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton — shimmering placeholder block used inside Suspense fallbacks and
 * anywhere content loads asynchronously. Pure CSS, no JS cost.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} />;
}

/**
 * PageSkeleton — a full-page loading state that matches the dashboard/inner
 * page layout. Shown by Suspense while a lazy route chunk downloads.
 */
export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-6 pb-20 pt-32 md:px-10">
      {/* header */}
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className="mt-5 h-10 w-72" />
      <Skeleton className="mt-4 h-4 w-96 max-w-full" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-3 w-10 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-8 w-20" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-6 h-64 w-full rounded-xl" />
        </div>
        <div className="card p-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-6 h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** A polished branded loader for the very first paint / suspense boundary. */
export function BrandLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-glow-sm">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/30" />
          <ShieldGlyph />
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary"
                style={{
                  animation: `float 1s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </span>
          {label}
        </div>
      </div>
    </div>
  );
}

function ShieldGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="relative">
      <path
        d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"
        fill="white"
        fillOpacity="0.95"
      />
      <path d="M9 12l2 2 4-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * SpotlightCard — a glass card whose internal radial glow tracks the cursor.
 * Attaches a mousemove listener that sets --mx/--my CSS vars consumed by the
 * `.spotlight` pseudo-element. Falls back gracefully on touch (no hover).
 */
export function SpotlightCard({ children, className }: SpotlightCardProps) {
  return (
    <div
      className={cn('spotlight glow-ring rounded-3xl', className)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }}
    >
      {children}
    </div>
  );
}
