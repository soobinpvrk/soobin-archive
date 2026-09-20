/**
 * 사이트 전체 폰트는 이 파일 한 곳에서만 선언한다.
 * 폰트를 교체하려면 이 파일과 app/globals.css의 :root { --font-display, --font-body }
 * 두 변수만 수정하면 된다. 다른 컴포넌트/CSS 파일에는 폰트 이름을 직접 적지 않는다.
 *
 * 원래 계획은 next/font/google 로 Zalando Sans Expanded 를 불러오는 것이었지만,
 * 현재 사용 중인 Next.js 15.5의 next/font/google 데이터셋에는 이 폰트가 아직
 * 없어(구글 폰트에는 있으나 Next 번들 데이터가 그보다 오래됨) next/font/local 로
 * 파일을 직접 내려받아 self-host 했다 (app/fonts/*.woff2).
 * Pretendard는 애초에 Google Fonts가 아닌 오픈소스 배포 폰트라 처음부터 local이 맞다.
 *
 * ── 나중에 Helvetica Neue 같은 유료 웹폰트로 교체하는 경우 ──
 *
 * 1) next/font/google 에 있는 폰트로 바꾼다면 아래처럼 교체:
 *
 *      import { Helvetica_Neue } from "next/font/google";
 *      export const displayFont = Helvetica_Neue({
 *        variable: "--font-zalando-sans-expanded", // 변수 이름은 그대로 유지
 *        subsets: ["latin"],
 *      });
 *
 * 2) 라이선스 파일(.woff2)을 직접 받아 self-host 한다면 next/font/local을
 *    그대로 쓰거나, app/globals.css에 아래처럼 @font-face를 직접 선언해도 된다:
 *
 *      @font-face {
 *        font-family: "Helvetica Neue";
 *        src: url("/fonts/HelveticaNeue-Variable.woff2") format("woff2");
 *        font-weight: 100 900;
 *        font-style: normal;
 *        font-display: swap;
 *      }
 *      :root {
 *        --font-display: "Helvetica Neue", "Pretendard", sans-serif;
 *      }
 *
 * 어느 방식이든 이 파일과 globals.css의 :root 변수 두 개 외에는 아무 것도
 * 건드릴 필요가 없다.
 */
import localFont from "next/font/local";

export const zalandoSansExpanded = localFont({
  src: "./fonts/ZalandoSansExpanded-Variable.woff2",
  variable: "--font-zalando-sans-expanded",
  weight: "200 900",
  style: "normal",
  display: "swap",
});

export const pretendard = localFont({
  src: "./fonts/Pretendard-Variable.woff2",
  variable: "--font-pretendard",
  weight: "45 930",
  style: "normal",
  display: "swap",
});
