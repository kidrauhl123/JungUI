"use client";
import { useState } from "react";
import { Maximize, X, Terminal } from "lucide-react";
import { CopyButton } from "./copy-button";
import { SourceDialog } from "./source-dialog";
import { SiteTheme } from "./site-theme";
import { SITE_URL } from "@/lib/site";
import type { CatalogItem } from "@/lib/catalog-types";
const runners = { npm: "npx", pnpm: "pnpm dlx", yarn: "yarn dlx", bun: "bunx" };
export function InstallToolbar({ item }: { item: CatalogItem }) {
  const [open, setOpen] = useState(false);
  const [manager, setManager] = useState<keyof typeof runners>("npm");
  const [origin, setOrigin] = useState(SITE_URL);
  const command = `${runners[manager]} shadcn@latest add ${origin}/r/${item.name}.json`;
  return (
    <div className={`install-toolbar ${open ? "is-open" : ""}`}>
      <button
        className={open ? "icon-button" : "install-trigger"}
        aria-label={open ? "收起安装命令" : "展开安装命令"}
        aria-expanded={open}
        onClick={() => {
          setOrigin(window.location.origin);
          setOpen((v) => !v);
        }}
      >
        {open ? (
          <X size={19} />
        ) : (
          <>
            <Terminal size={15} />
            <span>Install</span>
          </>
        )}
      </button>
      {open && (
        <div className="install-command">
          <label className="visually-hidden" htmlFor="package-manager">
            包管理器
          </label>
          <select
            id="package-manager"
            value={manager}
            onChange={(e) => setManager(e.target.value as keyof typeof runners)}
          >
            {Object.keys(runners).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <code title={command}>{command}</code>
          <CopyButton value={command} label="复制安装命令" />
        </div>
      )}
      <span className="toolbar-divider" />
      <a
        className="icon-button"
        href={`/preview/${item.name}/`}
        target="_blank"
        rel="noreferrer"
        aria-label="全屏预览"
        title="全屏预览"
      >
        <Maximize size={19} />
      </a>
      <SourceDialog item={item} />
      <SiteTheme />
    </div>
  );
}
