"use client";

import { motion } from "framer-motion";
import { getHexagramLines } from "@/lib/hexagram-lines";
import { getFormatSpec } from "@/lib/share/formats";
import { getThemeSpec } from "@/lib/share/themes";
import type {
  ShareCardFormat,
  ShareCardReadingData,
  ShareCardTheme,
} from "@/types/share";

type ReadingShareCardProps = {
  data: ShareCardReadingData;
  theme: ShareCardTheme;
  format: ShareCardFormat;
  showWatermark: boolean;
  animatedGlow?: boolean;
  className?: string;
};

function MiniHexagram({
  number,
  accentClass,
}: {
  number: number;
  accentClass: string;
}) {
  const lines = getHexagramLines(number);

  return (
    <div className="flex flex-col-reverse gap-1.5" aria-hidden>
      {lines.map((isYang, i) =>
        isYang ? (
          <div
            key={i}
            className={`h-1.5 w-14 rounded-full opacity-90 ${accentClass}`}
            style={{ background: "currentColor" }}
          />
        ) : (
          <div key={i} className="flex w-14 justify-between gap-2">
            <div
              className={`h-1.5 flex-1 rounded-full opacity-90 ${accentClass}`}
              style={{ background: "currentColor" }}
            />
            <div
              className={`h-1.5 flex-1 rounded-full opacity-90 ${accentClass}`}
              style={{ background: "currentColor" }}
            />
          </div>
        ),
      )}
    </div>
  );
}

export function ReadingShareCard({
  data,
  theme,
  format,
  showWatermark,
  animatedGlow = false,
  className = "",
}: ReadingShareCardProps) {
  const themeSpec = getThemeSpec(theme);
  const formatSpec = getFormatSpec(format);
  const isTall = format === "story" || format === "wallpaper";
  const isLandscape = format === "landscape";

  const padding = isLandscape ? "p-10" : isTall ? "p-14" : "p-12";
  const quoteSize = isLandscape
    ? "text-[22px] leading-snug"
    : isTall
      ? "text-[28px] leading-relaxed"
      : "text-[26px] leading-relaxed";

  return (
    <motion.div
      layout
      key={`${theme}-${format}`}
      initial={{ opacity: 0.85, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative box-border overflow-hidden font-serif ${themeSpec.container} ${themeSpec.glow} ${padding} ${className}`}
      style={{
        width: formatSpec.width,
        height: formatSpec.height,
      }}
      data-share-card
    >
      {animatedGlow ? (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-40"
          animate={{ opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              theme === "mystic-purple"
                ? "radial-gradient(circle at 50% 30%, rgba(167,139,250,0.35), transparent 65%)"
                : "radial-gradient(circle at 50% 20%, rgba(197,160,89,0.25), transparent 60%)",
          }}
          aria-hidden
        />
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <div
        className={`relative flex h-full flex-col ${isLandscape ? "justify-center gap-6" : "justify-between gap-8"}`}
      >
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <p
              className={`text-[11px] font-medium uppercase tracking-[0.35em] ${themeSpec.muted}`}
            >
              {data.categoryLabel}
            </p>
            <span className={`text-2xl ${themeSpec.symbol}`} aria-hidden>
              ☯
            </span>
          </div>
          <p
            className={`font-medium leading-snug ${isLandscape ? "text-[20px]" : "text-[22px]"} ${themeSpec.accent}`}
          >
            {data.question}
          </p>
        </header>

        <div
          className={`flex ${isLandscape ? "flex-row items-center gap-10" : "flex-col gap-8"}`}
        >
          <div className="flex flex-wrap items-start gap-8">
            <div className={`rounded-xl border p-4 ${themeSpec.border}`}>
              <p className={`text-[10px] uppercase tracking-widest ${themeSpec.muted}`}>
                Primary
              </p>
              <div className={`mt-3 ${themeSpec.accent}`}>
                <MiniHexagram number={data.primaryHexagram.number} accentClass={themeSpec.accent} />
              </div>
              <p className={`mt-3 text-sm font-medium ${themeSpec.accent}`}>
                {data.primaryHexagram.number}. {data.primaryHexagram.title}
              </p>
              <p className={`text-lg ${themeSpec.symbol}`}>
                {data.primaryHexagram.chineseName}
              </p>
            </div>

            {data.resultingHexagram ? (
              <div className={`rounded-xl border p-4 ${themeSpec.border}`}>
                <p className={`text-[10px] uppercase tracking-widest ${themeSpec.muted}`}>
                  Resulting
                </p>
                <div className={`mt-3 ${themeSpec.accent}`}>
                  <MiniHexagram
                    number={data.resultingHexagram.number}
                    accentClass={themeSpec.accent}
                  />
                </div>
                <p className={`mt-3 text-sm font-medium ${themeSpec.accent}`}>
                  {data.resultingHexagram.number}. {data.resultingHexagram.title}
                </p>
                <p className={`text-lg ${themeSpec.symbol}`}>
                  {data.resultingHexagram.chineseName}
                </p>
              </div>
            ) : null}
          </div>

          {data.changingLinesLabel !== "—" ? (
            <p className={`text-xs ${themeSpec.muted}`}>
              Changing lines: {data.changingLinesLabel}
            </p>
          ) : null}
        </div>

        <blockquote
          className={`${quoteSize} ${themeSpec.quote} border-l-2 pl-5 italic ${themeSpec.border}`}
        >
          &ldquo;{data.quote}&rdquo;
        </blockquote>

        <footer className="flex items-end justify-between gap-4">
          <p className={`text-xs ${themeSpec.muted}`}>{data.dateLabel}</p>
          {showWatermark ? (
            <p
              className={`text-[10px] font-medium uppercase tracking-[0.4em] ${themeSpec.muted}`}
            >
              IChing Oracle
            </p>
          ) : null}
        </footer>
      </div>
    </motion.div>
  );
}
