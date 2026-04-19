/**
 * Yutuqlar jadvalidagi inglizcha matnlarni UI uchun o‘zbekchaga (DB o‘zgarmasa ham ishlashi uchun).
 */

const NAME_UZ: Record<string, string> = {
  'First Step': 'Birinchi qadam',
  'First Lesson': 'Birinchi qadam',
  'Five Star': 'Besh yulduz',
  'Perfect Five': 'Besh yulduz',
  'Week Warrior': 'Haftaning qahramoni',
  'Weekly Hero': 'Haftaning qahramoni',
  '7 Day Streak': 'Haftaning qahramoni',
  'XP Master': 'Tajriba ustasi',
  'XP Champion': 'Tajriba ustasi',
  'Mathematician': 'Matematik',
  'Math Whiz': 'Matematik',
  'Perfect Student': 'Mukammal o‘quvchi',
  'Perfectionist': 'Mukammal o‘quvchi',
  'Speed Demon': 'Tezkor',
  'Quick Learner': 'Tezkor',
  'Fast Finisher': 'Tezkor',
  'Consistent': 'Izchil',
  'Dedicated': 'Izchil',
  '30 Day Streak': 'Izchil',
};

const DESC_UZ: Record<string, string> = {
  'Complete your first lesson': 'Birinchi darsingizni tugating.',
  'Complete your first lesson!': 'Birinchi darsingizni tugating!',
  'Finish your first lesson': 'Birinchi darsingizni tugating.',
  'Finish your first lesson!': 'Birinchi darsingizni tugating!',
  'Birinchi darsingizni tugatdingiz!': 'Birinchi darsingizni tugatdingiz!',
  'Complete 5 lessons with 100% accuracy': '5 ta darsni 100% aniqlik bilan tugating.',
  '5 ta darsni mukammal tugatdingiz': '5 ta darsni mukammal tugatdingiz.',
  'Maintain a 7-day learning streak': '7 kun ketma-ket o‘qing.',
  '7 kun ketma-ket o‘rgandingiz': '7 kun ketma-ket o‘rgandingiz.',
  'Earn 1000 total XP': 'Jami 1000 tajriba balli to‘plang.',
  '1000 XP to‘pladingiz': '1000 tajriba balli to‘pladingiz.',
  'Complete 10 lessons': '10 ta darsni tugating.',
  '10 ta darsni tugatdingiz': '10 ta darsni tugatdingiz.',
  'Finish a lesson with 100% accuracy': 'Bir darsni 100% aniqlik bilan tugating.',
  '100% aniqlik bilan dars tugatdingiz': '100% aniqlik bilan dars tugatdingiz.',
  'Complete a lesson in under 1 minute': 'Bir darsni 1 daqiqadan kam vaqtda tugating.',
  '1 daqiqada darsni tugatdingiz': '1 daqiqada darsni tugatdingiz.',
  'Maintain a 30-day streak': '30 kun ketma-ket o‘qing.',
  '30 kun ketma-ket o‘rgandingiz': '30 kun ketma-ket o‘rgandingiz.',
};

function applyDescPatterns(text: string): string {
  let t = text.trim();
  t = t.replace(/^Earn (\d[\d,]*)\s*XP\.?$/i, 'Jami $1 tajriba balli to‘plang.');
  t = t.replace(/^Reach (\d[\d,]*)\s*XP\.?$/i, '$1 tajriba balliga yeting.');
  t = t.replace(/^Get (\d[\d,]*)\s*XP\.?$/i, '$1 tajriba balli oling.');
  t = t.replace(/^Collect (\d[\d,]*)\s*XP\.?$/i, '$1 tajriba balli yig‘ing.');
  t = t.replace(/\b(\d[\d,]*)\s*XP\b/g, '$1 tajriba balli');
  t = t.replace(/\bXP\b/g, 'tajriba balli');
  return t;
}

export function achievementNameUz(name: string | null | undefined): string {
  if (!name?.trim()) return '';
  const raw = name.trim();
  if (NAME_UZ[raw]) return NAME_UZ[raw];
  return raw.replace(/\bXP\b/g, 'tajriba balli');
}

export function achievementDescriptionUz(description: string | null | undefined): string {
  if (!description?.trim()) return '';
  const raw = description.trim();
  if (DESC_UZ[raw]) return DESC_UZ[raw];
  return applyDescPatterns(raw);
}
