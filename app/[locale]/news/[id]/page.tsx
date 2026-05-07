import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ChevronLeft } from "lucide-react";
import type { NewsRow } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/price";

type Props = {
  params: { locale: string; id: string };
};

export default async function NewsDetailPage({ params }: Props) {
  const { locale, id } = params;
  const t = await getTranslations({ locale, namespace: "news" });
  const supabase = createClient();

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const newsItem = data as NewsRow;
  const title = locale === "zh" ? newsItem.title_zh : newsItem.title_ko;
  const content = locale === "zh" ? newsItem.content_zh : newsItem.content_ko;
  const images = newsItem.images ?? [];

  return (
    <div className="space-y-5 px-4 pb-6">
      {/* 顶部栏 */}
      <div className="flex items-center gap-3 pt-3">
        <Link
          href="/news"
          className="flex items-center gap-1 text-sm text-gray-600"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>{t("backToDetail")}</span>
        </Link>
      </div>

      <article className="space-y-4">
        {/* 日期 */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <time>
            {new Date(newsItem.created_at).toLocaleDateString(
              locale === "zh" ? "zh-CN" : "ko-KR",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </time>
        </div>

        {/* 标题 */}
        <h1 className="text-xl font-bold leading-tight text-gray-800">
          {title}
        </h1>

        {/* 价格 */}
        {(() => {
          const p = formatPrice(newsItem.price_krw);
          return p ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{p.krw}</span>
              <span className="text-sm text-gray-400">/</span>
              <span className="text-base font-bold text-primary">{p.cny}</span>
            </div>
          ) : null;
        })()}

        {/* 图片画廊 */}
        {images.length > 0 && (
          <div
            className={`grid gap-3 ${
              images.length === 1
                ? "grid-cols-1"
                : images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2"
            }`}
          >
            {images.map((src, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-xl ${
                  images.length === 3 && i === 0 ? "col-span-2" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${title} - ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* 正文 */}
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
          {content}
        </div>
      </article>

      {/* 底部操作 */}
      <div className="flex gap-3 pt-2">
        <Link
          href="/news"
          className="flex-1 rounded-xl border border-gray-200 py-3 text-center text-sm font-medium text-gray-600 transition-colors active:bg-gray-50"
        >
          {t("backToDetail")}
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-medium text-white transition-colors active:bg-primary-dark"
        >
          {t("backToHome")}
        </Link>
      </div>

      <div className="h-4" />
    </div>
  );
}
