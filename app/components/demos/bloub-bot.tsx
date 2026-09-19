"use client";

import { useState } from "react";
import { BloubBot } from "@/components/ui/bloub-bot";
import type { DemoProps } from "@/lib/catalog-types";
import { COLORS, DEFAULT_COLOR, SHAPES } from "@/lib/bloub/skins";
import { STATES } from "@/lib/bloub/states";

const PLAYABLE = STATES.filter((s) => s.id !== "swirl").map((s) => s.id);

export default function Demo({ compact }: DemoProps) {
  const [shape, setShape] = useState("chat");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [state, setState] = useState("idle");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: compact ? 16 : 24,
        padding: compact ? 12 : 24,
      }}
    >
      <BloubBot
        size={compact ? 160 : 280}
        shape={shape}
        color={color}
        state={state}
        paper="#f4f2ee"
      />
      {!compact ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            maxWidth: 420,
            alignItems: "center",
          }}
        >
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.id}
              aria-label={c.id}
              onClick={() => setColor(c.id)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                border:
                  color === c.id ? "2px solid #111" : "1px solid #ccc",
                background: c.hex,
                cursor: "pointer",
                boxShadow:
                  color === c.id ? "0 0 0 2px #fff, 0 0 0 4px #111" : "none",
              }}
            />
          ))}
        </div>
      ) : null}
      {!compact ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            maxWidth: 420,
          }}
        >
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setShape(s.id)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border:
                  shape === s.id ? "1px solid #111" : "1px solid #ccc",
                background: shape === s.id ? "#111" : "#fff",
                color: shape === s.id ? "#fff" : "#111",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {s.id}
            </button>
          ))}
        </div>
      ) : null}
      {!compact ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            maxWidth: 480,
          }}
        >
          {PLAYABLE.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setState(id)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border:
                  state === id ? "1px solid #111" : "1px solid #ccc",
                background: state === id ? "#111" : "#fff",
                color: state === id ? "#fff" : "#111",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {id}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}