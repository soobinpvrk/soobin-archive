import styles from "./SunHead.module.css";

/**
 * 이름 위에 떠 있는 해. 원반 가운데가 어릴 적 얼굴이다.
 *
 * 광선은 repeating-conic-gradient를 radial mask로 잘라 만든다.
 * mask의 안쪽 정지점이 얼굴 반지름보다 커야 광선이 얼굴을 덮지 않는다.
 *
 * .rays는 inset -85%라서 실제 차지하는 폭이 원반의 약 2.7배다.
 * 부모에 overflow: hidden을 걸면 광선이 잘리니 주의.
 *
 * 얼굴 이미지(public/sun/face.png)는 실내 배경과 옷깃을 잘라내고 그 자리를
 * 흰빛으로 메운 것이다. 투명하게 뚫으면 검은 배경이 비쳐 도려낸 것처럼
 * 보이므로, 빛과 같은 색으로 채워 .glow에 그대로 이어지게 했다.
 * 사진을 바꾸려면 같은 방식으로 만든 정사각형 PNG를 덮어쓰면 된다.
 */
export function SunHead() {
  return (
    <div className={styles.sun} aria-hidden="true">
      <div className={styles.rays} />
      <div className={styles.glow} />
      <img className={styles.face} src="/sun/face.png" alt="" />
    </div>
  );
}
