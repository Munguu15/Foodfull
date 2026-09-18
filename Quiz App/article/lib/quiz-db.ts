import { prisma } from "@/lib/prisma";
import type { GeneratedQuiz } from "@/lib/generate-quiz";

export type QuizRecord = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

type QuizDelegate = {
  create(args: {
    data: {
      articleId: string;
      question: string;
      options: string[];
      answer: string;
    };
  }): Promise<QuizRecord>;
};

function quizDb(): QuizDelegate {
  return (prisma as unknown as { quiz: QuizDelegate }).quiz;
}

export async function createQuizzesForArticle(
  articleId: string,
  quizzes: GeneratedQuiz[],
) {
  const created: QuizRecord[] = [];

  for (const quiz of quizzes) {
    created.push(
      await quizDb().create({
        data: {
          articleId,
          question: quiz.question,
          options: quiz.options,
          answer: quiz.answer,
        },
      }),
    );
  }

  return created;
}
