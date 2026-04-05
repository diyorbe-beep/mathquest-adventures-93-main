import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, BookOpen, HelpCircle, BarChart3, Plus, Trash2, Pencil } from 'lucide-react';
import {
  useAdminUsers,
  useAdminUserRoles,
  useAdminLessons,
  useAdminQuestions,
  useAdminAnalytics,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useAssignRole,
} from '@/hooks/useAdmin';
import { useTopics } from '@/hooks/useLessons';
import { getAvatarEmoji } from '@/lib/avatars';
import { toUzbekQuestionText } from '@/lib/questionI18n';
import { toUzbekLessonDescription, toUzbekLessonTitle } from '@/lib/lessonI18n';
import { toUzbekTopicName } from '@/lib/topicI18n';
import { toast } from 'sonner';

type Tab = 'analytics' | 'users' | 'lessons' | 'questions';

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  parent: 'Ota-ona',
  student: 'O‘quvchi',
};

const questionTypeLabels: Record<string, string> = {
  multiple_choice: 'Ko‘p tanlov',
  drag_drop: 'Surib qo‘yish',
  equation_builder: 'Tenglama tuzish',
  type_answer: 'Javob yozish',
  number_line: 'Son o‘qi',
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('analytics');

  const tabs: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
    { key: 'analytics', label: 'Analitika', icon: BarChart3 },
    { key: 'users', label: 'Foydalanuvchilar', icon: Users },
    { key: 'lessons', label: 'Darslar', icon: BookOpen },
    { key: 'questions', label: 'Savollar', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => { navigate('/dashboard'); }} className="rounded-xl p-2 hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">⚙️ Administrator paneli</h1>
        </div>
        <div className="container mx-auto px-4 flex gap-1 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all whitespace-nowrap ${
                tab === t.key ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === 'analytics' && <AnalyticsTab />}
          {tab === 'users' && <UsersTab />}
          {tab === 'lessons' && <LessonsTab />}
          {tab === 'questions' && <QuestionsTab />}
        </motion.div>
      </main>
    </div>
  );
};

