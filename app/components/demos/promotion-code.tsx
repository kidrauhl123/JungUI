"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PromotionCode } from "@/components/ui/promotion-code";
import { THEME_EVENT } from "@/lib/site-theme";
import type { DemoProps } from "@/lib/catalog-types";
import "./promotion-code-demo.css";

const subscribe = (callback: () => void) => {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
};
const getSnapshot = () => document.documentElement.dataset.theme === "dark";
const getServerSnapshot = () => true;

export default function Demo({ compact }: DemoProps) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function apply(value: string) {
    if (timer.current) clearTimeout(timer.current);
    setCode(value);
    setStatus("loading");
    timer.current = setTimeout(() => {
      setStatus(value.trim().toUpperCase() === "JUNGUI" ? "success" : "error");
      timer.current = null;
    }, 1200);
  }
  return <div className="demo-promotion-code" data-compact={compact}>
    <PromotionCode theme={dark ? "dark" : "light"} value={code}
      onValueChange={(value) => { setCode(value); setStatus("idle"); }} onApply={apply}
      loading={status === "loading"} success={status === "success"}
      error={status === "error" ? "This code is invalid. Try JUNGUI." : undefined} />
    <div className="demo-promotion-code-examples" aria-label="演示优惠码结果">
      <button type="button" disabled={status === "loading"} onClick={() => apply("JUNGUI")}>演示成功</button>
      <span aria-hidden="true">·</span>
      <button type="button" disabled={status === "loading"} onClick={() => apply("EXPIRED")}>演示失败</button>
      <span aria-hidden="true">·</span>
      <button type="button" onClick={() => { if (timer.current) clearTimeout(timer.current); timer.current = null; setCode(""); setStatus("idle"); }}>重置</button>
    </div>
  </div>;
}
