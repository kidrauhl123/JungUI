"use client";

import { useState } from "react";
import { AllSet, allSetFonts, type AllSetFont, type AllSetMotion } from "@/components/ui/all-set";
import type { DemoProps } from "@/lib/catalog-types";
import "./all-set-demo.css";

const copies = [
  { id: "en", label: "英文", title: "You're all set" },
  { id: "zh", label: "中文", title: "一切就绪" },
] as const;

const motions: { id: AllSetMotion; label: string }[] = [
  { id: "wipe", label: "揭开" },
  { id: "handwriting", label: "手写" },
];

export default function Demo({ compact }: DemoProps) {
  const [play, setPlay] = useState(0);
  const [copy, setCopy] = useState<(typeof copies)[number]["id"]>("en");
  const [font, setFont] = useState<AllSetFont>("sans");
  const [motion, setMotion] = useState<AllSetMotion>("wipe");
  const title = copies.find((item) => item.id === copy)?.title ?? copies[0].title;
  if (compact) return <AllSet title="You're all set" actionLabel="Open JungUI" />;
  return (
    <div className="demo-all-set">
      <div className="demo-all-set-stage">
        <AllSet
          key={`${play}-${copy}-${font}-${motion}`}
          title={title}
          actionLabel="Open JungUI"
          font={font}
          motion={motion}
        />
        <button type="button" className="demo-all-set-replay" onClick={() => setPlay((value) => value + 1)}>
          Replay
        </button>
      </div>
      <div className="demo-all-set-options">
        <fieldset>
          <legend>文案</legend>
          {copies.map((item) => (
            <button key={item.id} type="button" aria-pressed={copy === item.id} onClick={() => setCopy(item.id)}>
              {item.label}
            </button>
          ))}
        </fieldset>
        <fieldset>
          <legend>字体</legend>
          {allSetFonts.map((item) => (
            <button key={item.id} type="button" aria-pressed={font === item.id} onClick={() => setFont(item.id)}>
              {item.label}
            </button>
          ))}
        </fieldset>
        <fieldset>
          <legend>动效</legend>
          {motions.map((item) => (
            <button key={item.id} type="button" aria-pressed={motion === item.id} onClick={() => setMotion(item.id)}>
              {item.label}
            </button>
          ))}
        </fieldset>
      </div>
    </div>
  );
}
