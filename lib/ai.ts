import "server-only";

import {
  LANGUAGE_INSTRUCTIONS,
  normalizeLanguageCode,
  type SupportedLanguageCode,
} from "@/lib/i18n/languages";
import { formatChangingLines } from "@/lib/iching";
import { fetchAiCompletion } from "@/lib/monitoring/ai-client";
import { captureException } from "@/lib/monitoring/sentry";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_TEMPERATURE = 0.8;
const DEFAULT_MAX_TOKENS = 2000;

const SYSTEM_PROMPT =
  "You are a wise I Ching master and philosopher. Provide profound, practical, and compassionate interpretations.";

export type InterpretationHexagram = {
  number: number;
  title: string;
  judgment: string;
};

export type InterpretationInput = {
  question: string;
  primaryHexagram: InterpretationHexagram;
  transformedHexagram?: InterpretationHexagram | null;
  changingLines?: number[];
  language?: string | null;
};

export type InterpretationResult = {
  text: string;
  pending: boolean;
};

export const INTERPRETATION_UNAVAILABLE_MESSAGE = `
# Interpretation Temporarily Unavailable

We successfully generated and saved your I Ching reading, but the AI interpretation could not be produced at this time.

This is usually caused by:
- AI service quota limits
- Temporary service interruptions
- API configuration issues

Please try again later. Your reading has been safely stored in your History.
`.trim();

/** Legacy placeholder text from early readings — not generated anymore. */
export function isLegacyPlaceholderInterpretation(text: string): boolean {
  return /^This is a temporary interpretation for hexagram \d+\./i.test(
    text.trim(),
  );
}

export function isInterpretationUnavailableMessage(text: string): boolean {
  return text.trim().startsWith("# Interpretation Temporarily Unavailable");
}

type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
  };
};

function getDeepSeekApiKey(): string {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }
  return apiKey;
}

function getDeepSeekModel(): string {
  return process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_MODEL;
}

type PromptLabels = {
  role: string;
  question: string;
  primary: string;
  primaryHexagram: string;
  judgment: string;
  changing: string;
  transformed: string;
  transformedHexagram: string;
  noTransformed: string;
  structure: string[];
  tone: string;
};

const PROMPT_LABELS: Record<SupportedLanguageCode, PromptLabels> = {
  de: {
    role: "Du bist ein weiser I-Ging-Meister und Philosoph.",
    question: "Frage des Nutzers",
    primary: "Haupthexagramm (gegenwärtige Situation)",
    primaryHexagram: "Hexagramm",
    judgment: "Urteil",
    changing: "Wandelnde Linien",
    transformed: "Wandelhexagramm (Zukunftstrend)",
    transformedHexagram: "Hexagramm",
    noTransformed:
      "Kein Wandelhexagramm (keine wandelnden Linien — die Situation ist relativ stabil).",
    structure: [
      "Die Kernbedeutung des Haupthexagramms und ihr Bezug zur Frage",
      "Die symbolische Bedeutung der wandelnden Linien — was sich wandelt und warum es jetzt sichtbar wird",
      "Die vom Wandelhexagramm angedeutete zukünftige Richtung und mögliche Entwicklung",
      "Praktische Empfehlungen und spirituelle Einsichten",
    ],
    tone: "Ton: warm, weise, einfühlsam und tiefgründig.",
  },
  en: {
    role: "You are a wise I Ching master and philosopher.",
    question: "User question",
    primary: "Primary hexagram (present situation)",
    primaryHexagram: "Hexagram",
    judgment: "Judgment",
    changing: "Changing lines",
    transformed: "Transformed hexagram (future trend)",
    transformedHexagram: "Hexagram",
    noTransformed:
      "No transformed hexagram (no changing lines — the situation is relatively stable).",
    structure: [
      "The core meaning of the primary hexagram and its relation to the question",
      "The symbolic meaning of the changing lines — what is shifting and why it appears now",
      "The future direction and possible outcomes indicated by the transformed hexagram",
      "Practical guidance and spiritual insight",
    ],
    tone: "Tone: warm, wise, compassionate, and insightful.",
  },
  "zh-CN": {
    role: "你是一位深谙《易经》的智慧占卜师与哲学家。",
    question: "用户问题",
    primary: "本卦（当下形势）",
    primaryHexagram: "卦",
    judgment: "卦辞",
    changing: "动爻",
    transformed: "变卦（未来趋势）",
    transformedHexagram: "卦",
    noTransformed: "变卦：无（此卦无动爻，局势相对稳定）。",
    structure: [
      "本卦的核心意义，以及与用户问题的关联",
      "动爻的象征意义——什么正在转变、为何此刻浮现",
      "变卦所揭示的未来方向与可能结果",
      "实际可采取的建议与心灵层面的启发",
    ],
    tone: "语气要温暖、睿智、具有洞察力。",
  },
};

