import { ThemeToggle } from "@/components/ThemeToggle";
import { TopBar } from "@/components/TopBar";
import { api } from "@/lib/api";

export default async function SettingsPage() {
  const user = await api.getMe();

  const placeholders = [
    "Super subscription",
    "Speech recognition",
    "Notifications",
    "Account settings",
  ];

  return (
    <div className="min-h-screen bg-white md:rounded-tl-2xl dark:bg-gray-900">
      <TopBar user={user} />
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-6 text-2xl font-extrabold dark:text-white">
          Settings
        </h1>
        <ul className="space-y-3">
          <li>
            <ThemeToggle />
          </li>
          {placeholders.map((item) => (
            <li
              key={item}
              className="duo-card flex items-center justify-between px-4 py-4 font-bold text-duo-feather dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {item}
              <span className="text-xs uppercase text-duo-gray-dark">
                Coming soon
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
