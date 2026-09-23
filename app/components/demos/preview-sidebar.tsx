"use client";
import { useState, useSyncExternalStore } from "react";
import { PreviewSidebar } from "@/components/ui/preview-sidebar";
import { THEME_EVENT } from "@/lib/site-theme";
import type { DemoProps } from "@/lib/catalog-types";
import "./preview-sidebar-demo.css";
const subscribe = (callback: () => void) => { window.addEventListener(THEME_EVENT, callback); return () => window.removeEventListener(THEME_EVENT, callback); };
const getSnapshot = () => document.documentElement.dataset.theme === "dark";
const getServerSnapshot = () => true;
const entries = [
  ["theme", "Theme Toggle", "按钮与输入", "◐"],
  ["nudge", "Nudge Instead", "交互反馈", "↔"],
  ["button", "Elastic Button", "按钮与输入", "↗"],
  ["sky", "Procedural Sky", "氛围背景", "☁"],
  ["reveal", "Reveal Card", "展示与布局", "▧"],
  ["stack", "Card Stack", "展示与布局", "▱"],
  ["confetti", "Confetti", "交互反馈", "✳"],
  ["gooey", "Gooey Input", "按钮与输入", "⌕"],
  ["expand", "Expandable Card", "展示与布局", "⤢"],
  ["words", "Words Preloader", "交互反馈", "Hello"],
  ["sidebar", "Preview Sidebar", "展示与布局", "☰"],
];
export default function Demo({ compact }: DemoProps) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [active, setActive] = useState("confetti");
  const [open, setOpen] = useState(true);
  return <div className="demo-preview-sidebar" data-compact={compact}>
    <PreviewSidebar theme={dark ? "dark" : "light"} height={compact ? 380 : 480} open={open} onOpenChange={setOpen} activeId={active} onSelect={setActive} toggleLabel="展开或收起侧边栏" orderLabel="按编号排列" groupLabel="按分类排列" allLabel="全部组件" label="组件演示导航" items={entries.map(([id, label, group, symbol], index) => ({ id, label, group, badge: id === "sidebar" ? "New" : undefined, preview: <div className="demo-preview-sidebar-card" data-tone={index % 4}><span>{symbol}</span><small>{label}</small></div> }))} />
    <div className="demo-preview-sidebar-caption" role="status">{open ? entries.find(([id]) => id === active)?.[1] : "点击左上角重新展开"}</div>
  </div>;
}
