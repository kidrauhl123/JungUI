"use client";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import "./terms-nudge.css";
export type TermsNudgeProps = Omit<ComponentProps<"div">, "onChange"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onContinue?: () => void;
  label?: ReactNode;
  buttonLabel?: string;
  errorMessage?: string;
  feedback?: "nudge" | "message";
  disabled?: boolean;
};
export function TermsNudge({
  checked,
  defaultChecked = false,
  onCheckedChange,
  onContinue,
  label = (
    <>
      I accept the <b>Terms &amp; Conditions</b>
    </>
  ),
  buttonLabel = "下一步",
  errorMessage = "You must accept the Terms & Conditions to continue.",
  feedback = "nudge",
  disabled,
  className,
  ...props
}: TermsNudgeProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const [attempted, setAttempted] = useState(false);
  const row = useRef<HTMLLabelElement>(null);
  const animation = useRef<Animation | null>(null);
  const id = useId();
  const accepted = checked ?? internal;
  const invalid = attempted && !accepted;
  useEffect(() => () => animation.current?.cancel(), []);
  function proceed() {
    if (accepted) {
      setAttempted(false);
      onContinue?.();
      return;
    }
    setAttempted(true);
    animation.current?.cancel();
    if (
      feedback === "nudge" &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      animation.current =
        row.current?.animate(
          [
            { transform: "translateX(0)", offset: 0 },
            { transform: "translateX(-9px)", offset: 0.18 },
            { transform: "translateX(8px)", offset: 0.36 },
            { transform: "translateX(-5px)", offset: 0.54 },
            { transform: "translateX(3px)", offset: 0.72 },
            { transform: "translateX(0)", offset: 1 },
          ].map((frame) => ({
            ...frame,
            easing: "cubic-bezier(.16, 1, .3, 1)",
          })),
          { duration: 420 },
        ) ?? null;
    }
  }
  return (
    <div
      {...props}
      data-slot="terms-nudge"
      className={cn("jui-terms", className)}
    >
      <button
        type="button"
        className="jui-terms-next"
        disabled={disabled}
        onClick={proceed}
      >
        {buttonLabel}
      </button>
      <label
        ref={row}
        className="jui-terms-row"
        data-nudging={(feedback === "nudge" && invalid) || undefined}
      >
        <span className="jui-terms-box" aria-hidden="true">
          {accepted && (
            <svg viewBox="0 0 18 18">
              <path d="m4.2 9.2 3.1 3.1 6.5-7" />
            </svg>
          )}
        </span>
        <input
          type="checkbox"
          checked={accepted}
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={invalid ? id : undefined}
          onChange={(e) => {
            if (checked === undefined) setInternal(e.target.checked);
            onCheckedChange?.(e.target.checked);
            setAttempted(false);
            animation.current?.cancel();
          }}
        />
        <span>{label}</span>
      </label>
      <div className="jui-terms-error">
        <span
          id={id}
          aria-live="polite"
          className={feedback === "nudge" ? "jui-terms-sr" : undefined}
        >
          {invalid ? errorMessage : ""}
        </span>
      </div>
    </div>
  );
}
