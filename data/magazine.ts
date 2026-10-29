/* 번외 — 매거진 두 권. 인쇄용 PDF(재단 115 × 183 mm)를 낱장으로 잘라
   public/magazine/<slug>/p01.webp … 로 둔다. 두 권 모두 p01이 앞표지,
   마지막 장이 3D 책을 닫았을 때 보이는 뒤표지다.
   - 인터뷰어 수빈(interviewer): 52쪽. p02~p51 본문, p52 검은 뒤표지
   - 인터뷰이 수빈(interviewee): 56쪽. p02~p55 본문, p56 흰 뒤표지 */

export type MagazineChapter = {
  /** 챕터 번호. 표지·들어가며처럼 번호가 없으면 빈 문자열 */
  number: string;
  title: string;
  /** 1부터 세는 쪽 번호 */
  page: number;
};

export type Magazine = {
  slug: string;
  /** 메인 목록·breadcrumb에 보일 이름 */
  label: string;
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

export const INTERVIEWER: Magazine = {
  slug: "interviewer",
  label: "인터뷰어 수빈",
  title: "EXPLORATION",
  subtitle: "권한 없이, 사람을 움직이는 일",
  pageCount: 52,
  pageWidth: 996,
  pageHeight: 1585,
  pagesPath: "/magazine/interviewer",
  folioOffset: 1,
  chapters: [
    { number: "", title: "표지", page: 1 },
    { number: "", title: "들어가며", page: 2 },
    { number: "1", title: "권한 없이, 사람을 움직이는 일", page: 3 },
    { number: "2", title: "역할을 하는 사람과, 일을 완성하는 사람", page: 9 },
    { number: "3", title: "방향을 주는 사람, 고통스러워도 가는 사람", page: 14 },
    { number: "4", title: "물어보고, 다시 물어보며 알아 가는 일", page: 20 },
    { number: "5", title: "남을 읽는 사람은, 자신도 읽을까", page: 28 },
    { number: "6", title: "하기 싫어도, 어항의 물을 갈아야만 한다", page: 33 },
    { number: "7", title: "되고 싶어서가 아니라, 되어야 해서", page: 42 },
    { number: "", title: "대화를 마치며", page: 48 },
  ],
};

export const INTERVIEWEE: Magazine = {
  slug: "interviewee",
  label: "인터뷰이 수빈",
  title: "EXPLORATION",
  subtitle: "장난을 건네는 사람, 혼자 충전하는 사람",
  pageCount: 56,
  pageWidth: 996,
  pageHeight: 1585,
  pagesPath: "/magazine/interviewee",
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

/* 매거진 상세 탭에 보이는 순서 */
export const MAGAZINES: Magazine[] = [INTERVIEWEE, INTERVIEWER];

export function getMagazine(slug: string) {
  return MAGAZINES.find((m) => m.slug === slug);
}

/* 인쇄본 쪽 번호. 앞·뒤표지는 번호가 없어 null */
export function magazineFolio(magazine: Magazine, page: number) {
  if (page <= 1 || page >= magazine.pageCount) return null;
  return page + magazine.folioOffset;
}

export function magazinePageSrc(magazine: Magazine, page: number) {
  return `${magazine.pagesPath}/p${String(page).padStart(2, "0")}.webp`;
}
