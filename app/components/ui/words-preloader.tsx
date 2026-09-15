"use client";

import { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import "./words-preloader.css";

// Independent implementation. Visual references: Skiper UI / Dennis Snellenberg.
const greetings = ["Hello", "bonjour", "Ciao", "Olá", "やあ", "Hallå", "Guten Tag", "你好"];
export type WordsPreloaderProps = Omit<ComponentProps<"div">, "onAnimationEnd"> & {
  words?: string[];
  ready?: boolean;
  replayKey?: string | number;
  fullscreen?: boolean;
  theme?: "light" | "dark";
  firstDuration?: number;
  wordDuration?: number;
  lastDuration?: number;
  exitDuration?: number;
  curveHeight?: number;
  loadingLabel?: string;
  onComplete?: () => void;
};

export function WordsPreloader({ replayKey, ...props }: WordsPreloaderProps) {
  return <WordsPreloaderRun key={replayKey} {...props} />;
}
function WordsPreloaderRun({ words = greetings, ready = true, fullscreen = false, theme = "dark", firstDuration = 800, wordDuration = 150, lastDuration = 300, exitDuration = 800, curveHeight = 300, loadingLabel = "Loading", onComplete, children, className, ...props }: WordsPreloaderProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [sequenceDone, setSequenceDone] = useState(false);
  const [finished, setFinished] = useState(false);
  const exiting = sequenceDone && ready;
  const complete = useRef(onComplete);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { complete.current = onComplete; }, [onComplete]);
  useEffect(() => {
    if (sequenceDone) return;
    const last = index >= words.length - 1;
    const delay = reduced || !words.length ? 0 : index === 0 ? firstDuration : last ? lastDuration : wordDuration;
    const timer = setTimeout(() => {
      if (last || reduced) setSequenceDone(true);
      else setIndex((value) => value + 1);
    }, Math.max(0, delay));
    return () => clearTimeout(timer);
  }, [index, words.length, firstDuration, wordDuration, lastDuration, reduced, sequenceDone]);
  const finish = () => {
    if (!exiting || finished) return;
    if (!fullscreen && root.current?.contains(document.activeElement)) root.current.focus({ preventScroll: true });
    setFinished(true);
    complete.current?.();
  };
  const curtain = <Curtain words={words} index={index} exiting={exiting} reduced={Boolean(reduced)} theme={theme} fullscreen={fullscreen} exitDuration={exitDuration} curveHeight={curveHeight} loadingLabel={loadingLabel} onFinish={finish} />;
  return <div {...props} ref={root} tabIndex={-1} data-slot="words-preloader" data-theme={theme} data-state={finished ? "complete" : exiting ? "exiting" : "loading"} className={cn("jui-words-preloader", className)} aria-busy={!finished}>
    <div className="jui-words-preloader-page" inert={!finished}>{children}</div>
    {!finished && (fullscreen ? <Dialog.Root open>
      <Dialog.Portal><Dialog.Overlay className="jui-words-preloader-modal">
        <Dialog.Content asChild aria-describedby={undefined} onEscapeKeyDown={(event) => event.preventDefault()} onInteractOutside={(event) => event.preventDefault()} onCloseAutoFocus={(event) => { event.preventDefault(); root.current?.focus({ preventScroll: true }); }}>
          <div className="jui-words-preloader-modal-content"><Dialog.Title className="jui-words-preloader-sr">{loadingLabel}</Dialog.Title>{curtain}</div>
        </Dialog.Content>
      </Dialog.Overlay></Dialog.Portal>
    </Dialog.Root> : curtain)}
  </div>;
}

type CurtainProps = {
  words: string[]; index: number; exiting: boolean; reduced: boolean; theme: string; fullscreen: boolean;
  exitDuration: number; curveHeight: number; loadingLabel: string;
  onFinish: () => void;
};
function Curtain({ words, index, exiting, reduced, theme, fullscreen, exitDuration, curveHeight, loadingLabel, onFinish }: CurtainProps) {
  const element = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1000, height: 600 });
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const curve = Math.max(0, curveHeight);
  const { width, height } = size;
  const path = (bend: number) => `M0 0 H${width} V${height} Q${width / 2} ${height + bend} 0 ${height} Z`;
  const duration = reduced ? 0.12 : Math.max(0, exitDuration) / 1000;
  return <motion.div ref={element} data-slot="words-preloader-curtain" data-theme={theme} data-fullscreen={fullscreen} className="jui-words-preloader-curtain" initial={false} animate={exiting ? reduced ? { opacity: 0, y: 0 } : { y: "-100%", opacity: 1 } : { y: 0, opacity: 1 }} transition={{ duration, ease: [0.76, 0, 0.24, 1] }} onAnimationComplete={onFinish} style={{ "--wp-curve": `${curve}px` } as CSSProperties}>
    <svg className="jui-words-preloader-shape" viewBox={`0 0 ${width} ${height + curve}`} preserveAspectRatio="none" aria-hidden="true">
      <motion.path initial={false} d={path(curve)} animate={{ d: path(exiting ? 0 : curve) }} transition={{ duration, ease: [0.76, 0, 0.24, 1] }} />
    </svg>
    <motion.span className="jui-words-preloader-word" aria-hidden="true" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: exiting ? 0 : 1 }} transition={{ duration: reduced ? 0 : exiting ? 0.15 : 0.6 }}>{words[Math.min(index, words.length - 1)] ?? loadingLabel}</motion.span>
    <span className="jui-words-preloader-sr" role="status">{loadingLabel}</span>
  </motion.div>;
}
