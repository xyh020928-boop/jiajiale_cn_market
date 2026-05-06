"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Home, Bell, Phone } from "lucide-react";

const tabs = [
  { key: "/", icon: Home, label: "home" },
  { key: "/news", icon: Bell, label: "news" },
  { key: "/contact", icon: Phone, label: "contact" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("tabBar");

  const getActiveIndex = () => {
    if (pathname === "/") return 0;
    if (pathname.startsWith("/news")) return 1;
    if (pathname.startsWith("/contact")) return 2;
    return 0;
  };

  const activeIndex = getActiveIndex();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-[480px] items-center justify-around py-1.5">
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeIndex === i;
          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.key)}
              className="flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors"
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-primary" : "text-gray-400"
                }`}
              />
              <span
                className={`text-[10px] leading-tight ${
                  isActive
                    ? "font-medium text-primary"
                    : "text-gray-400"
                }`}
              >
                {t(tab.label)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
