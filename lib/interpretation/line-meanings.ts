import type { SupportedLanguageCode } from "@/lib/i18n/languages";
import type { HexagramRecord } from "@/lib/hexagrams";
import type { ChangingLineContext } from "@/types/interpretation";

const POSITION_ARCHETYPES: Record<
  number,
  Record<SupportedLanguageCode, string>
> = {
  1: {
    en: "Foundation — the ground of the situation, what is just beginning or rooting",
    de: "Fundament — der Boden der Situation, was beginnt oder Wurzeln schlägt",
    "zh-CN": "初爻 — 事态根基，刚刚开始或正在扎根之处",
  },
  2: {
    en: "Inner response — how one meets the situation from within",
    de: "Innere Antwort — wie man die Lage von innen begegnet",
    "zh-CN": "二爻 — 内在回应，从内心面对局势的方式",
  },
  3: {
    en: "Transition — friction, choice, or a threshold between phases",
    de: "Übergang — Reibung, Wahl oder Schwelle zwischen Phasen",
    "zh-CN": "三爻 — 转折，摩擦、抉择或阶段之间的门槛",
  },
  4: {
    en: "Approach — moving toward a new role, relationship, or responsibility",
    de: "Annäherung — Aufnahme einer neuen Rolle, Beziehung oder Verantwortung",
    "zh-CN": "四爻 — 接近，迈向新角色、关系或责任",
  },
  5: {
    en: "Sovereignty — leadership, clarity, or the decisive center of power",
    de: "Herrschaft — Führung, Klarheit oder das entscheidende Zentrum der Kraft",
    "zh-CN": "五爻 — 主导，领导力、明晰或力量的核心",
  },
  6: {
    en: "Culmination — completion, excess, or what must be released",
    de: "Höhepunkt — Vollendung, Überschuss oder was losgelassen werden muss",
    "zh-CN": "上爻 — 极致，完成、过满或必须放下之处",
  },
};

const CHANGING_NATURE: Record<
  6 | 9,
  Record<SupportedLanguageCode, string>
> = {
  6: {
    en: "Old yin (6) transforming to yang — latent force emerging, a yin line becoming active",
    de: "Altes Yin (6) wird zu Yang — schlummernde Kraft bricht hervor",
    "zh-CN": "老阴（六）化阳 — 潜藏之力浮现，阴转主动",
  },
  9: {
    en: "Old yang (9) transforming to yin — peak force yielding, a yang line softening or completing",
    de: "Altes Yang (9) wird zu Yin — Höhepunkt gibt nach, Yang wird weich oder vollendet",
    "zh-CN": "老阳（九）化阴 — 盛极而柔，阳势收敛或完成",
  },
};

export function getChangingLineContexts(
  hexagram: HexagramRecord,
  lineValues: number[],
  changingPositions: number[],
  language: SupportedLanguageCode,
): ChangingLineContext[] {
  return changingPositions.map((position) => {
    const index = position - 1;
    const lineValue = lineValues[index] as 6 | 7 | 8 | 9;
    const positionText =
      POSITION_ARCHETYPES[position]?.[language] ??
      POSITION_ARCHETYPES[position]?.en ??
      `Line ${position}`;
    const changeText =
      lineValue === 6 || lineValue === 9
        ? (CHANGING_NATURE[lineValue][language] ?? CHANGING_NATURE[lineValue].en)
        : "";

    const meaning = [
      `Line ${position} in ${hexagram.title} (${hexagram.chineseName}).`,
      positionText,
      changeText,
      `Hexagram judgment for context: ${hexagram.judgment}`,
    ]
      .filter(Boolean)
      .join(" ");

    return { position, lineValue, meaning };
  });
}
