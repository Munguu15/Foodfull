"use client";

import { useState } from "react";

import { readApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { SparkleIcon } from "@/components/tools/icons";
import { EmptyCopy, PanelHeader, SummaryBlock } from "@/components/tools/panel";

export function IngredientRecognition() {
  const { t, lang } = useI18n();
  const [text, setText] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = text.trim().length > 0;

  async function generate() {
    if (!canGenerate) return;
    setLoading(true);
    setError("");
    setResult([]);

    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, t.errorGeneric));
      }

      const data = (await res.json()) as { ingredients?: string[] };
      setResult(data.ingredients ?? []);
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
        title={t.ingredients}
        onReset={() => {
          setText("");
          setResult([]);
          setError("");
          setLoading(false);
        }}
      />
      <p className="mt-3 text-sm text-muted-foreground">{t.ingredientsHint}</p>
      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setResult([]);
          setError("");
        }}
        rows={3}
        placeholder={t.ingredientsPlaceholder}
        className="mt-3 w-full resize-none rounded-md border border-border px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-border"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={!canGenerate || loading}
          onClick={generate}
          className="rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t.loading : t.generate}
        </button>
      </div>
      <SummaryBlock>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {result.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {result.map((item) => (
              <li
                key={item}
                className="rounded-full bg-muted px-3 py-1 text-sm text-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : loading ? (
          <EmptyCopy>{t.loading}</EmptyCopy>
        ) : (
          <EmptyCopy>{t.ingredientsEmpty}</EmptyCopy>
        )}
      </SummaryBlock>
    </section>
  );
}
