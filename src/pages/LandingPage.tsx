import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Sparkles,
  Brain,
  ShieldCheck,
  Route,
  Users,
  MapPin,
  Dna,
  Plus,
  Minus,
  Quote,
  Star,
  Activity,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import {
  Section,
  Eyebrow,
  Reveal,
  GradientText,
  StatCounter,
  Card,
  StaggerGroup,
  StaggerItem,
} from '@/components/ui/Primitives';
import { AnimatedMapCanvas } from '@/components/AnimatedMapCanvas';
import { RippleButton } from '@/components/ui/RippleButton';
import { features, testimonials, faqs, heroStats, aiExplanation } from '@/data/content';

const iconMap: Record<string, typeof Dna> = {
  Dna,
  MapPin,
  Sparkles,
  Route,
  Users,
  Brain,
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function LandingPage() {
  return (
    <div className="relative">
      <Hero />
      <StatsBand />
      <Features />
      <MapPreview />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}

// --- Hero -------------------------------------------------------------------

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-32 md:pt-40">
      {/* Local ambient glow on top of the global aurora */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-primary/[0.12] blur-[120px]" />
        <div className="absolute right-[5%] top-[30%] h-[300px] w-[300px] rounded-full bg-secondary/[0.10] blur-[100px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-30" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-24 md:px-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-8">
        {/* Copy */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="chip">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Live in 312 cities
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
            className="mt-6 text-display-xl font-semibold tracking-tight text-ink"
          >
            Navigate Smarter.
            <br />
            <GradientText>Travel Safer.</GradientText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.16, ease: EASE }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted"
          >
            Sentinel AI predicts unsafe locations before incidents occur using explainable AI and real-time safety intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link to="/map">
              <RippleButton variant="primary" className="group">
                Try Live Map
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </RippleButton>
            </Link>
            <Link to="/route">
              <RippleButton variant="ghost" className="group">
                <Play className="h-4 w-4 text-primary" />
                Watch Demo
              </RippleButton>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex items-center gap-6 text-sm text-ink-faint"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              No black-box predictions
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <CheckCircle2 className="h-4 w-4 text-success" />
              90-second refresh
            </div>
          </motion.div>
        </div>

        {/* Animated 3D safety map with parallax tilt + floating cards */}
        <TiltMap />
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg-base to-transparent" />
    </section>
  );
}

function TiltMap() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div className="relative" style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: EASE }}
        className="relative"
      >
        <div className="relative rounded-3xl border border-white/10 bg-bg-card/60 p-2 shadow-soft-lg backdrop-blur-xl">
          <AnimatedMapCanvas className="aspect-[4/3] w-full" showRoute showHeat />
          {/* Map chrome */}
          <div className="absolute left-5 top-5 flex items-center gap-2">
            <span className="glass rounded-lg px-2.5 py-1 text-[11px] font-medium text-ink-muted">
              New York · Live
            </span>
            <span className="glass flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Streaming
            </span>
          </div>
        </div>

        {/* Floating AI cards */}
        <FloatingCard className="absolute -left-4 top-24 hidden sm:block" delay={0.9} y={[-10, 0, -10]} duration={5}>
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-danger/15">
              <Activity className="h-4 w-4 text-danger" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Risk spike detected</p>
              <p className="text-[11px] text-ink-faint">Mill Rd · Junction 7</p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard className="absolute -right-2 top-44 hidden sm:block" delay={1.2} y={[0, -12, 0]} duration={6}>
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-success/15">
              <ShieldCheck className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Route rerouted</p>
              <p className="text-[11px] text-ink-faint">Risk cut by 73%</p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard className="absolute bottom-8 left-6 hidden md:block" delay={1.5} y={[-8, 4, -8]} duration={7}>
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">AI confidence 94.3%</p>
              <p className="text-[11px] text-ink-faint">6h forecast horizon</p>
            </div>
          </div>
        </FloatingCard>
      </motion.div>
    </div>
  );
}

