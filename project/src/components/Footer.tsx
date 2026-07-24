import { Link } from 'react-router-dom';
import { ShieldCheck, Github, Twitter, Linkedin } from 'lucide-react';

const footerNav = [
  {
    title: 'Product',
    links: [
      { label: 'Live Map', to: '/map' },
      { label: 'Route Planner', to: '/route' },
      { label: 'Community Reports', to: '/community' },
      { label: 'Analytics Dashboard', to: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Mission', to: '/about#mission' },
      { label: 'Team', to: '/about#team' },
      { label: 'Technology', to: '/about#technology' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/about' },
      { label: 'API Reference', to: '/about' },
      { label: 'Trust & Privacy', to: '/about' },
      { label: 'Status', to: '/about' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5">
      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-semibold tracking-tight text-ink">Sentinel AI</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              Predictive, explainable safety intelligence for the cities, fleets, and people who move through them.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-ink-muted transition-colors hover:text-ink"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerNav.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-ink-muted transition-colors hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 md:flex-row md:items-center">
          <p className="text-xs text-ink-faint">
            © {new Date().getFullYear()} Sentinel AI, Inc. · Predict. Explain. Prevent.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-ink-faint transition-colors hover:text-ink-muted">Privacy</a>
            <a href="#" className="text-xs text-ink-faint transition-colors hover:text-ink-muted">Terms</a>
            <a href="#" className="text-xs text-ink-faint transition-colors hover:text-ink-muted">Data Handling</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
