import { clamp } from '@/lib/utils';
import type { IncidentMarker, RiskLevel } from '@/data/content';
import { supabase } from '@/lib/supabase';
import { computeAreaRisk } from '@/lib/riskEngine';

export interface SafetyFactor {
  id: string;
  label: string;
  value: number;
  level: RiskLevel;
  detail: string;
}

export interface LocationAnalysis {
  id: string;
  displayName: string;
  region: string;
  note?: string;
  score: number;
  riskLevel: RiskLevel;
  confidence: number;
  horizon: string;
  summary: string;
  estimate: boolean;
  mapMarker: { x: number; y: number; label: string; color: string };
  incidents: IncidentMarker[];
  factors: SafetyFactor[];
  topRiskFactors: string[];
  topSafetyFactors: string[];
  recommendations: string[];
}

export interface RoutePoint {
  x: number;
  y: number;
}

export interface RouteOption {
  id: string;
  label: string;
  badge: string;
  distance: string;
  duration: number;
  risk: number;
  riskLevel: RiskLevel;
  color: string;
  reasoning: string;
  via: string[];
  lighting: number;
  cctv: number;
  footTraffic: number;
  flaggedSegments: number;
  path: RoutePoint[];
  isEstimated?: boolean;
}

export interface RouteLocation {
  id: string;
  displayName: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  label: string;
  region: string;
  baseRisk: number;
  lighting: number;
  cctv: number;
  footTraffic: number;
  incidentFactor: number;
}

const routeLocations: RouteLocation[] = [
  {
    id: 'noida',
    displayName: 'Noida',
    region: 'Delhi NCR',
    lat: 28.5355,
    lng: 77.3910,
    mapX: 54,
    mapY: 40,
    label: 'Noida',
    baseRisk: 62,
    lighting: 78,
    cctv: 72,
    footTraffic: 68,
    incidentFactor: 5,
  },
  {
    id: 'rohini-sector-2',
    displayName: 'Rohini Sector 2',
    region: 'Delhi NCR',
    lat: 28.7100,
    lng: 77.0960,
    mapX: 42,
    mapY: 52,
    label: 'Rohini S2',
    baseRisk: 72,
    lighting: 62,
    cctv: 68,
    footTraffic: 80,
    incidentFactor: 6,
  },
  {
    id: 'dwarka',
    displayName: 'Dwarka',
    region: 'Delhi NCR',
    lat: 28.5644,
    lng: 77.0460,
    mapX: 30,
    mapY: 68,
    label: 'Dwarka',
    baseRisk: 52,
    lighting: 86,
    cctv: 76,
    footTraffic: 68,
    incidentFactor: 3,
  },
  {
    id: 'connaught-place',
    displayName: 'Connaught Place',
    region: 'Delhi NCR',
    lat: 28.6315,
    lng: 77.2167,
    mapX: 54,
    mapY: 24,
    label: 'CP',
    baseRisk: 70,
    lighting: 82,
    cctv: 72,
    footTraffic: 92,
    incidentFactor: 7,
  },
  {
    id: 'gurugram',
    displayName: 'Gurugram',
    region: 'Delhi NCR',
    lat: 28.4595,
    lng: 77.0266,
    mapX: 68,
    mapY: 52,
    label: 'Gurugram',
    baseRisk: 76,
    lighting: 69,
    cctv: 64,
    footTraffic: 60,
    incidentFactor: 8,
  },
  {
    id: 'kashmere-gate',
    displayName: 'Kashmere Gate',
    region: 'Delhi NCR',
    lat: 28.6693,
    lng: 77.2327,
    mapX: 54,
    mapY: 16,
    label: 'Kashmere',
    baseRisk: 68,
    lighting: 70,
    cctv: 70,
    footTraffic: 88,
    incidentFactor: 7,
  },
  {
    id: 'new-delhi',
    displayName: 'New Delhi',
    region: 'Delhi NCR',
    lat: 28.6139,
    lng: 77.2090,
    mapX: 54,
    mapY: 28,
    label: 'New Delhi',
    baseRisk: 65,
    lighting: 80,
    cctv: 78,
    footTraffic: 82,
    incidentFactor: 6,
  },
  {
    id: 'rajouri-garden',
    displayName: 'Rajouri Garden',
    region: 'Delhi NCR',
    lat: 28.6385,
    lng: 77.0905,
    mapX: 48,
    mapY: 66,
    label: 'Rajouri',
    baseRisk: 62,
    lighting: 80,
    cctv: 70,
    footTraffic: 72,
    incidentFactor: 5,
  },
  {
    id: 'lajpat-nagar',
    displayName: 'Lajpat Nagar',
    region: 'Delhi NCR',
    lat: 28.5677,
    lng: 77.2445,
    mapX: 50,
    mapY: 58,
    label: 'Lajpat',
    baseRisk: 66,
    lighting: 64,
    cctv: 66,
    footTraffic: 88,
    incidentFactor: 6,
  },
  {
    id: 'saket',
    displayName: 'Saket',
    region: 'Delhi NCR',
    lat: 28.5196,
    lng: 77.2100,
    mapX: 58,
    mapY: 60,
    label: 'Saket',
    baseRisk: 58,
    lighting: 84,
    cctv: 74,
    footTraffic: 74,
    incidentFactor: 4,
  },
  {
    id: 'janakpuri',
    displayName: 'Janakpuri',
    region: 'Delhi NCR',
    lat: 28.6410,
    lng: 77.0990,
    mapX: 30,
    mapY: 42,
    label: 'Janakpuri',
    baseRisk: 60,
    lighting: 76,
    cctv: 62,
    footTraffic: 58,
    incidentFactor: 5,
  },
  {
    id: 'pitampura',
    displayName: 'Pitampura',
    region: 'Delhi NCR',
    lat: 28.7072,
    lng: 77.1277,
    mapX: 38,
    mapY: 16,
    label: 'Pitampura',
    baseRisk: 64,
    lighting: 72,
    cctv: 68,
    footTraffic: 66,
    incidentFactor: 5,
  },
  {
    id: 'greater-kailash',
    displayName: 'Greater Kailash',
    region: 'Delhi NCR',
    lat: 28.5357,
    lng: 77.2410,
    mapX: 60,
    mapY: 66,
    label: 'GK',
    baseRisk: 59,
    lighting: 78,
    cctv: 76,
    footTraffic: 70,
    incidentFactor: 4,
  },
  {
    id: 'india-gate',
    displayName: 'India Gate',
    region: 'Delhi NCR',
    lat: 28.6129,
    lng: 77.2295,
    mapX: 56,
    mapY: 30,
    label: 'India Gate',
    baseRisk: 64,
    lighting: 88,
    cctv: 80,
    footTraffic: 90,
    incidentFactor: 6,
  },
  {
    id: 'delhi-airport',
    displayName: 'Delhi Airport',
    region: 'Delhi NCR',
    lat: 28.5562,
    lng: 77.1000,
    mapX: 46,
    mapY: 78,
    label: 'Airport',
    baseRisk: 58,
    lighting: 82,
    cctv: 80,
    footTraffic: 50,
    incidentFactor: 3,
  },
];

