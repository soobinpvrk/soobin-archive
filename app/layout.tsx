import type { Metadata } from "next";
import { zalandoSansExpanded, pretendard } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "수빈이네",
  description:
    "Phi Institute of Design, Self-Introduction 수업 — 10주간 매주 다른 제약으로 자기소개를 수행한 기록.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${zalandoSansExpanded.variable} ${pretendard.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
