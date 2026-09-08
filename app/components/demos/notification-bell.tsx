"use client";
import { useRef, useState } from "react";
import { motion, useDragControls, useReducedMotion } from "motion/react";
import { GripVertical, Minus, Plus } from "lucide-react";
import { NotificationBell } from "@/components/ui/notification-bell";
import "./notification-bell.css";

const colors = [
  ["red", "红色", "#FF3B30"],
  ["orange", "橙色", "#FF9500"],
  ["green", "绿色", "#34C759"],
  ["blue", "蓝色", "#007AFF"],
  ["violet", "紫色", "#AF52DE"],
] as const;
export default function Demo() {
  const [count, setCount] = useState(8);
  const [color, setColor] = useState<(typeof colors)[number][0]>("red");
  const preview = useRef<HTMLDivElement>(null);
  const drag = useDragControls();
  const reduced = useReducedMotion();
  return (
    <div className="demo-notification-bell" ref={preview}>
      <div className="demo-bell-center">
        <NotificationBell count={count} size={72} color={color} />
        <div className="demo-bell-steps">
          <button
            type="button"
            onClick={() => setCount((value) => Math.max(0, value - 1))}
            disabled={count === 0}
            aria-label="减少一条通知"
          >
            <Minus size={18} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => setCount((value) => value + 1)}
            aria-label="增加一条通知"
          >
            <Plus size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>
      <motion.div
        className="demo-bell-palette"
        role="group"
        aria-label="通知徽标颜色"
        drag
        dragControls={drag}
        dragListener={false}
        dragConstraints={preview}
        dragMomentum={false}
        dragElastic={0}
        whileDrag={reduced ? undefined : { scale: 1.03 }}
      >
        <span
          className="demo-bell-grip"
          aria-hidden="true"
          onPointerDown={(event) => drag.start(event)}
        >
          <GripVertical size={18} />
        </span>
        {colors.map(([value, label, background]) => (
          <button
            key={value}
            type="button"
            aria-label={`设为${label}`}
            title={label}
            aria-pressed={color === value}
            onClick={() => setColor(value)}
            style={{ background }}
          />
        ))}
      </motion.div>
    </div>
  );
}
