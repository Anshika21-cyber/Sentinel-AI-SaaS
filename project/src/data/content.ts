// Centralized mock data for Sentinel AI prototype.
// Realistic, no placeholder lorem — every string is intentional.

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface SafetyScore {
  overall: number; // 0-100, higher = safer
  lighting: number;
  crowd: number;
  incidents: number;
  surveillance: number;
}

export interface RiskFactor {
  id: string;
  label: string;
  level: RiskLevel;
  weight: number; // 0-1 contribution
  detail: string;
}

export interface IncidentMarker {
  id: string;
  lat: number;
  lng: number;
  x: number; // canvas-space 0-100
  y: number; // canvas-space 0-100
  type: 'theft' | 'assault' | 'nuisance' | 'traffic' | 'harassment';
  severity: RiskLevel;
  time: string;
  verified: boolean;
}

export interface ReportItem {
  id: string;
  title: string;
  area: string;
  category: 'Theft' | 'Harassment' | 'Nuisance' | 'Lighting' | 'Traffic' | 'Suspicious';
  severity: RiskLevel;
  trustScore: number; // 0-100
  reporter: string;
  time: string;
  verified: boolean;
  endorsements: number;
  photo: string;
  description: string;
}

export interface Hotspot {
  id: string;
  area: string;
  score: number;
  trend: number; // delta vs yesterday
  topFactor: string;
}

// --- Landing stats ----------------------------------------------------------

export const heroStats = [
  { label: 'Locations mapped', value: 1.2, suffix: 'M+', decimals: 1 },
  { label: 'Predictions / day', value: 847, suffix: 'K', decimals: 0 },
  { label: 'Avg. accuracy', value: 94.3, suffix: '%', decimals: 1 },
  { label: 'Cities live', value: 312, suffix: '', decimals: 0 },
];

// --- Features ---------------------------------------------------------------

export const features = [
  {
    icon: 'Dna',
    title: 'Dynamic Safety DNA',
    desc: 'Every street gets a living fingerprint — fusing time, weather, footfall, and incident history into a score that updates every 90 seconds.',
    accent: 'from-blue-500/20 to-blue-500/0',
  },
  {
    icon: 'MapPin',
    title: 'Hyperlocal Risk Detection',
    desc: 'Block-level resolution. Sentinel reads the difference between two sides of the same avenue and warns you before the gap matters.',
    accent: 'from-cyan-500/20 to-cyan-500/0',
  },
  {
    icon: 'Sparkles',
    title: 'Explainable AI',
    desc: 'No black boxes. Every prediction ships with a human-readable rationale — the top three signals that drove the model, ranked.',
    accent: 'from-emerald-500/20 to-emerald-500/0',
  },
  {
    icon: 'Route',
    title: 'Safe Route Recommendation',
    desc: 'The fastest path isn\'t always the smartest. Sentinel balances minutes against risk to find the route you\'d actually choose.',
    accent: 'from-blue-500/20 to-blue-500/0',
  },
  {
    icon: 'Users',
    title: 'Community Trust Engine',
    desc: 'Reports weighted by verified reputation, not volume. One trusted local outweighs a hundred anonymous flags.',
    accent: 'from-amber-500/20 to-amber-500/0',
  },
  {
    icon: 'BrainCircuit',
    title: 'Predictive Safety Intelligence',
    desc: 'A temporal graph neural network forecasts hotspots up to 6 hours ahead — so cities act before incidents, not after.',
    accent: 'from-cyan-500/20 to-cyan-500/0',
  },
];

// --- Testimonials -----------------------------------------------------------

