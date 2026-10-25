"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Magazine } from "@/data/magazine";
import { magazinePageSrc } from "@/data/magazine";
import type { MagazineScene, ViewerState } from "@/lib/magazineScene";
import styles from "./MagazineViewer.module.css";

const BACKGROUND = 0xe6e6e6;

type Props = { magazine: Magazine };

/* 지금 화면에 보이는 쪽 번호들 */
function visiblePages(state: ViewerState, pageCount: number): number[] {
  const sheets = Math.ceil(pageCount / 2);
  const f = state.flipped;
  if (state.single) {
    if (f <= 0) return [1];
    if (f >= sheets) return [pageCount];
    return [state.focus === "right" ? 2 * f + 1 : 2 * f];
  }
  if (f <= 0) return [1];
  if (f >= sheets) return [pageCount];
  return [2 * f, 2 * f + 1];
}

function pageLabel(pages: number[]) {
  return pages.length > 1 ? `${pages[0]}–${pages[1]}` : String(pages[0]);
}

export function MagazineViewer({ magazine }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<MagazineScene | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);
  const tocButtonRef = useRef<HTMLButtonElement>(null);

  const [state, setState] = useState<ViewerState>({
    phase: "intro",
    flipped: 0,
    focus: "right",
    single: false,
    ready: false,
  });
  const [noGl, setNoGl] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [scrub, setScrub] = useState<number | null>(null);
  const [hover, setHover] = useState<"next" | "prev" | null>(null);

  const P = magazine.pageCount;

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    let disposed = false;
    let scene: MagazineScene | null = null;
    let observer: ResizeObserver | null = null;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("@/lib/magazineScene")
      .then(({ MagazineScene }) => {
        if (disposed) return;
        try {
          scene = new MagazineScene({
            canvas,
            pageCount: magazine.pageCount,
            pageAspect: magazine.pageHeight / magazine.pageWidth,
            pageSrc: (p) => magazinePageSrc(magazine, p),
            background: BACKGROUND,
            reducedMotion: reduced,
            onState: (s) => setState(s),
          });
        } catch {
          setNoGl(true);
          return;
        }
        sceneRef.current = scene;
        observer = new ResizeObserver(() => scene?.layout());
        observer.observe(stage);
      })
      .catch(() => setNoGl(true));

    return () => {
      disposed = true;
      observer?.disconnect();
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [magazine]);

  const next = useCallback(() => sceneRef.current?.next(), []);
  const prev = useCallback(() => sceneRef.current?.prev(), []);
  const goTo = useCallback((p: number) => sceneRef.current?.goToPage(p), []);

  // 키보드
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("input, textarea, [role='slider']")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(1);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(P);
      } else if (e.key === "Escape") {
        setTocOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, P]);

  // 목차 바깥 클릭 시 닫기
  useEffect(() => {
    if (!tocOpen) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (tocRef.current?.contains(t) || tocButtonRef.current?.contains(t)) return;
      setTocOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [tocOpen]);

  /* ---------- 캔버스 포인터 ---------- */
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    sceneRef.current?.pointerDown(e.nativeEvent);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    sceneRef.current?.pointerMove(e.nativeEvent);
    if (e.pointerType === "mouse" && !e.buttons) {
      setHover(sceneRef.current?.hoverSide(e.clientX, e.clientY) ?? null);
    }
  };
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    sceneRef.current?.pointerUp(e.nativeEvent);
  };

  /* ---------- 진행 막대 ---------- */
  const pages = visiblePages(state, P);
  const current = pages[0];
  const shownPage = scrub ?? current;
  const progress = (shownPage - 1) / (P - 1);

  const pageFromTrack = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return current;
    const r = el.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return Math.round(k * (P - 1)) + 1;
  };
  const onTrackDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrub(pageFromTrack(e.clientX));
  };
  const onTrackMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scrub === null) return;
    setScrub(pageFromTrack(e.clientX));
  };
  const onTrackUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scrub === null) return;
    const p = pageFromTrack(e.clientX);
    setScrub(null);
    goTo(p);
  };
  const onTrackKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      prev();
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(1);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(P);
    }
  };

  const atStart = state.phase === "reading" && pages[0] <= 1;
  const atEnd = pages[pages.length - 1] >= P;
  const activeChapter = magazine.chapters.reduce(
    (acc, c, i) => (c.page <= pages[pages.length - 1] ? i : acc),
    0,
  );
  const label = scrub !== null ? String(scrub) : pageLabel(pages);

  if (noGl) {
    return (
      <div className={styles.fallback}>
        <p className={styles.fallbackNote}>
          이 브라우저에서는 3D 보기를 쓸 수 없어 페이지를 차례로 보여 드려요.
        </p>
        {Array.from({ length: P }, (_, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={magazinePageSrc(magazine, i + 1)}
            alt={`${i + 1}쪽`}
            loading="lazy"
            className={styles.fallbackPage}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.viewer}>
      <div
        ref={stageRef}
        className={`${styles.stage} ${hover ? styles.pointer : ""} ${
          state.phase === "intro" ? styles.grab : ""
        }`}
      >
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={() => setHover(null)}
          aria-label={`${magazine.title} 매거진. ${label}쪽`}
          role="img"
        />

        {!state.ready && <p className={styles.loading}>종이를 펼치는 중</p>}

        <div className={`${styles.intro} ${state.phase === "intro" ? styles.introShown : ""}`}>
          <p className={styles.introTitle}>{magazine.title}</p>
          <p className={styles.introSubtitle}>{magazine.subtitle}</p>
          <button
            type="button"
            className={styles.openButton}
            onClick={() => sceneRef.current?.open()}
            tabIndex={state.phase === "intro" ? 0 : -1}
          >
            펼쳐 보기
          </button>
          <p className={styles.introHint}>끌어서 이리저리 돌려 볼 수 있어요</p>
        </div>

        {tocOpen && (
          <div ref={tocRef} className={styles.toc} role="dialog" aria-label="목차">
            <p className={styles.tocHeading}>CONTENTS</p>
            <ol className={styles.tocList}>
              {magazine.chapters.map((c, i) => (
                <li key={c.page}>
                  <button
                    type="button"
                    className={`${styles.tocItem} ${i === activeChapter ? styles.tocCurrent : ""}`}
                    onClick={() => {
                      setTocOpen(false);
                      goTo(c.page);
                    }}
                  >
                    <span className={styles.tocNumber}>{c.number}</span>
                    <span className={styles.tocTitle}>{c.title}</span>
                    <span className={styles.tocPage}>{c.page}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className={styles.bar}>
        <div
          ref={trackRef}
          className={styles.track}
          role="slider"
          tabIndex={0}
          aria-label="쪽 이동"
          aria-valuemin={1}
          aria-valuemax={P}
          aria-valuenow={shownPage}
          aria-valuetext={`${label}쪽`}
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onPointerUp={onTrackUp}
          onPointerCancel={() => setScrub(null)}
          onKeyDown={onTrackKey}
        >
          <span className={styles.rail} aria-hidden="true">
            {magazine.chapters
              .filter((c) => c.number)
              .map((c) => (
                <span
                  key={c.page}
                  className={styles.tick}
                  style={{ left: `${((c.page - 1) / (P - 1)) * 100}%` }}
                />
              ))}
            <span className={styles.fill} style={{ width: `${progress * 100}%` }} />
            <span className={styles.knob} style={{ left: `${progress * 100}%` }} />
          </span>
        </div>

        <div className={styles.controls}>
          <div className={styles.controlsLeft}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={prev}
              disabled={state.phase === "intro" || atStart}
              aria-label="이전 쪽"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <span className={styles.count}>
              <b>{label}</b>
              <span className={styles.countTotal}> / {P}</span>
            </span>
            <button
              type="button"
              className={styles.iconButton}
              onClick={next}
              disabled={atEnd && state.phase === "reading"}
              aria-label="다음 쪽"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className={styles.controlsRight}>
            <button
              ref={tocButtonRef}
              type="button"
              className={styles.textButton}
              aria-expanded={tocOpen}
              onClick={() => setTocOpen((v) => !v)}
            >
              목차
            </button>
            {state.phase === "reading" ? (
              <button
                type="button"
                className={styles.textButton}
                onClick={() => sceneRef.current?.showObject()}
              >
                둘러보기
              </button>
            ) : (
              <button
                type="button"
                className={styles.textButton}
                onClick={() => sceneRef.current?.open()}
              >
                읽기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
