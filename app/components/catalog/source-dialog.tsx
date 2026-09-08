"use client";
import { useRef, useState } from "react";
import { Code2, X, RefreshCw } from "lucide-react";
import { CopyButton } from "./copy-button";
import type { CatalogItem } from "@/lib/catalog-types";
type SourceFile = { path: string; content: string };
export function SourceDialog({ item }: { item: CatalogItem }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [active, setActive] = useState(item.entry);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const selected = files.find((file) => file.path === active) ?? files[0];
  async function load() {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/r/${item.name}.json`);
      if (!response.ok) throw new Error("source");
      const payload = await response.json();
      setFiles(payload.files);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <button
        className="icon-button"
        aria-label="查看源码"
        title="查看源码"
        onClick={() => {
          dialog.current?.showModal();
          if (!files.length) void load();
        }}
      >
        <Code2 size={20} />
      </button>
      <dialog
        ref={dialog}
        className="source-dialog"
        aria-labelledby={`source-${item.name}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="source-shell">
          <header>
            <div>
              <h2 id={`source-${item.name}`}>{item.english}</h2>
              <p>安装时写入项目的完整源码</p>
            </div>
            <button
              className="icon-button"
              aria-label="关闭源码"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
          </header>
          {loading ? (
            <p className="source-message" role="status">
              正在读取源码…
            </p>
          ) : error ? (
            <div className="source-message" role="alert">
              源码暂时无法读取。
              <button onClick={() => void load()}>
                <RefreshCw size={15} />
                重试
              </button>
            </div>
          ) : (
            <>
              <div className="source-filebar">
                <label
                  className="visually-hidden"
                  htmlFor={`file-${item.name}`}
                >
                  源码文件
                </label>
                <select
                  id={`file-${item.name}`}
                  value={selected?.path ?? ""}
                  onChange={(e) => setActive(e.target.value)}
                >
                  {files.map((file) => (
                    <option key={file.path} value={file.path}>
                      {file.path}
                    </option>
                  ))}
                </select>
                {selected && (
                  <CopyButton value={selected.content} label="复制当前文件" />
                )}
              </div>
              <pre className="source-code">
                <code>
                  {selected?.content.split("\n").map((line, i) => (
                    <span className="code-line" data-line={i + 1} key={i}>
                      {line || " "}
                      {"\n"}
                    </span>
                  ))}
                </code>
              </pre>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
