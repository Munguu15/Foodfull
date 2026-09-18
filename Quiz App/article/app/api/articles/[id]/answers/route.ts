import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/current-user";
import { toPublicQuiz } from "@/lib/quiz-public";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const article = await prisma.article.findFirst({
    where: { id, userId: user.id },
    include: {
      quizzes: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (article.quizzes.length === 0) {
    return NextResponse.json({ error: "No quizzes" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const rawAnswers = Array.isArray(body?.answers) ? body.answers : [];
  const submitted = new Map<string, string>();

  for (const item of rawAnswers) {
    if (typeof item?.quizId !== "string" || typeof item?.answer !== "string") {
      continue;
    }
    const answer = item.answer.trim();
    if (answer) submitted.set(item.quizId, answer);
  }

  const missing = article.quizzes.some((quiz) => !submitted.has(quiz.id));
  if (missing) {
    return NextResponse.json(
      { error: "Answer every question before submitting." },
      { status: 400 },
    );
  }

  try {
    const results = await prisma.$transaction(async (tx) => {
      const scored = [];

      for (const quiz of article.quizzes) {
        const answer = submitted.get(quiz.id) ?? "";
        if (!quiz.options.includes(answer)) {
          throw new Error("INVALID_OPTION");
        }
        const isCorrect = answer === quiz.answer;
        const score = isCorrect ? 1 : 0;

        await tx.quizAttempt.create({
          data: {
            userId: user.id,
            quizId: quiz.id,
            answer,
            isCorrect,
          },
        });

        await tx.userScore.upsert({
          where: {
            userId_quizId: {
              userId: user.id,
              quizId: quiz.id,
            },
          },
          update: { score },
          create: {
            userId: user.id,
            quizId: quiz.id,
            score,
          },
        });

        scored.push(toPublicQuiz(quiz, { answer, isCorrect }, true));
      }

      return scored;
    });

    const correctCount = results.filter((quiz) => quiz.isCorrect).length;

    return NextResponse.json({
      quizzes: results,
      score: correctCount,
      total: results.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_OPTION") {
      return NextResponse.json({ error: "Invalid answer." }, { status: 400 });
    }
    throw error;
  }
}
