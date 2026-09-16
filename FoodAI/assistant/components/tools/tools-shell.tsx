"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircleIcon, MoonIcon, SunIcon } from "lucide-react";

import { AssistChatPanel } from "@/components/assist-chat";
import { LanguageProvider, useI18n } from "@/lib/i18n";
import { ThemeProvider, useTheme } from "@/lib/theme";

const tabs = [
  { href: "/analysis", labelKey: "analysis" },
  { href: "/ingredients", labelKey: "ingredients" },
  { href: "/creator", labelKey: "creator" },
] as const;

function ToolsShellInner({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-5 py-3.5 text-sm font-medium">
        <Link href="/analysis">{t.title}</Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === "mn" ? "en" : "mn")}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            aria-label={lang === "mn" ? "Switch to English" : "Монгол руу шилжих"}
          >
            {lang === "mn" ? t.switchToEn : t.switchToMn}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
            aria-label={theme === "dark" ? t.themeToLight : t.themeToDark}
          >
            {theme === "dark" ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-28 pt-8">
        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-muted p-1">
            {tabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-background font-medium text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t[tab.labelKey]}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8">{children}</div>
      </main>

      <button
        type="button"
        aria-label={t.search}
        onClick={() => setChatOpen(true)}
        className="fixed right-6 bottom-6 flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircleIcon className="size-4.5" />
      </button>

      {chatOpen ? (
        <AssistChatPanel lang={lang} onClose={() => setChatOpen(false)} />
      ) : null}
    </div>
  );
}

export function ToolsShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToolsShellInner>{children}</ToolsShellInner>
      </LanguageProvider>
    </ThemeProvider>
  );
}
