"use client";
import { ScrollCardStack } from "@/components/ui/scroll-card-stack";
import { ScrollCardArt } from "./scroll-card-art";
import type { DemoProps } from "@/lib/catalog-types";
const data = [
  {
    id: "skills",
    title: "Adaptive Skills",
    desc: "把复杂流程拆成可以重复练习的小步骤。",
    background: "#00b351",
    color: "#fdcb40",
    art: "badge-sunburst",
  },
  {
    id: "evidence",
    title: "Evidence Based",
    desc: "用清楚的反馈和节奏建立可信的行为模式。",
    background: "#2668fd",
    color: "#fdcb40",
    art: "pattern-balloon-red",
  },
  {
    id: "gentle",
    title: "Gentle Systems",
    desc: "让图形语言参与叙事。",
    background: "#ffffff",
    color: "#00b351",
    art: "butterfly-teal",
  },
  {
    id: "flow",
    title: "Caregiver Flow",
    desc: "留下明确的阶段感和前进感。",
    background: "#fd4401",
    color: "#fff2b7",
    art: "cloud-bubbles",
  },
] as const;
export default function Demo({ compact }: DemoProps) {
  if (compact)
    return (
      <div className="demo-scroll-poster">
        <ScrollCardArt name="pattern-balloon-red" />
        <strong>
          One card.
          <br />
          One moment.
        </strong>
        <span>滚动，逐张展开</span>
      </div>
    );
  const items = data.map((card) => ({
    ...card,
    content: (
      <>
        <h2 className="demo-scroll-title">{card.title}</h2>
        <ScrollCardArt name={card.art} style={{ height: 120, width: 180 }} />
        <p>{card.desc}</p>
      </>
    ),
  }));
  return (
    <div className="demo-scroll-page">
      <ScrollCardStack
        items={items}
        cover={
          <>
            <h2 className="demo-scroll-title">Adaptive Skills Training</h2>
            <span>Ages 3–18</span>
            <ScrollCardArt
              name="pattern-balloon-red"
              style={{ height: 120, width: 160 }}
            />
            <p>Helping kids help themselves through essential life skills.</p>
          </>
        }
      />
      <section className="demo-scroll-ending">
        <ScrollCardArt name="cloud-arch" />
        <h2>
          We believe independence grows when children are supported with care,
          respect, and the freedom to learn at their own pace.
        </h2>
      </section>
    </div>
  );
}
