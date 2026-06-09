import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveValidUserId } from "@/lib/auth/session-user";
import { sendContactFormEmail } from "@/lib/email/send-contact";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validations/contact";
import { guardPublicRoute } from "@/lib/api/route-guard";
import {
  RATE_LIMITS,
  consumeRateLimitByIp,
  peekRateLimitByIp,
  rateLimitResponse,
} from "@/lib/rate-limit/presets";
import { handleRouteError } from "@/lib/errors/api";
import { USER_MESSAGES } from "@/lib/errors/messages";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const peek = await peekRateLimitByIp(request, "contact", RATE_LIMITS.contact);
  if (!peek.ok) {
    return rateLimitResponse(peek);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  // Honeypot filled — pretend success to avoid tipping off bots
  if (parsed.data.company.trim().length > 0) {
    return NextResponse.json({
      ok: true,
      message: "Thank you. We will get back to you soon.",
    });
  }

  const session = await auth();
  const userId = await resolveValidUserId(session?.user?.id);

  const guarded = await guardPublicRoute({
    request,
    scope: "contact",
    userId,
    role: session?.user?.role,
  });
  if (guarded) return guarded;
  const email = parsed.data.email.toLowerCase();
  const name = parsed.data.name;
  const subject = parsed.data.subject;
  const message = parsed.data.message;
  const submittedAt = new Date();

  try {
    await prisma.supportTicket.create({
      data: {
        userId,
        email,
        name,
        category: "general",
        subject,
        message,
      },
    });

    const emailResult = await sendContactFormEmail({
      name,
      email,
      subject,
      message,
      submittedAt,
      userId,
      source: "contact_page",
    });

    if (!emailResult.ok) {
      console.error("[api/contact] Email failed", emailResult.reason);
      return NextResponse.json(
        {
          error:
            "Your message was saved but we could not send the notification email. Please try again later or email us directly.",
        },
        { status: 503 },
      );
    }

    await consumeRateLimitByIp(request, "contact", RATE_LIMITS.contact);

    return NextResponse.json({
      ok: true,
      message: "Thank you. We typically respond within two business days.",
    });
  } catch (error) {
    return handleRouteError(error, {
      category: "contact_form",
      userMessage: "We could not send your message. Please try again.",
      userId: userId ?? undefined,
      path: "/api/contact",
    });
  }
}
