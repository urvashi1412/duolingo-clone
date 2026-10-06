import { TopBar } from "@/components/TopBar";
import { api } from "@/lib/api";

export default async function LeaderboardPage() {
  const [user, entries] = await Promise.all([
    api.getMe(),
    api.getLeaderboard(),
  ]);

  return (
    <div className="min-h-screen bg-white md:rounded-tl-2xl">
      <TopBar user={user} />
      <div className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-6 text-center text-2xl font-extrabold text-duo-orange">
          🛡️ Leaderboards
        </h1>
        <div className="duo-card overflow-hidden">
          {entries.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 border-b border-duo-gray px-4 py-3 last:border-0 ${
                entry.is_current_user ? "bg-duo-blue/10" : ""
              }`}
            >
              <span className="w-8 font-extrabold text-duo-feather">
                {entry.rank}
              </span>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                style={{ backgroundColor: entry.avatar_color }}
              >
                {entry.display_name.charAt(0)}
              </div>
              <span className="flex-1 font-bold">{entry.display_name}</span>
              <span className="font-extrabold text-duo-feather">
                {entry.total_xp} XP
              </span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm font-bold text-duo-feather">
          Friends & leagues — Coming soon
        </p>
      </div>
    </div>
  );
}
