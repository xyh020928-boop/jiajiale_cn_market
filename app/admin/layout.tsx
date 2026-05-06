import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "家家乐超市 - 管理后台",
  description: "到货通知发布后台",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#C8102E",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="min-h-screen bg-gray-50 antialiased">
        <div className="mx-auto min-h-screen max-w-2xl">{children}</div>
      </body>
    </html>
  );
}
