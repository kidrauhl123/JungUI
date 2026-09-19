"use client";

/*
Adapted from jeremy-prt/bloub — https://github.com/jeremy-prt/bloub
MIT License. Not affiliated with x.ai.

The animation engine under @/lib/bloub is framework-free TypeScript.
This file is the React shell for JungUI install / preview.
*/

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { BotEngine, type BotFrame } from "@/lib/bloub/engine";
import { NOTIF_BLUE } from "@/lib/bloub/decor";
import {
  DEFAULT_EXPRESSION,
  EXPRESSION_BY_ID,
} from "@/lib/bloub/expressions";
import { DEMI_VIEWBOX, RAYON } from "@/lib/bloub/repere";
import {
  COLOR_BY_ID,
  DEFAULT_COLOR,
  DEFAULT_SHAPE,
  SHAPE_BY_ID,
  mixHex,
  type ShapeId,
} from "@/lib/bloub/skins";
import type { StateId } from "@/lib/bloub/states";
import { cn } from "@/lib/utils";
import "./bloub-bot.css";

export type BloubBotProps = {
  /** Display size in CSS pixels. */
  size?: number;
  /** Customiser shape id (`cercle`, `galet`, …). Default circle, matching upstream bloub. */
  shape?: string;
  /** Body colour id. */
  color?: string;
  /** Rest expression id. */
  expression?: string;
  /** Page/paper colour behind eye holes. */
  paper?: string;
  /** Freeze at this time (seconds) within the current state — no rAF. */
  frozenAt?: number;
  /** Animation state id (`idle`, `orbit`, …). */
  state?: string;
  /** When true (and not frozen), advance the engine clock. */
  playing?: boolean;
  className?: string;
  style?: CSSProperties;
};

function inkOf(color: string) {
  return COLOR_BY_ID.get(color)?.hex ?? "#0a0a0c";
}

function radiiOf(shape: string) {
  return SHAPE_BY_ID.get(shape)?.radii ?? SHAPE_BY_ID.get(DEFAULT_SHAPE)!.radii;
}

function expressionOf(id: string) {
  return (
    EXPRESSION_BY_ID.get(id) ??
    EXPRESSION_BY_ID.get(DEFAULT_EXPRESSION) ??
    null
  );
}

function dotAttrs(
  dot: BotFrame["dots"][number],
  ink: string,
  paper: string,
) {
  const fill =
    dot.color ??
    (dot.depth === undefined ? ink : mixHex(paper, ink, dot.depth));
  const common = { fill, opacity: dot.opacity };
  if (dot.d) {
    return {
      ...common,
      d: dot.d,
      transform: `translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${RAYON})`,
    };
  }
  return { ...common, cx: dot.x, cy: dot.y, r: dot.r };
}

function syncEngine(
  engine: BotEngine,
  clock: number,
  radii: number[],
  expr: ReturnType<typeof expressionOf>,
  state: string,
) {
  engine.setShape(radii, clock);
  engine.setExpression(expr, clock);
  if (engine.state !== state) {
    engine.setState(state as StateId, clock);
  }
}

