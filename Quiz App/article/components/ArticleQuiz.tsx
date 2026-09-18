"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import type { PublicQuiz } from "@/lib/quiz-public";

type ArticleQuizData = {
  id: string;
  title: string;
  quizzes: PublicQuiz[];
};

type ArticleQuizProps = {
  articleId: string;
  onClose: () => void;
};

export function ArticleQuiz({ articleId, onClose }: ArticleQuizProps) {
  const { t } = useLanguage();
  const [article, setArticle] = useState<ArticleQuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setConfirmClose(false);
      setSubmitted(false);
      setScore(null);
      setAnswers({});
      setCurrentIndex(0);
      setArticle(null);

      try {
        const res = await fetch(`/api/articles/${articleId}`);
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error ?? t.errorQuiz);
        }
        if (cancelled) return;

        const quizzes: PublicQuiz[] = Array.isArray(data.quizzes) ? data.quizzes : [];
        const alreadyAnswered =
          quizzes.length > 0 && quizzes.every((quiz) => quiz.previousAnswer);
        setArticle({
          id: data.id,
          title: data.title,
          quizzes,
        });
        if (alreadyAnswered) {
          setAnswers(
            Object.fromEntries(
              quizzes.map((quiz) => [quiz.id, quiz.previousAnswer ?? ""]),
            ),
          );
          setSubmitted(true);
          setScore(quizzes.filter((quiz) => quiz.isCorrect).length);
        }
      } catch {
        if (!cancelled) setError(t.errorQuiz);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [articleId, t.errorQuiz]);

  async function submitAnswers(nextAnswers: Record<string, string>) {
    if (!article) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/articles/${article.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: article.quizzes.map((quiz) => ({
            quizId: quiz.id,
            answer: nextAnswers[quiz.id],
          })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? t.errorSave);
        return;
      }

      setArticle({
        ...article,
        quizzes: data.quizzes,
      });
      setScore(typeof data.score === "number" ? data.score : null);
      setSubmitted(true);
    } catch {
      setError(t.errorNetwork);
    } finally {
      setSubmitting(false);
    }
  }

  function onSelectOption(option: string) {
    if (!article || submitted || submitting) return;
    const quiz = article.quizzes[currentIndex];
    if (!quiz) return;

    const nextAnswers = { ...answers, [quiz.id]: option };
    setAnswers(nextAnswers);

    if (currentIndex < article.quizzes.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    void submitAnswers(nextAnswers);
  }

  function onRetry() {
    if (!article) return;
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    setScore(null);
    setError("");
    setArticle({
      ...article,
      quizzes: article.quizzes.map((quiz) => ({
        id: quiz.id,
        question: quiz.question,
        options: quiz.options,
      })),
    });
  }

  const quiz = article?.quizzes[currentIndex];
  const total = article?.quizzes.length ?? 0;
  const showResults = submitted && score !== null && Boolean(article);

  return (
    <div className="mx-auto w-full max-w-lg pt-6 sm:pt-10">
      <div className="animate-rise">
        <div className={`mb-4 flex items-start gap-4 ${showResults ? "" : "justify-between"}`}>
          <div>
            <div className="flex items-center gap-2">
              <SparkleIcon />
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
                {showResults ? t.quizCompleted : t.quizTitle}
              </h1>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {showResults ? t.quizCompletedDesc : t.quizDesc}
            </p>
          </div>
          {showResults ? null : (
            <button
              type="button"
              onClick={() => setConfirmClose(true)}
              className="rounded-md border border-zinc-200 bg-white p-1.5 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800"
              aria-label={t.closeQuiz}
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {loading ? (
            <p className="py-8 text-center text-sm text-zinc-400">{t.loadingQuiz}</p>
          ) : !article || total === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-red-600">{error || t.noQuizzes}</p>
            </div>
          ) : showResults ? (
            <ResultsList
              quizzes={article.quizzes}
              answers={answers}
              score={score}
              total={total}
              onRestart={onRetry}
              onLeave={onClose}
            />
          ) : quiz ? (
            <>
              <div className="mb-4 flex items-start justify-between gap-4">
                <p className="text-sm font-semibold text-zinc-900">{quiz.question}</p>
                <span className="shrink-0 text-xs text-zinc-400">
                  {currentIndex + 1} / {total}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quiz.options.map((option, optionIndex) => {
                  const selected = answers[quiz.id] === option;
                  return (
                    <button
                      key={`${quiz.id}-${optionIndex}`}
                      type="button"
                      disabled={submitting}
                      onClick={() => onSelectOption(option)}
                      className={`rounded-md border px-3 py-2.5 text-center text-sm transition disabled:opacity-60 ${
                        selected
                          ? "border-zinc-400 bg-zinc-50 text-zinc-900"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {error ? (
                <p className="mt-3 text-center text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {confirmClose ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmClose(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-close-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="confirm-close-title"
              className="text-xl font-semibold tracking-tight text-zinc-900"
            >
              {t.confirmTitle}
            </h2>
            <p className="mt-2 text-sm text-red-500">{t.confirmWarning}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmClose(false)}
                className="min-w-28 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                {t.goBack}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmClose(false);
                  onClose();
                }}
                className="min-w-28 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                {t.cancelQuiz}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResultsList({
  quizzes,
  answers,
  score,
  total,
  onRestart,
  onLeave,
}: {
  quizzes: PublicQuiz[];
  answers: Record<string, string>;
  score: number;
  total: number;
  onRestart: () => void;
  onLeave: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div>
      <p className="mb-4 text-sm font-semibold text-zinc-900">
        {t.scoreTitle}: {score} / {total}
      </p>

      <ul className="space-y-3">
        {quizzes.map((quiz, index) => {
          const userAnswer = quiz.previousAnswer ?? answers[quiz.id] ?? "";
          const isCorrect = quiz.isCorrect === true;

          return (
            <li key={quiz.id} className="flex items-start gap-2.5">
              {isCorrect ? <CorrectIcon /> : <WrongIcon />}
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-medium text-zinc-800">
                  {index + 1}. {quiz.question}
                </p>
                <p
                  className={`mt-0.5 text-xs ${
                    isCorrect ? "text-zinc-400" : "text-red-500"
                  }`}
                >
                  {t.youAnswered}: {userAnswer}
                </p>
                {!isCorrect && quiz.correctAnswer ? (
                  <p className="text-xs text-zinc-400">
                    {t.correctLabel}: {quiz.correctAnswer}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <RestartIcon />
          {t.restartQuiz}
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800"
        >
          <SaveIcon />
          {t.saveAndLeave}
        </button>
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-zinc-900"
      aria-hidden
    >
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
    </svg>
  );
}

function CloseIcon() {
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
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CorrectIcon() {
  return (
    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
        <path d="M5 12l5 5L20 7" />
      </svg>
    </span>
  );
}

function WrongIcon() {
  return (
    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </span>
  );
}

function RestartIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h12l4 4v12H4z" />
      <path d="M8 4v6h8" />
      <path d="M8 20v-6h8v6" />
    </svg>
  );
}
