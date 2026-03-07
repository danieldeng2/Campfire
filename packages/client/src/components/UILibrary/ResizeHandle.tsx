"use client";

import { useCallback, useRef } from "react";

interface Props {
  side: "left" | "right";
  onResize: (delta: number) => void;
}

export function ResizeHandle({ side, onResize }: Props) {
  const startXRef = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      startXRef.current = e.clientX;
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const delta = ev.clientX - startXRef.current;
        startXRef.current = ev.clientX;
        onResize(side === "left" ? -delta : delta);
      };

      const onUp = () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
    },
    [onResize, side]
  );

  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        width: 5,
        marginLeft: -2,
        marginRight: -3,
        cursor: "col-resize",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}
    />
  );
}
