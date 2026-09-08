"use client";

/*
Adapted from Rare UI — https://github.com/swamimalode07/rare-ui
MIT License

Copyright (c) 2026 Swami Malode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { useRef, useState, type ComponentProps } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import "./otp-input.css";

const PATTERNS = {
  numbers: /^[0-9]$/,
  letters: /^[a-zA-Z]$/,
  both: /^[a-zA-Z0-9]$/,
} as const;

// success draws its own ring in svg, so no css ring here
const RING = {
  idle: "jui-otp-idle",
  success: "",
  error: "jui-otp-error",
} as const;

const SUCCESS = "#34C759";

const SIZES = {
  sm: {
    box: "jui-otp-sm",
    text: "jui-otp-text-sm",
    caret: "jui-otp-caret-sm",
    gap: "jui-otp-gap-sm",
    px: 40,
    radius: 8,
  },
  md: {
    box: "jui-otp-md",
    text: "jui-otp-text-md",
    caret: "jui-otp-caret-md",
    gap: "jui-otp-gap-md",
    px: 48,
    radius: 12,
  },
  lg: {
    box: "jui-otp-lg",
    text: "jui-otp-text-lg",
    caret: "jui-otp-caret-lg",
    gap: "jui-otp-gap-lg",
    px: 56,
    radius: 16,
  },
} as const;

const SLOT_CLASS = "jui-otp-slot";

const ROLL_SPRING = { type: "spring", stiffness: 500, damping: 34 } as const;
const CARET_SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;
const BLINK = {
  duration: 1.1,
  times: [0, 0.5, 0.5, 1],
  repeat: Infinity,
  ease: "linear" as const,
};

const ROLL = {
  initial: { y: "110%" },
  exit: (cleared: boolean) => ({ y: cleared ? "110%" : "-110%" }),
};

const SHAKE = [0, -5, 4, -2, 0];

const toSlots = (code: string, length: number) =>
  Array.from({ length }, (_, i) => code[i] ?? "");

export type OtpStatus = "idle" | "success" | "error";

export type OtpInputProps = Omit<
  ComponentProps<"div">,
  "onChange" | "value" | "defaultValue"
> & {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  type?: keyof typeof PATTERNS;
  size?: keyof typeof SIZES;
  status?: OtpStatus;
  mask?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  slotClassName?: string;
};

export function OtpInput({
  length = 6,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  type = "numbers",
  size = "md",
  status = "idle",
  mask = false,
  disabled,
  autoFocus,
  className,
  slotClassName,
  ...props
}: OtpInputProps) {
  const [uncontrolled, setUncontrolled] = useState(() =>
    toSlots(defaultValue, length),
  );
  const [cleared, setCleared] = useState(false);
  const [focused, setFocused] = useState<number | null>(null);
  const [caretX, setCaretX] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const cells = useRef<(HTMLDivElement | null)[]>([]);
  // the slot the user deliberately moved to, so a full code only changes on purpose
  const editingAt = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  // padded, not joined: joining would close a gap left by a mid-code backspace
  const slots =
    value === undefined
      ? Array.from({ length }, (_, i) => uncontrolled[i] ?? "")
      : toSlots(value, length);
  const numeric = type === "numbers";
  const scale = SIZES[size];
  const caretVisible = focused !== null && !slots[focused];

  const commit = (next: string[]) => {
    if (value === undefined) setUncontrolled(next);
    const code = next.join("");
    onChange?.(code);
    if (next.every(Boolean)) onComplete?.(code);
  };

  const setCharAt = (index: number, char: string) => {
    setCleared(!char);
    commit(slots.map((slot, i) => (i === index ? char : slot)));
  };

  const focusAt = (index: number) => {
    const input = inputs.current[Math.min(Math.max(index, 0), length - 1)];
    input?.focus();
    input?.select();
  };

  const fill = (index: number, chars: string[]) => {
    const room = Math.min(chars.length, length - index);
    const next = [...slots];
    chars.slice(0, room).forEach((char, i) => {
      next[index + i] = char;
    });
    setCleared(false);
    commit(next);
    editingAt.current = null;
    focusAt(index + room);
  };

  const handleChange = (index: number, raw: string) => {
    if (!raw) {
      setCharAt(index, "");
      return;
    }
    const chars = raw.split("").filter((char) => PATTERNS[type].test(char));
    if (!chars.length) return;

    // typing into a filled slot appends, so keep only the new character
    const typed =
      chars.length === 1
        ? chars[0]
        : chars.length === 2 && chars[0] === slots[index]
          ? chars[1]
          : null;

    if (typed === null) {
      // anything longer arrived at once: a paste or an SMS autofill
      fill(index, chars);
      return;
    }

    if (slots.every(Boolean) && editingAt.current !== index) return;

    setCharAt(index, typed);
    editingAt.current = null;
    focusAt(index + 1);
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => {
        editingAt.current = Math.max(index - 1, 0);
        focusAt(index - 1);
      },
      ArrowRight: () => {
        editingAt.current = Math.min(index + 1, length - 1);
        focusAt(index + 1);
      },
      Backspace: () => {
        if (slots[index]) {
          setCharAt(index, "");
        } else if (index > 0) {
          setCharAt(index - 1, "");
          focusAt(index - 1);
        }
      },
    };

    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .split("")
      .filter((char) => PATTERNS[type].test(char));
    if (pasted.length) fill(index, pasted);
  };

  // clicking past the first gap lands on the gap, so a code stays contiguous
  const handlePointerDown = (
    index: number,
    event: React.PointerEvent<HTMLInputElement>,
  ) => {
    const firstEmpty = slots.findIndex((slot) => !slot);
    const target = firstEmpty === -1 ? index : Math.min(index, firstEmpty);
    editingAt.current = target;
    if (target === index) return;
    event.preventDefault();
    focusAt(target);
  };

  return (
    <div
      data-slot="otp-input"
      data-status={status}
      className={cn("jui-otp", className)}
      {...props}
    >
      <motion.div
        onFocus={(event) => {
          const index = inputs.current.indexOf(
            event.target as HTMLInputElement,
          );
          const cell = cells.current[index];
          setFocused(index);
          if (cell) setCaretX(cell.offsetLeft + cell.offsetWidth / 2);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setFocused(null);
          }
        }}
        animate={{
          x: status === "error" && !reduceMotion ? SHAKE : 0,
        }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        data-slot="otp-input-row"
        className={cn("jui-otp-row", scale.gap)}
      >
        {slots.map((slot, index) => (
          <div
            key={index}
            ref={(el) => {
              cells.current[index] = el;
            }}
            data-slot="otp-input-cell"
            data-filled={Boolean(slot)}
            className="jui-otp-cell"
          >
            <input
              ref={(el) => {
                inputs.current[index] = el;
              }}
              data-slot="otp-input-slot"
              data-filled={Boolean(slot)}
              value={slot}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={(event) => handlePaste(index, event)}
              onPointerDown={(event) => handlePointerDown(index, event)}
              onFocus={(event) => event.target.select()}
              type={mask ? "password" : "text"}
              inputMode={numeric ? "numeric" : "text"}
              autoCapitalize={numeric ? undefined : "characters"}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              autoFocus={autoFocus && index === 0}
              disabled={disabled}
              aria-invalid={status === "error"}
              aria-label={`${numeric ? "Digit" : "Character"} ${index + 1} of ${length}`}
              className={cn(
                SLOT_CLASS,
                scale.box,
                scale.text,
                RING[status],
                slotClassName,
              )}
            />

            <AnimatePresence>
              {status === "success" && (
                <motion.svg
                  aria-hidden
                  data-slot="otp-input-ring"
                  viewBox={`0 0 ${scale.px} ${scale.px}`}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="jui-otp-ring"
                >
                  <motion.rect
                    x={1}
                    y={1}
                    width={scale.px - 2}
                    height={scale.px - 2}
                    rx={scale.radius - 1}
                    fill="none"
                    stroke={SUCCESS}
                    strokeWidth={2}
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.45,
                            ease: "easeOut",
                            delay: 0.15 + index * 0.05,
                          }
                    }
                  />
                </motion.svg>
              )}
            </AnimatePresence>

            <span className="jui-otp-overlay" aria-hidden="true">
              <AnimatePresence initial={false} custom={cleared}>
                {slot && (
                  <motion.span
                    key={slot}
                    custom={cleared}
                    variants={ROLL}
                    initial={reduceMotion ? false : "initial"}
                    animate={{ y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : "exit"}
                    transition={reduceMotion ? { duration: 0 } : ROLL_SPRING}
                    data-slot="otp-input-char"
                    className={cn("jui-otp-char", scale.text)}
                  >
                    {mask ? "•" : slot}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </div>
        ))}

        {caretVisible && (
          <motion.span
            aria-hidden
            data-slot="otp-input-caret"
            initial={false}
            animate={{
              x: caretX - 1,
              y: "-50%",
              opacity: reduceMotion ? 1 : [1, 1, 0, 0],
            }}
            transition={{
              x: reduceMotion ? { duration: 0 } : CARET_SPRING,
              opacity: reduceMotion ? { duration: 0 } : BLINK,
            }}
            className={cn("jui-otp-caret", scale.caret)}
          />
        )}
      </motion.div>
    </div>
  );
}

export default OtpInput;
