"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MessageCircleIcon } from "lucide-react";

import { AssistChatPanel } from "@/components/assist-chat";

type Lang = "mn" | "en";

const messages = {
  en: {
    title: "AI tools",
    analysis: "Image analysis",
    ingredients: "Ingredient recognition",
    creator: "Image creator",
    generate: "Generate",
    summary: "Here is the summary",
    reset: "Reset",
    search: "Cooking help",
    closeSearch: "Close chat",
    searchTools: "Cooking help",
    searchPlaceholder: "How do I make noodle soup?",
    analysisHint: "Upload a food photo, and AI will detect the ingredients.",
    analysisEmpty: "First, enter your image to recognize an ingredients.",
    uploadedFood: "Uploaded food",
    ingredientsHint:
      "List the ingredients you have, and AI will recognize them.",
    ingredientsPlaceholder: "tomato, basil, olive oil",
    ingredientsEmpty: "First, enter ingredients to recognize them.",
    creatorHint: "Describe a dish, and AI will create an image.",
    creatorPlaceholder: "A bowl of noodles with chili oil",
    creatorEmpty: "First, describe the image you want to create.",
    creatorSaved: "Generated image",
    loading: "Working...",
    errorGeneric: "Something went wrong. Please try again.",
    detectedIngredients: "Detected ingredients",
    switchToMn: "MN",
    switchToEn: "EN",
  },
  mn: {
    title: "AI хэрэгслүүд",
    analysis: "Зураг шинжлэх",
    ingredients: "Орц таних",
    creator: "Зураг үүсгэх",
    generate: "Үүсгэх",
    summary: "Энд хураангуй байна",
    reset: "Шинэчлэх",
    search: "Хоолны тусламж",
    closeSearch: "Чатыг хаах",
    searchTools: "Хоолны тусламж",
    searchPlaceholder: "Гоймонтой шөл хэрхэн хийх вэ?",
    analysisHint: "Хоолны зураг оруулбал AI орцыг илрүүлнэ.",
    analysisEmpty: "Эхлээд орц таниулах зургаа оруулна уу.",
    uploadedFood: "Оруулсан хоол",
    ingredientsHint: "Байгаа орцоо жагсаавал AI тэдгээрийг танина.",
    ingredientsPlaceholder: "улаан лооль, basil, оливийн тос",
    ingredientsEmpty: "Эхлээд орцоо бичээд таниулна уу.",
    creatorHint: "Хоолны тайлбар бичвэл AI зураг үүсгэнэ.",
    creatorPlaceholder: "Чилийн тостой гоймонтой аяга",
    creatorEmpty: "Эхлээд үүсгэх зургийнхаа тайлбарыг бичнэ үү.",
    creatorSaved: "Үүсгэсэн зураг",
    loading: "Ажиллаж байна...",
    errorGeneric: "Алдаа гарлаа. Дахин оролдоно уу.",
    detectedIngredients: "Илрүүлсэн орц",
    switchToMn: "MN",
    switchToEn: "EN",
  },
} as const;

type Messages = (typeof messages)[Lang];

const LangContext = createContext<{
  lang: Lang;
  t: Messages;
  setLang: (lang: Lang) => void;
} | null>(null);

function useI18n() {
  const value = useContext(LangContext);
  if (!value) {
    throw new Error("useI18n must be used inside LangContext");
  }
  return value;
}

const tabIds = ["analysis", "ingredients", "creator"] as const;
type TabId = (typeof tabIds)[number];

const LANG_KEY = "foodai-lang";

