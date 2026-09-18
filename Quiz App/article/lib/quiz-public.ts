import type { Quiz, QuizAttempt } from "@prisma/client";

export type PublicQuiz = {
  id: string;
  question: string;
  options: string[];
  previousAnswer?: string;
  isCorrect?: boolean;
  correctAnswer?: string;
};

export function toPublicQuiz(
  quiz: Pick<Quiz, "id" | "question" | "options" | "answer">,
  attempt?: Pick<QuizAttempt, "answer" | "isCorrect"> | null,
  revealAnswer = false,
): PublicQuiz {
  return {
    id: quiz.id,
    question: quiz.question,
    options: quiz.options,
    ...(attempt
      ? {
          previousAnswer: attempt.answer,
          isCorrect: attempt.isCorrect,
        }
      : {}),
    ...(revealAnswer ? { correctAnswer: quiz.answer } : {}),
  };
}
