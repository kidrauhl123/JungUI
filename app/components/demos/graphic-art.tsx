"use client";
import { GraphicArt } from "@/components/ui/graphic-art";
import type { DemoProps } from "@/lib/catalog-types";
const names = [
  "badge-sunburst",
  "pattern-balloon-red",
  "butterfly-teal",
  "cloud-bubbles",
  "cloud-arch",
  "cloud-pill",
  "cloud-ribbon",
] as const;
export default function Demo({ compact }: DemoProps) {
  return (
    <div className="demo-art-grid">
      {(compact ? names.slice(0, 3) : names).map((name) => (
        <div key={name}>
          <GraphicArt name={name} label={name} />
          {!compact && <span>{name}</span>}
        </div>
      ))}
    </div>
  );
}
