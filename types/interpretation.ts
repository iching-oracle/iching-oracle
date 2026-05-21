import type { HexagramRecord } from "@/lib/hexagrams";

export type InterpretationMode =
  | "traditional"
  | "psychological"
  | "spiritual"
  | "direct";

export type InterpretationSectionId =
  | "overall-reading"
  | "current-situation"
  | "hidden-obstacles"
  | "recommended-action"
  | "timing-momentum"
  | "emotional-insight"
  | "summary";

export type InterpretationSection = {
  id: InterpretationSectionId;
  title: string;
  content: string;
};

export type ChangingLineContext = {
  position: number;
  lineValue: 6 | 7 | 8 | 9;
  meaning: string;
};

export type OracleHexagram = {
  number: number;
  title: string;
  chineseName: string;
  englishName: string;
  judgment: string;
};

export type OracleReadingContext = {
  question: string;
  language: string;
  mode: InterpretationMode;
  emotionalContext: string;
  primaryHexagram: OracleHexagram;
  transformedHexagram: OracleHexagram | null;
  changingLines: ChangingLineContext[];
  lineValues: number[];
};

export type ParsedInterpretation = {
  mode: InterpretationMode;
  sections: InterpretationSection[];
  raw: string;
};

export type InterpretationStreamEvent =
  | { type: "chunk"; text: string }
  | { type: "done"; raw: string; sections: InterpretationSection[] }
  | { type: "error"; message: string };

export function hexagramRecordToOracle(hex: HexagramRecord): OracleHexagram {
  return {
    number: hex.number,
    title: hex.title,
    chineseName: hex.chineseName,
    englishName: hex.englishName,
    judgment: hex.judgment,
  };
}
