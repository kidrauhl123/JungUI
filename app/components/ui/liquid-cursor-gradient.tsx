"use client";
/*
Liquid cursor gradient from Rewamp UI by Palak (palakonweb).
Source: https://github.com/palakonweb/Rewamp-UI/blob/main/src/components/ui/LiquidCursorGradientShowcase.jsx
The Rewamp-UI repository declares no license. Kept here at the owner's request.
*/
import {
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";
import "./liquid-cursor-gradient.css";

export type LiquidOrb = { color: string; size?: string };

export type LiquidCursorGradientProps = Omit<ComponentProps<"div">, "color"> & {
  colors?: [string, string, string];
  orbs?: [LiquidOrb, LiquidOrb];
  cursorSize?: number;
  blur?: number;
  tint?: string;
  noise?: number;
  children?: ReactNode;
};

const COLORS: [string, string, string] = ["#9C8EB8", "#D4CBE5", "#E4DDF0"];

export function LiquidCursorGradient({
  colors = COLORS,
  orbs,
  cursorSize = 400,
  blur = 80,
  tint = "rgba(0,0,0,.1)",
  noise = 0.2,
  className,
  style,
  children,
  ...props
}: LiquidCursorGradientProps) {
  const root = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20, mass: 0.8 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20, mass: 0.8 });
  const ambient: [LiquidOrb, LiquidOrb] = orbs ?? [
    { color: colors[0], size: "60%" },
    { color: colors[1], size: "55%" },
  ];

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const place = () => {
      const rect = node.getBoundingClientRect();
      mouseX.set(rect.width / 2);
      mouseY.set(rect.height / 2);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(node);
    return () => observer.disconnect();
  }, [mouseX, mouseY]);

  return (
    <div
      {...props}
      ref={root}
      data-slot="liquid-cursor-gradient"
      onPointerMove={(event) => {
        props.onPointerMove?.(event);
        const rect = root.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set(event.clientX - rect.left);
        mouseY.set(event.clientY - rect.top);
      }}
      className={cn("jui-liquid-cursor", className)}
      style={
        {
          ...style,
          "--liquid-blur": `${Math.max(0, blur)}px`,
          "--liquid-tint": tint,
          "--liquid-noise": noise,
        } as CSSProperties
      }
    >
      <div className="jui-liquid-cursor__orbs" aria-hidden="true">
        <motion.div
          className="jui-liquid-cursor__orb jui-liquid-cursor__orb--a"
          animate={{
            x: [0, 50, 0, -50, 0],
            y: [0, -50, 50, -20, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ backgroundColor: ambient[0].color, width: ambient[0].size, height: ambient[0].size }}
        />
        <motion.div
          className="jui-liquid-cursor__orb jui-liquid-cursor__orb--b"
          animate={{
            x: [0, -60, 20, 40, 0],
            y: [0, 40, -40, 30, 0],
            scale: [1, 0.8, 1.3, 0.9, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ backgroundColor: ambient[1].color, width: ambient[1].size, height: ambient[1].size }}
        />
        <motion.div
          className="jui-liquid-cursor__cursor"
          style={{
            backgroundColor: colors[2],
            width: cursorSize,
            height: cursorSize,
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
          }}
        />
      </div>
      <div className="jui-liquid-cursor__blur" aria-hidden="true" />
      <div className="jui-liquid-cursor__noise" aria-hidden="true" />
      {children && <div className="jui-liquid-cursor__content">{children}</div>}
    </div>
  );
}
