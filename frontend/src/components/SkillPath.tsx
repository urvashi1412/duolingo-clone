"use client";

import Link from "next/link";
import type { CourseTree, SkillNode } from "@/lib/types";

const ICONS: Record<string, string> = {
  chat: "💬",
  book: "📖",
  wave: "👋",
  users: "👥",
  plane: "✈️",
  star: "⭐",
};

type Props = {
  course: CourseTree;
};

export function SkillPath({ course }: Props) {
  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      {course.units.map((unit) => (
        <section key={unit.id} className="mb-10">
          <div className="duo-card mb-8 overflow-hidden border-duo-green bg-duo-green text-white">
            <div className="px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                {unit.section_label}
              </p>
              <h2 className="text-xl font-extrabold">{unit.title}</h2>
              <p className="text-sm opacity-90">{unit.description}</p>
            </div>
          </div>
          <div className="relative flex flex-col items-center gap-2">
            {unit.skills.map((skill, index) => (
              <div key={skill.id} className="relative flex w-full flex-col items-center">
                {index > 0 && (
                  <svg
                    className="mb-2 h-10 w-24 text-white/40"
                    viewBox="0 0 96 40"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d={
                        index % 2 === 0
                          ? "M72 0 C48 20, 48 20, 24 40"
                          : "M24 0 C48 20, 48 20, 72 40"
                      }
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                <PathNode
                  skill={skill}
                  offset={index % 2 === 0 ? "left" : "right"}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function PathNode({
  skill,
  offset,
}: {
  skill: SkillNode;
  offset: "left" | "right";
}) {
  const icon = ICONS[skill.icon] ?? "⭐";
  const locked = skill.state === "locked";
  const completed = skill.state === "completed";
  const href =
    !locked && skill.current_lesson_id
      ? `/lesson/${skill.current_lesson_id}`
      : "#";

  const ring = (
    <div
      className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 bg-white text-3xl shadow-lg transition hover:scale-105 ${
        locked
          ? "border-duo-gray-dark opacity-60 grayscale"
          : completed
            ? "border-duo-yellow"
            : "border-duo-green"
      }`}
      style={{ boxShadow: locked ? undefined : `0 0 0 6px ${skill.color}33` }}
    >
      <span>{icon}</span>
      {skill.crowns > 0 && (
        <span className="absolute -bottom-1 flex gap-0.5 text-sm">
          {"👑".repeat(Math.min(skill.crowns, 3))}
        </span>
      )}
      {locked && (
        <span className="absolute -right-1 -top-1 rounded-full bg-duo-gray px-1.5 text-xs">
          🔒
        </span>
      )}
    </div>
  );

  return (
    <div
      className={`flex w-full max-w-xs ${offset === "left" ? "justify-start pl-4" : "justify-end pr-4"}`}
    >
      {locked ? (
        <div className="cursor-not-allowed">{ring}</div>
      ) : (
        <Link href={href} className="group flex flex-col items-center gap-2">
          {ring}
          <span className="rounded-xl bg-white/90 px-3 py-1 text-center text-sm font-extrabold text-duo-feather group-hover:bg-white">
            {skill.title}
          </span>
          <span className="text-xs font-bold text-duo-feather">
            {skill.lessons_completed}/{skill.lessons_total} lessons
          </span>
        </Link>
      )}
    </div>
  );
}
