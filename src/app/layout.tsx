import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "年代別 90sロック名曲 Top 20",
  description: "1990〜2002年のグランジ・オルタナロック名曲を年代別に試聴",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
