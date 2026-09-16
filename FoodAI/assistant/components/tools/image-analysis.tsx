"use client";

import { useRef, useState } from "react";

import { readApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { SparkleIcon } from "@/components/tools/icons";
import { EmptyCopy, PanelHeader, SummaryBlock } from "@/components/tools/panel";

export function ImageAnalysis() {
  const { t, lang } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setFile(null);
    setPreview(null);
    setSummary("");
    setIngredients([]);
    setError("");
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onFile(next: File | null) {
    setFile(next);
    setSummary("");
    setIngredients([]);
    setError("");
    setPreview(next ? URL.createObjectURL(next) : null);
  }

  async function generate() {
    if (!file) return;
    setLoading(true);
    setError("");
    setSummary("");
    setIngredients([]);

    try {
      const form = new FormData();
      form.append("image", file);
      form.append("lang", lang);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, t.errorGeneric));
      }

      const data = (await res.json()) as {
        summary?: string;
        ingredients?: string[];
      };
      setSummary(data.summary ?? "");
      setIngredients(data.ingredients ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <PanelHeader icon={<SparkleIcon />} title={t.analysis} onReset={reset} />
      <p className="mt-3 text-sm text-muted-foreground">{t.analysisHint}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        className="mt-3 block w-full rounded-md border border-border px-3 py-2 text-sm text-muted-foreground file:mr-3 file:rounded file:border file:border-border file:bg-background file:px-2.5 file:py-1 file:text-sm file:font-medium file:text-foreground"
      />

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={!file || loading}
          onClick={generate}
          className="rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t.loading : t.generate}
        </button>
      </div>

      <SummaryBlock>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {summary || ingredients.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={file?.name ?? t.uploadedFood}
                className="h-56 w-full object-cover"
              />
            ) : null}
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {file?.name ? (
                <p className="font-medium text-foreground">{file.name}</p>
              ) : null}
              {summary ? (
                <p className="mt-1 whitespace-pre-wrap">{summary}</p>
              ) : null}
              {ingredients.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t.detectedIngredients}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {ingredients.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-muted px-3 py-1 text-sm text-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : loading ? (
          <EmptyCopy>{t.loading}</EmptyCopy>
        ) : (
          <EmptyCopy>{t.analysisEmpty}</EmptyCopy>
        )}
      </SummaryBlock>
    </section>
  );
}
