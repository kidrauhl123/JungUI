"use client";
import { useState } from "react";
import { BaseCtaButton } from "@/components/ui/base-cta-button";
export default function Demo() {
  const [count, setCount] = useState(0);
  return (
    <div className="demo-column">
      <BaseCtaButton onClick={() => setCount((v) => v + 1)}>
        Start building
      </BaseCtaButton>
      <span className="demo-result" role="status">
        {count ? `已点击 ${count} 次` : ""}
      </span>
    </div>
  );
}
