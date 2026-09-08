"use client";
import {
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import "./scroll-card-stack.css";
export type ScrollStackItem = {
  id: string;
  content: ReactNode;
  background?: string;
  color?: string;
  rotation?: number;
};
export type ScrollCardStackProps = ComponentProps<"section"> & {
  items: ScrollStackItem[];
  cover: ReactNode;
  background?: string;
};
const ROTATIONS = [0.01, -11, 7, -3.82];
export function ScrollCardStack({
  items,
  cover,
  background = "#a7eb98",
  children,
  className,
  style,
  ...props
}: ScrollCardStackProps) {
  const rootRef = useRef<HTMLElement>(null);
  const rotations = items
    .map((item, i) => item.rotation ?? ROTATIONS[i % ROTATIONS.length])
    .join(",");
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const match = gsap.matchMedia();
    match.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const stage = root.querySelector<HTMLElement>(".maxima-flip-stage")!;
        const coverNode =
          root.querySelector<HTMLElement>(".maxima-cover-card")!;
        const track = root.querySelector<HTMLElement>(".maxima-scroll-track")!;
        const layers = Array.from(
          root.querySelectorAll<HTMLElement>(".maxima-service-layer"),
        );
        const cards = Array.from(
          root.querySelectorAll<HTMLElement>(".maxima-stack-card"),
        );
        const angles = rotations.split(",").map(Number);
        gsap.set(cards, { rotate: 0 });
        gsap.to(coverNode, {
          y: () =>
            (window.innerHeight - coverNode.offsetHeight) / 2 -
            (parseFloat(getComputedStyle(coverNode).top) || 0),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${window.innerHeight}`,
            invalidateOnRefresh: true,
            scrub: true,
          },
        });
        ScrollTrigger.create({
          trigger: root,
          start: () => `top top-=${window.innerHeight}`,
          onEnter: () => {
            gsap.to(stage, {
              rotateY: 180,
              duration: 1,
              ease: "power3.out",
              overwrite: true,
            });
            gsap.to(cards, {
              rotate: (i) => angles[i],
              delay: 0.5,
              duration: 1.2,
              ease: "elastic.out(2, 0.8)",
              overwrite: true,
            });
          },
          onLeaveBack: () => {
            gsap.to(stage, {
              rotateY: 0,
              duration: 1,
              ease: "power3.out",
              overwrite: true,
            });
            gsap.to(cards, { rotate: 0, duration: 0.6, overwrite: true });
          },
        });
        ScrollTrigger.create({
          trigger: track,
          start: "top top",
          end: "bottom center",
          scrub: true,
          onUpdate: (self) => {
            layers.forEach((layer, i) => {
              const phase = gsap.utils.clamp(
                0,
                1,
                gsap.utils.mapRange(
                  i / layers.length,
                  (i + 1.5) / layers.length,
                  0,
                  1,
                  self.progress,
                ),
              );
              gsap.to(layer, {
                yPercent: -100 * phase,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
                overwrite: true,
              });
              gsap.to(cards[i], {
                rotate: angles[i] + phase * 40 * Math.sign(angles[i] || 1),
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
                overwrite: true,
              });
            });
          },
        });
        ScrollTrigger.refresh();
      }, root);
      return () => ctx.revert();
    });
    return () => match.revert();
  }, [rotations]);
  return (
    <section
      {...props}
      ref={rootRef}
      data-slot="scroll-card-stack"
      className={cn("maxima-scroll-root", className)}
      style={
        { background, "--stack-count": items.length, ...style } as CSSProperties
      }
    >
      {children}
      <div className="maxima-scroll-track" />
      <div className="maxima-scroll-sticky">
        <div className="maxima-flip-stage">
          <div className="maxima-flip-face maxima-flip-face--front">
            <article className="maxima-cover-card">{cover}</article>
          </div>
          <div className="maxima-flip-face maxima-flip-face--back">
            <div className="maxima-card-scene">
              {items.map((item, i) => (
                <div
                  className="maxima-service-layer"
                  key={item.id}
                  style={{ zIndex: items.length + 1 - i }}
                >
                  <article
                    className="maxima-stack-card"
                    style={
                      {
                        "--card-bg": item.background ?? "white",
                        "--card-text": item.color ?? "#171717",
                      } as CSSProperties
                    }
                  >
                    {item.content}
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
