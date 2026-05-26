export type ShareCardTheme =
  | "midnight-gold"
  | "mystic-purple"
  | "minimal-light"
  | "ancient-scroll";

export type ShareCardFormat = "square" | "story" | "landscape" | "wallpaper";

export type ShareCardReadingData = {
  question: string;
  quote: string;
  primaryHexagram: {
    number: number;
    title: string;
    chineseName: string;
  };
  resultingHexagram: {
    number: number;
    title: string;
    chineseName: string;
  } | null;
  changingLinesLabel: string;
  categoryLabel: string;
  dateLabel: string;
};

export type ShareCardOptions = {
  theme: ShareCardTheme;
  format: ShareCardFormat;
  showWatermark: boolean;
  isPremium: boolean;
};
