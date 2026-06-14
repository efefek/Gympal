"use client";

interface ActivityScoreGaugeProps {
  score: number; // 0-100
  streak: number; // gün sayısı
}

export function ActivityScoreGauge({ score, streak }: ActivityScoreGaugeProps) {
  const RADIUS = 55;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className="animate-fade-in-up flex flex-col items-center gap-6 rounded-3xl border border-zinc-800 bg-surface-1 p-6">
      {/* SVG Gauge */}
      <div className="relative" aria-hidden="true">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={RADIUS}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={RADIUS}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-all duration-300"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-primary">{score}</span>
          <span className="text-xs text-muted">pts</span>
        </div>
      </div>

      {/* Stats below gauge */}
      <div className="text-center">
        <p className="text-sm text-muted mb-2">This week</p>
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-2xl font-bold text-foreground">{streak}</span>
          <span className="text-sm text-muted">day streak</span>
        </div>
      </div>
    </div>
  );
}
