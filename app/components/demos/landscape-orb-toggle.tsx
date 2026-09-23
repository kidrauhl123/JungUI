"use client";
import { useSyncExternalStore } from "react";
import { LandscapeOrbToggle } from "@/components/ui/landscape-orb-toggle";
import { THEME_EVENT, THEME_KEY } from "@/lib/site-theme";
import "./landscape-orb-toggle-demo.css";

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
    <div className="demo-landscape-orb">
      <LandscapeOrbToggle value={theme} onValueChange={setSiteTheme} />
      <span>{theme === "light" ? "Day Mode" : "Night Mode"}</span>
    </div>
  );
}
