"use client";

import { Pipette } from "lucide-react";
import { c, ink } from "@/lib/colors";
import { COLOR_COLUMNS, NUM_COLS, NUM_ROWS } from "@/lib/colorUtils";

export interface ColorPickerPanelProps {
  baseHex: string;
  isMixed: boolean;
  onSelectHex: (hex: string) => void;
  onCustomColor: (hex: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function ColorPickerPanel({
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
