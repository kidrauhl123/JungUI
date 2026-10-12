"use client";

import { useState } from "react";
import { AllSet } from "@/components/ui/all-set";
import type { DemoProps } from "@/lib/catalog-types";
import "./all-set-demo.css";

export default function Demo({ compact }: DemoProps) {
  const [play, setPlay] = useState(0);
  if (compact) return <AllSet title="You're all set" actionLabel="Open Spotify" />;
  return (
    <div className="demo-all-set">
      <AllSet key={play} actionLabel="Open Spotify" />
      <button type="button" className="demo-all-set-replay" onClick={() => setPlay((value) => value + 1)}>
        Replay
      </button>
    </div>
  );
}
