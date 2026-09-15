"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DemoProps } from "@/lib/catalog-types";
export const demos: Record<string, ComponentType<DemoProps>> = {
  "telegraph-text": dynamic(() => import("./telegraph-text")),
  "theme-toggle": dynamic(() => import("./theme-toggle")),
  "terms-nudge": dynamic(() => import("./terms-nudge")),
  "base-cta-button": dynamic(() => import("./base-cta-button")),
  "notification-bell": dynamic(() => import("./notification-bell")),
  "gsap-buttons": dynamic(() => import("./gsap-buttons")),
  "otp-input": dynamic(() => import("./otp-input")),
  "programmatic-sky": dynamic(() => import("./programmatic-sky")),
  "reveal-card": dynamic(() => import("./reveal-card")),
  "ripple-field": dynamic(() => import("./ripple-field")),
  "card-stack": dynamic(() => import("./card-stack")),
  "scroll-card-stack": dynamic(() => import("./scroll-card-stack")),
  "confetti": dynamic(() => import("./confetti")),
  "expandable-card": dynamic(() => import("./expandable-card")),
  "gooey-input": dynamic(() => import("./gooey-input")),
  "promotion-code": dynamic(() => import("./promotion-code")),
};