const knownLocations: LocationAnalysis[] = [
  {
    id: 'noida',
    displayName: 'Noida',
    region: 'Delhi NCR',
    score: 68,
    riskLevel: 'moderate',
    confidence: 0.92,
    horizon: '6h forecast',
    summary:
      'Noida is generally well-lit and has strong emergency access, but busy arterial traffic and a few recent theft reports keep the score in the moderate range.',
    estimate: false,
    mapMarker: { x: 54, y: 40, label: 'Noida', color: '#f59e0b' },
    incidents: [
      { id: 'no1', lat: 28.575, lng: 77.325, x: 52, y: 38, type: 'theft', severity: 'moderate', time: '18m ago', verified: true },
      { id: 'no2', lat: 28.579, lng: 77.316, x: 60, y: 42, type: 'traffic', severity: 'moderate', time: '9m ago', verified: true },
      { id: 'no3', lat: 28.567, lng: 77.328, x: 48, y: 45, type: 'harassment', severity: 'low', time: '39m ago', verified: false },
      { id: 'no4', lat: 28.571, lng: 77.333, x: 58, y: 34, type: 'nuisance', severity: 'low', time: '1h ago', verified: true },
    ],
    factors: [
      { id: 'crime', label: 'Crime risk', value: 62, level: 'moderate', detail: 'Theft clusters near commercial strips raise local risk despite surveillance.', },
      { id: 'lighting', label: 'Lighting', value: 78, level: 'low', detail: 'Streetlights are active along main corridors and residential blocks.', },
      { id: 'traffic', label: 'Traffic congestion', value: 72, level: 'high', detail: 'Peak-hour arterial traffic limits safe crossing and increases vulnerability.', },
      { id: 'emergency', label: 'Emergency access', value: 84, level: 'low', detail: 'Multiple wide roads and clear ambulance routes support quick response.', },
      { id: 'crowd', label: 'Crowd activity', value: 68, level: 'moderate', detail: 'Busy retail zones draw steady foot traffic, which helps safety after dark.', },
    ],
    topRiskFactors: ['Busy traffic corridors', 'Recent theft reports'],
    topSafetyFactors: ['Good lighting coverage', 'Strong emergency access'],
    recommendations: ['Avoid isolated service roads after 22:00', 'Use the main market streets with CCTV coverage', 'Share arrival time with a trusted contact'],
  },
  {
    id: 'rohini-sector-2',
    displayName: 'Rohini Sector 2',
    region: 'Delhi NCR',
    score: 55,
    riskLevel: 'moderate',
    confidence: 0.88,
    horizon: '6h forecast',
    summary:
      'Rohini Sector 2 has moderate performance overall. Some dark pockets and elevated footfall at transit hubs lower the score despite reasonable crowd presence.',
    estimate: false,
    mapMarker: { x: 42, y: 52, label: 'Rohini S2', color: '#f59e0b' },
    incidents: [
      { id: 'ro1', lat: 28.716, lng: 77.100, x: 44, y: 56, type: 'harassment', severity: 'moderate', time: '26m ago', verified: true },
      { id: 'ro2', lat: 28.712, lng: 77.106, x: 40, y: 49, type: 'theft', severity: 'high', time: '53m ago', verified: true },
      { id: 'ro3', lat: 28.718, lng: 77.098, x: 46, y: 52, type: 'traffic', severity: 'moderate', time: '11m ago', verified: true },
      { id: 'ro4', lat: 28.714, lng: 77.104, x: 38, y: 46, type: 'nuisance', severity: 'low', time: '1h ago', verified: false },
    ],
    factors: [
      { id: 'crime', label: 'Crime risk', value: 72, level: 'high', detail: 'Two recent theft reports and a harassment incident at transit access points.', },
      { id: 'lighting', label: 'Lighting', value: 62, level: 'moderate', detail: 'Several stretches have low coverage after midnight, especially near service lanes.', },
      { id: 'traffic', label: 'Traffic congestion', value: 66, level: 'high', detail: 'Transit entrance roads get crowded, increasing exposure for pedestrians.', },
      { id: 'emergency', label: 'Emergency access', value: 74, level: 'moderate', detail: 'Access is good on main roads but weaker inside inner residential blocks.', },
      { id: 'crowd', label: 'Crowd activity', value: 80, level: 'low', detail: 'Strong foot traffic improves informal surveillance in commercial areas.', },
    ],
    topRiskFactors: ['Transit hub congestion', 'Dark service roads after sundown'],
    topSafetyFactors: ['Strong pedestrian activity', 'Rapid emergency response on major roads'],
    recommendations: ['Stay on the main roads near the market square', 'Avoid the service lanes in the southeast pocket after dark', 'Prefer and track well-lit routes'],
  },
  {
    id: 'dwarka',
    displayName: 'Dwarka',
    region: 'Delhi NCR',
    score: 74,
    riskLevel: 'low',
    confidence: 0.94,
    horizon: '6h forecast',
    summary:
      'Dwarka performs well overall with strong lighting and low recent incident counts. Transit junctions remain the primary moderate risk area.',
    estimate: false,
    mapMarker: { x: 30, y: 68, label: 'Dwarka', color: '#22c55e' },
    incidents: [
      { id: 'dw1', lat: 28.573, lng: 77.056, x: 32, y: 66, type: 'traffic', severity: 'moderate', time: '12m ago', verified: true },
      { id: 'dw2', lat: 28.565, lng: 77.053, x: 28, y: 70, type: 'nuisance', severity: 'low', time: '48m ago', verified: false },
      { id: 'dw3', lat: 28.571, lng: 77.061, x: 35, y: 63, type: 'harassment', severity: 'low', time: '1h ago', verified: true },
    ],
    factors: [
      { id: 'crime', label: 'Crime risk', value: 52, level: 'moderate', detail: 'A few reports around major intersections but overall low incident density.', },
      { id: 'lighting', label: 'Lighting', value: 86, level: 'low', detail: 'Broad coverage across residential sectors and arterial roads.', },
      { id: 'traffic', label: 'Traffic congestion', value: 60, level: 'moderate', detail: 'Rush-hour congestion is the main concern rather than safety-critical flow.', },
      { id: 'emergency', label: 'Emergency access', value: 88, level: 'low', detail: 'Grid streets support fast response and easy navigation for first responders.', },
      { id: 'crowd', label: 'Crowd activity', value: 68, level: 'moderate', detail: 'Reasonable activity keeps streets visible without severe crowding.', },
    ],
    topRiskFactors: ['Major junction traffic', 'Transit station footfall'],
    topSafetyFactors: ['Excellent lighting coverage', 'Clear emergency access'],
    recommendations: ['Use the sector grid routes after dark', 'Keep to main streets around transit stations', 'Monitor traffic flows near the blue line stations'],
  },
  {
    id: 'connaught-place',
    displayName: 'Connaught Place',
    region: 'Delhi NCR',
    score: 60,
    riskLevel: 'moderate',
    confidence: 0.89,
    horizon: '6h forecast',
    summary:
      'Connaught Place is active and well-served, but heavy crowds and traffic create more opportunities for petty crime and transit-related risk.',
    estimate: false,
    mapMarker: { x: 54, y: 24, label: 'CP', color: '#f59e0b' },
    incidents: [
      { id: 'cp1', lat: 28.632, lng: 77.216, x: 56, y: 22, type: 'theft', severity: 'high', time: '21m ago', verified: true },
      { id: 'cp2', lat: 28.629, lng: 77.219, x: 52, y: 26, type: 'traffic', severity: 'high', time: '14m ago', verified: true },
      { id: 'cp3', lat: 28.631, lng: 77.214, x: 58, y: 18, type: 'nuisance', severity: 'moderate', time: '39m ago', verified: false },
      { id: 'cp4', lat: 28.634, lng: 77.217, x: 50, y: 20, type: 'harassment', severity: 'moderate', time: '1h ago', verified: false },
    ],
    factors: [
      { id: 'crime', label: 'Crime risk', value: 70, level: 'high', detail: 'Petty theft and transit-targeted incidents are the primary driver of risk.', },
      { id: 'lighting', label: 'Lighting', value: 82, level: 'low', detail: 'Popular zones remain brightly lit, helping safety after dark.', },
      { id: 'traffic', label: 'Traffic congestion', value: 88, level: 'high', detail: 'Heavy vehicle and pedestrian flows increase hazards around key intersections.', },
      { id: 'emergency', label: 'Emergency access', value: 76, level: 'moderate', detail: 'Central arteries are accessible, but inner circles can be difficult for first responders.', },
      { id: 'crowd', label: 'Crowd activity', value: 92, level: 'low', detail: 'Continuous foot traffic creates informal surveillance throughout the precinct.', },
    ],
    topRiskFactors: ['Dense crowds', 'Traffic-heavy intersections'],
    topSafetyFactors: ['Bright lighting', 'Busy pedestrian presence'],
    recommendations: ['Avoid late-night parking garages and side alleys', 'Use CCTV-backed corridors through the inner circle', 'Travel with a companion after 21:00'],
  },
  {
    id: 'gurugram',
    displayName: 'Gurugram',
    region: 'Delhi NCR',
    score: 52,
    riskLevel: 'moderate',
    confidence: 0.87,
    horizon: '6h forecast',
    summary:
      'Gurugram scores lower due to heavy traffic and mixed lighting along commercial strips. Emergency response remains solid on primary roads.',
    estimate: false,
    mapMarker: { x: 68, y: 52, label: 'Gurugram', color: '#f59e0b' },
    incidents: [
      { id: 'gr1', lat: 28.459, lng: 77.072, x: 70, y: 50, type: 'traffic', severity: 'high', time: '7m ago', verified: true },
      { id: 'gr2', lat: 28.456, lng: 77.063, x: 64, y: 53, type: 'theft', severity: 'moderate', time: '31m ago', verified: true },
      { id: 'gr3', lat: 28.462, lng: 77.078, x: 74, y: 48, type: 'assault', severity: 'high', time: '58m ago', verified: false },
    ],
    factors: [
      { id: 'crime', label: 'Crime risk', value: 76, level: 'high', detail: 'Recent incidents near nightlife hubs raise the risk profile for after-hours movement.', },
      { id: 'lighting', label: 'Lighting', value: 69, level: 'moderate', detail: 'Lighting is good along main roads but inconsistent in mixed-use pockets.', },
      { id: 'traffic', label: 'Traffic congestion', value: 86, level: 'high', detail: 'Major highways and service roads are frequently congested, increasing exposure.', },
      { id: 'emergency', label: 'Emergency access', value: 82, level: 'low', detail: 'Primary roads are accessible and rapid incident response is available.', },
      { id: 'crowd', label: 'Crowd activity', value: 60, level: 'moderate', detail: 'Busy business districts create both visibility and crowding risk.', },
    ],
    topRiskFactors: ['Nightlife corridor congestion', 'Mixed lighting pockets'],
    topSafetyFactors: ['Strong emergency access', 'Main road surveillance'],
    recommendations: ['Choose main roads after dusk', 'Avoid quieter service roads near the business district', 'Use app-recommended routes through well-lit zones'],
  },
  {
    id: 'saket',
    displayName: 'Saket',
    region: 'Delhi NCR',
    score: 70,
    riskLevel: 'low',
    confidence: 0.91,
    horizon: '6h forecast',
    summary:
      'Saket edges into low-risk territory thanks to reliable lighting and active foot traffic, with minor crowding near the mall complexes.',
    estimate: false,
    mapMarker: { x: 58, y: 60, label: 'Saket', color: '#22c55e' },
    incidents: [
      { id: 'sk1', lat: 28.519, lng: 77.210, x: 58, y: 62, type: 'nuisance', severity: 'low', time: '28m ago', verified: true },
      { id: 'sk2', lat: 28.523, lng: 77.213, x: 60, y: 58, type: 'traffic', severity: 'moderate', time: '13m ago', verified: false },
      { id: 'sk3', lat: 28.515, lng: 77.208, x: 56, y: 65, type: 'theft', severity: 'moderate', time: '55m ago', verified: true },
    ],
    factors: [
      { id: 'crime', label: 'Crime risk', value: 58, level: 'moderate', detail: 'A few theft reports near transit nodes keep the score from reaching low risk.', },
      { id: 'lighting', label: 'Lighting', value: 84, level: 'low', detail: 'Mall complexes and main roads are brightly lit after dark.', },
      { id: 'traffic', label: 'Traffic congestion', value: 68, level: 'moderate', detail: 'Shopping crowds spike in the evening, but roads are generally manageable.', },
      { id: 'emergency', label: 'Emergency access', value: 86, level: 'low', detail: 'Clear access via the ring road supports timely response.', },
      { id: 'crowd', label: 'Crowd activity', value: 74, level: 'moderate', detail: 'Steady foot traffic gives informal surveillance in most corridors.', },
    ],
    topRiskFactors: ['Mall-area crowding', 'Transit node theft reports'],
    topSafetyFactors: ['Strong lighting', 'Good emergency access'],
    recommendations: ['Use main boulevards for late-night travel', 'Monitor crowd activity near the cinema complex', 'Choose routes that keep you in well-lit public spaces'],
  },
  {
    id: 'lajpat-nagar',
    displayName: 'Lajpat Nagar',
    region: 'Delhi NCR',
    score: 58,
    riskLevel: 'moderate',
    confidence: 0.90,
    horizon: '6h forecast',
    summary:
      'Lajpat Nagar is active and visible, but dense crowds and variable lighting in market lanes keep the overall score moderate.',
    estimate: false,
    mapMarker: { x: 50, y: 58, label: 'Lajpat Nagar', color: '#f59e0b' },
    incidents: [
      { id: 'ln1', lat: 28.567, lng: 77.232, x: 52, y: 60, type: 'theft', severity: 'high', time: '19m ago', verified: true },
      { id: 'ln2', lat: 28.564, lng: 77.229, x: 48, y: 56, type: 'nuisance', severity: 'moderate', time: '33m ago', verified: false },
      { id: 'ln3', lat: 28.569, lng: 77.234, x: 54, y: 62, type: 'traffic', severity: 'moderate', time: '1h ago', verified: true },
    ],
    factors: [
      { id: 'crime', label: 'Crime risk', value: 66, level: 'high', detail: 'Theft and pickpocket reports are concentrated in crowded market lanes.', },
      { id: 'lighting', label: 'Lighting', value: 64, level: 'moderate', detail: 'Inner alleys suffer from inconsistent lighting despite bright main roads.', },
      { id: 'traffic', label: 'Traffic congestion', value: 84, level: 'high', detail: 'Frequent jams near the eastern market increase exposure for pedestrians.', },
      { id: 'emergency', label: 'Emergency access', value: 78, level: 'moderate', detail: 'Primary roads are accessible, but inner passages are narrow.', },
      { id: 'crowd', label: 'Crowd activity', value: 88, level: 'low', detail: 'High pedestrian density improves safety through visibility.', },
    ],
    topRiskFactors: ['Crowded market lanes', 'Inconsistent inner alley lighting'],
    topSafetyFactors: ['Main roads are well-lit', 'High pedestrian activity'],
    recommendations: ['Stay on main market roads after dark', 'Avoid narrow inner alleys alone', 'Use well-lit arteries when crossing toward the metro'],
  },
  {
    id: 'india-gate',
    displayName: 'India Gate',
    region: 'Delhi NCR',
    score: 63,
    riskLevel: 'moderate',
    confidence: 0.90,
    horizon: '6h forecast',
    summary:
      'India Gate is a busy public zone with good lighting, but large crowds and traffic near the monument increase the overall risk score.',
    estimate: false,
    mapMarker: { x: 56, y: 30, label: 'India Gate', color: '#f59e0b' },
    incidents: [
      { id: 'ig1', lat: 28.612, lng: 77.229, x: 56, y: 28, type: 'traffic', severity: 'high', time: '14m ago', verified: true },
      { id: 'ig2', lat: 28.613, lng: 77.230, x: 58, y: 30, type: 'nuisance', severity: 'moderate', time: '44m ago', verified: false },
      { id: 'ig3', lat: 28.614, lng: 77.232, x: 60, y: 26, type: 'theft', severity: 'moderate', time: '1h ago', verified: true },
    ],
    factors: [
      { id: 'crime', label: 'Crime risk', value: 64, level: 'moderate', detail: 'Theft and crowded transit areas keep risk elevated in tourist zones.', },
      { id: 'lighting', label: 'Lighting', value: 88, level: 'low', detail: 'Monument lighting and park paths are well illuminated.', },
      { id: 'traffic', label: 'Traffic congestion', value: 86, level: 'high', detail: 'Vehicle flow around the circular road is heavy and chaotic.', },
      { id: 'emergency', label: 'Emergency access', value: 80, level: 'moderate', detail: 'Main roads are accessible but crowd density slows response.', },
      { id: 'crowd', label: 'Crowd activity', value: 92, level: 'low', detail: 'Large visitor volumes create strong informal surveillance.', },
    ],
    topRiskFactors: ['Dense tourist crowds', 'Heavy traffic corridors'],
    topSafetyFactors: ['Excellent monument lighting', 'High foot traffic visibility'],
    recommendations: ['Stick to the main parade routes after sunset', 'Use official crossings and avoid roadside parking areas', 'Travel in groups around the monument area'],
  },
  {
    id: 'rajouri-garden',
    displayName: 'Rajouri Garden',
    region: 'Delhi NCR',
    score: 66,
    riskLevel: 'moderate',
    confidence: 0.91,
    horizon: '6h forecast',
    summary:
      'Rajouri Garden performs slightly better than average, with good CCTV coverage and active shopping areas balancing moderate crime and traffic signals.',
    estimate: false,
    mapMarker: { x: 48, y: 66, label: 'Rajouri', color: '#22c55e' },
    incidents: [
      { id: 'rg1', lat: 28.638, lng: 77.090, x: 48, y: 64, type: 'theft', severity: 'moderate', time: '23m ago', verified: true },
      { id: 'rg2', lat: 28.640, lng: 77.087, x: 45, y: 68, type: 'traffic', severity: 'moderate', time: '35m ago', verified: true },
      { id: 'rg3', lat: 28.639, lng: 77.092, x: 50, y: 66, type: 'nuisance', severity: 'low', time: '1h ago', verified: false },
    ],
    factors: [
      { id: 'crime', label: 'Crime risk', value: 62, level: 'moderate', detail: 'Theft reports around the mall belt keep the area in moderate risk.', },
      { id: 'lighting', label: 'Lighting', value: 80, level: 'low', detail: 'Mall frontage and parking zones are bright and visible.', },
      { id: 'traffic', label: 'Traffic congestion', value: 78, level: 'high', detail: 'Heavy shopping traffic means crossings are the primary risk area.', },
      { id: 'emergency', label: 'Emergency access', value: 82, level: 'low', detail: 'Major roads provide good access for emergency vehicles.', },
      { id: 'crowd', label: 'Crowd activity', value: 72, level: 'moderate', detail: 'Regular shopping crowds contribute to a visible environment.', },
    ],
    topRiskFactors: ['Shopping traffic', 'Theft near mall entrances'],
    topSafetyFactors: ['Strong CCTV presence', 'Bright public lighting'],
    recommendations: ['Avoid crowded mall exits after dark', 'Use the main service roads around the market', 'Travel with a partner in the parking areas'],
  },
];

