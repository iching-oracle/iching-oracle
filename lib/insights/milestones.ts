import "server-only";

import { prisma } from "@/lib/prisma";
import type { CreateMilestoneInput, OracleMilestoneDTO } from "@/types/insights";

function toDto(row: {
  id: string;
  title: string;
  note: string | null;
  kind: string;
  readingId: string | null;
  createdAt: Date;
}): OracleMilestoneDTO {
  return {
    id: row.id,
    title: row.title,
    note: row.note,
    kind: row.kind,
    readingId: row.readingId,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listOracleMilestones(
  userId: string,
  limit = 20,
): Promise<OracleMilestoneDTO[]> {
  const rows = await prisma.oracleMilestone.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      note: true,
      kind: true,
      readingId: true,
      createdAt: true,
    },
  });
  return rows.map(toDto);
}

export async function createOracleMilestone(
  userId: string,
  input: CreateMilestoneInput,
): Promise<OracleMilestoneDTO> {
  const title = input.title.trim().slice(0, 120);
  if (!title) throw new Error("Title is required");

  if (input.readingId) {
    const reading = await prisma.reading.findFirst({
      where: { id: input.readingId, userId },
      select: { id: true },
    });
    if (!reading) throw new Error("Reading not found");
  }

  const row = await prisma.oracleMilestone.create({
    data: {
      userId,
      title,
      note: input.note?.trim().slice(0, 2000) ?? null,
      kind: input.kind ?? "milestone",
      readingId: input.readingId ?? null,
    },
    select: {
      id: true,
      title: true,
      note: true,
      kind: true,
      readingId: true,
      createdAt: true,
    },
  });

  return toDto(row);
}

export async function deleteOracleMilestone(
  userId: string,
  milestoneId: string,
): Promise<boolean> {
  const result = await prisma.oracleMilestone.deleteMany({
    where: { id: milestoneId, userId },
  });
  return result.count > 0;
}
