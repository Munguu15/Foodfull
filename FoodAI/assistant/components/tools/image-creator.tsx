"use client";

import { useState } from "react";

import { readApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { SparkleIcon } from "@/components/tools/icons";
import { EmptyCopy, PanelHeader, SummaryBlock } from "@/components/tools/panel";

export function ImageCreator() {
  const { t, lang } = useI18n();
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setImageUrl("");
    setCaption("");

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), lang }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, t.errorGeneric));
      }

      const data = (await res.json()) as {
        imageUrl?: string;
        caption?: string | null;
      };
      setImageUrl(data.imageUrl ?? "");
      setCaption(data.caption ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <PanelHeader
        icon={<SparkleIcon />}
        title={t.creator}
        onReset={() => {
          setPrompt("");
          setImageUrl("");
          setCaption("");
          setError("");
          setLoading(false);
        }}
      />
      <p className="mt-3 text-sm text-muted-foreground">{t.creatorHint}</p>
      <textarea
        value={prompt}
        onChange={(event) => {
          setPrompt(event.target.value);
          setImageUrl("");
          setCaption("");
          setError("");
        }}
        rows={3}
        placeholder={t.creatorPlaceholder}
        className="mt-3 w-full resize-none rounded-md border border-border px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-border"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={!prompt.trim() || loading}
          onClick={generate}
          className="rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t.loading : t.generate}
        </button>
      </div>
      <SummaryBlock>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {imageUrl ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={prompt || t.creatorSaved}
              className="h-64 w-full object-cover"
            />
            <div className="px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t.creatorSaved}</p>
              {caption ? (
                <p className="mt-1">{caption}</p>
              ) : (
                <p className="mt-1">{prompt}</p>
              )}
            </div>
          </div>
        ) : loading ? (
          <EmptyCopy>{t.loading}</EmptyCopy>
        ) : (
          <EmptyCopy>{t.creatorEmpty}</EmptyCopy>
        )}
      </SummaryBlock>
    </section>
  );
}
