"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "mn" | "en";

export const messages = {
  en: {
    title: "AI tools",
    analysis: "Image analysis",
    ingredients: "Ingredient recognition",
    creator: "Image creator",
    generate: "Generate",
    summary: "Here is the summary",
    reset: "Reset",
    search: "Cooking help",
    analysisHint: "Upload a food photo, and AI will detect the ingredients.",
    analysisEmpty: "First, enter your image to recognize an ingredients.",
    uploadedFood: "Uploaded food",
    ingredientsHint: "List the ingredients you have, and AI will recognize them.",
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
    themeToDark: "Night mode",
    themeToLight: "Day mode",
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
    themeToDark: "Шөнийн горим",
    themeToLight: "Өдрийн горим",
  },
} as const;

export type Messages = (typeof messages)[Lang];

const LangContext = createContext<{
  lang: Lang;
  t: Messages;
  setLang: (lang: Lang) => void;
} | null>(null);

const LANG_KEY = "foodai-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("mn");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "mn" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    window.localStorage.setItem(LANG_KEY, next);
    document.documentElement.lang = next;
  }

  return (
    <LangContext.Provider value={{ lang, t: messages[lang], setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(LangContext);
  if (!value) {
    throw new Error("useI18n must be used inside LanguageProvider");
  }
  return value;
}
