'use client';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
  circle?: boolean;
}

export function Skeleton({
  width = '100%',
  height = 20,
  className = '',
  rounded = false,
  circle = false,
}: SkeletonProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: widthStyle,
        height: heightStyle,
        borderRadius: circle ? '50%' : rounded ? '8px' : '4px',
        background: 'var(--color-surface-3)',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`p-4 ${className}`}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
      }}
    >
      <div className="flex items-start gap-3">
        <Skeleton circle width={48} height={48} />
        <div className="flex-1">
          <Skeleton width="60%" height={16} className="mb-2" />
          <Skeleton width="40%" height={14} />
        </div>
      </div>
    </div>
  );
}
