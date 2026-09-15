"use client";
import { useState, useSyncExternalStore } from "react";
import { WordsPreloader } from "@/components/ui/words-preloader";
import type { DemoProps } from "@/lib/catalog-types";
import { THEME_EVENT } from "@/lib/site-theme";
import "./words-preloader-demo.css";
const subscribe = (callback: () => void) => {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
};
const getSnapshot = () => document.documentElement.dataset.theme === "dark";
const getServerSnapshot = () => true;
export default function Demo({ compact }: DemoProps) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [run, setRun] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [complete, setComplete] = useState(false);
  const [ready, setReady] = useState(true);
  function replay(full: boolean, wait = false) { setReady(!wait); setFullscreen(full); setComplete(false); setRun((value) => value + 1); }
  return <div className="demo-words-preloader" data-compact={compact}>
    <WordsPreloader ready={ready} replayKey={run} fullscreen={fullscreen} theme={dark ? "dark" : "light"} loadingLabel="正在准备页面" onComplete={() => setComplete(true)}>
      <div className="demo-words-preloader-page"><span>JUNGUI / WELCOME</span><h3>Hello, again.</h3><p>让每一次抵达，都有一点仪式感。</p></div>
    </WordsPreloader>
    <div className="demo-words-preloader-toolbar"><span role="status">{complete ? "页面已就绪" : ready ? "问候 → 弧形退场" : "等待内容就绪"}</span><button type="button" onClick={() => replay(false)}>重播</button><button type="button" onClick={() => replay(true)}>全屏体验</button><button type="button" onClick={() => ready || complete ? replay(false, true) : setReady(true)}>{ready || complete ? "模拟等待" : "内容就绪"}</button></div>
  </div>;
}
