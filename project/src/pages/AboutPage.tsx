import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Gauge,
  Target,
  Eye,
  ArrowRight,
  CheckCircle2,
  Quote,
} from 'lucide-react';
import { Section, Eyebrow, Reveal, GradientText, Card } from '@/components/ui/Primitives';
import { team, aboutTech } from '@/data/content';

const techIcons: Record<string, typeof BrainCircuit> = {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  Gauge,
};

const missionPoints = [
  'Make every street predictable — not through surveillance, but through intelligence.',
  'Replace gut-feel routing with a number anyone can audit in ten seconds.',
  'Earn community trust through verification, not anonymity.',
  'Surface risk from the reports that signal it — before it makes the news.',
];

export function AboutPage() {
  return (
    <div className="relative pt-24">
      {/* Hero */}
      <section className="relative overflow-hidden pb-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <Eyebrow>About Sentinel AI</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-display-lg font-semibold tracking-tight text-ink">
              We build the layer that lets cities <GradientText>see around corners</GradientText>.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
              Sentinel AI is a community-powered safety platform. We turn reports from people on the ground into a transparent area risk score you can act on — with the reasoning attached.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Vision + Mission */}
      <Section id="mission" className="!pt-12">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Vision */}
          <Reveal>
            <Card hover={false} className="h-full">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-ink">Vision</h2>
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">
                A world where no one walks into a dangerous block by accident. Where the safety of a street is as legible as its name on a map — and where the score that flagged it can tell you exactly why.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                We believe predictive safety is a public good. It should be explainable, auditable, and built with the communities it serves — not imposed on them.
              </p>
            </Card>
          </Reveal>

          {/* Mission */}
          <Reveal delay={1}>
            <Card hover={false} className="h-full bg-gradient-to-b from-primary/[0.05] to-transparent">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/15">
                  <Target className="h-5 w-5 text-secondary" />
                </div>
                <h2 className="text-lg font-semibold text-ink">Mission</h2>
              </div>
              <ul className="mt-5 space-y-3.5">
                {missionPoints.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-[15px] leading-relaxed text-ink-muted">{p}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* Technology */}
      <Section id="technology" className="!pt-8">
        <Reveal>
          <Eyebrow>Technology</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-display-md font-semibold tracking-tight text-ink">
            The stack behind <GradientText>every score</GradientText>.
          </h2>
          <p className="mt-4 max-w-xl text-ink-muted">
            Four systems, working in concert — from a report on the street to a score you can trace.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {aboutTech.map((t, i) => {
            const Icon = techIcons[t.icon] ?? Sparkles;
            return (
              <Reveal key={t.title} delay={i % 2}>
                <Card className="group h-full">
                  <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 transition-colors group-hover:border-primary/30">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-ink">{t.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.desc}</p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Explainable AI deep dive */}
      <Section className="!pt-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl border border-white/10 glass-card p-8 md:p-12">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-0 top-0 h-[300px] w-[400px] rounded-full bg-secondary/15 blur-[100px]" />
            </div>
            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <Eyebrow>Transparent scoring</Eyebrow>
                <h2 className="mt-4 text-display-md font-semibold tracking-tight text-ink">
                  No black boxes. <GradientText>Ever.</GradientText>
                </h2>
                <p className="mt-4 text-ink-muted">
                  Every score is a rule-based blend of report severity, corroboration, reporter trust, and time of day. Those factors are listed right next to the score — so a patrol officer, a fleet dispatcher, or a review board can trace the decision without opening a notebook.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    'Ranked factor cards with contribution weights',
                    'Corroboration and time-of-day signals',
                    'Plain-language rationale under 60 words',
                    'Every factor traceable to a report',
                  ].map((p) => (
                    <div key={p} className="flex items-center gap-2.5 text-sm text-ink">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock explanation card */}
              <div className="rounded-2xl border border-white/10 bg-bg-elev/60 p-6 backdrop-blur">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-ink">Sample area score</span>
                  <span className="ml-auto text-xs text-ink-faint">Tonight</span>
                </div>
                <div className="mt-4 rounded-xl bg-danger/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-danger">High risk · score 38</span>
                    <span className="text-xs text-ink-faint">4 reports · 2 corroborated</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink">
                    Three recent reports in this area, two of them corroborated, plus a late-night time boost, combine to raise the score 41% above daytime baseline.
                  </p>
                </div>
                <div className="mt-4 space-y-2.5">
                  {[
                    { l: 'Report severity load', v: 31 },
                    { l: 'Late-night time boost', v: 27 },
                    { l: 'Reporter trust', v: 18 },
                  ].map((d, i) => (
                    <div key={d.l}>
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-muted">{d.l}</span>
                        <span className="text-ink-faint">{d.v}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${d.v}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Team */}
      <Section id="team" className="!pt-8">
        <Reveal>
          <Eyebrow>Team</Eyebrow>
          <h2 className="mt-4 text-display-md font-semibold tracking-tight text-ink">
            The people behind <GradientText>Sentinel</GradientText>.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i % 4}>
              <Card className="group h-full text-center">
                <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-2xl ring-2 ring-white/10">
                  <img src={m.avatar} alt={m.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-ink">{m.name}</h3>
                <p className="mt-1 text-xs font-medium text-primary">{m.role}</p>
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">{m.bio}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Closing quote */}
      <Section className="!pt-4">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <Quote className="mx-auto h-8 w-8 text-primary/40" />
            <p className="mt-6 text-2xl font-medium leading-snug tracking-tight text-ink md:text-3xl">
              "The best safety system is the one that explains itself — and then gets out of your way."
            </p>
            <p className="mt-5 text-sm text-ink-faint">Elena Vasquez · Co-founder & CEO</p>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-14 flex flex-col items-center gap-4">
            <Link to="/map" className="btn-primary group">
              See it in action
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
