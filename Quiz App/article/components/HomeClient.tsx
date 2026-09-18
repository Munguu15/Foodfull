"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar, type SidebarArticle } from "@/components/AppSidebar";
import { ArticleForm } from "@/components/ArticleForm";
import { ArticleQuiz } from "@/components/ArticleQuiz";
import { LanguageProvider } from "@/components/LanguageProvider";

export function HomeClient() {
  const [articles, setArticles] = useState<SidebarArticle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles");
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setArticles(
        data.map((item: { id: string; title: string; createdAt?: string }) => ({
          id: item.id,
          title: item.title,
          createdAt: item.createdAt,
        })),
      );
    } catch {
      // ignore load errors on first paint
    }
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  function handleSaved(article: { id?: string; title: string }) {
    if (!article.id) return;
    setArticles((prev) => [
      { id: article.id!, title: article.title },
      ...prev.filter((item) => item.id !== article.id),
    ]);
    setSelectedId(article.id);
    setSidebarOpen(false);
  }

  function handleNewArticle() {
    setSelectedId(null);
    setFormKey((key) => key + 1);
    setSidebarOpen(true);
  }

  return (
    <LanguageProvider>
      <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
        <AppHeader />
        <div className="flex min-h-0 flex-1">
          <AppSidebar
            articles={articles}
            selectedId={selectedId}
            collapsed={Boolean(selectedId) && !sidebarOpen}
            onSelect={(article) => {
              setSelectedId(article.id);
              setSidebarOpen(false);
            }}
            onNewArticle={handleNewArticle}
            onToggle={() => setSidebarOpen(true)}
          />
          <main className="flex-1 overflow-y-auto bg-zinc-50 px-4 py-8 sm:px-8">
            {selectedId ? (
              <ArticleQuiz articleId={selectedId} onClose={handleNewArticle} />
            ) : (
              <ArticleForm key={formKey} onSaved={handleSaved} />
            )}
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}
