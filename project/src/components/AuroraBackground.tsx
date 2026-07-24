import { memo } from 'react';

/**
 * AuroraBackground — a fixed, slow-drifting gradient blob layer that sits
 * behind everything. Three large radial blobs animate independently with
 * long durations for an organic "aurora" feel. Pointer-events disabled.
 */
function AuroraBackgroundImpl() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* base wash */}
      <div className="absolute inset-0 bg-bg-base" />

      {/* drifting aurora blobs */}
      <div className="absolute left-[-15%] top-[-10%] h-[70vh] w-[70vw] rounded-full bg-primary/[0.14] blur-[130px] animate-aurora-drift" />
      <div className="absolute right-[-20%] top-[15%] h-[60vh] w-[60vw] rounded-full bg-secondary/[0.12] blur-[130px] animate-aurora-drift-2" />
      <div className="absolute bottom-[-15%] left-[25%] h-[55vh] w-[55vw] rounded-full bg-success/[0.06] blur-[140px] animate-aurora-drift" />

      {/* subtle grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.18] mask-fade-b" />

      {/* top + bottom vignette to keep content legible */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg-base/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg-base/80 to-transparent" />
    </div>
  );
}

export const AuroraBackground = memo(AuroraBackgroundImpl);
