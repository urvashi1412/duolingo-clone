import { TopBar } from "@/components/TopBar";
import { api } from "@/lib/api";

export default async function ProfilePage() {
  const user = await api.getMe();

  return (
    <div className="min-h-screen bg-white md:rounded-tl-2xl">
      <TopBar user={user} />
      <div className="mx-auto max-w-lg px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-4xl font-black text-white"
            style={{ backgroundColor: user.avatar_color }}
          >
            {user.display_name.charAt(0)}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">{user.display_name}</h1>
          <p className="text-sm font-bold text-duo-feather">@{user.username}</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <StatCard label="Total XP" value={user.total_xp} emoji="⚡" />
          <StatCard label="Day streak" value={user.streak} emoji="🔥" />
          <StatCard label="Hearts" value={user.hearts} emoji="❤️" />
          <StatCard label="Gems" value={user.gems} emoji="💎" />
        </div>

        <div className="duo-card mt-8 p-5">
          <h2 className="font-extrabold text-duo-feather">Achievements</h2>
          <p className="mt-2 text-sm font-bold text-duo-feather">
            🏅 Wildfire — 3 day streak (earned)
          </p>
          <p className="mt-1 text-sm font-bold text-duo-gray-dark">
            🔒 Scholar — Complete 5 skills
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  emoji,
}: {
  label: string;
  value: number;
  emoji: string;
}) {
  return (
    <div className="duo-card p-4 text-center">
      <p className="text-2xl">{emoji}</p>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-bold uppercase text-duo-feather">{label}</p>
    </div>
  );
}
