"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { components, componentHref } from "@/lib/components";
import { GooeyInput } from "@/components/ui/gooey-input";
import { THEME_EVENT } from "@/lib/site-theme";
import { DemoPreview } from "./demo-preview";
const subscribe = (callback: () => void) => {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
};
const getSnapshot = () => document.documentElement.dataset.theme === "dark";
const getServerSnapshot = () => true;
export function Gallery() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [query, setQuery] = useState("");
  const filtered = components.filter((item) =>
    `${item.title} ${item.english} ${item.description}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="gallery-tools">
        <GooeyInput
          theme={dark ? "dark" : "light"}
          label="搜索"
          placeholder="搜索组件"
          aria-label="搜索组件"
          value={query}
          onValueChange={setQuery}
          collapsedWidth={88}
          expandedWidth={220}
          expandedOffset={48}
        />
      </div>
      <div className="gallery-grid">
        {filtered.map((item) => (
          <article
            className={`gallery-card gallery-${item.name}`}
            key={item.name}
          >
            <div className="gallery-preview">
              <DemoPreview name={item.name} compact />
            </div>
            <Link href={componentHref(item.name)} className="gallery-caption">
              <div>
                <h2>{item.title}</h2>
                <p>{item.english}</p>
              </div>
              <ArrowUpRight size={19} />
            </Link>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="gallery-empty">
          <h2>还没有匹配的组件</h2>
          <button onClick={() => setQuery("")}>查看全部</button>
        </div>
      )}
    </>
  );
}
