"use client";

import { useLanguage } from "@/components/LanguageProvider";

export type SidebarArticle = {
  id: string;
  title: string;
  createdAt?: string;
};

type AppSidebarProps = {
  articles: SidebarArticle[];
  selectedId?: string | null;
  collapsed?: boolean;
  onSelect: (article: SidebarArticle) => void;
  onNewArticle: () => void;
  onToggle?: () => void;
};

export function AppSidebar({
  articles,
  selectedId,
  collapsed = false,
  onSelect,
  onNewArticle,
  onToggle,
}: AppSidebarProps) {
  const { t } = useLanguage();

  if (collapsed) {
    return (
      <aside className="hidden w-12 shrink-0 border-r border-zinc-200 bg-white sm:block">
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
            aria-label={t.sidebarTitle}
          >
            <PanelIcon />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white sm:block">
      <div className="flex h-full flex-col px-4 py-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900">
            {t.sidebarTitle}
          </h2>
          <button
            type="button"
            onClick={onNewArticle}
            className="rounded-md px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          >
            {t.newArticle}
          </button>
        </div>

        {articles.length === 0 ? (
          <p className="mt-6 text-sm leading-relaxed text-zinc-400">
            {t.sidebarEmpty}
          </p>
        ) : (
          <ul className="mt-4 space-y-1 overflow-y-auto">
            {articles.map((article) => (
              <li key={article.id}>
                <button
                  type="button"
                  onClick={() => onSelect(article)}
                  className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                    selectedId === article.id
                      ? "bg-zinc-100 font-medium text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {article.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function PanelIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  );
}
