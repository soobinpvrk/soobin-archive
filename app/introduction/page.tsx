import { redirect } from "next/navigation";

/* 주차 목록은 메인 아래 섹션으로 옮겼다.
   예전 주소로 들어온 사람이 빈 화면을 보지 않도록 그쪽으로 보낸다. */
export default function IntroductionPage() {
  redirect("/#introduction");
}
