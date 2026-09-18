"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export type ArticlePreview = {
  id?: string;
  title: string;
  content: string;
};

type ArticleFormProps = {
  onSaved?: (article: ArticlePreview) => void;
};

export function ArticleForm({ onSaved }: ArticleFormProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<ArticlePreview | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError(t.errorTitle);
      return;
    }
    if (trimmedContent.length < 50) {
      setError(t.errorContent);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? t.errorSave);
        return;
      }

      const saved: ArticlePreview = {
        id: data.id,
        title: data.title,
        content: data.content,
      };
      setPreview(saved);
      onSaved?.(saved);
    } catch {
      setError(t.errorNetwork);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form
        onSubmit={onSubmit}
        className="animate-rise rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {t.generatorTitle}
            </h1>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            {t.generatorDesc}
          </p>
        </div>

        <label className="mb-5 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-800">
            <DocIcon />
            {t.articleTitle}
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.titlePlaceholder}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-800">
            <DocIcon />
            {t.articleContent}
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder={t.contentPlaceholder}
            className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          />
        </label>

        {error ? (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? t.generating : t.generateSummary}
        </button>
      </form>

      {preview ? (
        <div className="animate-fade mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {t.previewTitle}
          </p>
          <p className="mt-2 font-medium text-zinc-900">{preview.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            {preview.content.slice(0, 280)}
            {preview.content.length > 280 ? "…" : ""}
          </p>
          <p className="mt-3 text-xs text-zinc-400">{t.saved}</p>
        </div>
      ) : null}
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-zinc-900"
      aria-hidden
    >
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-zinc-700"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
