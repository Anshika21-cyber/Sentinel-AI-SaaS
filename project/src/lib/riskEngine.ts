import type { ReportItem } from '@/data/content';

export interface AreaRisk {
  area: string;
  score: number;
  reportCount: number;
  breakdown: string;
}

export interface ForecastResult {
  forecastScore: number;
  direction: 'up' | 'stable';
  reason: string;
}

export function computeForecast(areaRiskScore: number, currentHour: number = new Date().getHours()): ForecastResult {
  const isNight = currentHour >= 21 || currentHour < 5;
  const multiplier = isNight ? 1.25 : 1.0;
  const forecastScore = Math.min(100, Math.round(areaRiskScore * multiplier));
  const direction: 'up' | 'stable' = isNight && forecastScore > areaRiskScore ? 'up' : 'stable';
  const reason = isNight
    ? 'Night hours — elevated risk window'
    : 'Daytime — baseline risk';

  return {
    forecastScore,
    direction,
    reason,
  };
}

export function computeAreaRisk(reports: ReportItem[]): AreaRisk[] {
  const areaMap: Record<string, { counts: Record<string, number>; totalWeight: number; totalReports: number }> = {};

  reports.forEach((r) => {
    const areaName = r.area?.trim() || 'Unknown Area';
    if (!areaMap[areaName]) {
      areaMap[areaName] = { counts: { low: 0, moderate: 0, high: 0, critical: 0 }, totalWeight: 0, totalReports: 0 };
    }
    const sev = (r.severity || 'low').toLowerCase();
    let weight = 1;
    if (sev === 'moderate') weight = 2;
    else if (sev === 'high' || sev === 'critical') weight = 3;

    areaMap[areaName].counts[sev] = (areaMap[areaName].counts[sev] || 0) + 1;
    areaMap[areaName].totalWeight += weight;
    areaMap[areaName].totalReports += 1;
  });

  return Object.entries(areaMap)
    .map(([area, data]) => {
      const score = Math.min(100, data.totalWeight * 15);

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
      };
    })
    .sort((a, b) => b.score - a.score);
}
