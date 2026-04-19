import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLessons, useTopics, useUserProgress } from '@/hooks/useLessons';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { toUzbekLessonTitle } from '@/lib/lessonI18n';
import { toUzbekTopicDescription, toUzbekTopicName } from '@/lib/topicI18n';

const TopicMap = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: topics } = useTopics();
  const topic = topics?.find(t => t.slug === slug);
  const { data: lessons } = useLessons(topic?.id);
  const { data: progress } = useUserProgress();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/auth" replace />;
  if (!topic) return <div className="flex min-h-screen items-center justify-center text-xl font-bold text-muted-foreground">Yuklanmoqda...</div>;

  const isLessonUnlocked = (lessonIndex: number) => {
    if (lessonIndex === 0) return true;
    const prevLesson = lessons?.[lessonIndex - 1];
    if (!prevLesson) return false;
    return progress?.some(p => p.lesson_id === prevLesson.id && p.completed) ?? false;
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress?.some(p => p.lesson_id === lessonId && p.completed) ?? false;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => { navigate('/dashboard'); }} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{topic.icon}</span>
            <div>
              <h1 className="font-extrabold text-foreground text-lg leading-tight">{toUzbekTopicName(topic.name)}</h1>
              <p className="text-xs font-semibold text-muted-foreground">
                {topic.description ? toUzbekTopicDescription(topic.description) : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Duolingo-style path */}
        <div className="relative flex flex-col items-center gap-4">
          {/* Connecting line */}
          <div className="absolute top-0 bottom-0 w-1 bg-border rounded-full" style={{ left: '50%', transform: 'translateX(-50%)' }} />

          {lessons?.map((lesson, i) => {
            const unlocked = isLessonUnlocked(i);
            const completed = isLessonCompleted(lesson.id);
            const offset = i % 2 === 0 ? -40 : 40;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
                style={{ marginLeft: `${offset}px` }}
              >
                <motion.button
                  whileHover={unlocked ? { scale: 1.08 } : {}}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (unlocked) navigate(`/lesson/${lesson.id}`);
                  }}
                  disabled={!unlocked}
                  className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-lg transition-all ${
                    completed
                      ? 'border-primary bg-primary/10 shadow-primary/20'
                      : unlocked
                      ? 'border-quest-orange bg-quest-orange/10 shadow-quest-orange/20 cursor-pointer'
                      : 'border-border bg-muted cursor-not-allowed opacity-50'
                  }`}
                >
                  {completed ? (
                    <CheckCircle className="h-8 w-8 text-primary" />
                  ) : unlocked ? (
                    <span className="text-2xl font-black text-quest-orange">{lesson.level_number}</span>
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  )}
                </motion.button>
                <p className={`mt-2 text-center text-xs font-bold max-w-[120px] ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {toUzbekLessonTitle(lesson.title)}
                </p>
                <p className="text-center text-xs text-muted-foreground">+{lesson.xp_reward} ball</p>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default TopicMap;
