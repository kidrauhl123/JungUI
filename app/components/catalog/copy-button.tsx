"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
export function CopyButton({
  value,
  label = "复制",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2200);
  }
  return (
    <button
      type="button"
      className={`icon-button ${className}`}
      onClick={copy}
      title={status === "copied" ? "已复制" : label}
      aria-label={status === "copied" ? "已复制" : label}
    >
      {status === "copied" ? <Check size={17} /> : <Copy size={17} />}
      <span className="visually-hidden" role="status">
        {status === "error"
          ? "复制失败，请手动选择文字复制。"
          : status === "copied"
            ? "已复制"
            : ""}
      </span>
    </button>
  );
}
