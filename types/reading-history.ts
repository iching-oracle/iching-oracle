export type ReadingHistoryItem = {
  id: string;
  question: string;
  primaryHexagramNumber: number;
  primaryHexagramName: string;
  changingLines: number[];
  finalHexagramNumber: number | null;
  finalHexagramName: string | null;
  interpretationSummary: string;
  createdAt: Date;
};