function getPromptLabels(language: SupportedLanguageCode): PromptLabels {
  return PROMPT_LABELS[language];
}

export function buildInterpretationPrompt(input: InterpretationInput): string {
  const language = normalizeLanguageCode(input.language);
  const labels = getPromptLabels(language);
  const changingText = formatChangingLines(input.changingLines ?? []);
  const hasTransformed = Boolean(input.transformedHexagram);
  const languageInstruction = LANGUAGE_INSTRUCTIONS[language];

  const transformedSection = hasTransformed
    ? `
${labels.transformed}：
${labels.transformedHexagram} ${input.transformedHexagram!.number} — ${input.transformedHexagram!.title}
${labels.judgment}：${input.transformedHexagram!.judgment}
`
    : `
${labels.noTransformed}
`;

  const transformedStructureItem = hasTransformed
    ? labels.structure[2]
    : language === "de"
      ? "Bei fehlenden wandelnden Linien: Stabilität der gegenwärtigen Lage und Wege des vertiefenden Handelns"
      : language === "en"
        ? "When there are no changing lines: stability of the present situation and paths for deepening"
        : "在无动爻的情况下，当前局势的稳定与深耕之道";

  const structureWithVariant = [
    labels.structure[0],
    labels.structure[1],
    transformedStructureItem,
    labels.structure[3],
  ]
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n");

  return `
${labels.role}

${labels.question}：
${input.question}

${labels.primary}：
${labels.primaryHexagram} ${input.primaryHexagram.number} — ${input.primaryHexagram.title}
${labels.judgment}：${input.primaryHexagram.judgment}

${labels.changing}：
${changingText}
${transformedSection}

${languageInstruction}

Write 4 to 6 substantial paragraphs covering:
${structureWithVariant}

${labels.tone}
`.trim();
}

/**
 * Call DeepSeek chat completions with a raw prompt string.
 * @throws Error when the API request fails or returns no content
 */
export async function generateInterpretationFromPrompt(
  prompt: string,
): Promise<string> {
  const apiKey = getDeepSeekApiKey();
  const model = getDeepSeekModel();

  console.log("[deepseek] Generating interpretation...");

  const messages: DeepSeekMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  const response = await fetchAiCompletion(
    DEEPSEEK_API_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS,
      }),
    },
    { category: "deepseek_interpretation" },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[deepseek] API request failed", {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    });
    throw new Error(
      `DeepSeek API request failed (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  const data = (await response.json()) as DeepSeekChatResponse;

  if (data.error?.message) {
    console.error("[deepseek] API error payload", data.error);
    throw new Error(`DeepSeek API error: ${data.error.message}`);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("No interpretation returned from DeepSeek");
  }

  console.log("[deepseek] Interpretation generated successfully.");
  return content;
}

/**
 * Request AI interpretation for a full reading input.
 * Never throws — returns pending flag when DeepSeek is unavailable.
 */
export async function generateInterpretation(
  input: InterpretationInput,
): Promise<InterpretationResult> {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    console.error("[deepseek] DEEPSEEK_API_KEY is not configured");
    return {
      text: INTERPRETATION_UNAVAILABLE_MESSAGE,
      pending: true,
    };
  }

  try {
    const prompt = buildInterpretationPrompt(input);
    const text = await generateInterpretationFromPrompt(prompt);
    return { text, pending: false };
  } catch (error) {
    console.error("[deepseek] generateInterpretation failed", error);
    captureException(error, { category: "deepseek_interpretation" });
    return {
      text: INTERPRETATION_UNAVAILABLE_MESSAGE,
      pending: true,
    };
  }
}
