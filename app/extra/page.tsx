import { redirect } from "next/navigation";

/* 번외 목록은 메인 아래 목록의 마지막 줄에 있다. */
export default function ExtraPage() {
  redirect("/#introduction");
}
