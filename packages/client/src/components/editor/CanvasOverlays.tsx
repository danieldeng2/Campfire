"use client";

import { c } from "@/lib/colors";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvasConstants";

interface SnapLinesProps {
  vertical: number[];
  horizontal: number[];
}

export function SnapLines({ vertical, horizontal }: SnapLinesProps) {
  return (
    <>
      {vertical.map((x, i) => (
        <div
          key={`v${i}`}
          style={{
            position: "absolute",
            left: x - 1,
            top: 0,
            width: 2,
            height: CANVAS_HEIGHT,
            backgroundColor: c.danger,
            pointerEvents: "none",
          }}
        />
      ))}
      {horizontal.map((y, i) => (
        <div
          key={`h${i}`}
          style={{
            position: "absolute",
            left: 0,
            top: y - 1,
            width: CANVAS_WIDTH,
            height: 2,
            backgroundColor: c.danger,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

interface RubberBandProps {
  rect: { x: number; y: number; width: number; height: number } | null;
}

export function RubberBand({ rect }: RubberBandProps) {
  if (!rect || rect.width <= 2 || rect.height <= 2) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: `1px solid ${c.brand}`,
        background: c.brandGhost,
        pointerEvents: "none",
        borderRadius: 2,
        zIndex: 9999,
      }}
    />
  );
}
