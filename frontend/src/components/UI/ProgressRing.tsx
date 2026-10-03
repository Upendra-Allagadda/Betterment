import { type FC } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const ProgressRing: FC<ProgressRingProps> = ({
  progress,
  size = 90,
  strokeWidth = 7,
  color = '#3b82f6',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = Math.min(100, Math.max(0, progress));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size}>
        <circle
          stroke="rgba(255, 255, 255, 0.08)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-ring-circle"
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: `${size * 0.22}px`, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
          {clamped}%
        </span>
      </div>
    </div>
  );
};
