export type GeneratedQuiz = {
  question: string;
  options: string[];
  answer: string;
};

const FILLERS_EN = ["Not mentioned", "None of the above", "Cannot be determined"];
const FILLERS_MN = ["Дурдсангүй", "Дээрхээс аль нь ч биш", "Тодорхойлох боломжгүй"];

function isMongolian(text: string) {
  return /[\u0400-\u04FF]/.test(text);
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?。])\s+|\n+/)
    .map((sentence) => sentence.trim().replace(/\s+/g, " "))
    .filter((sentence) => sentence.length >= 20);
}

function words(text: string) {
  return text.match(/[\p{L}\p{N}]+/gu) ?? [];
}

function unique(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value.trim());
  }
  return result;
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ensureOptions(answer: string, candidates: string[], fillers: string[]) {
  const rest = unique([...candidates, ...fillers]).filter(
    (item) => item.toLowerCase() !== answer.trim().toLowerCase(),
  );
  const options = [answer.trim(), ...shuffle(rest)];
  let n = 1;
  while (options.length < 4) {
    options.push(`${fillers[0]} ${n}`);
    n += 1;
  }
  return shuffle(options.slice(0, 4));
}

export function generateArticleQuiz(title: string, content: string) {
  const mn = isMongolian(`${title} ${content}`);
  const fillers = mn ? FILLERS_MN : FILLERS_EN;
  const sentences = splitSentences(content);
  const summarySource = sentences.slice(0, 3).join(" ") || content.trim();
  const summary =
    summarySource.length > 500 ? `${summarySource.slice(0, 497).trim()}…` : summarySource;

  const quizzes: GeneratedQuiz[] = [];
  const contentWords = unique(words(content).filter((word) => word.length >= 5));
  const ranked = [...sentences].sort((a, b) => b.length - a.length);

  const titleOptions = ensureOptions(
    title,
    ranked.map((sentence) => sentence.slice(0, 80)),
    fillers,
  );
  quizzes.push({
    question: mn
      ? "Энэ нийтлэлийн үндсэн сэдэв юу вэ?"
      : "What is the main topic of this article?",
    options: titleOptions,
    answer: title,
  });

  for (const sentence of ranked) {
    if (quizzes.length >= 5) break;
    const sentenceWords = unique(words(sentence).filter((word) => word.length >= 5));
    const target = [...sentenceWords].sort((a, b) => b.length - a.length)[0];
    if (!target) continue;

    const blanked = sentence.replace(new RegExp(escapeRegex(target), "i"), "______");
    if (blanked === sentence) continue;

    const options = ensureOptions(
      target,
      contentWords.filter((word) => word.toLowerCase() !== target.toLowerCase()),
      fillers,
    );
    quizzes.push({
      question: mn ? `Хоосон зайг бөглөнө үү: ${blanked}` : `Fill in the blank: ${blanked}`,
      options,
      answer: target,
    });
  }

  if (quizzes.length < 4 && ranked[0]) {
    const correct = ranked[0];
    quizzes.push({
      question: mn
        ? "Аль өгүүлбэр нийтлэлд байгаа вэ?"
        : "Which statement appears in the article?",
      options: ensureOptions(correct, ranked.slice(1), fillers),
      answer: correct,
    });
  }

  while (quizzes.length < 3) {
    quizzes.push({
      question: mn
        ? "Энэ нийтлэлд ямар гарчиг өгсөн бэ?"
        : "What title was given to this article?",
      options: ensureOptions(title, [`Draft: ${title}`, `Notes on ${title}`], fillers),
      answer: title,
    });
  }

  return { summary, quizzes: quizzes.slice(0, 5) };
}
