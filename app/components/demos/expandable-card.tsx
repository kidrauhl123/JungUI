"use client";
import { useState, useSyncExternalStore } from "react";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { THEME_EVENT } from "@/lib/site-theme";
import type { DemoProps } from "@/lib/catalog-types";
import "./expandable-card-demo.css";
const subscribe = (callback: () => void) => {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
};
const getSnapshot = () => document.documentElement.dataset.theme === "dark";
const getServerSnapshot = () => true;
// Original vector cover art; no external image requests or copyrighted album covers.
function cover(sky: string, glow: string, land: string, moon: number) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="440" viewBox="0 0 600 440"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${glow}"/></linearGradient><linearGradient id="land" x2="0" y2="1"><stop stop-color="${land}"/><stop offset="1" stop-color="${sky}"/></linearGradient></defs><rect width="600" height="440" fill="url(#sky)"/><circle cx="${moon}" cy="155" r="65" fill="${glow}"/><path d="M0 310 Q110 150 250 280 T600 255 V440 H0Z" fill="${land}" opacity=".55"/><path d="M0 390 Q180 240 360 330 T600 300 V440 H0Z" fill="url(#land)"/><path d="M0 420 Q230 320 420 400 T600 350 V440 H0Z" fill="${sky}" opacity=".8"/></svg>`)}`;
}
const stories = [
  { id: "dunes", title: "After the Sun", subtitle: "Desert studies · 01", image: cover("#704e42", "#f8d7a0", "#b56c4d", 420), text: "傍晚的最后一束光落在沙丘上，风抹去了白天留下的脚印。这里没有固定的路线，只有不断改变的轮廓。", detail: "把视线放低，会看见沙粒之间细密的阴影；把目光放远，起伏的地平线又像静止的海。这是一组关于温度、留白与时间的风景习作。" },
  { id: "tide", title: "Quiet Tides", subtitle: "Coastal notes · 02", image: cover("#234956", "#b9ddd2", "#568b88", 185), text: "退潮后的海岸比想象中安静。礁石露出水面，空气带着微凉的盐味，一条窄窄的光线把海和天空连在一起。", detail: "沿着海岸慢慢行走，浪声有了自己的节拍。这组画面记录那些很容易错过的瞬间：水面的折光、潮湿的石头，以及远处逐渐消失的帆。" },
  { id: "night", title: "Blue Hours", subtitle: "Night walks · 03", image: cover("#242f59", "#a1b7d5", "#45537b", 390), text: "太阳已经落下，夜色还没有完全降临。蓝调时刻让熟悉的山谷变得陌生，也让每一盏遥远的灯都有了故事。", detail: "在天光消失之前，留一点时间给自己。看山脊慢慢融入天空，听风从树叶之间穿过。无需赶路，这一刻本身就是目的地。" },
  { id: "bloom", title: "Soft Terrain", subtitle: "Field recordings · 04", image: cover("#66566a", "#f1c9c1", "#a78091", 230), text: "雾从低处升起，远处的山坡像一张被反复折叠的纸。柔和的色彩没有明确的边界，只在晨光里缓缓过渡。", detail: "这组田野笔记收集了春天最轻的声音和颜色。草叶上的水珠、还未开放的花，以及空气里若有若无的暖意，都值得停下来仔细看一看。" },
];
export default function Demo({ compact }: DemoProps) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [variant, setVariant] = useState<"list" | "grid">("list");
  const [saved, setSaved] = useState<string[]>([]);
  return <div className="demo-expandable-card" data-compact={compact}>
    <div className="demo-expandable-card-variants" role="group" aria-label="卡片布局">
      <button type="button" aria-pressed={variant === "list"} onClick={() => setVariant("list")}>列表</button>
      <button type="button" aria-pressed={variant === "grid"} onClick={() => setVariant("grid")}>网格</button>
    </div>
    <ExpandableCard theme={dark ? "dark" : "light"} variant={variant} closeLabel="关闭详情" items={stories.map((story) => ({ ...story, imageAlt: `${story.title} 抽象风景封面`, content: <><p>{story.text}</p><p>{story.detail}</p></>, action: <button type="button" className="demo-expandable-card-save" aria-pressed={saved.includes(story.id)} onClick={() => setSaved((current) => current.includes(story.id) ? current.filter((id) => id !== story.id) : [...current, story.id])}>{saved.includes(story.id) ? "已收藏 ✓" : "收藏"}</button> }))} />
  </div>;
}
