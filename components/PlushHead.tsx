import styles from "./PlushHead.module.css";

const FACES = ["front", "back", "right", "left", "top", "bottom"] as const;

/**
 * 어린 시절 사진 네 장을 네 면에 넣은 봉제 인형 큐브.
 * 한 바퀴 구르는 동안 앞 → 왼 → 뒤 → 오른 순으로 시절이 지나간다.
 *
 * 텍스처는 public/plush/{front,left,back,right}.jpg. 사진을 갈아 끼우려면
 * 같은 이름으로 정사각형 이미지를 덮어쓰면 된다. 위아래 면은 원단 색 단색.
 *
 * CSS 3D를 쓸 때 두 가지를 반드시 지킬 것:
 *  - .core는 scale()이 아니라 scale3d(). scale()은 Z축을 줄이지 않아서
 *    안쪽 큐브의 앞면이 바깥 앞면과 같은 깊이에 놓이고, 얼굴을 덮어버린다.
 *  - .cube에 filter를 걸지 말 것. filter는 preserve-3d를 평탄화시켜
 *    3D 배치를 통째로 무너뜨린다. 그림자는 별도 엘리먼트로 그린다.
 */
export function PlushHead() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.roller}>
        <div className={styles.cube}>
          <div className={styles.shell}>
            {FACES.map((face) => (
              <div key={face} className={`${styles.face} ${styles[face]}`} />
            ))}
          </div>
          <div className={styles.core}>
            {FACES.map((face) => (
              <div key={face} className={`${styles.face} ${styles[face]}`} />
            ))}
          </div>
        </div>
      </div>
      <div className={styles.drop} />
    </div>
  );
}
