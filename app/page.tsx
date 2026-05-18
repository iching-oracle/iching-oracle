import { AmbientBackground } from "./components/home/AmbientBackground";
import { DailyVerse } from "./components/home/DailyVerse";
import { Hero } from "./components/home/Hero";
import { MethodGrid } from "./components/home/MethodGrid";
import { Navbar } from "./components/home/Navbar";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-zen-bg">
      <AmbientBackground />

      <Navbar />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16 sm:px-10 lg:px-12">
        <Hero />
        <MethodGrid />
        <DailyVerse />
      </main>
    </div>
  );
}
