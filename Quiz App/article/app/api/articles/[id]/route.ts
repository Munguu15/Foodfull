import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/current-user";
import { generateArticleQuiz } from "@/lib/generate-quiz";
import { toPublicQuiz } from "@/lib/quiz-public";
import { createQuizzesForArticle } from "@/lib/quiz-db";

async function loadArticleForUser(articleId: string, userId: string) {
  return prisma.article.findFirst({
    where: { id: articleId, userId },
    include: {
      quizzes: {
        orderBy: { createdAt: "asc" },
        include: {
          quizAttempts: {
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    let article = await loadArticleForUser(id, user.id);

    if (!article) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (article.quizzes.length === 0) {
      const generated = generateArticleQuiz(article.title, article.content);
      await prisma.article.update({
        where: { id: article.id },
        data: { summary: generated.summary },
      });
      await createQuizzesForArticle(article.id, generated.quizzes);
      article = await loadArticleForUser(id, user.id);
      if (!article) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    const attemptedAll =
      article.quizzes.length > 0 &&
      article.quizzes.every((quiz) => quiz.quizAttempts.length > 0);

    return NextResponse.json({
      id: article.id,
      title: article.title,
      content: article.content,
      summary: article.summary,
      quizzes: article.quizzes.map((quiz) =>
        toPublicQuiz(quiz, quiz.quizAttempts[0], attemptedAll),
      ),
    });
  } catch (error) {
    console.error("Failed to load quiz", error);
    return NextResponse.json({ error: "Could not load this quiz." }, { status: 500 });
  }
}
