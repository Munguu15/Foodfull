"use client";

import { useState } from "react";
import { MessageCircleIcon, SendHorizontalIcon, XIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

type Lang = "mn" | "en";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const copy = {
  en: {
    title: "Cooking help",
    subtitle: "Ask about recipes, ingredients, and cooking time.",
    placeholder: "How do I make noodle soup?",
    send: "Send",
    close: "Close chat",
    you: "You",
    assistant: "Chef",
    loading: "Thinking...",
    error: "Something went wrong. Please try again.",
    welcome:
      "Hi! Ask me about food only — ingredients, recipes, how to cook, and how long it takes.",
    suggestions: [
      "How do I make buuz?",
      "What can I cook with eggs and onion?",
      "How long to boil pasta?",
    ],
  },
  mn: {
    title: "Хоолны тусламж",
    subtitle: "Жор, орц найрлага, хугацааны талаар асуугаарай.",
    placeholder: "Гоймонтой шөл хэрхэн хийх вэ?",
    send: "Илгээх",
    close: "Чатыг хаах",
    you: "Та",
    assistant: "Тогооч",
    loading: "Бодож байна...",
    error: "Алдаа гарлаа. Дахин оролдоно уу.",
    welcome:
      "Сайн байна уу! Би зөвхөн хоолны талаар тусална — орц найрлага, жор, хэрхэн хийх, хэдэн минутад бэлэн болох гэх мэт.",
    suggestions: [
      "Бууз хэрхэн хийх вэ?",
      "Өндөг, сонгиноор юу хийж болох вэ?",
      "Гоймон хэдэн минут чанах вэ?",
    ],
  },
} as const;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AssistChatPanel({
  lang,
  onClose,
}: {
  lang: Lang;
  onClose: () => void;
}) {
  const t = copy[lang];
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t.welcome,
    },
  ]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          lang,
          history: nextMessages
            .filter((item) => item.id !== "welcome")
            .map(({ role, content: itemContent }) => ({
              role,
              content: itemContent,
            })),
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || t.error);
      }

      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: data.reply?.trim() || t.error,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: error instanceof Error ? error.message : t.error,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-end p-4 sm:p-6">
      <button
        type="button"
        aria-label={t.close}
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      <div className="relative flex h-[min(640px,85vh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageCircleIcon className="size-4" />
              {t.title}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t.subtitle}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t.close}
            onClick={onClose}
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <MessageScrollerProvider autoScroll>
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="gap-4 p-4">
                {messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={isUser}
                    >
                      <Message align={isUser ? "end" : "start"}>
                        <MessageAvatar>
                          <Avatar size="sm">
                            <AvatarFallback>
                              {isUser ? "U" : "AI"}
                            </AvatarFallback>
                          </Avatar>
                        </MessageAvatar>
                        <MessageContent>
                          <MessageHeader>
                            {isUser ? t.you : t.assistant}
                          </MessageHeader>
                          <Bubble
                            variant={isUser ? "default" : "secondary"}
                            align={isUser ? "end" : "start"}
                          >
                            <BubbleContent className="whitespace-pre-wrap">
                              {message.content}
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  );
                })}

                {loading ? (
                  <MessageScrollerItem messageId="loading">
                    <Message align="start">
                      <MessageAvatar>
                        <Avatar size="sm">
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      </MessageAvatar>
                      <MessageContent>
                        <Bubble variant="muted" align="start">
                          <BubbleContent>{t.loading}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ) : null}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>

        <div className="border-t border-border p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {t.suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="xs"
                disabled={loading}
                onClick={() => send(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>

          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.placeholder}
              disabled={loading}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              aria-label={t.send}
            >
              <SendHorizontalIcon className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
