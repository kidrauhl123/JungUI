"use client";

/*
Preset recipes adapted from Magic UI Confetti examples.
https://magicui.design/docs/components/confetti

MIT License

Copyright (c) Magic UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { useEffect, useImperativeHandle, useRef, useSyncExternalStore, type ComponentProps, type Ref } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import "./confetti.css";

export type ConfettiVariant = "basic" | "random" | "fireworks" | "side-cannons" | "stars" | "shapes" | "emoji";
export type ConfettiOptions = confetti.Options;
export type ConfettiRef = { fire: (options?: ConfettiOptions) => void; stop: () => void };
export type ConfettiProps = Omit<ComponentProps<"canvas">, "ref" | "children"> & {
  ref?: Ref<ConfettiRef>;
  variant?: ConfettiVariant;
  fullscreen?: boolean;
  options?: ConfettiOptions;
  /** Emission duration for fireworks and side cannons, in milliseconds. */
  duration?: number;
  emoji?: string;
  respectReducedMotion?: boolean;
};

const subscribeToMount = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Manual canvas effect. Each instance owns and cleans up its animation. */
export function Confetti({ ref, variant = "basic", fullscreen = false, options, duration, emoji = "🦄", respectReducedMotion = true, className, ...props }: ConfettiProps) {
  const mounted = useSyncExternalStore(subscribeToMount, clientSnapshot, serverSnapshot);
  const canvas = useRef<HTMLCanvasElement>(null);
  const instance = useRef<confetti.CreateTypes | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function stop() {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    instance.current?.reset();
  }
  useEffect(() => {
    if (!mounted || !canvas.current) return;
    // Main-thread canvas remains safe to recreate during React Strict Mode.
    instance.current = confetti.create(canvas.current!, { resize: true, useWorker: false });
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => { if (media.matches && respectReducedMotion) stop(); };
    media.addEventListener("change", onChange);
    return () => { stop(); instance.current = null; media.removeEventListener("change", onChange); };
  }, [respectReducedMotion, mounted, fullscreen]);
  useImperativeHandle(ref, () => ({ stop, fire(overrides = {}) {
    stop();
    if (!instance.current || (respectReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    const merged = { ...options, ...overrides };
    const shoot = (preset: ConfettiOptions) => { void instance.current?.({ ...preset, ...merged, disableForReducedMotion: respectReducedMotion }); };
    const repeat = (length: number, delay: number, frame: (progress: number) => void) => {
      const start = performance.now();
      const step = () => {
        const elapsed = performance.now() - start;
        if (elapsed >= length) { timer.current = null; return; }
        frame(elapsed / length);
        timer.current = setTimeout(step, delay);
      };
      step();
    };
    if (variant === "basic" || variant === "random") {
      shoot({ particleCount: 50, spread: 45, origin: { x: .5, y: .5 }, ...(variant === "random" ? { angle: Math.random() * 360 } : {}) });
    } else if (variant === "fireworks") {
      repeat(Math.max(0, duration ?? 5000), 250, (progress) => {
        for (const x of [.1 + Math.random() * .2, .7 + Math.random() * .2]) shoot({ startVelocity: 30, spread: 360, ticks: 60, particleCount: 50 * (1 - progress), origin: { x, y: Math.random() - .2 } });
      });
    } else if (variant === "side-cannons") {
      repeat(Math.max(0, duration ?? 3000), 16, () => {
        for (const [x, angle] of [[0, 60], [1, 120]]) shoot({ particleCount: 2, angle, spread: 55, startVelocity: 60, origin: { x, y: .5 }, colors: ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"] });
      });
    } else {
      const shapes: confetti.Shape[] = variant === "emoji" ? [confetti.shapeFromText({ text: emoji, scalar: 2 })] : variant === "shapes" ? [
        confetti.shapeFromPath({ path: "M0 10 L5 0 L10 10z" }),
        confetti.shapeFromPath({ path: "M0 0 L10 0 L10 10 L0 10 Z" }),
        confetti.shapeFromPath({ path: "M5 0 A5 5 0 1 0 5 10 A5 5 0 1 0 5 0 Z" }),
        confetti.shapeFromPath({ path: "M5 0 L10 10 L0 10 Z" }),
      ] : ["star"];
      let count = 0;
      const burst = () => {
        const stars = variant === "stars";
        const preset: ConfettiOptions = { spread: 360, ticks: stars ? 50 : 60, gravity: 0, decay: stars ? .94 : .96, startVelocity: stars ? 30 : 20, shapes, scalar: stars ? 1.2 : 2,
          ...(stars ? { colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"] } : {}) };
        shoot({ ...preset, particleCount: stars ? 40 : 35 });
        shoot({ ...preset, particleCount: stars ? 10 : 15, scalar: stars ? .75 : 1, shapes: ["circle"] });
        if (++count < 3) timer.current = setTimeout(burst, 100);
        else timer.current = null;
      };
      burst();
    }
  } }));
  const element = <canvas {...props} ref={canvas} data-slot="confetti" data-fullscreen={fullscreen} className={cn("jui-confetti", className)} aria-hidden="true" />;
  return fullscreen ? (mounted ? createPortal(element, document.body) : null) : element;
}
