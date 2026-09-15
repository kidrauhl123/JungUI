"use client";
import { useState, useSyncExternalStore } from "react";
import { CommandSearch } from "@/components/ui/command-search";
import { THEME_EVENT } from "@/lib/site-theme";
import type { DemoProps } from "@/lib/catalog-types";
import "./command-search-demo.css";
const subscribe = (callback: () => void) => { window.addEventListener(THEME_EVENT, callback); return () => window.removeEventListener(THEME_EVENT, callback); };
const getSnapshot = () => document.documentElement.dataset.theme === "dark";
const getServerSnapshot = () => true;
const groups = { Suggestions: ["Calendar", "Search Emoji", "Calculator", "Documents", "Images", "Music"], Settings: ["Profile", "Billing", "Settings", "Notifications", "Messages", "Security"], Help: ["FAQ", "Contact Support"], Docs: ["Documentation", "Tutorials"] };
export default function Demo({ compact }: DemoProps) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [selected, setSelected] = useState("");
  return <div className="demo-command-search" data-compact={compact}>
    <div className="demo-command-search-label">{compact ? "CLICK IN INPUT" : <>PRESS F OR<br/>CLICK IN<br/>INPUT</>}<span/></div>
    <CommandSearch theme={dark ? "dark" : "light"} shortcut={compact ? false : "f"} items={Object.entries(groups).flatMap(([group, labels]) => labels.map((label) => ({id:label.toLowerCase().replaceAll(" ","-"), label, group})))} onSelect={(item) => setSelected(item.label)}/>
    <span className="demo-command-search-status" role="status">{selected ? `已选择 ${selected}` : ""}</span>
  </div>;
}
