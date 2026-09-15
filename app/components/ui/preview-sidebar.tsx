"use client";
import { Fragment, useEffect, useId, useRef, useState, type ComponentProps, type ReactNode, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import "./preview-sidebar.css";

// Independent implementation; visual reference: https://skiper-ui.com/v1/skiper8
export type PreviewSidebarItem = {
  id: string;
  label: string;
  group?: string;
  href?: string;
  preview?: ReactNode;
  videoSrc?: string;
  badge?: string;
};
export type PreviewSidebarProps = Omit<ComponentProps<"div">, "children" | "onSelect"> & {
  items: PreviewSidebarItem[];
  activeId?: string;
  defaultActiveId?: string;
  onSelect?: (id: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  theme?: "light" | "dark";
  width?: number;
  height?: number;
  label?: string;
  allLabel?: string;
  orderLabel?: string;
  groupLabel?: string;
  toggleLabel?: string;
};
export function PreviewSidebar({ items, activeId, defaultActiveId, onSelect, open, defaultOpen = true, onOpenChange, theme = "light", width = 320, height = 520, label = "Component navigation", allLabel = "All components", orderLabel = "Sorted by Id", groupLabel = "Sorted by Collection", toggleLabel = "Toggle sidebar", className, style, ...props }: PreviewSidebarProps) {
  const panelId = useId();
  const reduced = useReducedMotion();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalActive, setInternalActive] = useState(defaultActiveId);
  const [grouped, setGrouped] = useState(false);
  const [preview, setPreview] = useState<PreviewSidebarItem | null>(null);
  const expanded = open ?? internalOpen;
  const selected = activeId ?? internalActive;
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const setOpen = (value: boolean) => { if (open === undefined) setInternalOpen(value); setPreview(null); onOpenChange?.(value); };
  useEffect(() => {
    if (!expanded) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        if (open === undefined) setInternalOpen(false);
        setPreview(null);
        onOpenChange?.(false);
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [expanded, open, onOpenChange]);
  const select = (id: string) => { if (activeId === undefined) setInternalActive(id); setPreview(null); onSelect?.(id); };
  useEffect(() => {
    if (!expanded) return;
    const container = scroller.current;
    const current = container?.querySelector<HTMLElement>('[aria-current="page"]');
    if (container && current) container.scrollTo({ top: current.offsetTop - container.clientHeight / 2 + current.clientHeight / 2, behavior: reduced ? "instant" : "smooth" });
  }, [selected, expanded, grouped, reduced]);
  useEffect(() => {
    if (!preview) return;
    const hide = () => setPreview(null);
    window.addEventListener("resize", hide);
    window.addEventListener("scroll", hide, true);
    return () => { window.removeEventListener("resize", hide); window.removeEventListener("scroll", hide, true); };
  }, [preview]);
  const position = (left: number, top: number) => {
    x.set(Math.max(8, Math.min(left + 14, window.innerWidth - 216)));
    y.set(Math.max(8, Math.min(top + 14, window.innerHeight - 125)));
  };
  const groups: [string, PreviewSidebarItem[]][] = grouped ? Array.from(new Set(items.map((item) => item.group ?? allLabel))).map((group) => [group, items.filter((item) => (item.group ?? allLabel) === group)]) : [[allLabel, items]];
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 250, damping: 30 };
  return <div {...props} ref={root} data-slot="preview-sidebar" data-theme={theme} data-open={expanded} className={cn("jui-preview-sidebar", className)} style={{ "--ps-width": `${Math.max(220, width)}px`, "--ps-height": `${Math.max(240, height)}px`, ...style } as CSSProperties} onKeyDown={(event) => {
    props.onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === "Escape") { setOpen(false); root.current?.querySelector<HTMLButtonElement>('.jui-preview-sidebar-toggle')?.focus(); }
  }}>
    <motion.button animate={{ width: expanded ? 42 : 32, height: expanded ? 42 : 32, x: expanded ? 10 : 0, y: expanded ? -10 : 0 }} transition={{ duration: reduced ? 0 : 0.35, ease: [0.23, 0.88, 0.26, 0.92] }} type="button" className="jui-preview-sidebar-toggle" aria-label={toggleLabel} aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(!expanded)}>
      <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="3" width="16" height="14" rx="4" fill="currentColor"/><motion.rect x="5" y="6" height="8" rx="1" fill="var(--ps-bg)" animate={{ width: expanded ? 4 : 1.5 }} transition={spring}/></svg>
    </motion.button>
    <motion.div id={panelId} className="jui-preview-sidebar-panel" inert={!expanded} aria-hidden={!expanded} initial={false} animate={{ x: expanded ? 0 : "-105%", opacity: expanded ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.35, ease: [0.23, 0.88, 0.26, 0.92] }}>
      <div ref={scroller} className="jui-preview-sidebar-scroll">
        <nav aria-label={label} className="jui-preview-sidebar-nav">
          <button type="button" className="jui-preview-sidebar-sort" onClick={() => { setGrouped(!grouped); setPreview(null); }}>{grouped ? groupLabel : orderLabel}<span aria-hidden="true">↕</span></button>
          {groups.map(([group, entries], groupIndex) => <Fragment key={group}>
            <div className="jui-preview-sidebar-group-label"><span/>{group}</div>
            <span className="jui-preview-sidebar-tick" aria-hidden="true"/><span className="jui-preview-sidebar-tick" aria-hidden="true"/>
            {entries.map((item, entryIndex) => {
              const active = selected === item.id;
              const hovered = preview?.id === item.id;
              const content = <><motion.span className="jui-preview-sidebar-line" animate={{ width: active || hovered ? 55 : 32 }} transition={spring}/><span className="jui-preview-sidebar-item-label">{!grouped && <span className="jui-preview-sidebar-number">{String(items.indexOf(item) + 1).padStart(2, "0")}</span>}{item.label}{item.badge && <sup>{item.badge}</sup>}</span></>;
              const events = {
                onPointerEnter: (event: React.PointerEvent<HTMLElement>) => { if (event.pointerType === "touch") return; position(event.clientX, event.clientY); setPreview(item); },
                onPointerMove: (event: React.PointerEvent<HTMLElement>) => { if (event.pointerType !== "touch") position(event.clientX, event.clientY); },
                onPointerLeave: () => setPreview(null),
                onFocus: (event: React.FocusEvent<HTMLElement>) => { const rect = event.currentTarget.getBoundingClientRect(); position(rect.right, rect.top); setPreview(item); },
                onBlur: () => setPreview(null),
                onClick: () => select(item.id),
              };
              const entry = item.href ? <a key={item.id} {...events} href={item.href} className="jui-preview-sidebar-item" aria-current={active ? "page" : undefined}>{content}</a> : <button key={item.id} {...events} type="button" className="jui-preview-sidebar-item" aria-current={active ? "page" : undefined}>{content}</button>;
              return <Fragment key={item.id}>{entry}{entryIndex < entries.length - 1 && <><span className="jui-preview-sidebar-tick" aria-hidden="true"/><span className="jui-preview-sidebar-tick" aria-hidden="true"/></>}</Fragment>;
            })}
            {groupIndex < groups.length - 1 && Array.from({ length: 7 }, (_, index) => <span key={index} className="jui-preview-sidebar-tick" aria-hidden="true"/>)}
          </Fragment>)}
        </nav>
      </div>
      <div className="jui-preview-sidebar-fade jui-preview-sidebar-fade-top" aria-hidden="true"/>
      <div className="jui-preview-sidebar-fade jui-preview-sidebar-fade-bottom" aria-hidden="true"/>
    </motion.div>
    {typeof document !== "undefined" && createPortal(<AnimatePresence>{expanded && preview && (preview.preview || preview.videoSrc) && <motion.div key={preview.id} data-theme={theme} className="jui-preview-sidebar-preview" style={{ x, y }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.14 }} aria-hidden="true">
      {preview.preview ?? <video src={preview.videoSrc} autoPlay={!reduced} muted loop playsInline preload="metadata"/>}
    </motion.div>}</AnimatePresence>, document.body)}
  </div>;
}
