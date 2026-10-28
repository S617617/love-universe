import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "@/lib/store";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: "Love Universe · 恋爱宇宙 Demo",
  description:
    "无需注册，体验回忆、日记、花园和未来信箱。默认内容为虚构示例，你的修改只保存在当前浏览器。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Provider>
          <Shell>{children}</Shell>
        </Provider>
      </body>
    </html>
  );
}
