import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const publicLinks = [{ label: 'About', to: '/about' }];
const privateLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Live Map', to: '/map' },
  { label: 'Route Planner', to: '/route' },
  { label: 'Community', to: '/community' },
  { label: 'About', to: '/about' },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 md:px-5',
          scrolled ? 'glass-strong shadow-soft-lg' : 'border border-transparent',
        )}
      >
        {/* Logo with glow on hover */}
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-glow-sm transition-all duration-300 group-hover:shadow-glow">
            <span className="absolute inset-0 rounded-xl bg-primary/40 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
            <ShieldCheck className="relative h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-ink">Sentinel AI</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              Predict · Explain · Prevent
            </span>
          </div>
        </Link>

        {/* Desktop nav with magnetic active indicator */}
        <nav className="hidden items-center gap-1 lg:flex">
          {(user ? privateLinks : publicLinks).map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  'group relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200',
                  active ? 'text-ink' : 'text-ink-muted hover:text-ink',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-white/8"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}

          {user ? (
            <div className="ml-3 flex items-center gap-2">
              <button onClick={() => signOut()} className="rounded-full border px-3 py-1 text-sm font-medium text-ink-muted hover:text-ink">
                Logout
              </button>
              <Link to="/dashboard" className="ml-2 inline-flex items-center rounded-full bg-white/5 px-3 py-2 text-sm font-medium text-ink">
                Profile
              </Link>
            </div>
          ) : null}
        </nav>

        {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2">
          {!user ? (
            <Link to="/signup" className="hidden btn-primary md:inline-flex">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link to="/map" className="hidden btn-primary md:inline-flex">
              Try Live Map
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-2 max-w-7xl px-4 lg:hidden"
          >
            <div className="glass-strong rounded-2xl p-3 shadow-soft-lg">
              {(user ? privateLinks : publicLinks).map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={l.to}
                    className={cn(
                      'block rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      location.pathname === l.to
                        ? 'bg-white/10 text-ink'
                        : 'text-ink-muted hover:bg-white/5 hover:text-ink',
                    )}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              {user ? (
                <div className="mt-3">
                  <button onClick={() => signOut()} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-ink-muted">Logout</button>
                </div>
              ) : (
                <div className="mt-3">
                  <Link to="/signup" className="btn-primary w-full">Get Started</Link>
                </div>
              )}
              <Link to="/map" className="mt-2 btn-primary w-full">
                Try Live Map
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
