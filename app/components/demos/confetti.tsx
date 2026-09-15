"use client";
import { useRef, useState } from "react";
import { Confetti, type ConfettiRef, type ConfettiVariant } from "@/components/ui/confetti";
import type { DemoProps } from "@/lib/catalog-types";
import "./confetti-demo.css";

const variants: { value: ConfettiVariant; label: string; english: string }[] = [
  { value: "basic", label: "基础", english: "Basic" },
  { value: "random", label: "随机方向", english: "Random direction" },
  { value: "fireworks", label: "烟花", english: "Fireworks" },
  { value: "side-cannons", label: "双侧礼炮", english: "Side cannons" },
  { value: "stars", label: "星星", english: "Stars" },
  { value: "shapes", label: "自定义形状", english: "Custom shapes" },
  { value: "emoji", label: "Emoji", english: "Emoji" },
];
export default function Demo({ compact }: DemoProps) {
  const effect = useRef<ConfettiRef>(null);
  const [variant, setVariant] = useState<ConfettiVariant>("basic");
  const [emoji, setEmoji] = useState("🦄");
  const [status, setStatus] = useState("");
  function fire(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    effect.current?.fire(variant === "basic" || variant === "random" ? { origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight } } : undefined);
    setStatus(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "已开启减少动态效果，动画已跳过。" : "已触发，可再次点击重播。");
  }
  return <div className="demo-confetti" data-compact={compact}>
    <div className="demo-confetti-stage">
      <div className="demo-confetti-content">
        <span className="demo-confetti-eyebrow">{variants.find((item) => item.value === variant)?.english}</span>
        <h2>Confetti</h2>
        <button className="demo-confetti-trigger" type="button" onClick={fire}>Celebrate <span aria-hidden="true">↗</span></button>
      </div>
      <Confetti fullscreen ref={effect} variant={variant} emoji={emoji} />
    </div>
    <div className="demo-confetti-controls" role="group" aria-label="彩纸版本">
      {variants.map((item) => <button key={item.value} type="button" aria-pressed={variant === item.value} onClick={() => { effect.current?.stop(); setVariant(item.value); setStatus(""); }}>{item.label}</button>)}
    </div>
    <div className="demo-confetti-footer">
      {variant === "emoji" && <label>图案 <select aria-label="Emoji 图案" value={emoji} onChange={(event) => { effect.current?.stop(); setEmoji(event.target.value); }}><option>🦄</option><option>🎉</option><option>❤️</option><option>✨</option></select></label>}
      <button type="button" onClick={() => { effect.current?.stop(); setStatus("已停止。"); }}>停止</button>
      <span role="status">{status}</span>
    </div>
  </div>;
}
