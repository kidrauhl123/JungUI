"use client";
/*
Glass orb toggle from Rewamp UI by Palak (palakonweb).
Source: https://github.com/palakonweb/Rewamp-UI/blob/main/src/components/ui/GlassOrbToggle.tsx
The Rewamp-UI repository declares no license. Kept here at the owner's request.
*/
import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import "./glass-orb-toggle.css";

export type GlassOrbToggleProps = {
  value?: "light" | "dark";
  defaultValue?: "light" | "dark";
  onValueChange?: (theme: "light" | "dark") => void;
  className?: string;
  disabled?: boolean;
};

export function GlassOrbToggle({
  value,
  defaultValue = "light",
  onValueChange,
  className,
  disabled,
}: GlassOrbToggleProps) {
  const [internal, setInternal] = useState(defaultValue);
  const light = (value ?? internal) === "light";
  return (
    <div className={cn("jui-glass-orb", className)} data-slot="glass-orb-toggle">
      <motion.span
        className="jui-glass-orb__glow"
        aria-hidden="true"
        animate={{ opacity: light ? 0.32 : 0.05, scale: light ? 1.25 : 0.85 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        style={{
          background: light
            ? "radial-gradient(circle, rgba(255,255,255,.5) 0%, rgba(180,180,200,.25) 50%, transparent 80%)"
            : "radial-gradient(circle, rgba(255,255,255,.15) 0%, transparent 70%)",
        }}
      />
      <motion.button
        type="button"
        aria-label={light ? "切换到夜间" : "切换到白天"}
        disabled={disabled}
        data-theme={light ? "light" : "dark"}
        aria-pressed={!light}
        className="jui-glass-orb__track"
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        animate={{
          backgroundColor: light ? "#56565E" : "#18181B",
          borderColor: light ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.08)",
          boxShadow: light
            ? "inset 0 3px 8px rgba(0,0,0,.35), inset 0 -1px 2px rgba(255,255,255,.2), 0 16px 36px -10px rgba(0,0,0,.5)"
            : "inset 0 3px 8px rgba(0,0,0,.8), inset 0 -1px 2px rgba(255,255,255,.06), 0 16px 36px -10px rgba(0,0,0,.6)",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        onClick={() => {
          const next = light ? "dark" : "light";
          if (value === undefined) setInternal(next);
          onValueChange?.(next);
        }}
      >
        <span className="jui-glass-orb__label">
          <motion.span
            animate={{ opacity: light ? 0.95 : 0, scale: light ? 1 : 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            Dark
          </motion.span>
        </span>
        <span className="jui-glass-orb__label">
          <motion.span
            animate={{ opacity: light ? 0 : 0.95, scale: light ? 0.9 : 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            Light
          </motion.span>
        </span>
        <motion.span
          className="jui-glass-orb__thumb"
          aria-hidden="true"
          animate={{ x: light ? 154 : -10 }}
          transition={{ type: "spring", stiffness: 240, damping: 24, mass: 0.85 }}
        >
          <span className="jui-glass-orb__lens">
            <span className="jui-glass-orb__lens-blur" />
            <span className="jui-glass-orb__lens-shade" />
            <span className="jui-glass-orb__lens-rim" />
            <span className="jui-glass-orb__lens-arc" />
            <span className="jui-glass-orb__lens-meniscus" />
            <span className="jui-glass-orb__icon">
              <motion.span
                className="jui-glass-orb__icon-layer"
                animate={{ opacity: light ? 0 : 1, scale: light ? 0.4 : 1, rotate: light ? 30 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <span className="jui-glass-orb__aura jui-glass-orb__aura--moon" />
                <svg viewBox="0 0 24 24" className="jui-glass-orb__moon" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </motion.span>
              <motion.span
                className="jui-glass-orb__icon-layer"
                animate={{ opacity: light ? 1 : 0, scale: light ? 1 : 0.4, rotate: light ? 0 : -45 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <span className="jui-glass-orb__aura jui-glass-orb__aura--sun" />
                <svg viewBox="0 0 40 40" className="jui-glass-orb__sun" fill="currentColor">
                  <circle cx="20" cy="20" r="8" />
                  <line x1="20" y1="4" x2="20" y2="7.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                  <line x1="20" y1="32.5" x2="20" y2="36" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                  <line x1="4" y1="20" x2="7.5" y2="20" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                  <line x1="32.5" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                  <line x1="8.7" y1="8.7" x2="11.2" y2="11.2" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                  <line x1="28.8" y1="28.8" x2="31.3" y2="31.3" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                  <line x1="8.7" y1="31.3" x2="11.2" y2="28.8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                  <line x1="28.8" y1="11.2" x2="31.3" y2="8.7" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                </svg>
              </motion.span>
            </span>
          </span>
        </motion.span>
      </motion.button>
    </div>
  );
}