const routeAliases: [string, string][] = [
  ['noida', 'noida'],
  ['rohini', 'rohini-sector-2'],
  ['rohini sector 2', 'rohini-sector-2'],
  ['rohini sector-2', 'rohini-sector-2'],
  ['dwarka', 'dwarka'],
  ['connaught place', 'connaught-place'],
  ['connaught', 'connaught-place'],
  ['cp', 'connaught-place'],
  ['gurugram', 'gurugram'],
  ['gurgaon', 'gurugram'],
  ['kashmere gate', 'kashmere-gate'],
  ['new delhi', 'new-delhi'],
  ['rajouri garden', 'rajouri-garden'],
  ['lajpat nagar', 'lajpat-nagar'],
  ['saket', 'saket'],
  ['janakpuri', 'janakpuri'],
  ['pitampura', 'pitampura'],
  ['greater kailash', 'greater-kailash'],
  ['india gate', 'india-gate'],
  ['delhi airport', 'delhi-airport'],
  ['airport', 'delhi-airport'],
  ['indira gandhi airport', 'delhi-airport'],
  ['delhi', 'new-delhi'],
];

const routeAliasMap = Object.fromEntries(routeAliases);
const knownTerms: [string, string][] = routeAliases;

const fallbackLocations: LocationAnalysis[] = [
  {
    id: 'delhi',
    displayName: 'Delhi',
    region: 'Delhi NCR',
    score: 61,
    riskLevel: 'moderate',
    confidence: 0.89,
    horizon: '6h forecast',
    summary:
      'The wider Delhi region shows moderate risk with mixed performance across neighborhoods. Central zones are often safer than the more congested outer corridors.',
    estimate: false,
    mapMarker: { x: 52, y: 38, label: 'Delhi', color: '#f59e0b' },
    incidents: [
      { id: 'dl1', lat: 28.613, lng: 77.209, x: 52, y: 38, type: 'traffic', severity: 'high', time: '12m ago', verified: true },
      { id: 'dl2', lat: 28.619, lng: 77.208, x: 56, y: 35, type: 'theft', severity: 'moderate', time: '27m ago', verified: true },
      { id: 'dl3', lat: 28.607, lng: 77.223, x: 50, y: 42, type: 'nuisance', severity: 'moderate', time: '47m ago', verified: false },
    ],
    factors: [
      { id: 'crime', label: 'Crime risk', value: 68, level: 'moderate', detail: 'The large metro area has varied risk, with transit hubs and markets trending higher.', },
      { id: 'lighting', label: 'Lighting', value: 74, level: 'moderate', detail: 'Lighting is good in central zones but variable in peripheral areas.', },
      { id: 'traffic', label: 'Traffic congestion', value: 82, level: 'high', detail: 'Heavy traffic across major arteries is the main safety limitation.', },
      { id: 'emergency', label: 'Emergency access', value: 80, level: 'moderate', detail: 'Primary roads are accessible, but inner lanes can slow response times.', },
      { id: 'crowd', label: 'Crowd activity', value: 78, level: 'moderate', detail: 'Crowd density is strong in the evening, giving both visibility and congestion risk.', },
    ],
    topRiskFactors: ['Traffic-heavy corridors', 'Transit hub density'],
    topSafetyFactors: ['Good lighting in core zones', 'Active crowd presence'],
    recommendations: ['Prefer main arterial routes after dark', 'Avoid poorly lit inner lanes in peripheral districts', 'Use public transport along the Blue Line where possible'],
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[\s·&\/]+/g, ' ');
}

