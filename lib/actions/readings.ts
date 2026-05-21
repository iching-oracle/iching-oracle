"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth } from "@/auth";
import { deleteReadingForUser } from "@/lib/readings/history";
import { regenerateInterpretationForReading } from "@/lib/readings/regenerate-interpretation";
import { saveReadingForUser } from "@/lib/readings/save-reading";
import { createReadingSchema } from "@/lib/validations/reading";
import { prisma } from "@/lib/prisma";

export type CreateReadingState = {
  error?: string;
};

export async function createReading(
  _prevState: CreateReadingState,
  formData: FormData,
): Promise<CreateReadingState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/reading/new");
  }

  const userId = session.user.id;

  const parsed = createReadingSchema.safeParse({
    question: formData.get("question"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid question",
    };
  }

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return {
        error: "Your account was not found. Please sign out and sign in again.",
      };
    }

    const reading = await saveReadingForUser(userId, parsed.data.question);

    revalidatePath("/dashboard");
    revalidatePath("/readings");
    revalidatePath("/history");
    redirect(`/readings/${reading.id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("[createReading]", error);
    return { error: "Failed to create reading. Please try again." };
  }
}

export type DeleteReadingResult = {
  error?: string;
  success?: boolean;
};

export type RegenerateInterpretationResult = {
  error?: string;
  success?: boolean;
};

export async function regenerateReadingInterpretation(
  readingId: string,
): Promise<RegenerateInterpretationResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  try {
    const result = await regenerateInterpretationForReading(
      session.user.id,
      readingId,
    );

    if (!result.success) {
      return { error: result.error ?? "Regeneration failed." };
    }

    revalidatePath(`/reading/${readingId}`);
    revalidatePath(`/readings/${readingId}`);
    revalidatePath("/readings");
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    console.error("[regenerateReadingInterpretation]", error);
    return { error: "Failed to regenerate interpretation." };
  }
}

export async function deleteReading(
  readingId: string,
): Promise<DeleteReadingResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be signed in to delete a reading." };
  }

  try {
    const deleted = await deleteReadingForUser(session.user.id, readingId);

    if (!deleted) {
      return { error: "Reading not found." };
    }

    revalidatePath("/readings");
    revalidatePath("/history");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deleteReading]", error);
    return { error: "Failed to delete reading. Please try again." };
  }
}