export const testimonials = [
  {
    quote:
      'Sentinel flagged a corridor our analysts had cleared. Two hours later, three incidents clustered exactly where it predicted. We rebuilt our patrol grid around it.',
    name: 'Lt. Mara Velez',
    role: 'Tactical Planning, Metro PD',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    quote:
      'The explanation panel is the whole product. My team can defend every routing decision in front of a review board without opening a notebook.',
    name: 'Dr. Idris Kahn',
    role: 'Director of Urban Safety, Civic Labs',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    quote:
      'We rolled it out to 4,000 field staff in a week. Onboarding was zero — the map just makes sense, and the trust score killed the noise.',
    name: 'Sofia Bergstrom',
    role: 'VP Operations, Northwind Logistics',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
  {
    quote:
      'I used to reroute deliveries on gut feel. Now I reroute on a number I can audit. Insurance loss dropped 18% in the first quarter.',
    name: 'Marcus Hale',
    role: 'Fleet Safety Lead, CourierOne',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  },
];

// --- FAQ --------------------------------------------------------------------

export const faqs = [
  {
    q: 'How does Sentinel predict incidents before they happen?',
    a: 'We train a temporal graph neural network on five years of anonymized incident, mobility, lighting, and weather data. The model learns the precursors — the quiet signals that precede a cluster — and emits a probability surface that refreshes every 90 seconds.',
  },
  {
    q: 'Is the AI explainable? Can I audit a prediction?',
    a: 'Yes. Every score is paired with an explanation card listing the top contributing factors, their weights, and a plain-language rationale. No prediction ships without a reason you can read in under ten seconds.',
  },
  {
    q: 'Where does the community report data come from?',
    a: 'Verified users submit reports through the app. Each report carries the reporter\'s trust score, earned through endorsements and accuracy over time. Anonymous reports are deprioritized, never amplified.',
  },
  {
    q: 'Does Sentinel share or sell personal location data?',
    a: 'Never. Location is processed ephemerally to compute a score, then discarded. We publish a public data handling policy and undergo annual third-party audits.',
  },
  {
    q: 'Can I integrate Sentinel into my own platform?',
    a: 'Yes — a REST and streaming API is available on the Scale plan, returning scores, explanations, and route recommendations as JSON or Server-Sent Events.',
  },
  {
    q: 'Which cities are currently live?',
    a: '312 metros across North America, Europe, and parts of APAC. Coverage expands monthly; the Live Map shows the active boundary for any queried region.',
  },
];

// --- Live map ----------------------------------------------------------------

export const incidents: IncidentMarker[] = [
  { id: 'i1', lat: 40.741, lng: -73.99, x: 22, y: 30, type: 'theft', severity: 'high', time: '14m ago', verified: true },
  { id: 'i2', lat: 40.749, lng: -73.985, x: 38, y: 22, type: 'harassment', severity: 'moderate', time: '32m ago', verified: true },
  { id: 'i3', lat: 40.735, lng: -73.975, x: 54, y: 48, type: 'nuisance', severity: 'low', time: '1h ago', verified: false },
  { id: 'i4', lat: 40.755, lng: -73.97, x: 66, y: 18, type: 'traffic', severity: 'moderate', time: '8m ago', verified: true },
  { id: 'i5', lat: 40.73, lng: -73.995, x: 18, y: 62, type: 'assault', severity: 'critical', time: '46m ago', verified: true },
  { id: 'i6', lat: 40.745, lng: -73.965, x: 72, y: 58, type: 'theft', severity: 'high', time: '22m ago', verified: true },
  { id: 'i7', lat: 40.76, lng: -73.985, x: 44, y: 68, type: 'nuisance', severity: 'low', time: '2h ago', verified: false },
  { id: 'i8', lat: 40.752, lng: -73.978, x: 58, y: 38, type: 'harassment', severity: 'moderate', time: '19m ago', verified: true },
];

export const riskFactors: RiskFactor[] = [
  { id: 'f1', label: 'Low foot traffic after 11pm', level: 'high', weight: 0.31, detail: 'Pedestrian density drops 64% vs. weekday baseline in this segment.' },
  { id: 'f2', label: '3 incidents within 400m / 72h', level: 'high', weight: 0.27, detail: 'Cluster of theft reports along the south side of the block.' },
  { id: 'f3', label: 'Streetlight outage reported', level: 'moderate', weight: 0.18, detail: 'Two fixtures non-operational, unresolved for 4 days.' },
  { id: 'f4', label: 'No active CCTV coverage', level: 'moderate', weight: 0.14, detail: 'Nearest verified camera is 220m east, line of sight blocked.' },
  { id: 'f5', label: 'Crowded transit exit', level: 'low', weight: 0.10, detail: 'Bottleneck during evening rush; minor opportunistic risk.' },
];

export const aiExplanation = {
  score: 38,
  summary:
    'This block scores low tonight. Three recent incidents, a streetlight outage, and a sharp drop in foot traffic after 11pm combine to raise predicted risk by 41% versus the neighborhood baseline.',
  confidence: 0.91,
  horizon: '6h forecast',
  drivers: [
    { label: 'Incident clustering', contribution: 31 },
    { label: 'Footfall collapse', contribution: 27 },
    { label: 'Lighting gap', contribution: 18 },
  ],
};

// --- Route planner -----------------------------------------------------------

export const routeOptions = [
  {
    id: 'safest',
    label: 'Safest Route',
    badge: 'Recommended',
    distance: '4.2 km',
    duration: 18,
    risk: 12,
    riskLevel: 'low' as RiskLevel,
    color: '#22C55E',
    reasoning:
      'Routes through two well-lit corridors with active CCTV and steady foot traffic. Adds 6 minutes versus the fastest path but cuts predicted risk by 73%.',
    via: ['Wellington St', 'Lantern Ave', 'Harbor Walk'],
  },
  {
    id: 'fastest',
    label: 'Fastest Route',
    badge: 'Quickest',
    distance: '3.6 km',
    duration: 12,
    risk: 44,
    riskLevel: 'moderate' as RiskLevel,
    color: '#F59E0B',
    reasoning:
      'Shortest path passes through a segment with a recent incident cluster and a known lighting gap. Acceptable in daylight, flagged after dark.',
    via: ['Mill Rd', 'Cutting Lane'],
  },
  {
    id: 'balanced',
    label: 'Balanced Route',
    badge: 'Trade-off',
    distance: '3.9 km',
    duration: 15,
    risk: 24,
    riskLevel: 'low' as RiskLevel,
    color: '#3B82F6',
    reasoning:
      'Avoids the highest-risk segment but keeps most of the distance saving. One stretch has moderate footfall; fine before midnight.',
    via: ['Mill Rd', 'Lantern Ave', 'Harbor Walk'],
  },
];

// --- Community reports -------------------------------------------------------

export const reports: ReportItem[] = [
  {
    id: 'r1',
    title: 'Group of teens harassing commuters near subway exit',
    area: 'Kennington Cross · Zone 2',
    category: 'Harassment',
    severity: 'high',
    trustScore: 92,
    reporter: 'A. Okafor',
    time: '11m ago',
    verified: true,
    endorsements: 47,
    photo: 'https://images.pexels.com/photos/1166644/pexels-photo-1166644.jpeg?auto=compress&cs=tinysrgb&w=900',
    description:
      'Three individuals blocking the east exit of the station, verbally targeting solo travelers around 22:40. Dispersed when approached.',
  },
  {
    id: 'r2',
    title: 'Broken streetlight, dark stretch for 80m',
    area: 'Lantern Ave · Block 14',
    category: 'Lighting',
    severity: 'moderate',
    trustScore: 88,
    reporter: 'M. Reyes',
    time: '38m ago',
    verified: true,
    endorsements: 31,
    photo: 'https://images.pexels.com/photos/259110/pexels-photo-259110.jpeg?auto=compress&cs=tinysrgb&w=900',
    description:
      'Two fixtures out between #14 and #18. Reported to city 4 days ago, still unresolved. Visibility near zero after the tree line.',
  },
  {
    id: 'r3',
    title: 'Phone snatch from e-bike, repeat pattern',
    area: 'Mill Rd · Junction 7',
    category: 'Theft',
    severity: 'high',
    trustScore: 95,
    reporter: 'Verified · Civic Watch',
    time: '1h ago',
    verified: true,
    endorsements: 64,
    photo: 'https://images.pexels.com/photos/259336/pexels-photo-259336.jpeg?auto=compress&cs=tinysrgb&w=900',
    description:
      'Rider on black e-bike snatched phone from pedestrian at crossing. Third incident at this junction this week — clear pattern.',
  },
  {
    id: 'r4',
    title: 'Suspicious van parked, occupants watching footpath',
    area: 'Cutting Lane · North end',
    category: 'Suspicious',
    severity: 'moderate',
    trustScore: 61,
    reporter: 'anonymous',
    time: '1h ago',
    verified: false,
    endorsements: 8,
    photo: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=900',
    description:
      'White panel van, no plates visible, parked for 40+ minutes. Two occupants. Low trust pending verification — flagging for awareness.',
  },
  {
    id: 'r5',
    title: 'Crowd surge after event, narrow bottleneck',
    area: 'Harbor Walk · Pier 3',
    category: 'Nuisance',
    severity: 'low',
    trustScore: 84,
    reporter: 'S. Lindqvist',
    time: '2h ago',
    verified: true,
    endorsements: 22,
    photo: 'https://images.pexels.com/photos/2168974/pexels-photo-2168974.jpeg?auto=compress&cs=tinysrgb&w=900',
    description:
      'Post-event crowd forced through a single gate. No incidents, but a crush risk if repeated. Suggest opening the south gate next time.',
  },
  {
    id: 'r6',
    title: 'Aggressive panhandling at ATM cluster',
    area: 'Wellington St · Plaza',
    category: 'Harassment',
    severity: 'moderate',
    trustScore: 79,
    reporter: 'J. Park',
    time: '3h ago',
    verified: true,
    endorsements: 19,
    photo: 'https://images.pexels.com/photos/210467/pexels-photo-210467.jpeg?auto=compress&cs=tinysrgb&w=900',
    description:
      'Same individual at the Wellington ATM for three evenings. Verbally persistent, not physical. Regulars avoiding the area after dusk.',
  },
];

export const trendingAreas = [
  { area: 'Mill Rd · Junction 7', change: '+38%', trend: 'up', severity: 'high' as RiskLevel },
  { area: 'Kennington Cross', change: '+24%', trend: 'up', severity: 'moderate' as RiskLevel },
  { area: 'Harbor Walk · Pier 3', change: '+12%', trend: 'up', severity: 'low' as RiskLevel },
  { area: 'Lantern Ave · Block 14', change: '-9%', trend: 'down', severity: 'moderate' as RiskLevel },
  { area: 'Wellington Plaza', change: '-15%', trend: 'down', severity: 'low' as RiskLevel },
];

// --- Analytics dashboard -----------------------------------------------------

export const kpis = [
  { id: 'k1', label: "Today's Reports", value: 1284, delta: 12.4, trend: 'up' as const, icon: 'FileText' },
  { id: 'k2', label: 'Active Alerts', value: 37, delta: 5, trend: 'up' as const, icon: 'Siren' },
  { id: 'k3', label: 'Predicted Hotspots', value: 19, delta: -3, trend: 'down' as const, icon: 'Flame' },
  { id: 'k4', label: 'Model Confidence', value: 94.3, suffix: '%', delta: 1.1, trend: 'up' as const, icon: 'Gauge' },
];

export const weeklyIncidents = [
  { day: 'Mon', incidents: 142, predicted: 130 },
  { day: 'Tue', incidents: 168, predicted: 160 },
  { day: 'Wed', incidents: 151, predicted: 155 },
  { day: 'Thu', incidents: 189, predicted: 175 },
  { day: 'Fri', incidents: 224, predicted: 210 },
  { day: 'Sat', incidents: 267, predicted: 255 },
  { day: 'Sun', incidents: 198, predicted: 205 },
];

export const riskDistribution = [
  { name: 'Low', value: 58, color: '#22C55E' },
  { name: 'Moderate', value: 26, color: '#F59E0B' },
  { name: 'High', value: 12, color: '#EF4444' },
  { name: 'Critical', value: 4, color: '#B91C1C' },
];

export const hourlyRisk = [
  { hour: '00', risk: 72 },
  { hour: '03', risk: 81 },
  { hour: '06', risk: 34 },
  { hour: '09', risk: 22 },
  { hour: '12', risk: 18 },
  { hour: '15', risk: 26 },
  { hour: '18', risk: 41 },
  { hour: '21', risk: 63 },
  { hour: '24', risk: 74 },
];

export const activityFeed = [
  { id: 'a1', type: 'prediction', text: 'Hotspot forecast elevated for Mill Rd · J7 (+38%)', time: '2m ago', level: 'high' as RiskLevel },
  { id: 'a2', type: 'report', text: 'New verified report — Harassment, Kennington Cross', time: '11m ago', level: 'high' as RiskLevel },
  { id: 'a3', type: 'resolve', text: 'Streetlight outage on Lantern Ave resolved by city ops', time: '34m ago', level: 'low' as RiskLevel },
  { id: 'a4', type: 'prediction', text: 'Confidence rose to 94.3% across 312 zones', time: '1h ago', level: 'low' as RiskLevel },
  { id: 'a5', type: 'alert', text: 'Critical alert cleared — Wellington Plaza back to baseline', time: '1h ago', level: 'moderate' as RiskLevel },
  { id: 'a6', type: 'report', text: 'Endorsement surge — phone snatch report now 64 endorsements', time: '2h ago', level: 'high' as RiskLevel },
];

// --- About ------------------------------------------------------------------

export const team = [
  {
    name: 'Elena Vasquez',
    role: 'Co-founder & CEO',
    bio: 'Former lead of urban analytics at a national transit authority. Built the first citywide incident-forecasting grid in production.',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  },
  {
    name: 'Rohan Mehta',
    role: 'Co-founder & CTO',
    bio: 'Ex-OpenAI research engineer. Designed the temporal graph architecture at the core of Sentinel\'s prediction engine.',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  },
  {
    name: 'Lina Park',
    role: 'Head of Explainability',
    bio: 'PhD in interpretable ML. Wrote the rationale layer that turns model gradients into sentences a patrol officer can act on.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  },
  {
    name: 'Tomás Ferreira',
    role: 'Head of Community',
    bio: 'Built trust-score systems for two civic-tech platforms. Sentinel\'s verification engine runs on his reputation model.',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  },
];

export const aboutTech = [
  {
    icon: 'BrainCircuit',
    title: 'Temporal Graph Neural Network',
    desc: 'Street segments are nodes; movement, time, and incident history are edges. The model learns how risk propagates through a city\'s topology.',
  },
  {
    icon: 'Sparkles',
    title: 'Rationale Layer',
    desc: 'A secondary model translates gradient attributions into ranked, plain-language drivers — the "why" behind every score.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Federated Trust Scoring',
    desc: 'Community reports are weighted by per-user reputation earned through verified accuracy, not raw submission volume.',
  },
  {
    icon: 'Gauge',
    title: '90-Second Refresh',
    desc: 'Inference re-runs every 90 seconds against live mobility and incident streams, so the map you see is never more than a minute stale.',
  },
];
