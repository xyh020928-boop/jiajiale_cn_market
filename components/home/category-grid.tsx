"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const categories = [
  { emoji: "🍿", key: "snacks" },
  { emoji: "🌶", key: "spicy" },
  { emoji: "🍜", key: "instant" },
  { emoji: "🍬", key: "candy" },
  { emoji: "🥩", key: "meat" },
  { emoji: "🫙", key: "seasoning" },
  { emoji: "🧃", key: "drinks" },
  { emoji: "🧹", key: "daily" },
] as const;

export function CategoryGrid() {
  const t = useTranslations("home.categories");

  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((cat) => (
        <Link
          key={cat.key}
          href="/news"
          className="flex flex-col items-center gap-1.5 rounded-xl bg-white py-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
        >
          <span className="text-2xl">{cat.emoji}</span>
          <span className="text-[11px] font-medium text-gray-700">
            {t(cat.key)}
          </span>
        </Link>
      ))}
    </div>
  );
}
