import styles from "./SunHead.module.css";

/**
 * 이름 위에 떠 있는 해. 원반 가운데가 어릴 적 얼굴이다.
 *
 * 빛살(.rays)은 repeating-conic-gradient를 radial mask로 잘라 만든다.
 * 얼굴 둘레에서만 시작해 바깥으로 흩어지게 하려면 mask의 안쪽 정지점이
 * 얼굴 반지름보다 커야 한다.
 *
 * .rays는 inset -85%라서 실제로 차지하는 폭이 원반의 약 2.7배다.
 * 부모에 overflow: hidden을 걸면 빛살이 잘리니 주의.
 *
 * 얼굴 이미지는 public/sun/face.png. 정사각형이고 가장자리가 알파로
 * 흐려져 있어서 빛에 스민 것처럼 보인다. 사진을 바꾸려면 같은 규격으로
 * 덮어쓰면 된다.
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
