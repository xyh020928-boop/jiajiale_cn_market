import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { Calendar } from "lucide-react";

type Props = {
  params: { locale: string };
};

export default async function HomePage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "home" });

  // 获取最新 3 条到货通知
  const supabase = createClient();
  const { data: latestNews } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="space-y-8 px-4 py-8">
      {/* Hero 区域 */}
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
        <Link
          href="/news"
          className="inline-block rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          {t("cta")}
        </Link>
      </section>

      {/* 特色介绍 */}
      <section className="space-y-4">
        <h2 className="text-center text-xl font-semibold">
          {t("features.title")}
        </h2>
        <div className="grid gap-4">
          <FeatureCard
            title={t("features.fresh.title")}
            desc={t("features.fresh.desc")}
          />
          <FeatureCard
            title={t("features.authentic.title")}
            desc={t("features.authentic.desc")}
          />
          <FeatureCard
            title={t("features.convenient.title")}
            desc={t("features.convenient.desc")}
          />
        </div>
      </section>

      {/* 最新到货通知 */}
      {latestNews && latestNews.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {t("latestNews.title")}
            </h2>
            <Link
              href="/news"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("latestNews.viewAll")}
            </Link>
          </div>
          <div className="space-y-3">
            {latestNews.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`}>
                <div className="rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <h3 className="mb-1 text-sm font-semibold text-foreground">
                    {locale === "zh" ? item.title_zh : item.title_ko}
                  </h3>
                  <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">
                    {locale === "zh" ? item.content_zh : item.content_ko}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                    <Calendar className="h-3 w-3" />
                    <time>
                      {new Date(item.created_at).toLocaleDateString(
                        locale === "zh" ? "zh-CN" : "ko-KR",
                        { month: "short", day: "numeric" }
                      )}
                    </time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 门店信息 */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          {t("storeInfo.title")}
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>{t("storeInfo.address")}</p>
          <p>{t("storeInfo.hours")}</p>
          <p>{t("storeInfo.phone")}</p>
        </div>
        {/* 地图占位 */}
        <div className="mt-4 flex h-40 items-center justify-center rounded-lg bg-gray-100 text-xs text-muted-foreground">
          🗺️ 地图将在后续接入
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
