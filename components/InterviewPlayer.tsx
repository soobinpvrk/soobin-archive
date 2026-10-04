"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import transcript from "@/content/week-03-transcript.json";
import styles from "./InterviewPlayer.module.css";

type Speaker = "me" | "friend";

type Segment = {
  start: number;
  end: number;
  speaker: Speaker;
  text: string;
  /* 질문 묶음 번호. 0은 첫 질문 이전의 인사. */
  question: number;
  /* question: 묶음을 여는 질문 줄, talk: 그 밖의 대화. */
  kind: "question" | "talk";
};

const SRC = "/audio/week-03-interview.m4a";
const SEGMENTS = transcript as Segment[];
const SEEK_STEP = 5;
/* 말이 끝난 뒤 흰색으로 남아 있는 시간. */
const HOLD = 1.5;
/* 재생 중 오버레이 버튼을 다시 보여주는 시간. */
const POKE_MS = 2000;
/* 이전 버튼: 질문 시작 후 이만큼 지났으면 현재 질문 처음으로. */
const RESTART_THRESHOLD = 3;
const DRAG_THRESHOLD = 4;

const QUESTION_STARTS = (() => {
  const starts = [0];
  for (const s of SEGMENTS) {
    if (s.question > 0 && starts.length === s.question) starts.push(s.start);
  }
  return starts;
})();

const QUESTION_LINES = SEGMENTS.filter((s) => s.kind === "question");
const TALK_BY_SPEAKER: Record<Speaker, Segment[]> = {
  me: SEGMENTS.filter((s) => s.kind === "talk" && s.speaker === "me"),
  friend: SEGMENTS.filter((s) => s.kind === "talk" && s.speaker === "friend"),
};

/* start가 time 이하인 마지막 인덱스. 없으면 -1. */
function lastStarted(list: { start: number }[], time: number) {
  let lo = 0;
  let hi = list.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid].start <= time) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}

