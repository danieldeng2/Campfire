"use client";

import { useState } from "react";
import { c, ink } from "@/lib/colors";
import { MIXED } from "@/types/slides";
import type { MixedValue } from "@/types/slides";

interface Props {
  value: number | MixedValue;
  label: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}

export function NumberInput({ value, label, unit, min, max, step = 1, onChange }: Props) {
  const [focused, setFocused] = useState(false);
  const isMixed = value === MIXED;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <span
        style={{
          fontSize: 10,
          color: ink(0.6),
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: `1px solid ${focused ? c.brand : ink(0.1)}`,
          borderRadius: 5,
          height: 28,
          background: c.surface,
          boxShadow: focused ? `0 0 0 2px ${c.brandGhost}` : "none",
          overflow: "hidden",
          transition: "border-color 0.1s, box-shadow 0.1s",
        }}
      >
        <input
          type="number"
          value={isMixed ? "" : value}
          placeholder={isMixed ? "Mixed" : undefined}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 12,
            color: isMixed ? ink(0.3) : c.ink,
            fontStyle: isMixed ? "italic" : "normal",
            padding: "0 8px",
            height: "100%",
            width: "100%",
            minWidth: 0,
          }}
        />
        {unit && (
          <span
            style={{
              fontSize: 11,
              color: ink(0.35),
              paddingRight: 6,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
