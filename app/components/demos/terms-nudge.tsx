"use client";
import { useState } from "react";
import { TermsNudge } from "@/components/ui/terms-nudge";
import "./terms-nudge.css";

export default function Demo() {
  const [mode, setMode] = useState<"bad" | "good">("bad");
  const [accepted, setAccepted] = useState(false);
  const [revision, setRevision] = useState(0);
  function selectMode(nextMode: "bad" | "good") {
    setMode(nextMode);
    setRevision((value) => value + 1);
  }
  return (
    <div className="nudge-comparison">
      <div className="nudge-comparison-card">
        <TermsNudge
          key={revision}
          feedback={mode === "good" ? "nudge" : "message"}
          checked={accepted}
          onCheckedChange={setAccepted}
        />
        <div
          className="nudge-comparison-switch"
          role="group"
          aria-label="反馈模式对比"
        >
          <button
            type="button"
            className={mode === "bad" ? "is-active" : ""}
            aria-pressed={mode === "bad"}
            onClick={() => selectMode("bad")}
          >
            Bad
          </button>
          <button
            type="button"
            className={mode === "good" ? "is-active" : ""}
            aria-pressed={mode === "good"}
            onClick={() => selectMode("good")}
          >
            Good
          </button>
        </div>
      </div>
      <div className="nudge-comparison-caption">
        <div className="nudge-comparison-name">
          条款错误提示 · Nudge Instead
        </div>
        <div className="nudge-comparison-note">
          Bad：红字打断。Good：只让未勾选项轻轻动一下。
        </div>
      </div>
    </div>
  );
}
