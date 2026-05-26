import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MemorySettingsPanel } from "@/components/memory/memory-settings-panel";
import { listMemoriesForUser, listTimelineForUser } from "@/lib/memory/list";
import { getMemorySettings } from "@/lib/memory/settings";

export const metadata = {
  title: "Companion Memory | IChing Oracle",
  description:
    "Review and control what the oracle remembers about your spiritual journey.",
};

export default async function MemorySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/settings/memory");
  }

  const [memories, settings, timeline] = await Promise.all([
    listMemoriesForUser(session.user.id),
    getMemorySettings(session.user.id),
    listTimelineForUser(session.user.id),
  ]);

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
      <div
        className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-cosmic-purple/15 blur-[100px]"
        aria-hidden
      />

      <div className="relative space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-medium uppercase tracking-widest text-zen-muted hover:text-amber-gold"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-4 font-serif text-3xl text-foreground">
            Companion memory
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zen-muted">
            Themes the oracle holds — so your journey can feel continuous, not
            recorded.
          </p>
        </div>

        <MemorySettingsPanel
          initialMemories={memories}
          initialSettings={settings}
          initialTimeline={timeline}
        />
      </div>
    </div>
  );
}
