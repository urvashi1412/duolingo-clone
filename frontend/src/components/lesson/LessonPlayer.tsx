"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import type { LessonDetail, UserStats } from "@/lib/types";
import { ExerciseRenderer } from "./ExerciseViews";
import { FeedbackBar } from "./FeedbackBar";

type Props = {
  lesson: LessonDetail;
  initialUser: UserStats;
};

export function LessonPlayer({ lesson, initialUser }: Props) {
  const router = useRouter();
  const exercises = [...lesson.exercises].sort(
    (a, b) => a.order_index - b.order_index
  );
  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(initialUser.hearts);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<{
    variant: "correct" | "incorrect";
    title: string;
    subtitle?: string;
  } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);
  const [completeStats, setCompleteStats] = useState<{
    xp: number;
    streak: number;
  } | null>(null);

  const current = exercises[index];
  const progress = ((index + (feedback ? 1 : 0)) / exercises.length) * 100;

  const finishLesson = useCallback(async () => {
    const result = await api.completeLesson(
      lesson.id,
      correctCount,
      exercises.length
    );
    setCompleteStats({ xp: result.xp_earned, streak: result.streak });
    setShowComplete(true);
  }, [correctCount, exercises.length, lesson.id]);

  const handleSubmit = async (answer: unknown) => {
    if (!current || checking) return;
    setChecking(true);
    try {
      const result = await api.checkAnswer(lesson.id, current.id, answer);
      setHearts(result.hearts_remaining);

      if (result.lesson_failed) {
        setShowOutOfHearts(true);
        setChecking(false);
        return;
      }

      if (result.correct) {
        setCorrectCount((c) => c + 1);
        setFeedback({ variant: "correct", title: "Nice!" });
      } else {
        const subtitle =
          result.correct_answer != null
            ? String(
                Array.isArray(result.correct_answer)
                  ? result.correct_answer.join(" ")
                  : result.correct_answer
              )
            : undefined;
        setFeedback({
          variant: "incorrect",
          title: "Correct solution:",
          subtitle,
        });
      }
    } finally {
      setChecking(false);
    }
  };

  const continueAfterFeedback = async () => {
    setFeedback(null);
    if (index >= exercises.length - 1) {
      await finishLesson();
      return;
    }
    setIndex((i) => i + 1);
  };

  const refillGems = async () => {
    const result = await api.refillHearts();
    const me = await api.getMe();
    setHearts(me.hearts);
    if (result.message.includes("refilled") || me.hearts > 0) {
      setShowOutOfHearts(false);
    }
  };

  const practiceRefill = async () => {
    await api.practiceRefill();
    const me = await api.getMe();
    setHearts(me.hearts);
    setShowOutOfHearts(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/" className="text-duo-feather hover:text-gray-800">
            ✕
          </Link>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-duo-gray">
            <div
              className="h-full rounded-full bg-duo-green transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-1 font-extrabold text-duo-red">
            <span>❤️</span>
            <span>{hearts}</span>
          </div>
        </div>

        {current && (
          <div className="pb-32 pt-6">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-duo-feather">
              {current.prompt}
            </p>
            <ExerciseRenderer
              exercise={current}
              disabled={Boolean(feedback) || checking}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>

      <FeedbackBar
        variant={feedback?.variant ?? "hidden"}
        title={feedback?.title ?? ""}
        subtitle={feedback?.subtitle}
        onContinue={continueAfterFeedback}
      />

      {showComplete && completeStats && (
        <Modal>
          <div className="text-center">
            <p className="text-5xl">🎉</p>
            <h2 className="mt-4 text-3xl font-extrabold text-duo-yellow">
              Lesson complete!
            </h2>
            <p className="mt-2 text-lg font-bold text-duo-feather">
              +{completeStats.xp} XP · {completeStats.streak} day streak
            </p>
            <button
              type="button"
              className="duo-btn-green mt-8 w-full"
              onClick={() => router.push("/")}
            >
              Continue
            </button>
          </div>
        </Modal>
      )}

      {showOutOfHearts && (
        <Modal>
          <div className="text-center">
            <p className="text-5xl">💔</p>
            <h2 className="mt-4 text-2xl font-extrabold text-duo-red">
              You ran out of hearts!
            </h2>
            <p className="mt-2 text-sm font-bold text-duo-feather">
              Practice to earn a heart, or refill with gems.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                className="duo-btn-blue w-full"
                onClick={practiceRefill}
              >
                Practice (+1 heart)
              </button>
              <button
                type="button"
                className="duo-btn-green w-full"
                onClick={refillGems}
              >
                Refill with gems
              </button>
              <Link href="/" className="duo-btn-outline block w-full text-center">
                Back to path
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="duo-card w-full max-w-md animate-bounce-in p-8">{children}</div>
    </div>
  );
}
