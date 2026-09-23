"use client";
/*
Day/night sky toggle from Rewamp UI by Palak (palakonweb).
Source: https://github.com/palakonweb/Rewamp-UI/blob/main/src/components/ui/DayNightSkyToggleShowcase.jsx
The Rewamp-UI repository declares no license. Kept here at the owner's request.
*/
import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import "./day-night-sky-toggle.css";

const STARS = [
  { x: 18, y: 18, delay: 0 },
  { x: 34, y: 14, delay: 0.3 },
  { x: 52, y: 22, delay: 0.6 },
  { x: 70, y: 16, delay: 0.2 },
  { x: 26, y: 34, delay: 0.5 },
  { x: 60, y: 30, delay: 0.4 },
  { x: 44, y: 44, delay: 0.7 },
];

export type DayNightSkyToggleProps = {
  value?: "light" | "dark";
  defaultValue?: "light" | "dark";
  onValueChange?: (theme: "light" | "dark") => void;
  className?: string;
  disabled?: boolean;
};

export function DayNightSkyToggle({
  value,
  defaultValue = "light",
  onValueChange,
  className,
  disabled,
}: DayNightSkyToggleProps) {
  const [internal, setInternal] = useState(defaultValue);
  const day = (value ?? internal) === "light";
  return (
    <motion.button
      type="button"
      aria-label={day ? "切换到夜间" : "切换到白天"}
      disabled={disabled}
      data-slot="day-night-sky-toggle"
      data-theme={day ? "light" : "dark"}
      aria-pressed={!day}
      className={cn("jui-sky-toggle", className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        const next = day ? "dark" : "light";
        if (value === undefined) setInternal(next);
        onValueChange?.(next);
      }}
    >
      <span className="jui-sky-toggle__night" aria-hidden="true" />
      <motion.span
        className="jui-sky-toggle__day"
        aria-hidden="true"
        animate={{ opacity: day ? 1 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <motion.span
        className="jui-sky-toggle__stars"
        aria-hidden="true"
        animate={{ opacity: day ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {STARS.map((star, index) => (
          <motion.span
            key={index}
            className="jui-sky-toggle__star"
            style={{ left: `${star.x}%`, top: `${star.y}%` }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
          />
        ))}
      </motion.span>
      <motion.span
        className="jui-sky-toggle__birds"
        aria-hidden="true"
        animate={{ opacity: day ? 1 : 0, y: day ? 0 : 6 }}
        transition={{ duration: 0.5, delay: day ? 0.2 : 0 }}
      >
        {[0, 1].map((index) => (
          <span key={index} style={{ left: `${46 + index * 14}%`, top: `${22 + index * 8}%` }}>
            ⌃⌃
          </span>
        ))}
      </motion.span>
      <motion.span
        className="jui-sky-toggle__sun"
        aria-hidden="true"
        animate={{ rotate: day ? 0 : 180, scale: day ? 1 : 0.6, opacity: day ? 1 : 0.25 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <motion.span
        className="jui-sky-toggle__moon"
        aria-hidden="true"
        animate={{ rotate: day ? -180 : 0, scale: day ? 0.6 : 1, opacity: day ? 0.25 : 0.95 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
        </svg>
      </motion.span>
      <span className="jui-sky-toggle__clouds" aria-hidden="true">
        {[
          { w: 36, h: 14, x: [0, 8, 0], dur: 6 },
          { w: 48, h: 16, x: [0, -10, 0], dur: 7 },
          { w: 32, h: 12, x: [0, 6, 0], dur: 5 },
        ].map((cloud, index) => (
          <motion.span
            key={index}
            style={{ width: cloud.w, height: cloud.h }}
            animate={{
              x: cloud.x,
              backgroundColor: day ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)",
            }}
            transition={{
              x: { duration: cloud.dur, repeat: Infinity, ease: "easeInOut" },
              backgroundColor: { duration: 0.7, ease: "easeInOut" },
            }}
          />
        ))}
      </span>
      <motion.span
        className="jui-sky-toggle__orb"
        aria-hidden="true"
        animate={{
          x: day ? 14 : 204,
          boxShadow: day
            ? "0 0 24px 8px rgba(255,255,255,0.65), inset 0 2px 4px rgba(255,255,255,0.8)"
            : "0 0 28px 10px rgba(180,205,255,0.5), inset 0 2px 4px rgba(255,255,255,0.6)",
        }}
        transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.8 }}
      />
    </motion.button>
  );
}
