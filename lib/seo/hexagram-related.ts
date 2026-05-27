/** Related hexagram numbers for internal linking (King Wen neighbors + complements). */
export function getRelatedHexagramNumbers(number: number): number[] {
  const related = new Set<number>();
  if (number > 1) related.add(number - 1);
  if (number < 64) related.add(number + 1);
  const complement = 65 - number;
  if (complement >= 1 && complement <= 64) related.add(complement);
  const cycle = ((number + 7) % 64) + 1;
  related.add(cycle);
  related.delete(number);
  return [...related].slice(0, 4);
}
