"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import { components, componentHref } from "@/lib/components";
import { DemoPreview } from "./demo-preview";
export function Gallery() {
  const [query, setQuery] = useState("");
  const filtered = components.filter((item) =>
    `${item.title} ${item.english} ${item.description}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="gallery-tools">
        <label className="search">
          <Search size={16} />
          <input
            aria-label="搜索组件"
            placeholder="搜索组件…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
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
          <p>试试其他关键词，或者查看全部组件。</p>
          <button onClick={() => setQuery("")}>查看全部</button>
        </div>
      )}
    </>
  );
}
