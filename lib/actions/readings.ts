"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth } from "@/auth";
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
    redirect(`/reading/${reading.id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("[createReading]", error);
    return { error: "Failed to create reading. Please try again." };
  }
}
