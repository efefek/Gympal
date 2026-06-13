"use client";

import { Activity, Weight, Flame } from "lucide-react";

interface StatsRowProps {
  totalDistance: number; // km
  totalWeight: number; // kg
  activeDays: number; // gün sayısı
}

export function StatsRow({ totalDistance, totalWeight, activeDays }: StatsRowProps) {
  return (
    <div className="animate-fade-in-up grid grid-cols-3 gap-3">
      {[
        {
          icon: Activity,
          label: "Total Distance",
          value: totalDistance.toString(),
          unit: "km",
        },
        {
          icon: Weight,
          label: "Total Weight",
          value: totalWeight.toString(),
          unit: "kg",
        },
        {
          icon: Flame,
          label: "Active Days",
          value: activeDays.toString(),
          unit: "days",
        },
      ].map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800 bg-surface-1 p-3 text-center"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-dim text-primary mx-auto mb-2">
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <p className="text-xs text-muted mb-1.5">{stat.label}</p>
            <p className="text-lg font-bold text-foreground">
              {stat.value} <span className="text-xs text-muted">{stat.unit}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
