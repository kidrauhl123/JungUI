"use client";
import { LiquidCursorGradient } from "@/components/ui/liquid-cursor-gradient";
import type { DemoProps } from "@/lib/catalog-types";
import "./liquid-cursor-gradient-demo.css";

export default function Demo({ compact }: DemoProps) {
  return (
    <LiquidCursorGradient className="demo-liquid-cursor" data-compact={compact}>
      <div className="demo-liquid-cursor__copy">
        <span>NEW · Creative Components</span>
        <strong>Liquid cursor gradients to enhance your UI</strong>
        <div>
          <button type="button">Get started</button>
          <button type="button">Learn more</button>
        </div>
      </div>
    </LiquidCursorGradient>
  );
}
