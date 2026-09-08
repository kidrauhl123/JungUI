"use client";
import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
export type RippleFieldProps = ComponentProps<"svg"> & {
  lines?: number;
  width?: number;
  height?: number;
};
export function RippleField({
  stroke = "#2f7bd4",
  lines = 12,
  width = 264,
  height = 300,
  className,
  ...props
}: RippleFieldProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const count = Math.max(2, Math.min(100, Math.round(lines)));
    const paths = Array.from({ length: count }, (_, i) => {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("opacity", String(Math.max(0.1, 0.85 - i * 0.02)));
      svg.appendChild(p);
      return p;
    });
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let started = 0;
    const wave = (x: number, l: number, t: number) =>
      7 * Math.sin(0.024 * x + t * 0.75 + l * 0.55) +
      4.5 * Math.sin(0.013 * x - t * 0.5 + l * 0.935) +
      2.6 * Math.sin(0.045 * x + t * 1.2 + l * 0.22) +
      1.8 * Math.sin(0.08 * x - t * 0.95);
    const draw = (now: number) => {
      started ||= now;
      const t = media.matches ? 0 : (now - started) / 1000;
      paths.forEach((p, i) => {
        let d = "";
        for (let x = -10; x <= width + 10; x += 8)
          d += `${x === -10 ? "M" : "L"} ${x} ${((i * height) / (count - 1) + wave(x, i, t)).toFixed(2)} `;
        p.setAttribute("d", d);
      });
      if (!media.matches && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      draw(performance.now());
    };
    restart();
    media.addEventListener("change", restart);
    document.addEventListener("visibilitychange", restart);
    return () => {
      cancelAnimationFrame(raf);
      paths.forEach((p) => p.remove());
      media.removeEventListener("change", restart);
      document.removeEventListener("visibilitychange", restart);
    };
  }, [lines, width, height]);
  return (
    <svg
      aria-hidden="true"
      {...props}
      ref={ref}
      data-slot="ripple-field"
      className={cn(className)}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      fill="none"
      stroke={stroke}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  );
}
