"use client";

import { useState } from "react";
import { c, ink } from "@/lib/colors";
import { MIXED } from "@/types/slides";
import type { MixedValue } from "@/types/slides";

interface Option<T> {
  label: string;
  value: T;
}

interface Props<T extends string | number> {
  value: T | MixedValue;
  options: Option<T>[];
  label: string;
  onChange: (v: T) => void;
}

export function SelectInput<T extends string | number>({
  value,
  options,
  label,
  onChange,
}: Props<T>) {
  const [focused, setFocused] = useState(false);
  const isMixed = value === MIXED;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <span
        style={{
          fontSize: 11,
          color: ink(0.85),
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      <div
        style={{
          position: "relative",
          border: `1px solid ${focused ? c.brand : ink(0.1)}`,
          borderRadius: 5,
          height: 28,
          background: c.surface,
          boxShadow: focused ? `0 0 0 2px ${c.brandGhost}` : "none",
          transition: "border-color 0.1s, box-shadow 0.1s",
        }}
      >
        <select
          value={isMixed ? "" : String(value)}
          onChange={(e) => {
            const opt = options.find((o) => String(o.value) === e.target.value);
            if (opt) onChange(opt.value);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 12,
            color: isMixed ? ink(0.3) : c.ink,
            fontStyle: isMixed ? "italic" : "normal",
            padding: "0 6px",
            cursor: "pointer",
            appearance: "none",
            WebkitAppearance: "none",
          }}
        >
          {isMixed && (
            <option value="" disabled>
              Mixed
            </option>
          )}
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <div
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: ink(0.35),
            fontSize: 10,
            lineHeight: 1,
          }}
        >
          ▾
        </div>
      </div>
    </div>
  );
}
