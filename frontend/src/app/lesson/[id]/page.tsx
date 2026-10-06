import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { api } from "@/lib/api";

type Props = { params: Promise<{ id: string }> };

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const lessonId = Number(id);
  const [lesson, user] = await Promise.all([
    api.getLesson(lessonId),
    api.getMe(),
  ]);

  return <LessonPlayer lesson={lesson} initialUser={user} />;
}