function questionAt(time: number) {
  let index = 0;
  while (
    index + 1 < QUESTION_STARTS.length &&
    QUESTION_STARTS[index + 1] <= time
  ) {
    index += 1;
  }
  return index;
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

type FillStyle = CSSProperties & { "--fill": string };

export function InterviewPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pointerTypeRef = useRef("mouse");
  const pokeTimerRef = useRef<number | undefined>(undefined);
  const dragRef = useRef<{ x: number; dragging: boolean } | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(
    SEGMENTS[SEGMENTS.length - 1]?.end ?? 0,
  );
  const [playing, setPlaying] = useState(false);
  const [poked, setPoked] = useState(false);

  // hydration 전에 메타데이터가 이미 로드됐으면 loadedmetadata를 놓친다.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) setDuration(audio.duration);
  }, []);

  // 재생 중에는 프레임마다 currentTime을 읽어 자막을 맞춘다.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      if (audioRef.current) setTime(audioRef.current.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => () => window.clearTimeout(pokeTimerRef.current), []);

  const seek = useCallback(
    (to: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const clamped = Math.min(Math.max(to, 0), duration);
      audio.currentTime = clamped;
      setTime(clamped);
    },
    [duration],
  );

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const poke = () => {
    setPoked(true);
    window.clearTimeout(pokeTimerRef.current);
    pokeTimerRef.current = window.setTimeout(() => setPoked(false), POKE_MS);
  };

  const overlayVisible = !playing || poked;

  const onStageClick = () => {
    // 터치로 재생 중일 때 첫 탭은 버튼만 다시 보여준다.
    if (pointerTypeRef.current === "touch" && playing && !poked) {
      poke();
      return;
    }
    togglePlay();
  };

  const onStageKeyDown = (event: React.KeyboardEvent) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === " ") {
      event.preventDefault();
      togglePlay();
    }
  };

  /* 진행 바의 x 좌표를 시간으로. 칸 사이 간격은 다음 칸의 시작으로 본다. */
  const timeFromX = (clientX: number) => {
    for (let i = 0; i < QUESTION_STARTS.length; i += 1) {
      const el = segmentRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const start = QUESTION_STARTS[i];
      const end = QUESTION_STARTS[i + 1] ?? duration;
      if (clientX < rect.left) return start;
      if (clientX <= rect.right) {
        return start + ((clientX - rect.left) / rect.width) * (end - start);
      }
    }
    return duration;
  };

  const questionFromX = (clientX: number) => {
    let index = 0;
    segmentRefs.current.forEach((el, i) => {
      if (el && clientX >= el.getBoundingClientRect().left) index = i;
    });
    return index;
  };

  const current = questionAt(time);
  const isLastQuestion = current === QUESTION_STARTS.length - 1;

  const goPrevious = () => {
    if (time - QUESTION_STARTS[current] > RESTART_THRESHOLD) {
      seek(QUESTION_STARTS[current]);
    } else {
      seek(QUESTION_STARTS[Math.max(current - 1, 0)]);
    }
  };

  const goNext = () => {
    if (!isLastQuestion) seek(QUESTION_STARTS[current + 1]);
  };

  const onBarKeyDown = (event: React.KeyboardEvent) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => seek(time - SEEK_STEP),
      ArrowDown: () => seek(time - SEEK_STEP),
      ArrowRight: () => seek(time + SEEK_STEP),
      ArrowUp: () => seek(time + SEEK_STEP),
      PageUp: goPrevious,
      PageDown: goNext,
      Home: () => seek(0),
      End: () => seek(duration),
    };
    if (event.key in actions) {
      event.preventDefault();
      actions[event.key]();
    }
  };

  const questionText = QUESTION_LINES.filter(
    (s) => s.question === current && s.start <= time,
  )
    .map((s) => s.text)
    .join(" ");

  const slots: Speaker[] = ["me", "friend"];

  return (
    <section className={styles.player} aria-label="지인 인터뷰 음성">
      <audio
        ref={audioRef}
        src={SRC}
        preload="metadata"
        onLoadedMetadata={(e) => {
          if (Number.isFinite(e.currentTarget.duration)) {
            setDuration(e.currentTarget.duration);
          }
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onSeeked={(e) => setTime(e.currentTarget.currentTime)}
        onTimeUpdate={(e) => {
          if (e.currentTarget.paused) setTime(e.currentTarget.currentTime);
        }}
      />

      <div
        className={styles.frame}
        tabIndex={0}
        aria-label="인터뷰 무대. 스페이스바로 재생·일시정지"
        onPointerDown={(e) => {
          pointerTypeRef.current = e.pointerType;
        }}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse" && playing) poke();
        }}
        onClick={onStageClick}
        onKeyDown={onStageKeyDown}
      >
        <div className={styles.stage} aria-live="polite">
          <p className={styles.question}>{questionText}</p>

          <div className={styles.dialogue}>
            {slots.map((speaker) => {
              const list = TALK_BY_SPEAKER[speaker];
              const index = lastStarted(list, time);
              const segment = index === -1 ? null : list[index];
              const visible = segment !== null && time < segment.end + HOLD;
              const progress = segment
                ? Math.min(
                    Math.max(
                      (time - segment.start) / (segment.end - segment.start),
                      0,
                    ),
                    1,
                  )
                : 0;
              const fillStyle: FillStyle = {
                "--fill": `calc(${progress * 100}% + ${progress * 1.5}em)`,
              };

              return (
                <p
                  key={speaker}
                  className={`${styles.line} ${styles[speaker]}`}
                  aria-hidden={!visible}
                >
                  {segment && (
                    <span
                      key={index}
                      className={`${styles.utterance} ${
                        visible ? "" : styles.gone
                      }`}
                    >
                      <span className={styles.fill} style={fillStyle}>
                        {segment.text}
                      </span>
                    </span>
                  )}
                </p>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.overlayButton} ${
            overlayVisible ? "" : styles.overlayHidden
          }`}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label={playing ? "일시정지" : "재생"}
        >
          {playing ? (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="3" y="2" width="3.5" height="12" />
              <rect x="9.5" y="2" width="3.5" height="12" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4.5 2 L14 8 L4.5 14 Z" />
            </svg>
          )}
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.skipButtons}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={goPrevious}
            aria-label="이전 질문"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="2.5" y="3" width="2" height="10" />
              <path d="M13.5 3 L5.5 8 L13.5 13 Z" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={goNext}
            disabled={isLastQuestion}
            aria-label="다음 질문"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2.5 3 L10.5 8 L2.5 13 Z" />
              <rect x="11.5" y="3" width="2" height="10" />
            </svg>
          </button>
        </div>

        <div
          className={styles.bar}
          role="slider"
          tabIndex={0}
          aria-label="재생 위치"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${formatTime(time)} / ${formatTime(duration)}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragRef.current = { x: e.clientX, dragging: false };
          }}
          onPointerMove={(e) => {
            const drag = dragRef.current;
            if (!drag) return;
            if (!drag.dragging && Math.abs(e.clientX - drag.x) < DRAG_THRESHOLD) {
              return;
            }
            drag.dragging = true;
            seek(timeFromX(e.clientX));
          }}
          onPointerUp={(e) => {
            const drag = dragRef.current;
            dragRef.current = null;
            if (drag && !drag.dragging) {
              seek(QUESTION_STARTS[questionFromX(e.clientX)]);
            }
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          onKeyDown={onBarKeyDown}
        >
          {QUESTION_STARTS.map((start, i) => {
            const end = QUESTION_STARTS[i + 1] ?? duration;
            const ratio = Math.min(Math.max((time - start) / (end - start), 0), 1);
            return (
              <div
                key={start}
                ref={(el) => {
                  segmentRefs.current[i] = el;
                }}
                className={styles.segment}
                style={{ flexGrow: Math.max(end - start, 0) }}
              >
                <div className={styles.track}>
                  <div
                    className={styles.played}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
                {i === current && (
                  <div
                    className={styles.thumb}
                    style={{ left: `${ratio * 100}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <p className={styles.time}>
          {formatTime(time)} / {formatTime(duration)}
        </p>
      </div>

      <section className={styles.srOnly} aria-label="전체 대본">
        <ol>
          {SEGMENTS.map((segment, i) => (
            <li key={i}>
              {formatTime(segment.start)}{" "}
              {segment.speaker === "me" ? "나" : "지인"}: {segment.text}
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
