import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft, Search } from "lucide-react";
import type { NewsRow } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/price";

type Props = {
  params: { locale: string };
};

const categories = ["all", "snacks", "seasoning", "frozen", "drinks"] as const;

export default async function NewsListPage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "news" });
  const catT = await getTranslations({ locale, namespace: "news.categories" });

  const supabase = createClient();
  const { data: newsList, error } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch news:", error.message);
  }

  const items = (newsList ?? []) as NewsRow[];

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* ===== 顶部栏 ===== */}
      <div className="flex items-center justify-between pt-3">
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-600">
          <ChevronLeft className="h-5 w-5" />
          <span>{t("backToHome")}</span>
        </Link>
        <h1 className="text-base font-bold text-gray-800">{t("title")}</h1>
        <Link href="/news">
          <Search className="h-5 w-5 text-gray-400" />
        </Link>
      </div>

      {/* ===== 分类滑动 Tab ===== */}
      <div className="-mx-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                cat === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {catT(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* ===== 双列商品卡片 ===== */}
      {items.length === 0 ? (
        <p className="py-20 text-center text-sm text-gray-400">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <article className="overflow-hidden rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
                {/* 图片 */}
                <div className="flex h-[140px] items-center justify-center bg-gray-100 text-xs text-gray-300">
                  {item.images && item.images.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{t("noImage")}</span>
                  )}
                </div>
                {/* 文字 */}
                <div className="space-y-1 p-2.5">
                  <h3 className="line-clamp-2 text-sm font-medium leading-snug text-gray-800">
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
                        <span className="text-xs font-bold text-primary">{p.krw} / {p.cny}</span>
                      ) : null;
                    })()}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
