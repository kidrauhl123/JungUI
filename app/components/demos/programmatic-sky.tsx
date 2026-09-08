"use client";
import { useState } from "react";
import {
  ProgrammaticSky,
  SKY_DEFAULTS,
} from "@/components/ui/programmatic-sky";
import { CopyButton } from "@/components/catalog/copy-button";
import type { DemoProps } from "@/lib/catalog-types";
export default function Demo({ compact }: DemoProps) {
  const [warmth, setWarmth] = useState(SKY_DEFAULTS.warmth);
  const [clouds, setClouds] = useState(SKY_DEFAULTS.clouds);
  const [drift, setDrift] = useState(SKY_DEFAULTS.drift);
  const [direction, setDirection] = useState(0);
  const angle = (direction * Math.PI) / 4;
  const wind: [number, number] = [
    Number(Math.cos(angle).toFixed(3)),
    Number(Math.sin(angle).toFixed(3)),
  ];
  const code = `<ProgrammaticSky warmth={${warmth}} clouds={${clouds}} drift={${drift}} wind={[${wind.join(", ")}]} />`;
  return (
    <div className="demo-column demo-sky">
      <ProgrammaticSky
        warmth={warmth}
        clouds={clouds}
        drift={drift}
        wind={wind}
        className="demo-sky-canvas"
      >
        <div className="demo-sky-label">A little atmosphere.</div>
      </ProgrammaticSky>
      {!compact && (
        <>
          <div className="demo-controls">
            {(
              [
                ["色温", warmth, setWarmth, 1],
                ["云量", clouds, setClouds, 1],
                ["流速", drift, setDrift, 3],
              ] as const
            ).map(([label, value, set, max]) => (
              <label key={label}>
                {label}
                <input
                  type="range"
                  min="0"
                  max={max}
                  step="0.01"
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                />
              </label>
            ))}
            <button onClick={() => setDirection((v) => (v + 1) % 8)}>
              风向 {direction * 45}°
            </button>
          </div>
          <div className="demo-snippet">
            <code>{code}</code>
            <CopyButton value={code} label="复制当前参数" />
          </div>
        </>
      )}
    </div>
  );
}
