import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

type Props = {
  params: { locale: string };
};

export default async function NewsListPage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "news" });
  const supabase = createClient();

  const { data: newsList, error } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  // 出错时静默处理，显示空列表
  if (error) {
    console.error("Failed to fetch news:", error.message);
  }

  const items = newsList ?? [];

  return (
    <div className="space-y-6 px-4 py-8">
      {/* 页面标题 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* 到货通知列表 */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  {/* 图片预览 */}
                  {item.images && item.images.length > 0 && (
                    <div className="mb-3 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.images[0]}
                        alt=""
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  )}

                  {/* 标题 */}
                  <h2 className="mb-2 text-base font-semibold leading-snug text-foreground">
                    {locale === "zh" ? item.title_zh : item.title_ko}
                  </h2>

                  {/* 内容预览 */}
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {locale === "zh" ? item.content_zh : item.content_ko}
                  </p>

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
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
                    <Badge variant="success" className="text-[11px]">
                      {t("readMore")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
