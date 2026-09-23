"use client";
import { useSyncExternalStore } from "react";
import { DayNightSkyToggle } from "@/components/ui/day-night-sky-toggle";
import { THEME_EVENT, THEME_KEY } from "@/lib/site-theme";
import "./day-night-sky-toggle-demo.css";

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
    <div className="demo-day-night-sky">
      <span>{theme === "light" ? "Day Mode" : "Night Mode"}</span>
      <DayNightSkyToggle value={theme} onValueChange={setSiteTheme} />
    </div>
  );
}
