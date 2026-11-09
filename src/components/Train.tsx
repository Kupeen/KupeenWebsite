// The train on the front page. It waits at the platform; the whistle sends it off to the left, round and round,
// and »Stop toget« brakes it so it stops exactly at the platform again.

import { useCallback, useEffect, useRef, useState } from "react";
import { CARRIAGE_COLOURS } from "../content/site";

const PLATFORM_X = 24;
const ACCELERATION = 160; // px/s²
const TOP_SPEED = 650; // px/s
const HARDEST_BRAKING = 260; // px/s²; harder than this, and the train takes another lap first

/** Moves the train frame by frame, so it can speed up from the platform and brake to a stop there. */
export function useTrain() {
  const element = useRef<HTMLDivElement | null>(null);
  const motion = useRef({ x: PLATFORM_X, speed: 0, braking: false, brakeLeft: 0, brakeRate: 0, frame: 0, lastTime: null as number | null });
  const [running, setRunning] = useState(false);
  const [moving, setMoving] = useState(false);
  const audio = useRef<AudioContext | null>(null);

  const move = useCallback((time: number) => {
    const train = element.current;
    const m = motion.current;
    if (!train?.parentElement) {
      m.frame = 0;
      return;
    }
    const seconds = m.lastTime === null ? 0 : Math.min(0.05, (time - m.lastTime) / 1000);
    m.lastTime = time;
    m.speed = m.braking ? Math.max(0, m.speed - m.brakeRate * seconds) : Math.min(TOP_SPEED, m.speed + ACCELERATION * seconds);
    const step = m.speed * seconds;
    m.x -= step;
    // Out on the left, back in from the right.
    if (m.x < -train.offsetWidth) m.x += train.offsetWidth + train.parentElement.clientWidth;

    if (m.braking) {
      m.brakeLeft -= step;
      if (m.brakeLeft <= 0.5 || m.speed <= 0) {
        Object.assign(m, { x: PLATFORM_X, speed: 0, braking: false, frame: 0 });
        train.style.transform = `translateX(${PLATFORM_X}px)`;
        setMoving(false);
        return;
      }
    }
    train.style.transform = `translateX(${m.x}px)`;
    m.frame = requestAnimationFrame(move);
  }, []);

  const start = useCallback(() => {
    const m = motion.current;
    m.braking = false;
    if (m.frame) return;
    m.lastTime = null;
    m.frame = requestAnimationFrame(move);
  }, [move]);

  const stop = useCallback(() => {
    const train = element.current;
    const m = motion.current;
    if (!train?.parentElement || !m.frame) return;
    const lap = train.offsetWidth + train.parentElement.clientWidth;
    // The distance to the platform in the direction of travel, plus whole laps if the brakes would be too hard.
    let distance = m.x >= PLATFORM_X ? m.x - PLATFORM_X : m.x + lap - PLATFORM_X;
    while ((m.speed * m.speed) / (2 * Math.max(distance, 1)) > HARDEST_BRAKING) distance += lap;
    m.braking = true;
    m.brakeLeft = distance;
    m.brakeRate = (m.speed * m.speed) / (2 * Math.max(distance, 1));
  }, []);

  const toggle = useCallback(() => {
    if (running) {
      stop();
      setRunning(false);
    } else {
      audio.current = playWhistle(audio.current);
      start();
      setRunning(true);
      setMoving(true);
    }
  }, [running, start, stop]);

  useEffect(
    () => () => {
      cancelAnimationFrame(motion.current.frame);
      void audio.current?.close();
    },
    [],
  );

  const ref = useCallback((node: HTMLDivElement | null) => {
    element.current = node;
    if (node) node.style.transform = `translateX(${motion.current.x}px)`;
  }, []);

  return { ref, running, moving, toggle };
}

/** A steam whistle from the Web Audio API: three detuned tones that rise into a chord and fade. */
function playWhistle(existing: AudioContext | null): AudioContext | null {
  try {
    const ctx = existing ?? new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    const volume = ctx.createGain();
    volume.gain.setValueAtTime(0.0001, t);
    volume.gain.exponentialRampToValueAtTime(0.18, t + 0.08);
    volume.gain.setValueAtTime(0.18, t + 1.1);
    volume.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    volume.connect(ctx.destination);
    for (const frequency of [622, 784, 932]) {
      const tone = ctx.createOscillator();
      tone.type = "triangle";
      tone.frequency.setValueAtTime(frequency * 0.94, t);
      tone.frequency.linearRampToValueAtTime(frequency, t + 0.18);
      const wobble = ctx.createOscillator();
      const wobbleDepth = ctx.createGain();
      wobble.frequency.value = 6;
      wobbleDepth.gain.value = frequency * 0.008;
      wobble.connect(wobbleDepth);
      wobbleDepth.connect(tone.frequency);
      tone.connect(volume);
      tone.start(t);
      wobble.start(t);
      tone.stop(t + 1.65);
      wobble.stop(t + 1.65);
    }
    return ctx;
  } catch {
    // No sound is fine; the train still leaves.
    return existing;
  }
}

/** The locomotive and the carriages that spell KUPÉEN, on their track. */
export function Train({ trainRef, moving }: { trainRef: (node: HTMLDivElement | null) => void; moving: boolean }) {
  return (
    <div className="track" aria-hidden="true">
      <div ref={trainRef} className={moving ? "train running" : "train"}>
        <div className="car engine" style={{ background: "var(--tomato)" }}>
          <div className="puff" />
          <div className="puff" style={{ animationDelay: "0.5s", left: 42 }} />
          <div className="puff" style={{ animationDelay: "1s", left: 28 }} />
          <div className="chimney" />
          <div className="lamp" />
          <div className="window wide">9520</div>
          <div className="wheel" style={{ left: 30 }} />
          <div className="wheel" style={{ right: 18 }} />
        </div>
        {Array.from("KUPÉEN").map((letter, i) => (
          <div key={i} className="car" style={{ background: CARRIAGE_COLOURS[i] }}>
            <div className="window">{letter}</div>
            <div className="window" />
            <div className="wheel" style={{ left: 14 }} />
            <div className="wheel" style={{ right: 14 }} />
          </div>
        ))}
      </div>
      <div className="track-bed" />
      <div className="track-rail" />
    </div>
  );
}
