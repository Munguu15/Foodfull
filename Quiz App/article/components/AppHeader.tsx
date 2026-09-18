"use client";

import { UserButton } from "@clerk/nextjs";
import { useLanguage } from "@/components/LanguageProvider";

export function AppHeader() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
      <div className="relative flex h-14 items-center justify-end px-4 sm:px-6">
        <p className="absolute left-1/2 -translate-x-1/2 text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
          {t.appName}
        </p>

        <div className="flex items-center gap-2.5">
          <div
            className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5 text-[11px] font-semibold"
            role="group"
            aria-label={t.language}
          >
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`rounded px-2 py-1 transition ${
                locale === "en"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("mn")}
              className={`rounded px-2 py-1 transition ${
                locale === "mn"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              MN
            </button>
          </div>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
