import { PathMascot } from "@/components/PathMascot";
import { SkillPath } from "@/components/SkillPath";
import { TopBar } from "@/components/TopBar";
import { api } from "@/lib/api";

export default async function HomePage() {
  const [user, course] = await Promise.all([api.getMe(), api.getCourse()]);

  return (
    <div>
      <TopBar user={user} />
      <div className="relative">
        <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-1 -translate-x-1/2 bg-white/20 md:block" />
        <PathMascot />
        <SkillPath course={course} />
      </div>
    </div>
  );
}
