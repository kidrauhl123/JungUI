"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react";
import confetti from "canvas-confetti";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import "./all-set.css";

export const allSetFonts = [
  {
    id: "sans",
    label: "黑体",
    family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  {
    id: "serif",
    label: "衬线",
    family: 'Georgia, "Times New Roman", "Songti SC", serif',
  },
  {
    id: "mono",
    label: "等宽",
    family: '"Courier New", Courier, monospace',
  },
  {
    id: "script",
    label: "手写",
    family: '"Segoe Script", "Brush Script MT", "Comic Sans MS", KaiTi, STKaiti, cursive',
  },
] as const;

export type AllSetFont = (typeof allSetFonts)[number]["id"];
export type AllSetMotion = "wipe" | "handwriting";

export type AllSetProps = Omit<ComponentProps<"section">, "title"> & {
  title?: string;
  actionLabel?: string;
  font?: AllSetFont;
  motion?: AllSetMotion;
  replayKey?: string | number;
  onAction?: () => void;
};

const palette = ["#1ed760", "#1db954", "#191414", "#b3b3b3", "#ffffff", "#535353"];

export function AllSet({
  title = "You're all set",
  actionLabel = "Open JungUI",
  font = "sans",
  motion = "wipe",
  replayKey,
  onAction,
  className,
  ...props
}: AllSetProps) {
  return (
    <AllSetRun
      key={replayKey}
      title={title}
      actionLabel={actionLabel}
      font={font}
      motion={motion}
      onAction={onAction}
      className={className}
      {...props}
    />
  );
}

function AllSetRun({
  title = "You're all set",
  actionLabel = "Open JungUI",
  font = "sans",
  motion = "wipe",
  onAction,
  className,
  style,
  ...props
}: AllSetProps) {
  const reduced = useReducedMotion();
  const stage = useRef<HTMLElement>(null);
  const burst = useRef<ReturnType<typeof confetti.create> | null>(null);
  const timers = useRef<number[]>([]);
  const [ready, setReady] = useState(false);
  const letters = [...title];
  const cjk = /[^\u0000-\u00ff]/.test(title);
  const family = allSetFonts.find((item) => item.id === font)?.family ?? allSetFonts[0].family;
  const step = cjk ? 340 : 200;
  const draw = cjk ? 1100 : 820;
  const reveal = motion === "wipe" ? 1500 : Math.max(0, letters.length - 1) * step + draw;
  const viewWidth = Math.ceil(letters.length * (cjk ? 118 : 58) + 48);

  useEffect(() => {
    const canvas = stage.current?.querySelector("canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const fit = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas.parentElement!);
    const shoot = confetti.create(canvas, { resize: false, useWorker: false });
    burst.current = shoot;
    const clear = () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
      shoot.reset();
    };
    if (reduced) {
      return () => {
        clear();
        observer.disconnect();
      };
    }
    const fire = (options: confetti.Options) => {
      void shoot({
        colors: palette,
        disableForReducedMotion: true,
        ...options,
      });
    };
    const cheer = () => {
      fire({
        particleCount: 90,
        spread: 70,
        startVelocity: 48,
        origin: { x: 0.5, y: 0.62 },
        scalar: 0.9,
      });
      fire({
        particleCount: 36,
        angle: 60,
        spread: 55,
        startVelocity: 55,
        origin: { x: 0, y: 0.55 },
      });
      fire({
        particleCount: 36,
        angle: 120,
        spread: 55,
        startVelocity: 55,
        origin: { x: 1, y: 0.55 },
      });
    };
    cheer();
    timers.current.push(window.setTimeout(cheer, 280));
    return () => {
      clear();
      observer.disconnect();
    };
  }, [reduced]);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), reduced ? 0 : reveal);
    return () => window.clearTimeout(id);
  }, [reduced, reveal]);

  return (
    <section
      {...props}
      ref={stage}
      data-slot="all-set"
      data-motion={motion}
      data-ready={ready || undefined}
      className={cn("jui-all-set", className)}
      style={
        {
          ...style,
          "--all-set-font": family,
          "--all-set-reveal": `${reveal}ms`,
        } as CSSProperties
      }
    >
      <canvas className="jui-all-set-burst" aria-hidden="true" />
      <h1 className="jui-all-set-title">
        {motion === "handwriting" ? (
          <>
            <span className="jui-all-set-sr">{title}</span>
            <svg
              className="jui-all-set-write"
              viewBox={`0 0 ${viewWidth} 168`}
              role="img"
              aria-hidden="true"
            >
              <text x="50%" y="112" textAnchor="middle">
                {letters.map((letter, index) => (
                  <tspan
                    key={`${letter}-${index}`}
                    className="jui-all-set-stroke"
                    style={{ animationDelay: `${index * step}ms` }}
                  >
                    {letter === " " ? "\u00a0" : letter}
                  </tspan>
                ))}
              </text>
            </svg>
          </>
        ) : (
          title
        )}
      </h1>
      <button
        type="button"
        className="jui-all-set-action"
        onClick={() => {
          burst.current?.reset();
          onAction?.();
        }}
      >
        {actionLabel}
      </button>
    </section>
  );
}
