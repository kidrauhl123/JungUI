"use client";
import { useState } from "react";
import { OtpInput, type OtpStatus } from "@/components/ui/otp-input";
import "./otp-input.css";

const CORRECT_CODE = "123456";
export default function Demo() {
  const [status, setStatus] = useState<OtpStatus>("idle");
  return (
    <div className="demo-otp">
      <OtpInput
        length={6}
        size="md"
        status={status}
        onChange={() => setStatus("idle")}
        onComplete={(code) =>
          setStatus(code === CORRECT_CODE ? "success" : "error")
        }
      />
      <p>输入 {CORRECT_CODE} 通过验证，其他组合会提示错误。</p>
    </div>
  );
}
