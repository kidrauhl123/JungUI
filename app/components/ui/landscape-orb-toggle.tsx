"use client";
/*
Landscape orb toggle from Rewamp UI by Palak (palakonweb).
Source: https://github.com/palakonweb/Rewamp-UI/blob/main/src/components/ui/LandscapeOrbToggleShowcase.jsx
The Rewamp-UI repository declares no license. Kept here at the owner's request.
*/
import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import "./landscape-orb-toggle.css";

const THEMES = {
  dark: {
    sky: "#1A0B2E",
    skyBottom: "#2B1347",
    wave: "#4C1D95",
    fg: "#7C3AED",
  },
  light: {
    sky: "#38BDF8",
    skyBottom: "#7DD3FC",
    wave: "#93C5FD",
    fg: "#E0F2FE",
  },
};

export type LandscapeOrbToggleProps = {
  value?: "light" | "dark";
  defaultValue?: "light" | "dark";
  onValueChange?: (theme: "light" | "dark") => void;
  className?: string;
  disabled?: boolean;
};

export function LandscapeOrbToggle({
  value,
  defaultValue = "light",
  onValueChange,
  className,
  disabled,
}: LandscapeOrbToggleProps) {
  const [internal, setInternal] = useState(defaultValue);
  const theme = value ?? internal;
  const dark = theme === "dark";
  const palette = THEMES[theme];
  return (
    <motion.button
      type="button"
      aria-label={dark ? "切换到白天" : "切换到夜间"}
      disabled={disabled}
      data-slot="landscape-orb-toggle"
      data-theme={theme}
      aria-pressed={dark}
      className={cn("jui-landscape-orb", className)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        const next = dark ? "light" : "dark";
        if (value === undefined) setInternal(next);
        onValueChange?.(next);
      }}
    >
      <span
        className="jui-landscape-orb__sky"
        aria-hidden="true"
        style={{
          background: `linear-gradient(180deg, ${THEMES.light.sky} 0%, ${THEMES.light.skyBottom} 100%)`,
        }}
      />
      <motion.span
        className="jui-landscape-orb__sky"
        aria-hidden="true"
        style={{
          background: `linear-gradient(180deg, ${THEMES.dark.sky} 0%, ${THEMES.dark.skyBottom} 100%)`,
        }}
        animate={{ opacity: dark ? 1 : 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      />
      <span className="jui-landscape-orb__body" aria-hidden="true">
        <motion.span
          className="jui-landscape-orb__body-icon"
          animate={{ opacity: dark ? 1 : 0, scale: dark ? 1 : 0.3, rotate: dark ? 0 : -45 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M12 2.5A7 7 0 1 0 12 15.5 8.5 8.5 0 0 1 12 2.5Z" fill="#FFFFFF" />
          </svg>
        </motion.span>
        <motion.span
          className="jui-landscape-orb__body-icon"
          animate={{ opacity: dark ? 0 : 1, scale: dark ? 0.3 : 1, rotate: dark ? 45 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <span className="jui-landscape-orb__sun" />
        </motion.span>
      </span>
      <motion.svg
        className="jui-landscape-orb__wave jui-landscape-orb__wave--mid"
        viewBox="0 0 90 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          animate={{
            fill: palette.wave,
            d: dark
              ? "M0,16 C 20,6 40,24 60,10 C 75,0 85,18 90,12 L90,40 L0,40 Z"
              : "M0,18 C 15,4 30,4 45,16 C 60,28 75,28 90,14 L90,40 L0,40 Z",
          }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />
      </motion.svg>
      <motion.svg
        className="jui-landscape-orb__wave jui-landscape-orb__wave--front"
        viewBox="0 0 90 30"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          animate={{
            fill: palette.fg,
            d: dark
              ? "M0,14 C 24,24 45,4 65,18 C 78,26 85,12 90,16 L90,30 L0,30 Z"
              : "M0,16 C 18,26 32,6 50,14 C 66,21 78,10 90,18 L90,30 L0,30 Z",
          }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />
      </motion.svg>
      <span className="jui-landscape-orb__glass" aria-hidden="true" />
    </motion.button>
  );
}
