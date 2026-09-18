import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/current-user";
import { generateArticleQuiz } from "@/lib/generate-quiz";
import { toPublicQuiz } from "@/lib/quiz-public";
import { createQuizzesForArticle } from "@/lib/quiz-db";

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await prisma.article.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  });

  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!title || content.length < 50) {
      return NextResponse.json(
        { error: "Гарчиг болон хамгийн багадаа 50 тэмдэгттэй текст шаардлагатай." },
        { status: 400 },
      );
    }

    const generated = generateArticleQuiz(title, content);

    const article = await prisma.article.create({
      data: {
        userId: user.id,
        title,
        content,
        summary: generated.summary,
      },
    });

    const quizzes = await createQuizzesForArticle(article.id, generated.quizzes);

    return NextResponse.json(
      {
        id: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary,
        quizzes: quizzes.map((quiz) => toPublicQuiz(quiz)),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create article quiz", error);
    return NextResponse.json({ error: "Quiz үүсгэж чадсангүй." }, { status: 500 });
  }
}