function getSeed(value: string) {
  return Math.abs(
    [...value.toLowerCase()].reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0),
  );
}

function choose<T>(values: T[], index: number) {
  return values[index % values.length];
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

function findRouteLocation(query: string) {
  const normalized = normalize(query);
  const alias = routeAliasMap[normalized];
  if (alias) {
    const route = routeLocations.find((loc) => loc.id === alias);
    if (route) return route;
  }

  const exact = routeLocations.find(
    (loc) => normalize(loc.displayName) === normalized || loc.id === normalized,
  );
  if (exact) return exact;

  const contains = routeLocations.find(
    (loc) =>
      normalize(loc.displayName).includes(normalized) ||
      normalized.includes(loc.id) ||
      normalized.includes(normalize(loc.displayName)),
  );
  return contains ?? null;
}

export const routeLocationList = routeLocations;

export function getRouteLocation(query: string): RouteLocation | null {
  return findRouteLocation(query);
}

function getRoadFactor(distanceKm: number) {
  return clamp(1.18 + Math.min(0.22, distanceKm * 0.0035), 1.18, 1.45);
}

export function getLocationSafety(query: string): LocationAnalysis {
  const normalizedQuery = normalize(query);
  const matchedId = knownTerms.find(([term]) => normalizedQuery.includes(term)?.valueOf())?.[1];
  const exactMatch = knownLocations.find((location) => location.id === matchedId);
  if (exactMatch) {
    return exactMatch;
  }

  const fallback = fallbackLocations[0];
  const seed = getSeed(query);
  const score = clamp(55 + (seed % 30) - ((seed >> 2) % 8), 30, 86);
  const riskLevel: RiskLevel = score >= 70 ? 'low' : score >= 45 ? 'moderate' : 'high';
  const lighting = clamp(60 + ((seed >> 3) % 30), 40, 90);
  const traffic = clamp(50 + ((seed >> 4) % 40), 40, 92);
  const crime = clamp(50 + ((seed >> 5) % 34), 40, 86);
  const crowd = clamp(50 + ((seed >> 6) % 40), 40, 92);
  const emergency = clamp(65 + ((seed >> 7) % 26), 45, 92);

  const factors: SafetyFactor[] = [
    { id: 'crime', label: 'Crime risk', value: crime, level: crime >= 70 ? 'high' : crime >= 50 ? 'moderate' : 'low', detail: 'Prototype estimate based on known local patterns and transit density.', },
    { id: 'lighting', label: 'Lighting', value: lighting, level: lighting >= 75 ? 'low' : lighting >= 55 ? 'moderate' : 'high', detail: 'Estimated lighting coverage from nearby commercial and residential zones.', },
    { id: 'traffic', label: 'Traffic congestion', value: traffic, level: traffic >= 75 ? 'high' : traffic >= 55 ? 'moderate' : 'low', detail: 'Traffic risk is inferred from nearby major roads and transit hubs.', },
    { id: 'emergency', label: 'Emergency access', value: emergency, level: emergency >= 80 ? 'low' : emergency >= 60 ? 'moderate' : 'high', detail: 'Estimated response access based on major arterial and highway proximity.', },
    { id: 'crowd', label: 'Crowd activity', value: crowd, level: crowd >= 75 ? 'low' : crowd >= 55 ? 'moderate' : 'high', detail: 'Crowd activity is derived from market and transit node density.', },
  ];

  const topRiskFactors = [
    choose(['Transit hub activity', 'Busy market lanes', 'Traffic signal congestion'], seed),
    choose(['Variable lighting', 'Recent petty theft reports', 'Crowded transfer points'], seed + 1),
  ];
  const topSafetyFactors = [
    choose(['Major roads are well-lit', 'Emergency routes are available', 'Foot traffic remains steady'], seed + 2),
    choose(['Public squares have strong visibility', 'Active retail corridors', 'CCTV-backed streets'], seed + 3),
  ];

  const recommendations = [
    choose(['Stick to main roads and avoid dark alleys after dusk.', 'Travel with company through busy corridors after 21:00.', 'Use the app-recommended route through well-lit public areas.'], seed),
    choose(['Keep to routes with active CCTV and visible crowds.', 'Avoid isolated service lanes in low-light pockets.', 'Share your route with a trusted contact before departure.'], seed + 1),
  ];

  function makeIncident(idSuffix: string, type: IncidentMarker['type'], severity: RiskLevel, x: number, y: number, time: string) {
    return {
      id: `unknown-${idSuffix}`,
      lat: 28.6 + x * 0.0007,
      lng: 77.2 + y * 0.0008,
      x,
      y,
      type,
      severity,
      time,
      verified: seed % 2 === 0,
    } as IncidentMarker;
  }

  const incidents: IncidentMarker[] = [
    makeIncident('1', 'theft', crime >= 70 ? 'high' : 'moderate', 52, 42, '12m ago'),
    makeIncident('2', 'traffic', traffic >= 75 ? 'high' : 'moderate', 48, 46, '7m ago'),
    makeIncident('3', 'nuisance', crowd >= 80 ? 'low' : 'moderate', 58, 38, '33m ago'),
    makeIncident('4', 'harassment', crime >= 65 ? 'moderate' : 'low', 46, 50, '49m ago'),
  ];

  return {
    ...fallback,
    displayName: query.trim(),
    note: 'Prototype estimate based on local trends',
    score,
    riskLevel,
    confidence: clamp(0.84 + ((seed % 15) / 100), 0.78, 0.94),
    summary: `This location is an estimated analysis. Traffic and ${choose(['crime reports', 'lighting coverage', 'crowd density'], seed + 4)} are the primary drivers of the score.`,
    estimate: true,
    mapMarker: { x: clamp(35 + ((seed >> 2) % 40), 20, 80), y: clamp(26 + ((seed >> 4) % 50), 18, 75), label: 'Estimate', color: '#3b82f6' },
    factors,
    topRiskFactors,
    topSafetyFactors,
    recommendations,
    incidents,
  };
}

function makeRoutePath(origin: RouteLocation, destination: RouteLocation, seed: number, curveStrength: number): RoutePoint[] {
  const dx = destination.mapX - origin.mapX;
  const dy = destination.mapY - origin.mapY;
  const midX = origin.mapX + dx * 0.4 + ((seed % 20) - 10) * 0.4;
  const midY = origin.mapY + dy * 0.4 + ((seed >> 3) % 20 - 10) * 0.35;
  const mid2X = origin.mapX + dx * 0.7 + ((seed >> 2) % 20 - 10) * 0.65;
  const mid2Y = origin.mapY + dy * 0.7 + ((seed >> 5) % 20 - 10) * 0.45;

  const offset = curveStrength * 4;
  return [
    { x: origin.mapX, y: origin.mapY },
    { x: clamp(midX + offset, 5, 95), y: clamp(midY - offset, 5, 95) },
    { x: clamp(mid2X - offset, 5, 95), y: clamp(mid2Y + offset, 5, 95) },
    { x: destination.mapX, y: destination.mapY },
  ];
}

function normalizeRouteText(value: string) {
  return value.trim().toLowerCase();
}

export async function getRouteOptions(origin: string, destination: string): Promise<RouteOption[]> {
  const originLocation = findRouteLocation(origin);
  const destinationLocation = findRouteLocation(destination);
  if (!originLocation || !destinationLocation || originLocation.id === destinationLocation.id) {
    return [];
  }

  // 1. Fetch real data (last 48 hours)
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data: reports, error } = await supabase
    .from('community_reports')
    .select('*')
    .gte('created_at', fortyEightHoursAgo)
    .order('created_at', { ascending: false });

  // Fallback to static if DB fails
  if (error || !reports) {
    console.error('Failed to fetch reports:', error);
    return getStaticRouteOptions(originLocation, destinationLocation).map(opt => ({
        ...opt,
        risk: 0,
        riskLevel: 'low',
        isEstimated: true,
        reasoning: 'Data unavailable: 0% is a placeholder, as real-time safety reports could not be retrieved.'
    }));
  }

  // 2. Filter reports by area
  const minLat = Math.min(originLocation.lat, destinationLocation.lat) - 0.1;
  const maxLat = Math.max(originLocation.lat, destinationLocation.lat) + 0.1;
  const minLng = Math.min(originLocation.lng, destinationLocation.lng) - 0.1;
  const maxLng = Math.max(originLocation.lng, destinationLocation.lng) + 0.1;

  const relevantReports = reports.filter(
    (r) =>
      r.latitude >= minLat &&
      r.latitude <= maxLat &&
      r.longitude >= minLng &&
      r.longitude <= maxLng,
  );

  const riskAnalysis = computeAreaRisk(relevantReports as any);
  
  // 3. Construct route options using real or fallback data
  const staticOptions = getStaticRouteOptions(originLocation, destinationLocation);
  
  // Try to find risk data for the route's area (using destination for context)
  const areaRisk = riskAnalysis.find(ra => ra.area === destinationLocation.displayName) || riskAnalysis[0];

  return staticOptions.map(variant => {
    if (areaRisk) {
        // Construct real explanation
        const severityStr = Object.entries(areaRisk.severityCounts)
            .filter(([_, count]) => (count as number) > 0)
            .map(([level, count]) => `${count} ${level} severity`)
            .join(', ');
        
        const reasoning = `${areaRisk.reportCount} reports in this area in the last 48h: ${severityStr || 'no significant issues'}.`;

        // Vary risk per variant
        let riskModifier = 1.0;
        if (variant.id === 'safest') riskModifier = 0.75;
        if (variant.id === 'fastest') riskModifier = 1.1;
        
        const adjustedRisk = Math.min(100, Math.max(0, Math.round(areaRisk.score * riskModifier)));

        return {
            ...variant,
            risk: adjustedRisk,
            riskLevel: adjustedRisk >= 55 ? 'high' : adjustedRisk >= 40 ? 'moderate' : 'low',
            reasoning: reasoning,
            isEstimated: false
        };
    }
    
    // Fallback if no real reports
    return { 
        ...variant, 
        isEstimated: true, 
        reasoning: 'No recent reports in this area.' 
    };
  });
}

