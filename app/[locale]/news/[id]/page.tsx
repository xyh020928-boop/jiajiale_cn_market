import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import type { NewsRow } from "@/lib/supabase/types";

type Props = {
  params: { locale: string; id: string };
};

export default async function NewsDetailPage({ params }: Props) {
  const { locale, id } = params;
  const t = await getTranslations({ locale, namespace: "news" });
  const supabase = createClient();

  const { data, error } = await (supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .single() as Promise<{ data: NewsRow | null; error: Error | null }>);

  const item = data;

  if (error || !item) {
    notFound();
  }

  const title = locale === "zh" ? item.title_zh : item.title_ko;
  const content = locale === "zh" ? item.content_zh : item.content_ko;
  const images = item.images ?? [];

  return (
    <div className="space-y-6 px-4 py-8">
      {/* 返回按钮 */}
      <Link href="/news">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Button>
      </Link>

      <article className="space-y-6">
        {/* 发布日期 */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <time>
            {new Date(item.created_at).toLocaleDateString(
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
        <h1 className="text-2xl font-bold leading-tight text-foreground">
          {title}
        </h1>

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

        {/* 正文内容 */}
        <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
          {content}
        </div>
      </article>

      {/* 底部操作 */}
      <div className="flex gap-3 pt-4">
        <Link href="/news">
          <Button variant="outline" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost">{t("backToHome")}</Button>
        </Link>
      </div>
    </div>
  );
}
