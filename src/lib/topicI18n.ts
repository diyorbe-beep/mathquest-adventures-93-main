/** Mavzular bazada inglizcha qolgan bo‘lsa ham UI o‘zbekcha */
const TOPIC_NAME_MAP: Record<string, string> = {
  Addition: 'Qo‘shish',
  Subtraction: 'Ayirish',
  Fractions: 'Kasrlar',
  Geometry: 'Geometriya',
  Multiplication: 'Ko‘paytirish',
  Division: 'Bo‘lish',
};

export const toUzbekTopicName = (name?: string | null): string => {
  if (!name) return '';
  const raw = name.trim();
  if (TOPIC_NAME_MAP[raw]) return TOPIC_NAME_MAP[raw];
  const lower = raw.toLowerCase();
  for (const [en, uz] of Object.entries(TOPIC_NAME_MAP)) {
    if (en.toLowerCase() === lower) return uz;
  }
  return raw;
};

const TOPIC_DESCRIPTION_MAP: Record<string, string> = {
  'Master adding numbers together': 'Sonlarni qo‘shishni mukammal o‘rganing',
  'Learn to subtract like a pro': 'Ayirishni ustadek o‘rganing',
  'Explore parts of a whole': 'Butunning qismlarini o‘rganing',
  'Discover shapes and angles': 'Shakllar va burchaklarni kashf qiling',
  'Discover Shakllar and Burchaklar': 'Shakllar va burchaklarni kashf qiling',
};

export const toUzbekTopicDescription = (description?: string | null): string => {
  if (!description) return '';
  const raw = description.trim();
  if (TOPIC_DESCRIPTION_MAP[raw]) return TOPIC_DESCRIPTION_MAP[raw];

  return raw
    .replace(/\bMaster adding numbers together\b/gi, 'Sonlarni qo‘shishni mukammal o‘rganing')
    .replace(/\bLearn to subtract like a pro\b/gi, 'Ayirishni ustadek o‘rganing')
    .replace(/\bExplore parts of a whole\b/gi, 'Butunning qismlarini o‘rganing')
    .replace(/\bDiscover\s+(?:shapes|Shakllar)\s+and\s+(?:angles|Burchaklar)\b/gi, 'Shakllar va burchaklarni kashf qiling');
};
