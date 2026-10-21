import { useId } from 'react';
import type { PlotData } from '@/lib/types';
import { num } from '@/solver/rational';

const WIDTH = 560;
const HEIGHT = 280;
const PAD = 34;

export function Plot({ plot }: { plot: PlotData }) {
  const clipId = `plot-${useId().replace(/:/g, '')}`;
  const { fn, fn2, points = [], xMin, xMax } = plot;
  const steps = 260;

  const curves: { path: string; second: boolean }[] = [];
  const samples: number[] = [];

  const sampleCurve = (f: (x: number) => number, second: boolean) => {
    let path = '';
    let started = false;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + ((xMax - xMin) * i) / steps;
      let y: number;
      try {
        y = f(x);
      } catch {
        y = Number.NaN;
      }
      if (!Number.isFinite(y) || Math.abs(y) > 1e7) {
        started = false;
        continue;
      }
      samples.push(y);
      if (!started) {
        path += `M ${x} ${y} `;
        started = true;
      } else {
        path += `L ${x} ${y} `;
      }
    }
    curves.push({ path, second });
  };

  if (fn) sampleCurve(fn, false);
  if (fn2) sampleCurve(fn2, true);

  const pointValues = points.map((point) => point.y).filter(Number.isFinite);
  const all = [...samples, ...pointValues, 0];
  let yMin = Math.min(...all);
  let yMax = Math.max(...all);
  if (Math.abs(yMax - yMin) < 1e-9) {
    yMin -= 1;
    yMax += 1;
  }
  const yPad = (yMax - yMin) * 0.12;
  yMin -= yPad;
  yMax += yPad;

  const scaleX = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (WIDTH - PAD * 2);
  const scaleY = (y: number) => HEIGHT - PAD - ((y - yMin) / (yMax - yMin)) * (HEIGHT - PAD * 2);

  const gridLines = 6;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Graph">
        <defs>
          <clipPath id={clipId}>
            <rect x={PAD} y={PAD / 2} width={WIDTH - PAD * 2} height={HEIGHT - PAD * 1.5} />
          </clipPath>
        </defs>

        {Array.from({ length: gridLines + 1 }, (_, index) => {
          const x = PAD + ((WIDTH - PAD * 2) * index) / gridLines;
          const y = PAD + ((HEIGHT - PAD * 2) * index) / gridLines;
          return (
            <g key={index} stroke="var(--line)" strokeWidth={1}>
              <line x1={x} y1={PAD / 2} x2={x} y2={HEIGHT - PAD / 2} opacity={0.6} />
              <line x1={PAD} y1={y} x2={WIDTH - PAD} y2={y} opacity={0.6} />
            </g>
          );
        })}

        {yMin < 0 && yMax > 0 && (
          <line x1={PAD} y1={scaleY(0)} x2={WIDTH - PAD} y2={scaleY(0)} stroke="var(--muted)" strokeWidth={1.2} opacity={0.8} />
        )}
        {xMin < 0 && xMax > 0 && (
          <line x1={scaleX(0)} y1={PAD / 2} x2={scaleX(0)} y2={HEIGHT - PAD / 2} stroke="var(--muted)" strokeWidth={1.2} opacity={0.8} />
        )}

        <g clipPath={`url(#${clipId})`} fill="none" strokeLinejoin="round" strokeLinecap="round">
          {curves.map((curve, index) =>
            curve.path ? (
              <path
                key={index}
                d={curve.path}
                stroke={curve.second ? 'var(--gold)' : 'var(--brand)'}
                strokeWidth={2.4}
                vectorEffect="non-scaling-stroke"
              />
            ) : null,
          )}
        </g>

        {points.map((point, index) =>
          Number.isFinite(point.x) && Number.isFinite(point.y) ? (
            <g key={index}>
              <circle cx={scaleX(point.x)} cy={scaleY(point.y)} r={4} fill="var(--surface)" stroke="var(--gold)" strokeWidth={2.4} />
              {point.label && index < 3 && (
                <text
                  x={scaleX(point.x)}
                  y={scaleY(point.y) - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--muted)"
                  fontFamily="var(--font-mono)"
                >
                  {point.label}
                </text>
              )}
            </g>
          ) : null,
        )}

        <text x={WIDTH - PAD} y={HEIGHT - 8} textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
          x: {num(xMin, 2)} → {num(xMax, 2)}
        </text>

      </svg>
    </div>
  );
}