export function BloubBot({
  size = 280,
  shape = DEFAULT_SHAPE,
  color = DEFAULT_COLOR,
  expression = DEFAULT_EXPRESSION,
  paper = "#f9f9f9",
  frozenAt,
  state = "idle",
  playing = true,
  className,
  style,
}: BloubBotProps) {
  const reactId = useId().replace(/:/g, "");
  const maskId = `bot-mask-${reactId}`;
  const uid = `bot-${reactId}`;

  const ink = inkOf(color);
  const radii = useMemo(() => radiiOf(shape), [shape]);
  const expr = useMemo(() => expressionOf(expression), [expression]);

  const [engine] = useState(
    () => new BotEngine(RAYON, state as StateId, radii, expr),
  );

  const [liveFrame, setLiveFrame] = useState<BotFrame>(() => {
    syncEngine(engine, 0, radii, expr, state);
    return engine.sample(frozenAt ?? 0);
  });

  useEffect(() => {
    if (frozenAt !== undefined) return;
    if (!playing) return;

    let raf = 0;
    let last = 0;
    let clock = 0;

    const tick = (ms: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((ms - last) / 1000, 0.064) : 0;
      last = ms;
      clock += dt;
      syncEngine(engine, clock, radii, expr, state);
      setLiveFrame(engine.sample(clock));
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engine, frozenAt, playing, radii, expr, state]);

  const frame =
    frozenAt !== undefined
      ? (() => {
          syncEngine(engine, frozenAt, radii, expr, state);
          return engine.sample(frozenAt);
        })()
      : liveFrame;

  const VB = DEMI_VIEWBOX;
  const arcs = frame.arcs;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
      role="img"
      aria-label="Bloub animated avatar"
      data-slot="bloub-bot"
      data-shape={shape as ShapeId}
      className={cn("jui-bloub-bot", className)}
      style={style}
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={-VB}
          y={-VB}
          width={VB * 2}
          height={VB * 2}
        >
          <path d={frame.bodyPath} fill="#fff" />
          {frame.eyes.map((eye, i) => (
            <path
              key={i}
              d={eye.d}
              transform={eye.matrix}
              opacity={eye.alpha}
              fill="#000"
            />
          ))}
          {frame.notch ? (
            <circle
              cx={frame.notch.x}
              cy={frame.notch.y}
              r={frame.notch.r}
              fill="#000"
            />
          ) : null}
        </mask>

        {arcs.map((arc) => (
          <linearGradient
            key={arc.id}
            id={`${uid}-${arc.id}`}
            gradientUnits="userSpaceOnUse"
            x1={arc.grad.x1}
            y1={arc.grad.y1}
            x2={arc.grad.x2}
            y2={arc.grad.y2}
          >
            {arc.grad.stops.map((c, i) => (
              <stop
                key={i}
                offset={i / Math.max(arc.grad.stops.length - 1, 1)}
                stopColor={c}
              />
            ))}
          </linearGradient>
        ))}
      </defs>

      <g fill="none" strokeLinecap="round">
        {arcs.map((arc) => (
          <path
            key={`b${arc.id}`}
            d={arc.back}
            stroke={`url(#${uid}-${arc.id})`}
            strokeWidth={arc.width}
            opacity={arc.opacity}
          />
        ))}
      </g>

      {frame.dotsBehind
        ? frame.dots.map((dot, i) => {
            const a = dotAttrs(dot, ink, paper);
            return dot.d ? (
              <path key={`pb${i}`} {...a} />
            ) : (
              <circle key={`pb${i}`} {...a} />
            );
          })
        : null}

      <g opacity={frame.bodyAlpha}>
        <path d={frame.bodyPath} fill={paper} />
        <g mask={`url(#${maskId})`}>
          <rect x={-VB} y={-VB} width={VB * 2} height={VB * 2} fill={ink} />
        </g>
      </g>

      {!frame.dotsBehind
        ? frame.dots.map((dot, i) => {
            const a = dotAttrs(dot, ink, paper);
            return dot.d ? (
              <path key={`pf${i}`} {...a} />
            ) : (
              <circle key={`pf${i}`} {...a} />
            );
          })
        : null}

      {frame.notif ? (
        <circle
          cx={frame.notif.x}
          cy={frame.notif.y}
          r={frame.notif.r}
          fill={NOTIF_BLUE}
        />
      ) : null}

      <g fill="none" strokeLinecap="round">
        {arcs.map((arc) => (
          <path
            key={`f${arc.id}`}
            d={arc.front}
            stroke={`url(#${uid}-${arc.id})`}
            strokeWidth={arc.width}
            opacity={arc.opacity}
          />
        ))}
      </g>
    </svg>
  );
}
