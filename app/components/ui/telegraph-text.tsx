"use client";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import {
  makeTelegraphTransitionPlan,
  renderTelegraphTransitionFrame,
  telegraphDuration,
} from "@/lib/telegraph-engine";
import "./telegraph-text.css";

export type TelegraphTextProps = ComponentProps<"button"> & {
  text: string;
  expandedText: string;
  variant?: "dark" | "rainbow";
  frameDuration?: number;
};

export function TelegraphText({
  text,
  expandedText,
  variant = "dark",
  frameDuration = 26,
  className,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onClick,
  ...props
}: TelegraphTextProps) {
  const readout = useRef<HTMLSpanElement>(null);
  const current = useRef(text);
  const seed = useRef(3);
  const [expanded, setExpanded] = useState(false);
  const target = expanded ? expandedText : text;
  useEffect(() => {
    const node = readout.current;
    if (!node) return;
    const from = current.current;
    const plan = makeTelegraphTransitionPlan(from, target, {
      seed: seed.current++,
    });
    const duration = telegraphDuration(plan);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let started: number | undefined;
    const finish = () => {
      cancelAnimationFrame(raf);
      node.textContent = target;
      current.current = target;
    };
    const tick = (now: number) => {
      started ??= now;
      const frame = Math.min(
        duration,
        Math.floor((now - started) / Math.max(1, frameDuration)),
      );
      current.current = renderTelegraphTransitionFrame(
        from,
        target,
        frame,
        plan,
      );
      node.textContent = current.current;
      if (frame < duration) raf = requestAnimationFrame(tick);
    };
    if (media.matches || from === target) finish();
    else raf = requestAnimationFrame(tick);
    const onPreference = () => {
      if (media.matches) finish();
    };
    media.addEventListener("change", onPreference);
    return () => {
      cancelAnimationFrame(raf);
      media.removeEventListener("change", onPreference);
    };
  }, [target, frameDuration]);
  return (
    <button
      type="button"
      {...props}
      data-slot="telegraph-text"
      data-target={expanded ? "expanded" : "compact"}
      className={cn("telegraph-word", `telegraph-word--${variant}`, className)}
      aria-label={target}
      aria-expanded={expanded}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        if (
          !e.defaultPrevented &&
          !props.disabled &&
          matchMedia("(hover: hover)").matches
        )
          setExpanded(true);
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e);
        if (!e.defaultPrevented) setExpanded(false);
      }}
      onFocus={(e) => {
        onFocus?.(e);
        if (!e.defaultPrevented && !matchMedia("(pointer: coarse)").matches)
          setExpanded(true);
      }}
      onBlur={(e) => {
        onBlur?.(e);
        if (!e.defaultPrevented) setExpanded(false);
      }}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setExpanded((value) => !value);
      }}
    >
      <span className="telegraph-word-grid" aria-hidden="true" />
      <span className="telegraph-word-text" ref={readout} aria-hidden="true">
        {text}
      </span>
    </button>
  );
}
