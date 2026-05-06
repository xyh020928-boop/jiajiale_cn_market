import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { TabBar } from "@/components/tab-bar";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-white antialiased">
        <PWARegister />
        <NextIntlClientProvider messages={messages}>
          <div className="mx-auto min-h-screen max-w-[480px] bg-white pb-16">
            <main>{children}</main>
          </div>
          <TabBar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