function FloatingCard({
  children,
  className,
  delay,
  y,
  duration,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  y: number[];
  duration: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className={className}
      style={{ transform: 'translateZ(60px)' }}
    >
      <motion.div
        animate={{ y }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        className="glass-strong rounded-2xl p-3.5 shadow-soft-lg"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// --- Stats band -------------------------------------------------------------

function StatsBand() {
  return (
    <Section className="!py-16">
      <Reveal>
        <div className="grid grid-cols-2 gap-8 rounded-3xl border border-white/5 glass-card p-8 md:grid-cols-4 md:p-10">
          {heroStats.map((s) => (
            <StatCounter key={s.label} value={s.value} decimals={s.decimals} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

// --- Features ---------------------------------------------------------------

function Features() {
  return (
    <Section id="features">
      <Reveal>
        <Eyebrow>Capabilities</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-display-lg font-semibold tracking-tight text-ink">
          Six systems working as <GradientText>one intelligence</GradientText>.
        </h2>
        <p className="mt-4 max-w-xl text-ink-muted">
          Each layer feeds the next — from raw signals on the street to a number you can act on, with the reasoning attached.
        </p>
      </Reveal>

      <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = iconMap[f.icon] ?? Sparkles;
          return (
            <StaggerItem key={f.title}>
              <Card className="group h-full overflow-hidden">
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${f.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                <div className="relative">
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:scale-110 group-hover:border-primary/30">
                    <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{f.desc}</p>
                </div>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </Section>
  );
}

// --- Map preview -----------------------------------------------------------

function MapPreview() {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <Reveal>
          <Eyebrow>Explainable AI</Eyebrow>
          <h2 className="mt-4 text-display-md font-semibold tracking-tight text-ink">
            Every score comes with <GradientText>the why</GradientText>.
          </h2>
          <p className="mt-4 text-ink-muted">
            No black boxes. Tap any block and Sentinel shows the top signals driving the prediction — ranked, weighted, and written in plain language.
          </p>

          <div className="mt-8 space-y-3">
            {aiExplanation.drivers.map((d, i) => (
              <div key={d.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink">{d.label}</span>
                  <span className="text-ink-faint tnum">{d.contribution}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${d.contribution}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1, ease: EASE }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Link to="/map" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-secondary">
            Explore the live map <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal delay={1}>
          <div className="relative rounded-3xl border border-white/10 bg-bg-card/60 p-2 shadow-soft-lg">
            <AnimatedMapCanvas className="aspect-[5/4] w-full" interactive showRoute showHeat />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

// --- Testimonials -----------------------------------------------------------

function Testimonials() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>Trusted by operators</Eyebrow>
        <h2 className="mt-4 text-display-lg font-semibold tracking-tight text-ink">
          The teams who can't afford <GradientText>to be wrong</GradientText>.
        </h2>
      </Reveal>

      <StaggerGroup className="mt-14 grid gap-5 md:grid-cols-2">
        {testimonials.map((t) => (
          <StaggerItem key={t.name}>
            <Card className="h-full">
              <Quote className="h-7 w-7 text-primary/40" />
              <p className="mt-4 text-[15px] leading-relaxed text-ink">{t.quote}</p>
              <div className="mt-6 flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10" loading="lazy" />
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink-faint">{t.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                  ))}
                </div>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Section>
  );
}

// --- FAQ --------------------------------------------------------------------

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-4 text-display-md font-semibold tracking-tight text-ink">Questions, answered.</h2>
          <p className="mt-4 text-ink-muted">
            Everything you'd want to know before trusting an AI with a routing decision.
          </p>
        </Reveal>

        <Reveal delay={1}>
          <div className="divide-y divide-white/5 rounded-2xl border border-white/5 glass-card">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    <span className="text-[15px] font-medium text-ink">{f.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5"
                    >
                      {isOpen ? <Minus className="h-4 w-4 text-ink" /> : <Plus className="h-4 w-4 text-ink-muted" />}
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-ink-muted">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

// --- Final CTA --------------------------------------------------------------

function CTA() {
  return (
    <Section>
      <Reveal>
        <div className="relative overflow-hidden rounded-4xl border border-white/10 glass-card p-10 text-center md:p-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-0 left-1/4 h-[200px] w-[400px] rounded-full bg-secondary/15 blur-[80px]" />
          </div>
          <div className="relative">
            <span className="chip mx-auto">
              <Sparkles className="h-3 w-3 text-primary" />
              Start in seconds
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl text-display-md font-semibold tracking-tight text-ink">
              See your city the way <GradientText>Sentinel sees it</GradientText>.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ink-muted">
              Open the live map, drop a pin, and watch the model explain a block in real time.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/map">
                <RippleButton variant="primary" className="group">
                  Try Live Map
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </RippleButton>
              </Link>
              <Link to="/dashboard">
                <RippleButton variant="ghost">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  View Dashboard
                </RippleButton>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
