"use client";

import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvasConstants";

interface Props {
  scale: number;
  background: string;
  pointerEvents?: "none" | "auto";
  children?: React.ReactNode;
}

/** Inner 1920×1080 canvas scaled via CSS transform. Drop inside any sized overflow:hidden wrapper. */
export function ScaledCanvas({ scale, background, pointerEvents = "none", children }: Props) {
  return (
    <div
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: background,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents,
      }}
    >
      {children}
    </div>
  );
}
