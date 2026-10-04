"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import transcript from "@/content/week-03-transcript.json";
import styles from "./InterviewPlayer.module.css";

type Speaker = "me" | "friend";

type Segment = {
  start: number;
  end: number;
  speaker: Speaker;
  text: string;
};

const SRC = "/audio/week-03-interview.m4a";
const SEGMENTS = transcript as Segment[];
const SEEK_STEP = 5;

/* start가 time 이하인 마지막 인덱스. 없으면 -1. */
function lastStartedIndex(indices: number[], time: number) {
  let lo = 0;
  let hi = indices.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (SEGMENTS[indices[mid]].start <= time) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found === -1 ? -1 : indices[found];
}

const ALL = SEGMENTS.map((_, i) => i);
const BY_SPEAKER: Record<Speaker, number[]> = {
  me: ALL.filter((i) => SEGMENTS[i].speaker === "me"),
  friend: ALL.filter((i) => SEGMENTS[i].speaker === "friend"),
};

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function InterviewPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(
    SEGMENTS[SEGMENTS.length - 1]?.end ?? 0,
  );
  const [playing, setPlaying] = useState(false);

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

  const seekFromPointer = (clientX: number) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    seek(ratio * duration);
  };

  const onBarKeyDown = (event: React.KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowLeft: time - SEEK_STEP,
      ArrowDown: time - SEEK_STEP,
      ArrowRight: time + SEEK_STEP,
      ArrowUp: time + SEEK_STEP,
      Home: 0,
      End: duration,
    };
    if (event.key in keys) {
      event.preventDefault();
      seek(keys[event.key]);
    }
  };

  const currentIndex = lastStartedIndex(ALL, time);
  const activeSpeaker = currentIndex === -1 ? null : SEGMENTS[currentIndex].speaker;
  const slots: Speaker[] = ["me", "friend"];
  const progress = duration > 0 ? (time / duration) * 100 : 0;

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

      <div className={styles.stage} aria-live="polite">
        {slots.map((speaker) => {
          const index = lastStartedIndex(BY_SPEAKER[speaker], time);
          const isActive = activeSpeaker === speaker;
          return (
            <p
              key={speaker}
              className={`${styles.line} ${styles[speaker]} ${
                isActive ? styles.active : ""
              }`}
            >
              {index !== -1 && (
                <span key={index} className={styles.text}>
                  {SEGMENTS[index].text}
                </span>
              )}
            </p>
          );
        })}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.playButton}
          onClick={togglePlay}
          aria-label={playing ? "일시정지" : "재생"}
        >
          {playing ? (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="3" y="2" width="3.5" height="12" />
              <rect x="9.5" y="2" width="3.5" height="12" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 2 L14 8 L4 14 Z" />
            </svg>
          )}
        </button>

        <div
          ref={barRef}
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
            seekFromPointer(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              seekFromPointer(e.clientX);
            }
          }}
          onKeyDown={onBarKeyDown}
        >
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.thumb} style={{ left: `${progress}%` }} />
        </div>

        <p className={styles.time}>
          {formatTime(time)} / {formatTime(duration)}
        </p>
      </div>

      <details className={styles.transcript}>
        <summary>전체 대본 보기</summary>
        <ol className={styles.transcriptList}>
          {SEGMENTS.map((segment, i) => (
            <li
              key={i}
              className={`${styles.transcriptItem} ${
                segment.speaker === "friend" ? styles.transcriptFriend : ""
              }`}
            >
              <button
                type="button"
                className={styles.timestamp}
                onClick={() => seek(segment.start)}
                aria-label={`${formatTime(segment.start)}부터 재생 위치 이동`}
              >
                {formatTime(segment.start)}
              </button>
              <span className={styles.srOnly}>
                {segment.speaker === "me" ? "나: " : "지인: "}
              </span>
              {segment.text}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
