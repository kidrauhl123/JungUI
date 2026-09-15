"use client";
import { useEffect, useLayoutEffect, useId, useRef, useState, type ComponentProps, type ReactNode, type CSSProperties } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import "./command-search.css";

// Independent implementation. Visual reference: Skiper UI's Vercel Command Search.
export type CommandSearchItem = {
  id: string;
  label: string;
  group?: string;
  keywords?: string[];
  icon?: ReactNode;
  hint?: string;
  disabled?: boolean;
};
export type CommandSearchProps = Omit<ComponentProps<"div">, "children" | "onSelect"> & {
  items: CommandSearchItem[];
  onSelect?: (item: CommandSearchItem) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  label?: string;
  emptyLabel?: string;
  shortcut?: string | false;
  theme?: "light" | "dark";
  width?: number;
};
export function CommandSearch({ items, onSelect, open: controlledOpen, defaultOpen = false, onOpenChange, placeholder = "Find...", label = "Command search", emptyLabel = "No results found.", shortcut = "f", theme = "light", width = 384, className, ...props }: CommandSearchProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const anchor = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [placement, setPlacement] = useState({ left: 0, top: 0, listHeight: 300 });
  const open = controlledOpen ?? internalOpen;
  const changeOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    if (next) setQuery("");
    onOpenChange?.(next);
  };
  useEffect(() => {
    if (!shortcut || open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.isComposing || event.metaKey || event.ctrlKey || event.altKey || event.key.toLowerCase() !== shortcut.toLowerCase()) return;
      if (event.target instanceof HTMLElement && (event.target.isContentEditable || event.target.closest("input,textarea,select,[role='textbox']"))) return;
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect || !rect.width || rect.bottom < 0 || rect.top > window.innerHeight) return;
      event.preventDefault();
      if (controlledOpen === undefined) setInternalOpen(true);
      setQuery("");
      onOpenChange?.(true);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [shortcut, open, controlledOpen, onOpenChange]);
  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const rect = anchor.current?.getBoundingClientRect();
      if (!rect) return;
      const panelWidth = Math.min(Math.max(240, width), window.innerWidth - 24);
      const top = Math.max(12, Math.min(rect.top - 8, window.innerHeight - 156));
      setPlacement({ left: Math.max(12, Math.min(rect.left - 16, window.innerWidth - 12 - panelWidth)), top, listHeight: Math.min(300, window.innerHeight - top - 60) });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => { window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure, true); };
  }, [open, width]);
  const groups = Array.from(new Set(items.map((item) => item.group ?? "")));
  // Verified from the public Skiper92 bundle: shared wrapper/icon/center/key,
  // a low-mass spring, and a separately entering list. Anchor measurements must
  // come from the static root, never the button undergoing layout projection.
  const transition = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 450, damping: 25, mass: 0.1 };
  return <LayoutGroup id={id}><MotionConfig transition={transition}><Dialog.Root open={open} onOpenChange={changeOpen}>
    <div {...props} ref={anchor} data-slot="command-search" data-theme={theme} className={cn("jui-command-search", className)}>
      <Dialog.Trigger asChild><motion.button layoutId="wrapper" ref={trigger} type="button" className="jui-command-search-trigger" aria-label={label}>
        <motion.span layoutId="border" className="jui-command-search-border" style={{ borderRadius: 6 }}/>
        <span className="jui-command-search-icon-cell"><motion.span layoutId="icon"><Search size={16} aria-hidden="true"/></motion.span></span>
        <span className="jui-command-search-placeholder"><motion.span layoutId="center">{placeholder}</motion.span></span>
        <motion.span layoutId="wordwrapper" transition={{ duration: reduced ? 0 : 0.1 }} className="jui-command-search-key">{shortcut && <kbd>{shortcut.toUpperCase()}</kbd>}</motion.span>
      </motion.button></Dialog.Trigger>
    </div>
    <AnimatePresence>{open && <Dialog.Portal forceMount>
      <motion.div layoutRoot className="jui-command-search-layer" data-theme={theme}>
        <Dialog.Overlay forceMount className="jui-command-search-backdrop"/>
        <Dialog.Content forceMount asChild aria-describedby={undefined} onOpenAutoFocus={(event) => { event.preventDefault(); input.current?.focus({ preventScroll: true }); }} onCloseAutoFocus={(event) => { event.preventDefault(); trigger.current?.focus({ preventScroll: true }); }}>
          <motion.div layoutId="wrapper" data-slot="command-search-panel" data-theme={theme} className="jui-command-search-panel" style={{ left: placement.left, top: placement.top, "--cs-width": `${Math.max(240, width)}px`, "--cs-list-height": `${placement.listHeight}px`, borderRadius: 12 } as CSSProperties}>
            <Dialog.Title className="jui-command-search-sr-only">{label}</Dialog.Title>
            <span className="jui-command-search-border" style={{ borderRadius: 12 }}/>
            <Command label={label}>
              <div className="jui-command-search-field">
                <span className="jui-command-search-icon-cell"><motion.span layoutId="icon"><Search size={16} aria-hidden="true"/></motion.span></span>
                <motion.span layoutId="center" className="jui-command-search-input"><Command.Input ref={input} value={query} onValueChange={setQuery} placeholder={placeholder} aria-label={label}/></motion.span>
                <motion.span layoutId="wordwrapper" className="jui-command-search-key"><kbd>Esc</kbd></motion.span>
              </div>
              <motion.div className="jui-command-search-results" initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -50 }}>
                <Command.List className="jui-command-search-list">
                  <Command.Empty className="jui-command-search-empty">{emptyLabel}</Command.Empty>
                  {groups.map((group) => <Command.Group key={group} heading={group || undefined}>
                    {items.filter((item) => (item.group ?? "") === group).map((item) => <Command.Item key={item.id} value={item.id} keywords={[item.label, ...(item.keywords ?? [])]} disabled={item.disabled} onSelect={() => onSelect?.(item)}>
                      <span className="jui-command-search-icon">{item.icon ?? <ArrowRight size={16}/>}</span><span>{item.label}</span>{item.hint && <span className="jui-command-search-hint">{item.hint}</span>}
                    </Command.Item>)}
                  </Command.Group>)}
                </Command.List>
              </motion.div>
            </Command>
          </motion.div>
        </Dialog.Content>
      </motion.div>
    </Dialog.Portal>}</AnimatePresence>
  </Dialog.Root></MotionConfig></LayoutGroup>;
}
