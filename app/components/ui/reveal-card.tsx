"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RippleField } from "@/components/ui/ripple-field";
import "./reveal-card.css";
export type RevealCardProps = Omit<ComponentProps<"article">, "title"> & {
  title: ReactNode;
  brand?: ReactNode;
  action?: ReactNode;
  background?: ReactNode;
};
export function RevealCard({
  title,
  brand,
  action,
  background,
  children,
  className,
  ...props
}: RevealCardProps) {
  const reduced = useReducedMotion();
  return (
    <article
      {...props}
      data-slot="reveal-card"
      className={cn("jui-reveal", className)}
    >
      {background ?? <RippleField className="jui-reveal-waves" />}
      {brand && <span className="jui-reveal-brand">{brand}</span>}
      <motion.div
        className="jui-reveal-sheet"
        initial={reduced ? false : { y: 0 }}
        whileInView={{ y: "20%" }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: reduced ? 0 : 0.66, ease: [0.16, 1, 0.3, 1] }}
      >
        <h3>{title}</h3>
        <motion.div
          initial={reduced ? false : { opacity: 0, filter: "blur(7px)", y: 7 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: reduced ? 0 : 0.55,
            delay: reduced ? 0 : 0.3,
          }}
        >
          {children}
          {action && <div className="jui-reveal-action">{action}</div>}
        </motion.div>
      </motion.div>
    </article>
  );
}