export default function AiTools() {
  const [tab, setTab] = useState<TabId>("analysis");
  const [searchOpen, setSearchOpen] = useState(false);
  const [lang, setLangState] = useState<Lang>("mn");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "mn" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    window.localStorage.setItem(LANG_KEY, next);
    document.documentElement.lang = next;
  }

  const t = messages[lang];

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <div className="flex min-h-full flex-1 flex-col bg-white text-neutral-950">
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5 text-sm font-medium">
          <span>{t.title}</span>
          <button
            type="button"
            onClick={() => setLang(lang === "mn" ? "en" : "mn")}
            className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            aria-label={
              lang === "mn" ? "Switch to English" : "Монгол руу шилжих"
            }
          >
            {lang === "mn" ? t.switchToEn : t.switchToMn}
          </button>
        </header>

        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-28 pt-8">
          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-neutral-100 p-1">
              {tabIds.map((id) => {
                const active = tab === id;
                const label =
                  id === "analysis"
                    ? t.analysis
                    : id === "ingredients"
                      ? t.ingredients
                      : t.creator;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-white font-medium text-neutral-900 shadow-sm ring-1 ring-neutral-200"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            {tab === "analysis" && <ImageAnalysis />}
            {tab === "ingredients" && <IngredientRecognition />}
            {tab === "creator" && <ImageCreator />}
          </div>
        </main>

        <button
          type="button"
          aria-label={t.search}
          onClick={() => setSearchOpen(true)}
          className="fixed right-6 bottom-6 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-white shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircleIcon className="size-4.5" />
        </button>

        {searchOpen && (
          <AssistChatPanel lang={lang} onClose={() => setSearchOpen(false)} />
        )}
      </div>
    </LangContext.Provider>
  );
}

async function readApiError(res: Response, fallback: string) {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

function ImageAnalysis() {
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
      <p className="mt-3 text-sm text-neutral-500">{t.analysisHint}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        className="mt-3 block w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-500 file:mr-3 file:rounded file:border file:border-neutral-300 file:bg-white file:px-2.5 file:py-1 file:text-sm file:font-medium file:text-neutral-800"
      />

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={!file || loading}
          onClick={generate}
          className="rounded-md bg-neutral-500 px-4 py-1.5 text-sm text-white transition-colors hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t.loading : t.generate}
        </button>
      </div>

      <SummaryBlock>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {summary || ingredients.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={file?.name ?? t.uploadedFood}
                className="h-56 w-full object-cover"
              />
            ) : null}
            <div className="px-4 py-3 text-sm text-neutral-600">
              {file?.name ? (
                <p className="font-medium text-neutral-900">{file.name}</p>
              ) : null}
              {summary ? (
                <p className="mt-1 whitespace-pre-wrap">{summary}</p>
              ) : null}
              {ingredients.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {t.detectedIngredients}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {ingredients.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700"
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

function IngredientRecognition() {
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
      <p className="mt-3 text-sm text-neutral-500">{t.ingredientsHint}</p>
      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setResult([]);
          setError("");
        }}
        rows={3}
        placeholder={t.ingredientsPlaceholder}
        className="mt-3 w-full resize-none rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={!canGenerate || loading}
          onClick={generate}
          className="rounded-md bg-neutral-500 px-4 py-1.5 text-sm text-white transition-colors hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700"
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

function ImageCreator() {
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
      <p className="mt-3 text-sm text-neutral-500">{t.creatorHint}</p>
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
        className="mt-3 w-full resize-none rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={!prompt.trim() || loading}
          onClick={generate}
          className="rounded-md bg-neutral-500 px-4 py-1.5 text-sm text-white transition-colors hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t.loading : t.generate}
        </button>
      </div>
      <SummaryBlock>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {imageUrl ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={prompt || t.creatorSaved}
              className="h-64 w-full object-cover"
            />
            <div className="px-4 py-3 text-sm text-neutral-600">
              <p className="font-medium text-neutral-900">{t.creatorSaved}</p>
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

function PanelHeader({
  icon,
  title,
  onReset,
}: {
  icon: ReactNode;
  title: string;
  onReset: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between">
      <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        {icon}
        {title}
      </h1>
      <button
        type="button"
        aria-label={t.reset}
        onClick={onReset}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50"
      >
        <RefreshIcon />
      </button>
    </div>
  );
}

function SummaryBlock({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <DocumentIcon />
        {t.summary}
      </h2>
      {children}
    </div>
  );
}

function EmptyCopy({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-sm text-neutral-400">{children}</p>;
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M18 14.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z"
        fill="currentColor"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8.5 12.5h7M8.5 16h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 12a8 8 0 1 1-2.2-5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M20 5v5h-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
