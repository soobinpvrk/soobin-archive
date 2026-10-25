/* 번외 — 매거진. 인쇄용 PDF(재단 115 × 183 mm, 펼침면 28장)를 낱장으로
   잘라 public/magazine/<slug>/p01.webp … p56.webp 로 둔다.
   p01은 앞표지, p02~p55가 본문, p56은 3D 책을 닫았을 때 보이는 흰 뒤표지다. */

export type MagazineChapter = {
  /** 챕터 번호. 표지·들어가며처럼 번호가 없으면 빈 문자열 */
  number: string;
  title: string;
  /** 1부터 세는 쪽 번호 */
  page: number;
};

export type Magazine = {
  slug: string;
  title: string;
  subtitle: string;
  pageCount: number;
  /** 낱장 이미지 픽셀 크기. 3D 페이지 비율을 여기서 정한다. */
  pageWidth: number;
  pageHeight: number;
  /** 이미지가 있는 public 경로. 끝에 슬래시를 붙이지 않는다. */
  pagesPath: string;
  /** 인쇄본에 찍힌 쪽 번호 = 이미지 순서 + folioOffset */
  folioOffset: number;
  chapters: MagazineChapter[];
};

export const EXPLORATION: Magazine = {
  slug: "exploration",
  title: "EXPLORATION",
  subtitle: "장난을 건네는 사람, 혼자 충전하는 사람",
  pageCount: 56,
  pageWidth: 996,
  pageHeight: 1585,
  pagesPath: "/magazine/exploration",
  folioOffset: 1,
  chapters: [
    { number: "", title: "표지", page: 1 },
    { number: "", title: "들어가며", page: 2 },
    { number: "1", title: "장난을 건네는 사람, 혼자 충전하는 사람", page: 3 },
    { number: "2", title: "디자인 안에서, 나에게 맞는 일을 찾는 과정", page: 9 },
    { number: "3", title: "성장하고 싶은 마음과 멈춰 있는 시간", page: 19 },
    { number: "4", title: "안정적인 자리를 떠나, 방향이 보이지 않는 곳으로", page: 27 },
    { number: "5", title: "내 디자인을 넘어, 일이 잘 굴러가는 방향으로", page: 31 },
    { number: "6", title: "중요한 일과 재미있는 일이 어긋날 때", page: 41 },
    { number: "", title: "대화를 마치며", page: 53 },
  ],
};

/* 인쇄본 쪽 번호. 앞·뒤표지는 번호가 없어 null */
export function magazineFolio(magazine: Magazine, page: number) {
  if (page <= 1 || page >= magazine.pageCount) return null;
  return page + magazine.folioOffset;
}

export function magazinePageSrc(magazine: Magazine, page: number) {
  return `${magazine.pagesPath}/p${String(page).padStart(2, "0")}.webp`;
}
