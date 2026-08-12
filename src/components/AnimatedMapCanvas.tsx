import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { incidents, type IncidentMarker } from '@/data/content';

/**
 * AnimatedMapCanvas — a stylized, animated dark "safety map" rendered with
 * SVG + CSS. Designed to evoke Mapbox GL without requiring a token. Streets
 * glow, a heatmap pulses, incident markers ring out, and a route traces itself.
 *
 * Props:
 *  - interactive: when true, markers respond to hover and emit onSelect.
 *  - showRoute:   draw the glowing recommended route.
 *  - showHeat:    render the radial heatmap layer.
 *  - className:   sizing / positioning.
 */
export interface RoutePoint {
  x: number;
  y: number;
}

export interface HighlightMarker {
  x: number;
  y: number;
  label: string;
  color: string;
}

interface MapProps {
  interactive?: boolean;
  showRoute?: boolean;
  showHeat?: boolean;
  className?: string;
  incidents?: IncidentMarker[];
  onSelect?: (id: string) => void;
  routes?: { path: RoutePoint[]; color: string }[];
  markers?: HighlightMarker[];
}

const severityColor: Record<string, string> = {
  low: '#22C55E',
  moderate: '#F59E0B',
  high: '#EF4444',
  critical: '#B91C1C',
};

const streetPaths = [
  'M 0 180 L 1000 180',
  'M 0 360 L 1000 360',
  'M 0 540 L 1000 540',
  'M 180 0 L 180 700',
  'M 420 0 L 420 700',
  'M 660 0 L 660 700',
  'M 840 0 L 840 700',
  'M 0 90 L 1000 260',
  'M 0 620 L 1000 460',
  'M 120 0 L 300 700',
  'M 760 0 L 560 700',
];

// A pleasant glowing route from bottom-left to top-right.
const routePath = 'M 60 640 L 180 540 L 420 460 L 540 360 L 660 220 L 880 80';

export function AnimatedMapCanvas({
  interactive = false,
  showRoute = true,
  showHeat = true,
  className,
  incidents: incidentList = incidents,
  onSelect,
  routes,
  markers,
}: MapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [routeLen, setRouteLen] = useState(0);
  const routeRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (routeRef.current) setRouteLen(routeRef.current.getTotalLength());
  }, []);

  return (
    <div className={cn('relative overflow-hidden rounded-3xl', className)}>
      {/* Base */}
      <div className="absolute inset-0 bg-[#0b0b0e]" />

      {/* Radial heatmap blobs */}
      {showHeat && (
        <div className="absolute inset-0">
          <div className="absolute left-[18%] top-[62%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger/20 blur-3xl" />
          <div className="absolute left-[66%] top-[18%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warning/20 blur-3xl" />
          <div className="absolute left-[54%] top-[48%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute left-[42%] top-[22%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-success/15 blur-3xl" />
        </div>
      )}

      {/* Grid */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* SVG layer: streets + route + markers */}
      <svg
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {/* Streets */}
        <g stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" strokeLinecap="round">
          {streetPaths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g stroke="rgba(59,130,246,0.10)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5">
          {streetPaths.map((d, i) => (
            <path key={`g-${i}`} d={d} />
          ))}
        </g>

        {/* Animated route */}
        {showRoute && (!routes || routes.length === 0) && (
          <>
            <path
              ref={routeRef}
              d={routePath}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={routeLen}
              strokeDashoffset={routeLen}
              style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.7))' }}
            >
              <animate
                attributeName="stroke-dashoffset"
                from={routeLen}
                to="0"
                dur="3.2s"
                fill="freeze"
                begin="0.4s"
              />
            </path>
            <path d={routePath} fill="none" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.4s" repeatCount="indefinite" />
            </path>
            {/* Route endpoints */}
            <circle cx="60" cy="640" r="7" fill="#22C55E" />
            <circle cx="60" cy="640" r="7" fill="none" stroke="#22C55E" strokeWidth="2">
              <animate attributeName="r" values="7;16;7" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="880" cy="80" r="7" fill="#EF4444" />
          </>
        )}
        {showRoute && routes && routes.length > 0 && (
          <g>
            {routes.map((route, index) => {
              const points = route.path.map((point) => `${(point.x / 100) * 1000},${(point.y / 100) * 700}`).join(' L ');
              const d = `M ${points}`;
              return (
                <path key={route.color + index} d={d} fill="none" stroke={route.color} strokeWidth={index === 0 ? 4 : 2} strokeLinecap="round" opacity={index === 0 ? 1 : 0.55} />
              );
            })}
          </g>
        )}

        {/* Incident markers */}
        {incidentList.map((inc) => {
          const cx = (inc.x / 100) * 1000;
          const cy = (inc.y / 100) * 700;
          const color = severityColor[inc.severity];
          const isHovered = hovered === inc.id;
          return (
            <g
              key={inc.id}
              transform={`translate(${cx} ${cy})`}
              className={interactive ? 'cursor-pointer' : ''}
              onMouseEnter={() => interactive && setHovered(inc.id)}
              onMouseLeave={() => interactive && setHovered(null)}
              onClick={() => interactive && onSelect?.(inc.id)}
            >
              {/* Pulsing ring */}
              <circle r="6" fill="none" stroke={color} strokeWidth="2" opacity="0.5">
                <animate attributeName="r" values="6;20;6" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle r={isHovered ? 6.5 : 4.5} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color}99)` }} />
              {inc.verified && (
                <circle r="1.4" cx="3.2" cy="-3.2" fill="#0b0b0e" stroke="#22C55E" strokeWidth="1" />
              )}
            </g>
          );
        })}
        {markers?.map((marker) => {
          const cx = (marker.x / 100) * 1000;
          const cy = (marker.y / 100) * 700;
          return (
            <g key={`${marker.x}-${marker.y}-${marker.label}`}>
              <circle cx={cx} cy={cy} r="8" fill={marker.color} opacity="0.9" />
              <text x={cx} y={cy - 12} textAnchor="middle" fill="white" fontSize="14" fontWeight="600">
                {marker.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hovered marker tooltip */}
      {interactive && hovered && (
        <MarkerTooltip id={hovered} />
      )}

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />

      {/* Scanning sweep for the live map vibe */}
      <motion.div
        className="pointer-events-none absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent"
        initial={{ left: '-5%' }}
        animate={{ left: '105%' }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function MarkerTooltip({ id }: { id: string }) {
  const inc = incidents.find((i) => i.id === id);
  if (!inc) return null;
  const color = severityColor[inc.severity];
  const left = `${inc.x}%`;
  const top = `${inc.y}%`;
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)]"
      style={{ left, top }}
    >
      <div className="glass-strong rounded-xl px-3 py-2 text-xs shadow-soft">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          <span className="font-semibold capitalize text-ink">{inc.type}</span>
          <span className="text-ink-faint capitalize">· {inc.severity}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-ink-muted">
          <span>{inc.time}</span>
          {inc.verified && <span className="text-success">· Verified</span>}
        </div>
      </div>
    </div>
  );
}
