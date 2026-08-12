import type { ReportItem, RiskLevel } from '@/data/content';

export interface AreaRisk {
  area: string;
  score: number;
  reportCount: number;
  breakdown: string;
  avgTrustScore: number;
  severityCounts: Record<RiskLevel, number>;
}

export interface AreaSummary {
  counts: Record<RiskLevel, number>;
  totalWeight: number;
  totalReports: number;
  severity: RiskLevel;
  trustSum: number;
}

export interface ForecastResult {
  forecastScore: number;
  direction: 'up' | 'stable';
  reason: string;
}

const severityRank: RiskLevel[] = ['critical', 'high', 'moderate', 'low'];

function determineSeverity(counts: Record<RiskLevel, number>): RiskLevel {
  for (const level of severityRank) {
    if (counts[level] > 0) {
      return level;
    }
  }
  return 'low';
}

export function groupReportsByArea(reports: ReportItem[]): Record<string, AreaSummary> {
  const areaMap: Record<string, AreaSummary> = {};

  reports.forEach((r) => {
    const areaName = r.area?.trim() || 'Unknown Area';
    if (!areaMap[areaName]) {
      areaMap[areaName] = {
        counts: { low: 0, moderate: 0, high: 0, critical: 0 },
        totalWeight: 0,
        totalReports: 0,
        severity: 'low',
        trustSum: 0,
      };
    }

    const sev = (r.severity || 'low').toLowerCase() as RiskLevel;
    let weight = 1;
    if (sev === 'moderate') weight = 2;
    else if (sev === 'high' || sev === 'critical') weight = 3;

    const trustScore = Number((r as any).trustScore ?? (r as any).trust_score ?? 50);

    areaMap[areaName].counts[sev] += 1;
    areaMap[areaName].totalWeight += weight;
    areaMap[areaName].totalReports += 1;
    areaMap[areaName].trustSum += trustScore;
  });

  Object.values(areaMap).forEach((entry) => {
    entry.severity = determineSeverity(entry.counts);
  });

  return areaMap;
}

export function computeForecast(areaRisk: AreaRisk, currentHour: number = new Date().getHours()): ForecastResult {
  const isNight = currentHour >= 21 || currentHour < 5;
  const timeBoost = isNight ? 1.12 : 1.0;

  const severityLoad =
    areaRisk.severityCounts.critical * 1.35 +
    areaRisk.severityCounts.high * 1.0 +
    areaRisk.severityCounts.moderate * 0.55;

  const momentum = 1 + Math.min(0.18, Math.sqrt(areaRisk.reportCount) * 0.04);
  const trustFactor = 1 + Math.max(-0.1, Math.min(0.12, (areaRisk.avgTrustScore - 68) / 220));

  const modelBase =
    areaRisk.score * 0.62 +
    Math.min(100, severityLoad * 12) * 0.18 +
    areaRisk.avgTrustScore * 0.12 +
    (isNight ? 10 : 0) * 0.08;

  const forecastScore = Math.min(100, Math.max(0, Math.round(modelBase * momentum * trustFactor * timeBoost)));
  const direction: 'up' | 'stable' = forecastScore > areaRisk.score ? 'up' : 'stable';
  const reason = isNight
    ? 'Model blends nighttime elevation with severity and trust signals.'
    : 'Model blends activity, report reliability, and severity to predict risk.';

  return {
    forecastScore,
    direction,
    reason,
  };
}

export function computeAreaRisk(reports: ReportItem[]): AreaRisk[] {
  const areaMap = groupReportsByArea(reports);

  return Object.entries(areaMap)
    .map(([area, data]) => {
      const score = Math.min(100, data.totalWeight * 15);
      const avgTrustScore = data.totalReports > 0 ? Math.round(data.trustSum / data.totalReports) : 50;

      const parts: string[] = [];
      if (data.counts.high) parts.push(`${data.counts.high} high`);
      if (data.counts.critical) parts.push(`${data.counts.critical} critical`);
      if (data.counts.moderate) parts.push(`${data.counts.moderate} moderate`);
      if (data.counts.low) parts.push(`${data.counts.low} low`);

      const breakdownText = parts.length > 0
        ? `${parts.join(', ')} report${data.totalReports > 1 ? 's' : ''}`
        : `${data.totalReports} report${data.totalReports > 1 ? 's' : ''}`;

      return {
        area,
        score,
        reportCount: data.totalReports,
        breakdown: breakdownText,
        avgTrustScore,
        severityCounts: data.counts,
      };
    })
    .sort((a, b) => b.score - a.score);
}
