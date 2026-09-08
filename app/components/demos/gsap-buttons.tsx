"use client";
import { StrokeButton, FlairButton } from "@/components/ui/gsap-buttons";
export default function Demo() {
  return (
    <div className="demo-gsap">
      <div className="demo-gsap-dark">
        <StrokeButton />
      </div>
      <div className="demo-gsap-pink">
        <FlairButton />
      </div>
    </div>
  );
}