// --- Analytics Tab ---
const AnalyticsTab = () => {
  const { data: analytics, isLoading } = useAdminAnalytics();
  if (isLoading) return <div className="animate-pulse text-center py-8 text-primary font-bold">Analitika yuklanmoqda...</div>;
  if (!analytics) return null;

  const stats = [
    { label: 'Jami foydalanuvchilar', value: analytics.totalUsers, icon: '👥', color: 'bg-quest-blue/10 text-quest-blue' },
    { label: 'Kunlik faol (DAU)', value: analytics.dau, icon: '📅', color: 'bg-quest-green/10 text-quest-green' },
    { label: 'Haftalik faol (WAU)', value: analytics.wau, icon: '📊', color: 'bg-quest-purple/10 text-quest-purple' },
    { label: 'Bajarilgan darslar', value: analytics.lessonsCompleted, icon: '✅', color: 'bg-quest-orange/10 text-quest-orange' },
    { label: 'Jami savollar', value: analytics.totalQuestions, icon: '❓', color: 'bg-quest-pink/10 text-quest-pink' },
    { label: 'O‘rtacha aniqlik', value: `${analytics.avgAccuracy}%`, icon: '🎯', color: 'bg-quest-yellow/10 text-quest-yellow' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {stats.map(s => (
        <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
          <span className="text-2xl">{s.icon}</span>
          <p className="text-xs font-semibold opacity-70 mt-1">{s.label}</p>
          <p className="text-2xl font-black">{s.value}</p>
        </div>
      ))}
    </div>
  );
};

// --- Users Tab ---
const UsersTab = () => {
  const { data: users, isLoading } = useAdminUsers();
  const { data: roles } = useAdminUserRoles();
  const assignRole = useAssignRole();

  if (isLoading) return <div className="animate-pulse text-center py-8 text-primary font-bold">Foydalanuvchilar yuklanmoqda...</div>;

  const getUserRoles = (userId: string) => roles?.filter(r => r.user_id === userId).map(r => r.role) ?? [];

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground mb-3">{users?.length ?? 0} ta foydalanuvchi</p>
      {users?.map(user => {
        const userRoles = getUserRoles(user.user_id);
        return (
          <div key={user.id} className="rounded-2xl bg-card p-4 shadow-sm flex items-center gap-4">
            <span className="text-3xl">{getAvatarEmoji(user.avatar_id)}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground font-semibold">
                {user.level}-daraja · {user.xp} XP · 🔥 {user.streak_days}
              </p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {userRoles.map(role => (
                  <span key={role} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {roleLabels[role] ?? role}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-1">
              {!userRoles.includes('admin') && (
                <button
                  onClick={() => {
                    assignRole.mutate({ userId: user.user_id, role: 'admin' });
                    toast.success(`${user.username} administrator qilindi`);
                  }}
                  className="rounded-lg bg-quest-purple/10 px-2 py-1 text-xs font-bold text-quest-purple hover:bg-quest-purple/20 transition-colors"
                >
                  + Administrator
                </button>
              )}
              {!userRoles.includes('parent') && (
                <button
                  onClick={() => {
                    assignRole.mutate({ userId: user.user_id, role: 'parent' });
                    toast.success(`${user.username}ga ota-ona roli berildi`);
                  }}
                  className="rounded-lg bg-quest-blue/10 px-2 py-1 text-xs font-bold text-quest-blue hover:bg-quest-blue/20 transition-colors"
                >
                  + Ota-ona
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Lessons Tab ---
const LessonsTab = () => {
  const { data: lessons, isLoading } = useAdminLessons();
  const { data: topics } = useTopics();
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const [showForm, setShowForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', topic_id: '', level_number: 1, xp_reward: 10, sort_order: 1, description: '' });

  if (isLoading) return <div className="animate-pulse text-center py-8 text-primary font-bold">Darslar yuklanmoqda...</div>;

  const resetForm = () => {
    setEditingLessonId(null);
    setShowForm(false);
    setForm({ title: '', topic_id: '', level_number: 1, xp_reward: 10, sort_order: 1, description: '' });
  };

  const handleSave = async () => {
    if (!form.title || !form.topic_id) { toast.error('Majburiy maydonlarni to‘ldiring'); return; }
    try {
      if (editingLessonId) {
        await updateLesson.mutateAsync({ id: editingLessonId, updates: form });
        toast.success('Dars yangilandi!');
      } else {
        await createLesson.mutateAsync(form);
        toast.success('Dars yaratildi!');
      }
      resetForm();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-muted-foreground">{lessons?.length ?? 0} ta dars</p>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md transition-all active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" /> {editingLessonId ? 'Tahrirlash' : 'Dars qo‘shish'}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl bg-card p-5 shadow-md mb-4 space-y-3"
        >
          <input
            placeholder="Dars nomi"
            value={form.title}
            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); }}
            className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 font-semibold text-foreground focus:border-primary focus:outline-none"
          />
          <select
            value={form.topic_id}
            onChange={e => { setForm(f => ({ ...f, topic_id: e.target.value })); }}
            className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 font-semibold text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">Mavzuni tanlang</option>
            {topics?.map(t => (
              <option key={t.id} value={t.id}>
                {t.icon} {toUzbekTopicName(t.name)}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" placeholder="Daraja №" value={form.level_number}
              onChange={e => { setForm(f => ({ ...f, level_number: +e.target.value })); }}
              className="rounded-xl border-2 border-border bg-background px-3 py-2 font-semibold text-foreground focus:border-primary focus:outline-none" />
            <input type="number" placeholder="XP" value={form.xp_reward}
              onChange={e => { setForm(f => ({ ...f, xp_reward: +e.target.value })); }}
              className="rounded-xl border-2 border-border bg-background px-3 py-2 font-semibold text-foreground focus:border-primary focus:outline-none" />
            <input type="number" placeholder="Tartib" value={form.sort_order}
              onChange={e => { setForm(f => ({ ...f, sort_order: +e.target.value })); }}
              className="rounded-xl border-2 border-border bg-background px-3 py-2 font-semibold text-foreground focus:border-primary focus:outline-none" />
          </div>
          <button onClick={handleSave} disabled={createLesson.isPending || updateLesson.isPending}
            className="w-full rounded-xl bg-primary py-2.5 font-bold text-primary-foreground shadow-md transition-all active:scale-[0.97] disabled:opacity-60">
            {createLesson.isPending || updateLesson.isPending
              ? 'Saqlanmoqda...'
              : editingLessonId
              ? 'Darsni saqlash'
              : 'Dars yaratish'}
          </button>
        </motion.div>
      )}

      <div className="space-y-2">
        {lessons?.map(lesson => (
          <div key={lesson.id} className="rounded-2xl bg-card p-4 shadow-sm flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate">{toUzbekLessonTitle(lesson.title)}</p>
              {lesson.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {toUzbekLessonDescription(lesson.description)}
                </p>
              )}
              <p className="text-xs text-muted-foreground font-semibold">
                {lesson.level_number}-daraja · +{lesson.xp_reward} XP · {(lesson as any).topics?.icon}{' '}
                {toUzbekTopicName((lesson as any).topics?.name)}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingLessonId(lesson.id);
                setForm({
                  title: lesson.title ?? '',
                  topic_id: lesson.topic_id ?? '',
                  level_number: lesson.level_number ?? 1,
                  xp_reward: lesson.xp_reward ?? 10,
                  sort_order: lesson.sort_order ?? 1,
                  description: lesson.description ?? '',
                });
                setShowForm(true);
              }}
              className="rounded-lg p-2 text-quest-blue hover:bg-quest-blue/10 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => { deleteLesson.mutate(lesson.id); toast.success('O‘chirildi'); }}
              className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Questions Tab ---
const QuestionsTab = () => {
  const { data: lessons } = useAdminLessons();
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const { data: questions, isLoading } = useAdminQuestions(selectedLesson || undefined);
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const [showForm, setShowForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [form, setForm] = useState({
    question_text: '', correct_answer: '', explanation: '',
    options: ['', '', '', ''],
    difficulty: 1, sort_order: 1, question_type: 'multiple_choice',
  });

  const resetForm = () => {
    setEditingQuestionId(null);
    setShowForm(false);
    setForm({ question_text: '', correct_answer: '', explanation: '', options: ['', '', '', ''], difficulty: 1, sort_order: 1, question_type: 'multiple_choice' });
  };

  const handleSave = async () => {
    if (!selectedLesson || !form.question_text || !form.correct_answer) {
      toast.error('Majburiy maydonlarni to‘ldiring');
      return;
    }
    try {
      const payload = {
        question_text: form.question_text,
        question_type: form.question_type,
        options: form.options.filter(Boolean),
        correct_answer: form.correct_answer,
        explanation: form.explanation || undefined,
        difficulty: form.difficulty,
        sort_order: form.sort_order,
      };
      if (editingQuestionId) {
        await updateQuestion.mutateAsync({ id: editingQuestionId, updates: payload });
        toast.success('Savol yangilandi!');
      } else {
        await createQuestion.mutateAsync({
          lesson_id: selectedLesson,
          ...payload,
        });
        toast.success('Savol yaratildi!');
      }
      resetForm();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <select
          value={selectedLesson}
          onChange={e => { setSelectedLesson(e.target.value); }}
          className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 font-semibold text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">Barcha darslar</option>
          {lessons?.map(l => <option key={l.id} value={l.id}>{toUzbekLessonTitle(l.title)}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-muted-foreground">{questions?.length ?? 0} ta savol</p>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          disabled={!selectedLesson}
          className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md transition-all active:scale-[0.97] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> {editingQuestionId ? 'Tahrirlash' : 'Savol qo‘shish'}
        </button>
      </div>

      {showForm && selectedLesson && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl bg-card p-5 shadow-md mb-4 space-y-3"
        >
          <input placeholder="Savol matni" value={form.question_text}
            onChange={e => { setForm(f => ({ ...f, question_text: e.target.value })); }}
            className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 font-semibold text-foreground focus:border-primary focus:outline-none" />
          
          <div className="grid grid-cols-2 gap-2">
            {form.options.map((opt, i) => (
              <input key={i} placeholder={`Variant ${i + 1}`} value={opt}
                onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm(f => ({ ...f, options: o })); }}
                className="rounded-xl border-2 border-border bg-background px-3 py-2 font-semibold text-foreground focus:border-primary focus:outline-none" />
            ))}
          </div>

          <input placeholder="To‘g‘ri javob" value={form.correct_answer}
            onChange={e => { setForm(f => ({ ...f, correct_answer: e.target.value })); }}
            className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 font-semibold text-foreground focus:border-primary focus:outline-none" />
          
          <input placeholder="Izoh (ixtiyoriy)" value={form.explanation}
            onChange={e => { setForm(f => ({ ...f, explanation: e.target.value })); }}
            className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 font-semibold text-foreground focus:border-primary focus:outline-none" />

          <div className="grid grid-cols-3 gap-2">
            <select value={form.question_type} onChange={e => { setForm(f => ({ ...f, question_type: e.target.value })); }}
              className="rounded-xl border-2 border-border bg-background px-3 py-2 font-semibold text-foreground focus:border-primary focus:outline-none">
              <option value="multiple_choice">Ko‘p tanlov</option>
              <option value="drag_drop">Surib qo‘yish</option>
              <option value="equation_builder">Tenglama tuzish (blok)</option>
              <option value="type_answer">Javob yozish</option>
              <option value="number_line">Son o‘qi (slider)</option>
            </select>
            <select value={form.difficulty} onChange={e => { setForm(f => ({ ...f, difficulty: +e.target.value })); }}
              className="rounded-xl border-2 border-border bg-background px-3 py-2 font-semibold text-foreground focus:border-primary focus:outline-none">
              <option value={1}>Oson</option>
              <option value={2}>O‘rta</option>
              <option value={3}>Qiyin</option>
            </select>
            <input type="number" placeholder="Tartib" value={form.sort_order}
              onChange={e => { setForm(f => ({ ...f, sort_order: +e.target.value })); }}
              className="rounded-xl border-2 border-border bg-background px-3 py-2 font-semibold text-foreground focus:border-primary focus:outline-none" />
          </div>

          <button onClick={handleSave} disabled={createQuestion.isPending || updateQuestion.isPending}
            className="w-full rounded-xl bg-primary py-2.5 font-bold text-primary-foreground shadow-md transition-all active:scale-[0.97] disabled:opacity-60">
            {createQuestion.isPending || updateQuestion.isPending
              ? 'Saqlanmoqda...'
              : editingQuestionId
              ? 'Savolni saqlash'
              : 'Savol yaratish'}
          </button>
          <p className="text-xs font-semibold text-muted-foreground">
            `equation_builder` uchun `correct_answer`: vergul bilan (masalan: `10,-,4`).
            `number_line` uchun `options`: `min:0`, `max:12`, `step:1`.
          </p>
        </motion.div>
      )}

      {isLoading ? (
        <div className="animate-pulse text-center py-8 text-primary font-bold">Yuklanmoqda...</div>
      ) : (
        <div className="space-y-2">
          {questions?.map(q => (
            <div key={q.id} className="rounded-2xl bg-card p-4 shadow-sm flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">{toUzbekQuestionText(q.question_text)}</p>
                <p className="text-xs text-muted-foreground font-semibold mt-1">
                  ✅ {q.correct_answer} · {q.question_type} · Qiyinlik: {q.difficulty}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingQuestionId(q.id);
                  if (q.lesson_id) setSelectedLesson(q.lesson_id);
                  const currentOptions = Array.isArray(q.options) ? [...(q.options as string[])] : [];
                  while (currentOptions.length < 4) currentOptions.push('');
                  setForm({
                    question_text: q.question_text ?? '',
                    correct_answer: q.correct_answer ?? '',
                    explanation: q.explanation ?? '',
                    options: currentOptions.slice(0, 4),
                    difficulty: q.difficulty ?? 1,
                    sort_order: q.sort_order ?? 1,
                    question_type: q.question_type ?? 'multiple_choice',
                  });
                  setShowForm(true);
                }}
                className="rounded-lg p-2 text-quest-blue hover:bg-quest-blue/10 transition-colors shrink-0"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => { deleteQuestion.mutate(q.id); toast.success('O‘chirildi'); }}
                className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {(!questions || questions.length === 0) && (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📭</p>
              <p className="font-bold text-muted-foreground">Savollar topilmadi. Dars tanlang yoki yangi savol qo‘shing!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
