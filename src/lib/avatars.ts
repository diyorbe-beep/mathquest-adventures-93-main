const AVATARS = [
  { id: 1, emoji: '🦊' },
  { id: 2, emoji: '🐼' },
  { id: 3, emoji: '🦁' },
  { id: 4, emoji: '🐸' },
  { id: 5, emoji: '🦄' },
  { id: 6, emoji: '🐲' },
  { id: 7, emoji: '🦋' },
  { id: 8, emoji: '🐬' },
  { id: 9, emoji: '🦉' },
  { id: 10, emoji: '🐙' },
  { id: 11, emoji: '🦈' },
  { id: 12, emoji: '🐢' },
];

export const getAvatarEmoji = (id: number): string => {
  return AVATARS.find(a => a.id === id)?.emoji ?? '🦊';
};

export default AVATARS;
