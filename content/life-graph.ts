export type LifePoint = {
  /** 연도. 예: 2009 */
  year: number;
  /** 행복지수. -10~10 사이의 정수. 그래프 y값이자 모달의 +nn/-nn 표시에 쓴다. 예: 3, -5 */
  score: number;
  /** 사건 이름. 예: "대학 합격" */
  title: string;
  /** 한두 문장 설명. 예: "재수 끝에 원하던 학교에 붙었다." */
  text: string;
  /** public 폴더 기준 이미지 경로. 없으면 생략 가능. 예: "/life/2009-admission.jpg" */
  image?: string;
};

// 그래프 x축은 1996~2026으로 고정이다 (components/LifeGraph.tsx의 YEAR_MIN/YEAR_MAX).
// 아래 배열에 사건을 추가하면 연도 위치에 맞게 자동으로 배치된다. 순서는 상관없다.
export const lifeGraphData: LifePoint[] = [
  // 시작점: 태어난 해 (플레이스홀더)
  {
    year: 1996,
    score: 0,
    title: "여기에 사건 이름",
    text: "여기에 한두 문장으로 그때 있었던 일을 적는다.",
  },

  // 중간 사건은 이런 형태로 추가한다 (아래는 예시, 실제로 쓸 때 주석을 풀고 값만 바꾸면 됨):
  // {
  //   year: 2009,
  //   score: 3,
  //   title: "대학 합격",
  //   text: "재수 끝에 원하던 학교에 붙었다.",
  //   image: "/life/2009-admission.jpg",
  // },

  // 끝점: 현재 (플레이스홀더)
  {
    year: 2026,
    score: 0,
    title: "여기에 사건 이름",
    text: "여기에 한두 문장으로 그때 있었던 일을 적는다.",
  },
];
