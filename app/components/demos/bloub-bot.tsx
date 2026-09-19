"use client";

import { useState } from "react";
import { BloubBot } from "@/components/ui/bloub-bot";
import type { DemoProps } from "@/lib/catalog-types";
import { DEFAULT_SHAPE, SHAPES } from "@/lib/bloub/skins";
import { STATES } from "@/lib/bloub/states";

const PLAYABLE = STATES.filter((s) => s.id !== "swirl").map((s) => s.id);

type Stage = "black" | "white";

const STAGE = {
  black: { paper: "#000000", color: "gris", label: "纯黑" },
  white: { paper: "#ffffff", color: "encre", label: "纯白" },
} as const;

export default function Demo({ compact }: DemoProps) {
  const [stage, setStage] = useState<Stage>("black");
  const [shape, setShape] = useState(DEFAULT_SHAPE);
  const [state, setState] = useState("idle");
  const { paper, color } = STAGE[stage];
  const onDark = stage === "black";

  return (
    <div
      className="demo-bloub"
      data-stage={stage}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 14 : 20,
        padding: compact ? 16 : 28,
        width: "100%",
        minHeight: compact ? "100%" : 410,
        boxSizing: "border-box",
        background: paper,
        color: onDark ? "#ddd" : "#222",
      }}
    >
      <BloubBot
        size={compact ? 150 : 260}
        shape={shape}
        color={color}
        state={state}
        paper={paper}
      />
      {!compact ? (
        <div className="demo-bloub-controls">
          <div className="demo-bloub-row" role="group" aria-label="背景">
            {(["black", "white"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStage(key)}
                aria-pressed={stage === key}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border:
                    stage === key
                      ? onDark
                        ? "1px solid #fff"
                        : "1px solid #111"
                      : onDark
                        ? "1px solid #444"
                        : "1px solid #ccc",
                  background:
                    key === "black"
                      ? "#000"
                      : "#fff",
                  color: key === "black" ? "#eee" : "#111",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {STAGE[key].label}
              </button>
            ))}
          </div>
          <div className="demo-bloub-row">
            {SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setShape(s.id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border:
                    shape === s.id
                      ? onDark
                        ? "1px solid #fff"
                        : "1px solid #111"
                      : onDark
                        ? "1px solid #444"
                        : "1px solid #ccc",
                  background:
                    shape === s.id
                      ? onDark
                        ? "#fff"
                        : "#111"
                      : "transparent",
                  color:
                    shape === s.id
                      ? onDark
                        ? "#111"
                        : "#fff"
                      : onDark
                        ? "#ddd"
                        : "#111",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {s.id}
              </button>
            ))}
          </div>
          <div className="demo-bloub-row">
            {PLAYABLE.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setState(id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border:
                    state === id
                      ? onDark
                        ? "1px solid #fff"
                        : "1px solid #111"
                      : onDark
                        ? "1px solid #444"
                        : "1px solid #ccc",
                  background:
                    state === id
                      ? onDark
                        ? "#fff"
                        : "#111"
                      : "transparent",
                  color:
                    state === id
                      ? onDark
                        ? "#111"
                        : "#fff"
                      : onDark
                        ? "#ddd"
                        : "#111",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
