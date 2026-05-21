export function formatChangingLinesList(lines: number[]): string {
  if (lines.length === 0) return "—";
  return lines.join(", ");
}
