"use client";

import { useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import "./expandable-card.css";

// Independently implemented. Visual reference: Aceternity UI Expandable Cards.
export type ExpandableCardItem = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  imageAlt?: string;
  content: ReactNode;
  action?: ReactNode;
};
export type ExpandableCardProps = Omit<ComponentProps<"div">, "children"> & {
  items: ExpandableCardItem[];
  variant?: "list" | "grid";
  theme?: "light" | "dark";
  activeId?: string | null;
  defaultActiveId?: string | null;
  onActiveIdChange?: (id: string | null) => void;
  expandLabel?: string;
  closeLabel?: string;
  dialogClassName?: string;
};

export function ExpandableCard({ items, variant = "list", theme = "light", activeId, defaultActiveId = null, onActiveIdChange, expandLabel = "Explore", closeLabel = "Close", className, dialogClassName, ...props }: ExpandableCardProps) {
  const instanceId = useId();
  const reducedMotion = useReducedMotion();
  const [internalId, setInternalId] = useState<string | null>(defaultActiveId);
  const selectedId = activeId === undefined ? internalId : activeId;
  const active = items.find((item) => item.id === selectedId);
  const origin = useRef<HTMLButtonElement | null>(null);
  const root = useRef<HTMLDivElement | null>(null);
  const setActive = (id: string | null) => {
    if (activeId === undefined) setInternalId(id);
    onActiveIdChange?.(id);
  };
  const layoutId = (id: string, part: string) => reducedMotion ? undefined : `${instanceId}-${id}-${part}`;
  const transition = reducedMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 340, damping: 32 };
  const image = (item: ExpandableCardItem) => (
    <motion.div layoutId={layoutId(item.id, "image")} transition={transition} className="jui-expandable-card-image">
      {/* eslint-disable-next-line @next/next/no-img-element -- Portable registry component. */}
      <img src={item.image} alt={item.imageAlt ?? ""} draggable={false} />
    </motion.div>
  );
  return <LayoutGroup id={instanceId}>
    <Dialog.Root open={Boolean(active)} onOpenChange={(open) => { if (!open) setActive(null); }}>
      <div {...props} ref={root} tabIndex={-1} data-slot="expandable-card" data-theme={theme} data-variant={variant} className={cn("jui-expandable-card", className)}>
        {items.map((item) => <motion.button key={item.id} type="button" layoutId={layoutId(item.id, "card")} transition={transition} className="jui-expandable-card-trigger" aria-haspopup="dialog" aria-expanded={active?.id === item.id} onClick={(event) => { origin.current = event.currentTarget; setActive(item.id); }}>
          {image(item)}
          <span className="jui-expandable-card-summary">
            <motion.span layoutId={layoutId(item.id, "title")} transition={transition} className="jui-expandable-card-title">{item.title}</motion.span>
            {item.subtitle && <motion.span layoutId={layoutId(item.id, "subtitle")} transition={transition} className="jui-expandable-card-subtitle">{item.subtitle}</motion.span>}
          </span>
          {variant === "list" && <span className="jui-expandable-card-expand">{expandLabel}</span>}
        </motion.button>)}
      </div>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {active && <Dialog.Overlay forceMount asChild key={active.id}>
            <motion.div layoutRoot className="jui-expandable-card-layer" data-theme={theme} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.25 }}>
              <Dialog.Content forceMount asChild {...(!active.subtitle ? { "aria-describedby": undefined } : {})} onCloseAutoFocus={(event) => {
                event.preventDefault();
                (origin.current?.isConnected ? origin.current : root.current)?.focus({ preventScroll: true });
              }}>
                <motion.div layoutId={layoutId(active.id, "card")} transition={transition} className={cn("jui-expandable-card-dialog", dialogClassName)} data-slot="expandable-card-dialog" data-theme={theme}>
                  {image(active)}
                  <div className="jui-expandable-card-heading">
                    <div className="jui-expandable-card-summary">
                      <Dialog.Title asChild><motion.h2 layoutId={layoutId(active.id, "title")} transition={transition} className="jui-expandable-card-title">{active.title}</motion.h2></Dialog.Title>
                      {active.subtitle && <Dialog.Description asChild><motion.p layoutId={layoutId(active.id, "subtitle")} transition={transition} className="jui-expandable-card-subtitle">{active.subtitle}</motion.p></Dialog.Description>}
                    </div>
                    {active.action && <div className="jui-expandable-card-action">{active.action}</div>}
                  </div>
                  <motion.div className="jui-expandable-card-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.18 }}>{active.content}</motion.div>
                  <Dialog.Close asChild><button type="button" className="jui-expandable-card-close" aria-label={closeLabel}><X size={18} aria-hidden="true" /></button></Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </motion.div>
          </Dialog.Overlay>}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  </LayoutGroup>;
}
