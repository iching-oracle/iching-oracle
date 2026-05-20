export function truncate(text: string, length = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= length) return trimmed;
  return `${trimmed.slice(0, length).trim()}…`;
}
