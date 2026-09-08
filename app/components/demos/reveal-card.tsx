"use client";
import Link from "next/link";
import { RevealCard } from "@/components/ui/reveal-card";
export default function Demo() {
  return (
    <RevealCard
      title="Take your time."
      brand="JungUI"
      action={<Link href="/components/">浏览组件</Link>}
    >
      <p>留一点空间，让内容慢慢出现。</p>
    </RevealCard>
  );
}
