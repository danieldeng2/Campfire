"use client";

import { c } from "@/lib/colors";

export function DropIndicator({ offset = 0 }: { offset?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: offset,
        left: 0,
        right: 0,
        height: 2,
        background: c.brand,
        borderRadius: 1,
      }}
    />
  );
}

interface DropZoneProps {
  active: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  width?: number | string;
  height?: number;
  showIndicator: boolean;
}

export function DropZone({
  active,
  onDragOver,
  onDrop,
  width,
  height = 160,
  showIndicator,
}: DropZoneProps) {
  if (!active) return null;
  return (
    <div
      style={{ width: "100%", display: "flex", justifyContent: "center" }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div style={{ width, position: "relative", flexShrink: 0 }}>
        {showIndicator && <DropIndicator offset={-10} />}
      </div>
      <div style={{ height }} />
    </div>
  );
}
