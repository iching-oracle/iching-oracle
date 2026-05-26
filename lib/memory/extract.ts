import "server-only";

import { gatherMemoryExtractionContext } from "@/lib/memory/gather-context";
import { mergeMemoryCandidates } from "@/lib/memory/merge";
import { enforceMemoryCap } from "@/lib/memory/enforce-cap";
import { MEMORY_TYPES } from "@/types/memory";
import type { MemorySource } from "@/types/memory";
import { prisma } from "@/lib/prisma";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

type ExtractedPayload = {
  memories?: Array<{
    type?: string;
    summary?: string;
    confidence?: number;
    tags?: string[];
  }>;
};

export async function extractMemoriesForUser(
  userId: string,
  source: MemorySource,
  sourceId?: string,
): Promise<{ created: number; updated: number; skipped: boolean }> {
  const enabled = await prisma.user.findUnique({
    where: { id: userId },
    select: { memoryEnabled: true, memoryLastExtractedAt: true },
  });

  if (!enabled?.memoryEnabled) {
    return { created: 0, updated: 0, skipped: true };
  }

  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    return { created: 0, updated: 0, skipped: true };
  }

  const ctx = await gatherMemoryExtractionContext(userId);

  if (ctx.oracleSnippets.length === 0 && ctx.readingSnippets.length === 0) {
    return { created: 0, updated: 0, skipped: true };
  }

  const system = `You extract compressed spiritual companion memories for an I Ching oracle app.

RULES:
- Store THEMES and PATTERNS only — never exact quotes, names, addresses, or highly sensitive private details.
- Summaries are abstract, reflective, third-person ("The seeker often...").
- Max 3 new memory candidates per run.
- confidence 0.3–0.9 based on how clear the pattern is.
- types: ${MEMORY_TYPES.join(", ")}
- tags: 1–4 short lowercase keywords

GOOD: "Frequently reflects on career uncertainty and transitions."
BAD: "On March 3 said they hate their boss John."

Respond with JSON only: { "memories": [{ "type", "summary", "confidence", "tags" }] }`;

  const userPrompt = `EXISTING MEMORIES (avoid duplicates):
${ctx.existingMemories.map((m) => `- [${m.type}] ${m.summary}`).join("\n") || "(none)"}

RECENT ORACLE CHAT (user messages only, summarized):
${ctx.oracleSnippets.map((s) => `- ${s}`).join("\n") || "(none)"}

RECENT READINGS (summarized):
${ctx.readingSnippets.map((s) => `- ${s}`).join("\n") || "(none)"}

Extract meaningful recurring patterns only.`;

  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";
  const apiKey = process.env.DEEPSEEK_API_KEY!.trim();

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 800,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    console.error("[memory/extract] API failed", await response.text());
    return { created: 0, updated: 0, skipped: true };
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
  const parsed = parseJsonPayload(raw);

  const candidates =
    parsed.memories
      ?.filter((m) => m.summary && m.summary.length >= 12)
      .map((m) => ({
        type: m.type ?? "recurring_theme",
        summary: m.summary!,
        confidence: typeof m.confidence === "number" ? m.confidence : 0.5,
        tags: Array.isArray(m.tags) ? m.tags.map(String) : [],
      })) ?? [];

  if (candidates.length === 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { memoryLastExtractedAt: new Date() },
    });
    return { created: 0, updated: 0, skipped: false };
  }

  const { created, updated } = await mergeMemoryCandidates(
    userId,
    candidates,
    source,
    sourceId,
  );

  await enforceMemoryCap(userId);
  await prisma.user.update({
    where: { id: userId },
    data: { memoryLastExtractedAt: new Date() },
  });

  await prisma.memoryEvent.create({
    data: {
      userId,
      source,
      sourceId,
      note: `Extraction: ${created} created, ${updated} updated`,
    },
  });

  return { created, updated, skipped: false };
}

function parseJsonPayload(raw: string): ExtractedPayload {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};
  try {
    return JSON.parse(jsonMatch[0]) as ExtractedPayload;
  } catch {
    return {};
  }
}
