/** Random hexagram 1–64 with a temporary interpretation (no AI / coin cast). */
export function createPlaceholderReading() {
  const hexagram = Math.floor(Math.random() * 64) + 1;
  const interpretation = `This is a temporary interpretation for hexagram ${hexagram}.`;

  return {
    hexagram,
    changing: null as string | null,
    interpretation,
  };
}
