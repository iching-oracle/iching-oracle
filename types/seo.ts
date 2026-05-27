export type HexagramTopic = "love" | "career" | "spirituality" | "general";

export type SeoPageType =
  | "hexagram"
  | "hexagram_topic"
  | "topic_cluster"
  | "guide"
  | "public_reading";

export type SeoContentBlock = {
  id: string;
  heading: string;
  body: string;
};

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type HexagramSeoContent = {
  number: number;
  chineseName: string;
  englishName: string;
  title: string;
  judgment: string;
  topic: HexagramTopic;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  traditionalMeaning: string;
  modernInterpretation: string;
  aiInsight: string;
  changingLines: Array<{ line: number; meaning: string }>;
  faqs: SeoFaqItem[];
  relatedHexagrams: number[];
  blocks: SeoContentBlock[];
};

export type LearnArticle = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
  sections: Array<{ id: string; heading: string; body: string }>;
};

export type ProgrammaticPageDef = {
  slug: string;
  type: SeoPageType;
  templateKey: string;
  hexagramNumber?: number;
  topic?: HexagramTopic;
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  blocks: SeoContentBlock[];
  faqs: SeoFaqItem[];
  noindex?: boolean;
};

export type PublicReadingSeoPayload = {
  id: string;
  publicSlug: string;
  question: string;
  hexagram: number;
  primaryTitle: string;
  chineseName: string;
  judgment: string;
  interpretation: string;
  summary: string;
  category: string;
  transformedHexagram: number | null;
  finalTitle: string | null;
  viewCount: number;
  shareCount: number;
  publishedAt: Date;
  createdAt: Date;
};
