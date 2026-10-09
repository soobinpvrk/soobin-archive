// 각 항목의 status는 원본 그래프를 보고 직접 지정한다.
// (past/ongoing 두 상태에서 옮기면서 past → fulfilled, ongoing → unfulfilled로
//  임시 지정했고, "미술을 하고 싶다는 욕망"만 released로 정했다.)

/**
 * fulfilled: 충족된 것
 * unfulfilled: 충족되지 않은 것
 * released: 충족할 필요가 없어진 것
 */
export type DesireStatus = "fulfilled" | "unfulfilled" | "released";

type LifeNodeContent = {
  /** 칸에 들어갈 문구 */
  title: string;
  /** 모달에 들어갈 한두 문장. 비어 있으면 모달에 "아직 적지 않았다."가 나온다. */
  text: string;
  /** 나중에 채운다. 예: 2009 */
  year?: number;
  /** 나중에 채운다. 예: 14 */
  age?: number;
  /** public 폴더 기준 이미지 경로. 예: "/life/art.jpg" */
  image?: string;
};

/** 출생과 지금은 욕망이 아니라 구간의 양끝이라 상태가 없다. */
export type LifeNode =
  | (LifeNodeContent & { kind: "start" | "end" })
  | (LifeNodeContent & { kind: "desire"; status: DesireStatus });

export type LifeNodeKind = LifeNode["kind"];

// 세로축 없이, 배열 순서대로 왼쪽에서 오른쪽으로 놓인다.
// 앞의 욕망이 다음 욕망을 낳은 순서로 적는다.
export const lifeGraphData: LifeNode[] = [
  { kind: "start", title: "박수빈 출생", text: "" },

  { kind: "desire", status: "released", title: "미술을 하고 싶다는 욕망", text: "" },
  { kind: "desire", status: "fulfilled", title: "재밌는 것을 찾고 싶다는 욕망", text: "" },
  { kind: "desire", status: "fulfilled", title: "내가 소장하고 싶은 인쇄물을 만들고 싶다는 욕망", text: "" },
  { kind: "desire", status: "unfulfilled", title: "전문성이나 체계가 있는 곳에서 일하고 싶다는 욕망", text: "" },
  { kind: "desire", status: "fulfilled", title: "나한테 잘 맞는 일을 하고 싶다는 욕망", text: "" },
  { kind: "desire", status: "fulfilled", title: "1인분 이상은 하고 싶다는 욕망", text: "" },
  { kind: "desire", status: "fulfilled", title: "내가 병목이 되는 상황을 만들고 싶지 않은 욕망", text: "" },
  { kind: "desire", status: "unfulfilled", title: "내가 하는 프로젝트가 더 잘 굴러갔으면 좋겠다는 욕망", text: "" },
  { kind: "desire", status: "unfulfilled", title: "더 잘 성장하고 싶다는 욕망", text: "" },
  { kind: "desire", status: "unfulfilled", title: "인생 전반에 도움이 될 무언가를 배우고 싶다는 욕망", text: "" },

  { kind: "end", title: "지금 박수빈", text: "" },
];
