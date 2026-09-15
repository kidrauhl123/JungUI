"use client";
import { useState, useSyncExternalStore } from "react";
import { GooeyInput } from "@/components/ui/gooey-input";
import { THEME_EVENT } from "@/lib/site-theme";
import type { DemoProps } from "@/lib/catalog-types";
import "./gooey-input-demo.css";
const subscribe = (callback: () => void) => {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
};
const getSnapshot = () => document.documentElement.dataset.theme === "dark";
const getServerSnapshot = () => true;
export default function Demo({ compact }: DemoProps) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  return <div className="demo-gooey-input" data-compact={compact}>
    <GooeyInput theme={dark ? "dark" : "light"} value={query} onValueChange={(value) => { setQuery(value); setSubmitted(""); }} onSearch={setSubmitted} placeholder="Search..." />
    <div className="demo-gooey-input-status" role="status">{submitted ? `已提交：${submitted}` : ""}</div>
  </div>;
}
