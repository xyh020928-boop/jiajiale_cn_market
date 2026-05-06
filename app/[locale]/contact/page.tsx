import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ChevronLeft } from "lucide-react";

type Props = {
  params: { locale: string };
};

export default async function ContactPage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "home.storeInfo" });
  const brand = await getTranslations({ locale });

  return (
    <div className="space-y-5 px-4 pb-6">
      {/* ===== 顶部栏 ===== */}
      <div className="flex items-center justify-between pt-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-gray-600"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>返回</span>
        </Link>
        <h1 className="text-base font-bold text-gray-800">联系我们</h1>
        <div className="w-5" />
      </div>

      {/* ===== 店铺头图 ===== */}
      <div className="flex h-[160px] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#C8102E] to-[#E84444] text-white">
        <p className="text-2xl font-bold tracking-wide">{brand("brand")}</p>
        <p className="mt-1.5 text-sm opacity-90">首尔九老区中国超市</p>
      </div>

      {/* ===== 信息卡片 ===== */}
      <div className="space-y-3">
        {/* 地址 */}
        <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <span className="mt-0.5 text-xl">📍</span>
          <div>
            <p className="text-sm font-medium text-gray-800">地址</p>
            <p className="mt-0.5 text-sm text-gray-500">
              {t("address")}
            </p>
          </div>
        </div>

        {/* 营业时间 */}
        <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <span className="mt-0.5 text-xl">🕐</span>
          <div>
            <p className="text-sm font-medium text-gray-800">营业时间</p>
            <p className="mt-0.5 text-sm text-gray-500">
              {t("hours")}
            </p>
          </div>
        </div>

        {/* 电话 */}
        <a
          href="tel:0212345678"
          className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow active:shadow-[0_2px_4px_rgba(0,0,0,0.04)]"
        >
          <span className="mt-0.5 text-xl">📞</span>
          <div>
            <p className="text-sm font-medium text-gray-800">电话</p>
            <p className="mt-0.5 text-sm font-medium text-primary">
              {t("phone")} <span className="text-xs text-gray-400">(点击拨打)</span>
            </p>
          </div>
        </a>
      </div>

      {/* ===== 地图占位 ===== */}
      <div className="flex h-[220px] items-center justify-center rounded-xl bg-gray-100">
        <div className="text-center text-sm text-gray-400">
          <p className="text-2xl">🗺️</p>
          <p className="mt-1">地图将在后续接入</p>
        </div>
      </div>
    </div>
  );
}
