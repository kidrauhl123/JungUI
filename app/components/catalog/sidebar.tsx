"use client";
import { useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { categories, components, componentHref } from "@/lib/components";

function ComponentNavigation() {
  const pathname = usePathname();
  const id = useId();
  const [closed, setClosed] = useState<string[]>([]);
  return (
    <nav aria-label="组件导航">
      <Link
        className={`nav-all ${pathname === "/" || pathname === "/components/" ? "active" : ""}`}
        href="/components/"
      >
        全部组件<span>{components.length}</span>
      </Link>
      {categories.map((category) => {
        const open = !closed.includes(category.id);
        const panel = `${id}-${category.id}`;
        return (
          <div className="nav-group" key={category.id}>
            <button
              type="button"
              className="nav-group-trigger"
              aria-expanded={open}
              aria-controls={panel}
              onClick={() =>
                setClosed((value) =>
                  open
                    ? [...value, category.id]
                    : value.filter((item) => item !== category.id),
                )
              }
            >
              {category.label}
              <ChevronDown size={13} aria-hidden="true" />
            </button>
            <div
              className="nav-group-panel"
              id={panel}
              data-open={open}
              inert={!open}
            >
              <div>
                {components
                  .filter((item) => item.category === category.id)
                  .map((item) => {
                    const active =
                      pathname.replace(/\/$/, "") ===
                      componentHref(item.name).replace(/\/$/, "");
                    return (
                      <Link
                        href={componentHref(item.name)}
                        key={item.name}
                        className={active ? "active" : ""}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  return (
    <>
      <aside className="sidebar" data-collapsed={collapsed} aria-label="侧边栏">
        <div className="sidebar-header">
          <Link
            className="wordmark"
            href="/"
            tabIndex={collapsed ? -1 : undefined}
            aria-hidden={collapsed || undefined}
          >
            Jung<span>UI</span>
            <span className="wordmark-dot" />
          </Link>
          <button
            type="button"
            className="sidebar-toggle"
            aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
            title={collapsed ? "展开侧边栏" : "收起侧边栏"}
            aria-expanded={!collapsed}
            aria-controls={`${id}-sidebar`}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <PanelLeftClose size={19} />
            )}
          </button>
        </div>
        <div className="sidebar-body" id={`${id}-sidebar`} inert={collapsed}>
          <ComponentNavigation />
          <div className="sidebar-footer">
            <Link href="/guide/">
              使用指南
              <ArrowUpRight size={14} />
            </Link>
            <span>细节，让界面有感觉。</span>
          </div>
        </div>
      </aside>
      <div
        className="mobile-nav"
        onKeyDown={(event) => {
          if (event.key === "Escape" && mobileOpen) {
            setMobileOpen(false);
            mobileButton.current?.focus();
          }
        }}
      >
        <Link className="wordmark" href="/">
          Jung<span>UI</span>
        </Link>
        <button
          ref={mobileButton}
          type="button"
          className="sidebar-toggle"
          aria-label={mobileOpen ? "收起组件导航" : "展开组件导航"}
          aria-expanded={mobileOpen}
          aria-controls={`${id}-mobile`}
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div
          className="mobile-navigation-panel"
          id={`${id}-mobile`}
          data-open={mobileOpen}
          inert={!mobileOpen}
        >
          <div>
            <div
              className="mobile-navigation-content"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a"))
                  setMobileOpen(false);
              }}
            >
              <ComponentNavigation />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
