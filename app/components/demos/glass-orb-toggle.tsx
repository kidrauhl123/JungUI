"use client";
import { useSyncExternalStore } from "react";
import { GlassOrbToggle } from "@/components/ui/glass-orb-toggle";
import { THEME_EVENT, THEME_KEY } from "@/lib/site-theme";
import "./glass-orb-toggle-demo.css";

const subscribe = (callback: () => void) => {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
};
const getSnapshot = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";
const getServerSnapshot = () => "dark" as const;

function setSiteTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* Switching still works without storage. */
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

export default function Demo() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <div className="demo-glass-orb">
      <span data-theme={theme}>Mode: {theme === "light" ? "Light" : "Dark"}</span>
      <GlassOrbToggle value={theme} onValueChange={setSiteTheme} />
    </div>
  );
}
