import styles from "./SunHead.module.css";

/**
 * 이름 위에 떠 있는 해. 원반 가운데가 어릴 적 얼굴이다.
 *
 * 광선은 repeating-conic-gradient를 radial mask로 잘라 만든다. 길고 짧은
 * 두 겹을 각도를 어긋나게 겹쳐야 길이가 들쭉날쭉해 보인다 — 한 겹만 쓰면
 * 바퀴살처럼 규칙적이라 빛으로 읽히지 않는다.
 *
 * .rays는 inset -140%라서 실제 차지하는 폭이 원반의 약 3.8배다.
 * 부모에 overflow: hidden을 걸면 광선이 잘리니 주의.
 *
 * 얼굴 이미지(public/sun/face.png)는 배경을 지우고 가장자리를 빛의 색으로
 * 녹여둔 것이다. .core의 밝은 원반 위에 얹혀 경계 없이 이어진다. 사진을
 * 바꾸려면 같은 방식으로 배경을 없앤 정사각형 PNG를 덮어쓰면 된다.
 */
export function SunHead() {
  return (
    <div className={styles.sun} aria-hidden="true">
      <div className={styles.rays} />
      <div className={styles.rays2} />
      <div className={styles.core} />
      <img className={styles.face} src="/sun/face.png" alt="" />
    </div>
  );
}
