import { useAuth } from '@/contexts/AuthContext';
import { useTopics, useLessons, useUserProgress } from '@/hooks/useLessons';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { toUzbekTopicDescription, toUzbekTopicName } from '@/lib/topicI18n';

const MapPage = () => {
  const { user } = useAuth();
  const { data: topics } = useTopics();
  const { data: allLessons } = useLessons();
  const { data: progress } = useUserProgress();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate('/dashboard')} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">🗺️ Sarguzasht xaritasi</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <div className="space-y-6">
          {topics?.map((topic, topicIdx) => {
            const topicLessons = allLessons?.filter(l => l.topic_id === topic.id) ?? [];
            const completedCount = progress?.filter(p => p.completed && topicLessons.some(l => l.id === p.lesson_id)).length ?? 0;
            const allComplete = completedCount === topicLessons.length && topicLessons.length > 0;

            // Topic is unlocked if first topic or previous topic is fully complete
            const prevTopic = topics?.[topicIdx - 1];
            const prevTopicLessons = prevTopic ? allLessons?.filter(l => l.topic_id === prevTopic.id) ?? [] : [];
            const prevComplete = topicIdx === 0 || (
              prevTopicLessons.length > 0 &&
              prevTopicLessons.every(l => progress?.some(p => p.lesson_id === l.id && p.completed))
            );

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: topicIdx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.button
                  whileHover={prevComplete ? { scale: 1.01 } : {}}
                  whileTap={prevComplete ? { scale: 0.98 } : {}}
                  onClick={() => prevComplete && navigate(`/topic/${topic.slug}`)}
                  disabled={!prevComplete}
                  className={`w-full rounded-2xl p-6 text-left transition-all ${
                    allComplete
                      ? 'bg-primary/10 border-2 border-primary/20 shadow-md'
                      : prevComplete
                      ? 'bg-card border-2 border-transparent shadow-md hover:shadow-lg hover:border-primary/20'
                      : 'bg-muted border-2 border-transparent opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-5xl ${!prevComplete ? 'grayscale' : ''}`}>{topic.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg text-foreground">{toUzbekTopicName(topic.name)}</h3>
                        {allComplete && <CheckCircle className="h-5 w-5 text-primary" />}
                        {!prevComplete && <Lock className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <p className="text-sm text-muted-foreground font-semibold">
                        {topic.description ? toUzbekTopicDescription(topic.description) : ''}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${topicLessons.length ? (completedCount / topicLessons.length) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{completedCount}/{topicLessons.length}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default MapPage;
