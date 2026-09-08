import type { Metadata } from "next";
import "./globals.css";
import { themeInitScript } from "@/lib/site-theme";
export const metadata: Metadata = {
  title: { default: "JungUI · 有感觉的界面细节", template: "%s · JungUI" },
  description: "可预览、可调整、可直接带进项目的 UI 组件与交互动效。",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
