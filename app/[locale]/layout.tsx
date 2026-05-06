import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { PWARegister } from "@/components/pwa-register";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "home" });
  const brand = await getTranslations({ locale });

  return {
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
    manifest: "/manifest.json",
    icons: {
      icon: "/icons/icon-192.svg",
      apple: "/icons/icon-192.svg",
    },
    appleWebApp: {
      capable: true,
      title: brand("brand"),
      statusBarStyle: "default",
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "zh" ? "zh_CN" : "ko_KR",
      siteName: brand("brand"),
      type: "website",
    },
    // TODO: 替换为真实图片
    // twitter: {
    //   card: "summary_large_image",
    //   title: t("title"),
    //   description: t("description"),
    // },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#C8102E",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  // 校验 locale 是否有效
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <PWARegister />
        <NextIntlClientProvider messages={messages}>
          <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
            {/* 顶部导航 */}
            <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              <div className="flex items-center justify-between px-4 py-3">
                <a
                  href={`/${locale}`}
                  className="text-lg font-bold text-primary"
                >
                  <BrandName locale={locale} />
                </a>
                <nav className="flex items-center gap-4 text-sm">
                  <a
                    href={`/${locale}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <LocaleNavLabel locale={locale} namespace="nav" labelKey="home" />
                  </a>
                  <a
                    href={`/${locale}/news`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <LocaleNavLabel locale={locale} namespace="nav" labelKey="news" />
                  </a>
                  <LocaleSwitcher />
                </nav>
              </div>
            </header>

            {/* 主内容 */}
            <main className="flex-1">{children}</main>

            {/* 底部 */}
            <footer className="border-t bg-white py-6 text-center text-xs text-muted-foreground">
              <Copyright locale={locale} />
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

/** 显示店铺名称 */
async function BrandName({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  return <>{t("brand")}</>;
}

/** 版权信息 */
async function Copyright({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  return <p>© 2026 {t("brand")}. All rights reserved.</p>;
}

/** 显示导航文案 */
async function LocaleNavLabel({
  locale,
  namespace,
  labelKey,
}: {
  locale: string;
  namespace: string;
  labelKey: string;
}) {
  const t = await getTranslations({ locale, namespace });
  return <>{t(labelKey)}</>;
}
