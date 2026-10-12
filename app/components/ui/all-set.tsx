"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import confetti from "canvas-confetti";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import "./all-set.css";


export type AllSetProps = Omit<ComponentProps<"section">, "title"> & {
  title?: string;
  actionLabel?: string;
  replayKey?: string | number;
  onAction?: () => void;
};

const palette = ["#1ed760", "#1db954", "#191414", "#b3b3b3", "#ffffff", "#535353"];

export function AllSet({
  title = "You're all set",
  actionLabel = "Open JungUI",
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
      onAction={onAction}
      className={className}
      {...props}
    />
  );
}

function AllSetRun({
  title = "You're all set",
  actionLabel = "Open JungUI",
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
        origin: { x: 0.5, y: 0.72 },
        scalar: 0.9,
      });
      fire({
        particleCount: 36,
        angle: 60,
        spread: 55,
        startVelocity: 55,
        origin: { x: 0, y: 0.65 },
      });
      fire({
        particleCount: 36,
        angle: 120,
        spread: 55,
        startVelocity: 55,
        origin: { x: 1, y: 0.65 },
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
    const delay = reduced ? 0 : 1680;
    const id = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(id);
  }, [reduced]);

  return (
    <section
      {...props}
      ref={stage}
      data-slot="all-set"
      data-ready={ready || undefined}
      className={cn("jui-all-set", className)}
      style={style}
    >
      <canvas className="jui-all-set-burst" aria-hidden="true" />
      <h1 className="jui-all-set-title">{title}</h1>
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

