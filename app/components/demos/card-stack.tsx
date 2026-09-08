"use client";
import { CardStack } from "@/components/ui/card-stack";
import { RippleField } from "@/components/ui/ripple-field";
import { Bars, Dots, Orbit, TypeLine } from "./card-graphics";
import type { DemoProps } from "@/lib/catalog-types";
const cards = [
  {
    id: "a",
    bg: "#c14a26",
    ink: "#f4e7cf",
    body: "rgba(244,231,207,.72)",
    title: "Patterns\n& Parts",
    desc: "Reusable building blocks I keep coming back to.",
    viz: "bars",
  },
  {
    id: "b",
    bg: "#f5f3ef",
    ink: "#2b2723",
    body: "rgba(43,39,35,.62)",
    title: "Field Notes",
    desc: "Half-formed ideas, caught before they slip away.",
    viz: "type",
  },
  {
    id: "c",
    bg: "#3080ff",
    ink: "#eaf2ff",
    body: "rgba(234,242,255,.8)",
    title: "Signals",
    desc: "How small rules add up to large behavior.",
    viz: "dots",
  },
  {
    id: "d",
    bg: "#1f9d57",
    ink: "#eafff2",
    body: "rgba(234,255,242,.8)",
    title: "Flow",
    desc: "Motion that reveals — never just decoration.",
    viz: "ripple",
  },
  {
    id: "e",
    bg: "#1c1917",
    ink: "#e7e5e4",
    body: "rgba(231,229,228,.66)",
    title: "Deep Work",
    desc: "Fewer things, given full attention.",
    viz: "orbit",
  },
];

export default function Demo({ compact }: DemoProps) {
  const items = cards.map((card) => ({
    ...card,
    graphic: (
      <div style={{ color: card.ink, height: "100%" }}>
        {card.viz === "bars" ? (
          <Bars />
        ) : card.viz === "dots" ? (
          <Dots />
        ) : card.viz === "orbit" ? (
          <Orbit />
        ) : card.viz === "type" ? (
          <TypeLine />
        ) : (
          <RippleField
            stroke={card.ink}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>
    ),
  }));
  if (compact)
    return (
      <div className="demo-card-fan">
        {cards.slice(0, 3).map((card, i) => (
          <div
            key={card.id}
            style={{
              background: card.bg,
              color: card.ink,
              transform: `translateX(${(i - 1) * 72}px) rotate(${(i - 1) * 12}deg)`,
            }}
          >
            <span>{card.title}</span>
            <div>{i === 0 ? <Bars /> : i === 1 ? <Dots /> : <Orbit />}</div>
          </div>
        ))}
      </div>
    );
  return <CardStack items={items} />;
}
