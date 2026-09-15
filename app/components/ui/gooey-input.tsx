"use client";

/*
Gooey filter and spring timing adapted from Gooey Search by Oguzhan Tufenk.
https://github.com/oguzhantufenk/gooey-search (README declares MIT)

MIT License
Copyright (c) Oguzhan Tufenk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import "./gooey-input.css";

export type GooeyInputProps = Omit<ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "size"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSearch?: (value: string) => void;
  label?: string;
  searchLabel?: string;
  theme?: "light" | "dark";
  collapsedWidth?: number;
  expandedWidth?: number;
  expandedOffset?: number;
  gooeyBlur?: number;
};

export function GooeyInput({ value, defaultValue = "", onValueChange, open: controlledOpen,
  defaultOpen = false, onOpenChange, onSearch, label = "Search", searchLabel = "Submit search",
  placeholder = "Type to search...", theme = "light", collapsedWidth = 115, expandedWidth = 200,
  expandedOffset = 50, gooeyBlur = 5, className, disabled, readOnly, onKeyDown, id, ...props
}: GooeyInputProps) {
  const uid = useId();
  const filterId = `gooey-${uid.replace(/:/g, "")}`;
  const inputId = id ?? `${filterId}-input`;
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const text = value ?? internalValue;
  const reduced = useReducedMotion();
  const gap = Math.max(44, expandedOffset);
  const width = Math.max(80, expandedWidth);
  const collapsed = Math.max(60, Math.min(collapsedWidth, width + gap));
  const transition = reduced ? { duration: 0 } : { type: "spring" as const, duration: .75, bounce: .15 };
  function setOpen(next: boolean) {
    if (disabled || next === open) return;
    setInternalOpen(next);
    onOpenChange?.(next);
  }
  useEffect(() => {
    if (open && !disabled) input.current?.focus({ preventScroll: true });
    if (!open && restoreFocus.current) { trigger.current?.focus({ preventScroll: true }); restoreFocus.current = false; }
  }, [open, disabled]);
  function search() { if (!disabled && !readOnly && text.trim()) onSearch?.(text.trim()); }
  return <div ref={root} data-slot="gooey-input" data-theme={theme} data-open={open} data-disabled={disabled || undefined}
    className={cn("jui-gooey-input", className)} style={{ width: width + gap }}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <svg className="jui-gooey-defs" aria-hidden="true"><defs><filter id={filterId} x="-50%" y="-100%" width="200%" height="300%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(0, gooeyBlur)} result="blur" />
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -15" result="goo" />
      <feComposite in="SourceGraphic" in2="goo" operator="atop" />
    </filter></defs></svg>
    <div className="jui-gooey-surfaces" style={{ filter: reduced ? "none" : `url(#${filterId})` }} aria-hidden="true">
      <motion.div className="jui-gooey-surface jui-gooey-pill" initial={false}
        animate={{ left: open ? gap : (width + gap - collapsed) / 2, width: open ? width : collapsed }} transition={transition} />
      <motion.div className="jui-gooey-surface jui-gooey-drop" initial={false}
        animate={{ left: open ? 0 : (width + gap - collapsed) / 2, scale: open ? 1 : .75 }} transition={transition} />
    </div>
    <motion.div className="jui-gooey-field" initial={false}
      animate={{ left: open ? gap : (width + gap - collapsed) / 2, width: open ? width : collapsed }} transition={transition}>
      {open ? <input {...props} ref={input} id={inputId} type="search" placeholder={placeholder}
        aria-label={props["aria-label"] ?? label} disabled={disabled} readOnly={readOnly} value={text}
        onChange={(event) => { setInternalValue(event.target.value); onValueChange?.(event.target.value); }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.nativeEvent.isComposing) return;
          if (event.key === "Enter") { event.preventDefault(); search(); }
          if (event.key === "Escape") { event.preventDefault(); restoreFocus.current = true; setOpen(false); }
        }} /> : <button ref={trigger} className="jui-gooey-trigger" type="button" disabled={disabled} aria-expanded={false} onClick={() => setOpen(true)}>
        <Search size={16} aria-hidden="true" /><span>{label}</span>
      </button>}
    </motion.div>
    <motion.button className="jui-gooey-submit" type="button" initial={false} aria-label={searchLabel}
      animate={{ opacity: open ? 1 : 0, left: open ? 0 : (width + gap - collapsed) / 2 }} transition={transition}
      tabIndex={open ? 0 : -1} aria-hidden={!open} disabled={!open || disabled || readOnly} onClick={search}>
      <Search size={18} aria-hidden="true" />
    </motion.button>
  </div>;
}
