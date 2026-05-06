export type Locale = "zh" | "ko";

export const locales: Locale[] = ["zh", "ko"];
export const defaultLocale: Locale = "zh";

export const localeNames: Record<Locale, string> = {
  zh: "中文",
  ko: "한국어",
};
