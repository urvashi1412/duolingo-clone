import type {
  AnswerResult,
  CourseTree,
  LeaderboardEntry,
  LessonCompleteResult,
  LessonDetail,
  UserStats,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getMe: () => request<UserStats>("/api/users/me"),
  getCourse: () => request<CourseTree>("/api/course"),
  getLesson: (id: number) => request<LessonDetail>(`/api/lessons/${id}`),
  checkAnswer: (lessonId: number, exerciseId: number, answer: unknown) =>
    request<AnswerResult>(`/api/lessons/${lessonId}/check`, {
      method: "POST",
      body: JSON.stringify({ exercise_id: exerciseId, answer }),
    }),
  completeLesson: (
    lessonId: number,
    correctCount: number,
    totalCount: number
  ) =>
    request<LessonCompleteResult>(`/api/lessons/${lessonId}/complete`, {
      method: "POST",
      body: JSON.stringify({
        correct_count: correctCount,
        total_count: totalCount,
      }),
    }),
  refillHearts: () =>
    request<{ hearts: number; gems: number; message: string }>(
      "/api/users/hearts/refill",
      { method: "POST" }
    ),
  practiceRefill: () =>
    request<{ hearts: number; gems: number; message: string }>(
      "/api/users/practice/refill",
      { method: "POST" }
    ),
  getLeaderboard: () => request<LeaderboardEntry[]>("/api/leaderboard"),
};
