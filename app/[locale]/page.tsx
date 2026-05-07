import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { Search } from "lucide-react";
import type { NewsRow } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/price";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Banner } from "@/components/home/banner";
import { CategoryGrid } from "@/components/home/category-grid";

type Props = {
  params: { locale: string };
};

export default async function HomePage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "home" });

  const supabase = createClient();
  const { data: latestNews } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const items = (latestNews ?? []) as NewsRow[];

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* ===== 顶部栏 ===== */}
      <div className="flex items-center justify-between pt-3">
        <h1 className="text-lg font-bold text-primary">{t("title")}</h1>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link href="/news">
            <Search className="h-5 w-5 text-gray-500" />
          </Link>
        </div>
      </div>

      {/* ===== 搜索框 ===== */}
      <Link
        href="/news"
        className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-400 transition-colors active:bg-gray-200"
      >
        <Search className="h-4 w-4" />
        <span>{t("searchPlaceholder")}</span>
      </Link>

      {/* ===== Banner 轮播 ===== */}
      <Banner />

      {/* ===== 分类宫格 ===== */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-800">
          {t("categories.title")}
        </h2>
        <CategoryGrid />
      </section>

      {/* ===== 新品到货 ===== */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            {t("latestNews.title")}
          </h2>
          <Link
            href="/news"
            className="text-xs font-medium text-primary"
          >
            {t("latestNews.viewAll")}
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            {t("latestNews.empty")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`}>
                <article className="overflow-hidden rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
                  {/* 图片占位区 */}
                  <div className="flex h-[120px] items-center justify-center bg-gray-100 text-xs text-gray-300">
                    {item.images && item.images.length > 0 ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{t("latestNews.noImage")}</span>
                    )}
                  </div>
                  {/* 文字信息 */}
                  <div className="space-y-1 p-2.5">
                    <h3 className="line-clamp-1 text-sm font-medium text-gray-800">
                      {locale === "zh" ? item.title_zh : item.title_ko}
                    </h3>
                    <p className="line-clamp-1 text-[11px] text-gray-400">
                      {locale === "zh" ? item.content_zh : item.content_ko}
                    </p>
                    <div className="flex items-center justify-between">
                      <time className="text-[10px] text-gray-300">
                        {new Date(item.created_at).toLocaleDateString(
                          locale === "zh" ? "zh-CN" : "ko-KR",
                          { month: "2-digit", day: "2-digit" }
                        )}
                      </time>
                      {(() => {
                        const p = formatPrice(item.price_krw);
                        return p ? (
                          <span className="text-xs font-bold text-primary">
                            {p.krw} / {p.cny}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== 门店信息 ===== */}
      <section className="rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <h2 className="mb-3 text-base font-semibold text-gray-800">
          {t("storeInfo.title")}
        </h2>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">📍</span>
            <span className="text-gray-600">{t("storeInfo.address")}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">🕐</span>
            <span className="text-gray-600">{t("storeInfo.hours")}</span>
          </div>
          <a
            href="tel:0212345678"
            className="flex items-start gap-2"
          >
            <span className="mt-0.5 shrink-0">📞</span>
            <span className="text-primary">{t("storeInfo.phone")}</span>
          </a>
        </div>
      </section>

      {/* 底部间距 */}
      <div className="h-4" />
    </div>
  );
}
