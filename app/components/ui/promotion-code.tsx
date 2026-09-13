"use client";

import { useId, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import "./promotion-code.css";

export type PromotionCodeProps = Omit<ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "size"> & {
  theme?: "light" | "dark";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onApply?: (code: string) => void;
  applyLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  error?: string;
  success?: boolean;
  successLabel?: string;
};

/** A compact input that expands in place when focused. */
export function PromotionCode({
  theme = "light", value, defaultValue = "", onValueChange, onApply,
  placeholder = "Add promotion code", applyLabel = "Apply",
  loadingLabel = "Applying…", loading = false, error, success = false, successLabel = "Applied",
  className, disabled, readOnly, id, onFocus, onBlur, onKeyDown,
  "aria-describedby": describedBy, ...props
}: PromotionCodeProps) {
  const uid = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const code = value ?? internalValue;
  const expanded = focused || code.length > 0 || loading || !!error || success;
  const canApply = !!code.trim() && !disabled && !readOnly && !loading && !success;
  const errorId = `${uid}-error`;
  function apply() { if (canApply) onApply?.(code.trim()); }
  return (
    <div data-slot="promotion-code" data-theme={theme} className={cn("jui-promotion-code", className)} data-status={loading ? "loading" : error ? "error" : success ? "success" : "idle"} data-expanded={expanded} data-has-value={!!code.trim()} data-disabled={disabled || undefined} aria-busy={loading}>
      <div className="jui-promotion-code-field" onFocus={() => setFocused(true)} onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}>
        <span className="jui-promotion-code-measure" aria-hidden="true">{placeholder}</span>
        <input {...props} id={id ?? uid} type="text" size={1} value={code}
          placeholder={placeholder} aria-label={props["aria-label"] ?? placeholder}
          aria-invalid={!!error || props["aria-invalid"]}
          aria-describedby={[describedBy, error ? errorId : null].filter(Boolean).join(" ") || undefined}
          disabled={disabled} readOnly={readOnly || loading} autoComplete={props.autoComplete ?? "off"}
          spellCheck={props.spellCheck ?? false}
          onChange={(event) => { setInternalValue(event.target.value); onValueChange?.(event.target.value); }}
          onFocus={onFocus} onBlur={onBlur}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.nativeEvent.isComposing) return;
            if (event.key === "Enter") { event.preventDefault(); apply(); }
            if (event.key === "Escape") event.currentTarget.blur();
          }} />
        <button className="jui-promotion-code-apply" type="button" onClick={apply}
          disabled={!canApply} aria-label={loading ? loadingLabel : success ? successLabel : applyLabel} aria-hidden={!code.trim() && !loading && !success} tabIndex={code.trim() ? 0 : -1}>
          {loading ? <span className="jui-promotion-code-spinner" aria-hidden="true" /> : success ? <span className="jui-promotion-code-confirmation"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>{successLabel}</span> : applyLabel}
        </button>
      </div>
      <span className="jui-promotion-code-announcement" role="status">{loading ? loadingLabel : success && !error ? successLabel : ""}</span>
      {error && <span className="jui-promotion-code-error" id={errorId} role="alert">{error}</span>}
    </div>
  );
}
