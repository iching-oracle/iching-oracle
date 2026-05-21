export type DailyOraclePayload = {
  id: string;
  date: string;
  hexagramNumber: number;
  lineValues: number[];
  oracleMessage: string;
  emotionalInsight: string;
  recommendedAction: string;
  caution: string;
  reflectionQuote: string;
  luckyFocus: string;
  energyLevel: number;
  energyTheme: string;
  isFavorite: boolean;
  isAuthenticated: boolean;
  streak: number;
};

export type DailyOracleHistoryItem = {
  id: string;
  date: string;
  hexagramNumber: number;
  oracleMessage: string;
  reflectionQuote: string;
  energyLevel: number;
  isFavorite: boolean;
};

export type DailyOracleAIContent = {
  oracleMessage: string;
  emotionalInsight: string;
  recommendedAction: string;
  caution: string;
  reflectionQuote: string;
  luckyFocus: string;
  energyLevel: number;
  energyTheme: string;
};
