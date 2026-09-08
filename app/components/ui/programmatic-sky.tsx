"use client";
import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import {
  ANDO_SORA_DEFAULTS,
  createAndoSoraSkyRenderer,
} from "@/lib/ando-sora-sky.js";
import "./programmatic-sky.css";
export { ANDO_SORA_DEFAULTS as SKY_DEFAULTS };
export type ProgrammaticSkyProps = ComponentProps<"div"> & {
  warmth?: number;
  clouds?: number;
  softness?: number;
  drift?: number;
  grain?: number;
  wind?: [number, number];
};
const WIND: [number, number] = [1, 0];
export function ProgrammaticSky({
  warmth = ANDO_SORA_DEFAULTS.warmth,
  clouds = ANDO_SORA_DEFAULTS.clouds,
  softness = ANDO_SORA_DEFAULTS.softness,
  drift = ANDO_SORA_DEFAULTS.drift,
  grain = ANDO_SORA_DEFAULTS.grain,
  wind = WIND,
  className,
  children,
  ...props
}: ProgrammaticSkyProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const renderer = useRef<ReturnType<typeof createAndoSoraSkyRenderer>>(null);
  useEffect(() => {
    if (!canvas.current) return;
    const element = root.current;
    renderer.current = createAndoSoraSkyRenderer(canvas.current, {}, () =>
      element?.classList.add("is-ready"),
    );
    return () => {
      renderer.current?.dispose();
      renderer.current = null;
      element?.classList.remove("is-ready");
    };
  }, []);
  useEffect(() => {
    renderer.current?.update({ warmth, clouds, softness, drift, grain, wind });
  }, [warmth, clouds, softness, drift, grain, wind]);
  return (
    <div
      {...props}
      ref={root}
      data-slot="programmatic-sky"
      className={cn("programmatic-sky programmatic-sky--sora", className)}
    >
      <canvas
        ref={canvas}
        className="programmatic-sky__canvas"
        aria-hidden="true"
      />
      <div className="programmatic-sky__fallback" aria-hidden="true" />
      <div className="programmatic-sky__haze" aria-hidden="true" />
      <div className="programmatic-sky__grain" aria-hidden="true" />
      {children && <div className="programmatic-sky__content">{children}</div>}
    </div>
  );
}
