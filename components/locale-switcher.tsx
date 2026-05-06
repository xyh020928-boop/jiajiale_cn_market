"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, localeNames } from "@/lib/i18n-config";
import { Globe } from "lucide-react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  // 当前语言的下一个目标
  const nextLocale = locales.find((l) => l !== locale) || "zh";

  return (
    <button
      onClick={() => switchLocale(nextLocale)}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{localeNames[nextLocale]}</span>
    </button>
  );
}
