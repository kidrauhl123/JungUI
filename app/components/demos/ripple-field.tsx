"use client";
import { RippleField } from "@/components/ui/ripple-field";
export default function Demo() {
  return (
    <div className="demo-ripple">
      <RippleField
        width={560}
        height={280}
        lines={16}
        stroke="#2f7bd4"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
