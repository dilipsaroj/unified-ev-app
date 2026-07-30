'use client';

import { useEffect, useRef } from 'react';

interface SocDialProps {
  currentSoc: number;
  startSoc: number;
  targetSoc: number;
}

export default function SocDial({ currentSoc, startSoc, targetSoc }: SocDialProps) {
  const circleRef = useRef<SVGCircleElement>(null);

  const size = 260;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!circleRef.current) return;

    const progress = (currentSoc - startSoc) / (targetSoc - startSoc);
    const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
    
    circleRef.current.style.strokeDashoffset = `${offset}`;
  }, [currentSoc, startSoc, targetSoc, circumference]);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: 'rotate(-90deg)',
        }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />

        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#34E5A1"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          filter="url(#glow)"
          style={{
            transition: 'stroke-dashoffset 0.3s ease-out',
          }}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1,
              fontFeatureSettings: '"tnum" 1',
            }}
          >
            {Math.round(currentSoc)}
          </span>
          <span style={{ fontSize: 32, fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)' }}>
            %
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          State of Charge
        </div>
      </div>
    </div>
  );
}
