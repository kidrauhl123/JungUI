"use client";
import { useState } from "react";
import { TelegraphText } from "@/components/ui/telegraph-text";
import type { DemoProps } from "@/lib/catalog-types";
export default function Demo({ compact }: DemoProps) {
  const [variant, setVariant] = useState<"dark" | "rainbow">("dark");
  const [text, setText] = useState("MIA");
  const [expanded, setExpanded] = useState("Multiple Intelligent Agents");
  return (
    <div className="demo-column">
      <TelegraphText text={text} expandedText={expanded} variant={variant} />
      {!compact && (
        <div className="demo-controls">
          <label>
            短文字
            <input value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <label>
            展开文字
            <input
              value={expanded}
              onChange={(e) => setExpanded(e.target.value)}
            />
          </label>
          <label>
            外观
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as "dark" | "rainbow")}
            >
              <option value="dark">电报</option>
              <option value="rainbow">七彩扫光</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
