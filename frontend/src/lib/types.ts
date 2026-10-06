export type UserStats = {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  total_xp: number;
  streak: number;
  hearts: number;
  max_hearts: number;
  gems: number;
  daily_xp_goal: number;
  daily_xp_today: number;
  last_activity_date: string | null;
  hearts_updated_at: string;
};

export type SkillNode = {
  id: number;
  unit_id: number;
  order_index: number;
  title: string;
  icon: string;
  color: string;
  crowns: number;
  lessons_total: number;
  lessons_completed: number;
  state: "locked" | "available" | "completed";
  current_lesson_id: number | null;
};

export type UnitNode = {
  id: number;
  order_index: number;
  title: string;
  description: string;
  section_label: string;
  skills: SkillNode[];
};

export type CourseTree = {
  language_id: number;
  language_name: string;
  language_code: string;
  units: UnitNode[];
};

export type Exercise = {
  id: number;
  order_index: number;
  exercise_type: string;
  prompt: string;
  question: string;
  options: string[];
  pairs: { left: string; right: string }[];
  word_bank: string[];
  hint: string;
};

export type LessonDetail = {
  id: number;
  skill_id: number;
  title: string;
  xp_reward: number;
  exercises: Exercise[];
};

export type AnswerResult = {
  correct: boolean;
  correct_answer: unknown;
  hearts_remaining: number;
  lesson_failed: boolean;
  feedback_message: string;
};

export type LessonCompleteResult = {
  xp_earned: number;
  total_xp: number;
  streak: number;
  daily_xp_today: number;
  crowns: number;
  skill_completed: boolean;
};

export type LeaderboardEntry = {
  rank: number;
  display_name: string;
  total_xp: number;
  avatar_color: string;
  is_current_user: boolean;
};
