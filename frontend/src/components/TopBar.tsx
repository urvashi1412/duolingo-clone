"use client";

import type { UserStats } from "@/lib/types";

type Props = {
  user: UserStats;
  compact?: boolean;
};

export function TopBar({ user, compact }: Props) {
  const goalProgress = Math.min(
    100,
    Math.round((user.daily_xp_today / user.daily_xp_goal) * 100)
  );

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between border-b-2 border-duo-gray bg-white px-4 dark:border-gray-700 dark:bg-gray-900 ${
        compact ? "py-2" : "py-3"
      }`}
    >
      <div className="flex items-center gap-2 md:hidden">
        <span className="text-xl font-black text-duo-green">duo</span>
      </div>
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-4 md:justify-end md:gap-6">
        <StatPill
          icon="⚡"
          value={user.total_xp}
          label="total XP"
          className="hidden text-duo-yellow sm:flex"
        />
        <StatPill
          icon="🔥"
          value={user.streak}
          label="day streak"
          className="text-duo-orange"
        />
        <StatPill
          icon="💎"
          value={user.gems}
          label="gems"
          className="text-duo-blue"
        />
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-duo-red">❤️</span>
          <span className="font-extrabold text-duo-red">{user.hearts}</span>
        </div>
        <div className="flex min-w-[120px] flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-bold text-duo-feather">
            <span>Daily Goal</span>
            <span>
              {user.daily_xp_today}/{user.daily_xp_goal} XP
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-duo-gray">
            <div
              className="h-full rounded-full bg-duo-yellow transition-all"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatPill({
  icon,
  value,
  label,
  className,
}: {
  icon: string;
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-extrabold ${className ?? ""}`}
      title={label}
    >
      <span>{icon}</span>
      <span>{value}</span>
    </div>
  );
}
