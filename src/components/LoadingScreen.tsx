import { motion } from 'framer-motion';

/**
 * LoadingScreen — a dark, full-viewport intro shown before the app mounts.
 * The Sentinel shield glows in, the tagline fades up, and the whole thing
 * exits with a soft fade. Respects reduced-motion via CSS variables.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

export function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-bg-base"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
    >
      {/* Ambient glow behind the logo */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[90px]"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0.9, 0.6], scale: [0.7, 1.1, 1] }}
        transition={{ duration: 2.4, ease: EASE }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />

      <div className="relative flex flex-col items-center">
        {/* Shield mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative"
        >
          <motion.div
            className="absolute inset-0 rounded-3xl bg-primary/40 blur-xl"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-glow">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"
                fill="white"
                fillOpacity="0.95"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
          className="mt-6 text-2xl font-semibold tracking-tight text-ink"
        >
          Sentinel AI
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          className="mt-2 text-sm font-medium tracking-[0.25em] text-ink-muted"
        >
          Predict. Explain. Prevent.
        </motion.p>

        {/* Loading bar */}
        <motion.div
          className="mt-8 h-0.5 w-40 overflow-hidden rounded-full bg-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.1, ease: EASE }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
