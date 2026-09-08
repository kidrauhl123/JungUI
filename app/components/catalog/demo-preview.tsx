"use client";
import { useEffect, useRef, useState } from "react";
import { demos } from "@/components/demos/index.generated";
export function DemoPreview({
  name,
  compact = false,
}: {
  name: string;
  compact?: boolean;
}) {
  const node = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!compact);
  useEffect(() => {
    if (!compact || !node.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "160px" },
    );
    observer.observe(node.current);
    return () => observer.disconnect();
  }, [compact]);
  const Demo = demos[name];
  return (
    <div ref={node} className={`demo-preview ${compact ? "is-compact" : ""}`}>
      {visible && Demo ? (
        <Demo compact={compact} />
      ) : (
        <span className="preview-placeholder">JungUI</span>
      )}
    </div>
  );
}