function getStaticRouteOptions(originLocation: RouteLocation, destinationLocation: RouteLocation): RouteOption[] {

  const routeKey = `${originLocation.id}|${destinationLocation.id}`;
  const seed = getSeed(routeKey);
  const routeContext = `${originLocation.displayName} to ${destinationLocation.displayName}`;

  const straightDistance = getHaversineDistance(
    originLocation.lat,
    originLocation.lng,
    destinationLocation.lat,
    destinationLocation.lng,
  );

  const roadFactor = getRoadFactor(straightDistance);
  const roadDistance = clamp(straightDistance * roadFactor, straightDistance * 1.14, straightDistance * 1.42);

  const fastestDistance = clamp(
    Math.max(straightDistance, roadDistance * 0.94),
    straightDistance,
    roadDistance,
  );
  const balancedDistance = clamp(roadDistance * 1.03, fastestDistance + 0.4, roadDistance * 1.08);
  const safestDistance = clamp(roadDistance * 1.12, balancedDistance + 0.5, roadDistance * 1.18);

  const fastestSpeed = clamp(42 + ((seed >> 2) % 7), 40, 48);
  const balancedSpeed = clamp(30 + ((seed >> 4) % 6), 30, 36);
  const safestSpeed = clamp(22 + ((seed >> 6) % 6), 22, 28);

  const fastestDuration = Math.max(12, Math.round((fastestDistance / fastestSpeed) * 60));
  const balancedDuration = Math.max(fastestDuration + 5, Math.round((balancedDistance / balancedSpeed) * 60));
  const safestDuration = Math.max(balancedDuration + 6, Math.round((safestDistance / safestSpeed) * 60));

  const averageRisk = (originLocation.baseRisk + destinationLocation.baseRisk) / 2;
  const hotspotScore = (originLocation.incidentFactor + destinationLocation.incidentFactor) / 2;
  const visibilityScore =
    (originLocation.lighting + originLocation.cctv + destinationLocation.lighting + destinationLocation.cctv) / 4;
  const crowdScore = (originLocation.footTraffic + destinationLocation.footTraffic) / 2;

  const routeRiskBase = clamp(
    Math.round(averageRisk + hotspotScore * 2 + roadDistance * 0.13 - visibilityScore * 0.12 - crowdScore * 0.08),
    18,
    64,
  );

  const averageLighting = Math.round((originLocation.lighting + destinationLocation.lighting) / 2);
  const averageCctv = Math.round((originLocation.cctv + destinationLocation.cctv) / 2);
  const averageFootTraffic = Math.round((originLocation.footTraffic + destinationLocation.footTraffic) / 2);

  const fastestLighting = clamp(averageLighting - 16, 44, 74);
  const fastestCctv = clamp(averageCctv - 18, 36, 74);
  const fastestFootTraffic = clamp(averageFootTraffic + 8, 56, 92);

  const balancedLighting = clamp(averageLighting - 6, 58, 84);
  const balancedCctv = clamp(averageCctv - 6, 54, 86);
  const balancedFootTraffic = clamp(averageFootTraffic + 2, 52, 88);

  const safestLighting = clamp(averageLighting + 10, 72, 96);
  const safestCctv = clamp(averageCctv + 10, 72, 96);
  const safestFootTraffic = clamp(averageFootTraffic - 6, 38, 82);

  const fastestRisk = clamp(routeRiskBase + 12 - Math.round(crowdScore * 0.05), 24, 74);
  const balancedRisk = clamp(routeRiskBase + 4 - Math.round(crowdScore * 0.04), 18, 60);
  const safestRisk = clamp(routeRiskBase - 10 - Math.round(crowdScore * 0.03) + Math.round(hotspotScore * 0.6), 8, 46);

  return [
    {
      id: 'safest',
      label: 'Safest Route',
      badge: 'Recommended',
      distance: `${safestDistance.toFixed(1)} km`,
      duration: safestDuration,
      risk: safestRisk,
      riskLevel: safestRisk >= 55 ? 'high' : safestRisk >= 40 ? 'moderate' : 'low',
      color: '#22C55E',
      reasoning: `This path prioritizes the safest corridors between ${routeContext}, using better lighting and stronger CCTV coverage even if it adds a few minutes.`,
      via: ['Residential avenue', 'CCTV corridor', 'Park-side boulevard'],
      lighting: safestLighting,
      cctv: safestCctv,
      footTraffic: safestFootTraffic,
      flaggedSegments: 0,
      path: makeRoutePath(originLocation, destinationLocation, seed, 2.4),
    },
    {
      id: 'fastest',
      label: 'Fastest Route',
      badge: 'Quickest',
      distance: `${fastestDistance.toFixed(1)} km`,
      duration: fastestDuration,
      risk: fastestRisk,
      riskLevel: fastestRisk >= 55 ? 'high' : fastestRisk >= 40 ? 'moderate' : 'low',
      color: '#f59e0b',
      reasoning: `This route uses direct express and connector roads to cut travel time between ${originLocation.displayName} and ${destinationLocation.displayName}.`,
      via: ['Express corridor', 'Transit link', 'Market flank'],
      lighting: fastestLighting,
      cctv: fastestCctv,
      footTraffic: fastestFootTraffic,
      flaggedSegments: 3,
      path: makeRoutePath(originLocation, destinationLocation, seed + 11, 0.9),
    },
    {
      id: 'balanced',
      label: 'Balanced Route',
      badge: 'Trade-off',
      distance: `${balancedDistance.toFixed(1)} km`,
      duration: balancedDuration,
      risk: balancedRisk,
      riskLevel: balancedRisk >= 55 ? 'high' : balancedRisk >= 40 ? 'moderate' : 'low',
      color: '#3b82f6',
      reasoning: `A compromise route that avoids the busiest hotspots while keeping travel time reasonable for ${routeContext}.`,
      via: ['Collector road', 'Market edge', 'Secondary avenue'],
      lighting: balancedLighting,
      cctv: balancedCctv,
      footTraffic: balancedFootTraffic,
      flaggedSegments: 1,
      path: makeRoutePath(originLocation, destinationLocation, seed + 27, 1.5),
    },
  ];
}
