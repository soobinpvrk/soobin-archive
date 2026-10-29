/**
 * 05 이미지 페이지의 항목 데이터. 내용을 바꿀 때는 이 파일만 수정하면 된다.
 *
 * - src: public/ 기준 경로. 파일을 public/introduction/5/ 에 넣고 이름을 맞추면
 *   바로 보인다. 파일이 아직 없으면 그 자리는 테두리만 있는 플레이스홀더로 나온다.
 * - date: YYYY/MM/DD. date 는 그 이미지를 올린 날짜. Started 는 가장 이른 날짜,
 *   Modified 는 가장 최근 날짜로 자동 계산된다.
 * - 항목을 더하거나 빼면 Length도 따라 바뀐다.
 */
export type ArchiveImage = {
  id: string;
  src: string;
  title: string;
  date: string;
  description: string;
};

export const ABOUT =
  "이번 과제 설명 입력. 한두 줄로 이 아카이브가 무엇을 모았는지 적는다.";

export const AUTHOR = "soobin park";

export const IMAGES: ArchiveImage[] = [
  {
    id: "01",
    src: "/introduction/5/01.jpg",
    title: "제목 입력",
    date: "2026/10/19",
    description: "설명 입력",
  },
  {
    id: "02",
    src: "/introduction/5/02.jpg",
    title: "제목 입력",
    date: "2026/10/19",
    description: "설명 입력",
  },
  {
    id: "03",
    src: "/introduction/5/03.jpg",
    title: "제목 입력",
    date: "2026/10/19",
    description: "설명 입력",
  },
  {
    id: "04",
    src: "/introduction/5/04.jpg",
    title: "제목 입력",
    date: "2026/10/19",
    description: "설명 입력",
  },
  {
    id: "05",
    src: "/introduction/5/05.jpg",
    title: "제목 입력",
    date: "2026/10/19",
    description: "설명 입력",
  },
  {
    id: "06",
    src: "/introduction/5/06.jpg",
    title: "제목 입력",
    date: "2026/10/19",
    description: "설명 입력",
  },
  {
    id: "07",
    src: "/introduction/5/07.jpg",
    title: "제목 입력",
    date: "2026/10/19",
    description: "설명 입력",
  },
  {
    id: "08",
    src: "/introduction/5/08.jpg",
    title: "제목 입력",
    date: "2026/10/19",
    description: "설명 입력",
  },
  {
    id: "09",
    src: "/introduction/5/09.jpg",
    title: "제목 입력",
    date: "2026/10/19",
    description: "설명 입력",
  },
  {
    id: "10",
    src: "/introduction/5/10.jpg",
    title: "제목 입력",
    date: "2026/10/19",
    description: "설명 입력",
  },
];
