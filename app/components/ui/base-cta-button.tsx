"use client";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import "./base-cta-button.css";
export type BaseCtaButtonProps = ComponentProps<"button">;
export function BaseCtaButton({
  children = "Start building",
  className,
  ...props
}: BaseCtaButtonProps) {
  return (
    <button
      type="button"
      {...props}
      data-slot="base-cta-button"
      className={cn("base-cta", className)}
    >
      <span className="base-cta__chip" aria-hidden="true" />
      <span className="base-cta__label">{children}</span>
      <span className="base-cta__arrow" aria-hidden="true">
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
          <path
            d="M2 8h15M11 2l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
