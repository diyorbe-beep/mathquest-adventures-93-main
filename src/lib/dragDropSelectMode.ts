/** DragDropQuestion bilan bir xil: qaysi holatda tartib muhim emas (tanlash rejimi) */
export function isDragDropSelectMode(questionText: string, correctAnswer: string, optionsLength: number): boolean {
  const correctParts = correctAnswer
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  const q = questionText.toLowerCase();
  const looksLikeOrdering =
    q.includes('order') ||
    q.includes('arrange') ||
    q.includes('tartib') ||
    q.includes('joylashtir') ||
    q.includes('ketma-ket') ||
    q.includes('surib');
  return correctParts.length < optionsLength && !looksLikeOrdering;
}
