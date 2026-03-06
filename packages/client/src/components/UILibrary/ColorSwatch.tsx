"use client";

import { useRef, useState } from "react";
import { ChevronDown, Pipette } from "lucide-react";
import { c, ink } from "@/lib/colors";
import { MIXED } from "@/types/slides";
import type { MixedValue } from "@/types/slides";
import { COLOR_COLUMNS, NUM_COLS, NUM_ROWS, parseColor, buildColor } from "@/lib/colorUtils";

interface Props {
  value: string | MixedValue;
  onChange: (color: string) => void;
  label?: string;
}

const SPIN_HIDE = `
  .campfire-opacity-input::-webkit-inner-spin-button,
  .campfire-opacity-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
` as const;

interface ColorPickerPanelProps {
  baseHex: string;
  isMixed: boolean;
  onSelectHex: (hex: string) => void;
  onCustomColor: (hex: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

function ColorPickerPanel({
  baseHex,
  isMixed,
  onSelectHex,
  onCustomColor,
  inputRef,
}: ColorPickerPanelProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 8,
        border: `1px solid ${ink(0.08)}`,
        borderRadius: 6,
        background: c.surface,
      }}
    >
      {/* Color grid: columns = hues, rows = shades */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${NUM_ROWS}, 1fr)`,
          gap: 3,
        }}
      >
        {Array.from({ length: NUM_ROWS }, (_, row) =>
          Array.from({ length: NUM_COLS }, (_, col) => {
            const swatchHex = COLOR_COLUMNS[col][row].toLowerCase();
            const isSelected = !isMixed && baseHex === swatchHex;
            return (
              <button
                key={`${col}-${row}`}
                title={swatchHex}
                onClick={() => onSelectHex(swatchHex)}
                style={{
                  aspectRatio: "1",
                  borderRadius: 3,
                  border: `1px solid ${isSelected ? c.brand : ink(0.1)}`,
                  background: swatchHex,
                  cursor: "pointer",
                  padding: 0,
                  outline: isSelected ? `2px solid ${c.brand}` : "none",
                  outlineOffset: 1,
                  transition: "outline 0.1s",
                }}
              />
            );
          })
        )}
      </div>

      {/* Custom color */}
      <button
        onClick={() => inputRef.current?.click()}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          height: 26,
          border: `1px solid ${ink(0.1)}`,
          borderRadius: 5,
          background: c.surface,
          cursor: "pointer",
          fontSize: 11,
          color: ink(0.85),
          fontWeight: 500,
          transition: "border-color 0.1s",
        }}
      >
        <Pipette size={12} />
        Custom color
      </button>

      <input
        ref={inputRef}
        type="color"
        value={isMixed ? "#000000" : baseHex}
        onChange={(e) => onCustomColor(e.target.value)}
        style={{ width: 0, height: 0, opacity: 0, position: "absolute", pointerEvents: "none" }}
        tabIndex={-1}
      />
    </div>
  );
}

export function ColorSwatch({ value, onChange, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const isMixed = value === MIXED;

  const { hex: baseHex, alpha } = isMixed
    ? { hex: "#000000", alpha: 100 }
    : parseColor(value as string);

  function handleHexChange(newHex: string) {
    onChange(buildColor(newHex, alpha));
  }

  function handleAlphaChange(newAlpha: number) {
    const clamped = Math.min(100, Math.max(0, Math.round(newAlpha)));
    onChange(buildColor(baseHex, clamped));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <style>{SPIN_HIDE}</style>
      {label && (
        <span style={{ fontSize: 11, color: ink(0.85), fontWeight: 600, lineHeight: 1 }}>
          {label}
        </span>
      )}

      {/* Color + Opacity row */}
      <div style={{ display: "flex", gap: 6 }}>
        {/* Trigger button */}
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: `1px solid ${open ? c.brand : ink(0.1)}`,
            borderRadius: 5,
            height: 28,
            padding: "0 8px",
            cursor: "pointer",
            background: c.surface,
            boxShadow: open ? `0 0 0 2px ${c.brandGhost}` : "none",
            transition: "border-color 0.1s, box-shadow 0.1s",
            flex: 1,
            minWidth: 0,
            textAlign: "left",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 3,
              border: `1px solid ${ink(0.12)}`,
              flexShrink: 0,
              background: isMixed
                ? `repeating-conic-gradient(${ink(0.15)} 0% 25%, transparent 0% 50%) 0 0 / 8px 8px`
                : (value as string),
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: isMixed ? ink(0.3) : ink(0.85),
              fontStyle: isMixed ? "italic" : "normal",
              fontFamily: isMixed ? "inherit" : "monospace",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {isMixed ? "Mixed" : baseHex}
          </span>
          <ChevronDown
            size={12}
            style={{
              color: ink(0.35),
              flexShrink: 0,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
            }}
          />
        </button>

        {/* Opacity input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: `1px solid ${ink(0.1)}`,
            borderRadius: 5,
            height: 28,
            background: c.surface,
            overflow: "hidden",
            flexShrink: 0,
            width: 72,
          }}
        >
          <input
            className="campfire-opacity-input"
            type="number"
            min={0}
            max={100}
            step={1}
            value={isMixed ? "" : alpha}
            placeholder={isMixed ? "—" : undefined}
            disabled={isMixed}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) handleAlphaChange(v);
            }}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 12,
              color: isMixed ? ink(0.3) : ink(0.85),
              padding: "0 2px 0 8px",
              height: "100%",
              width: "100%",
              minWidth: 0,
              MozAppearance: "textfield",
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: ink(0.35),
              paddingRight: 6,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            %
          </span>
        </div>
      </div>

      {open && (
        <ColorPickerPanel
          baseHex={baseHex}
          isMixed={isMixed}
          onSelectHex={(hex) => {
            handleHexChange(hex);
            setOpen(false);
          }}
          onCustomColor={(hex) => {
            handleHexChange(hex);
            setOpen(false);
          }}
          inputRef={inputRef}
        />
      )}
    </div>
  );
}
