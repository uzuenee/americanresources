'use client';

export function ArticleProgressRing({ percent }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="relative inline-flex h-9 w-9 items-center justify-center"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-label={`Reading progress: ${Math.round(percent)}%`}
    >
      <svg
        width={36}
        height={36}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* background ring */}
        <circle
          cx={18}
          cy={18}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={1.5}
          opacity={0.6}
        />
        {/* progress ring */}
        <circle
          cx={18}
          cy={18}
          r={radius}
          fill="none"
          stroke="var(--color-copper)"
          strokeWidth={2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-100 ease-linear"
        />
      </svg>
    </div>
  );
}
