import { redirect } from "next/navigation";

/* 매거진이 두 권으로 나뉘기 전의 주소. 예전에 공유한 링크는 인터뷰이 수빈으로 연다. */
export default function MagazineIndexPage() {
  redirect("/extra/magazine/interviewee");
}
