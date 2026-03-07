"use client";

import { useCallback, useRef } from "react";
import type { SlideRect } from "@/types/slides";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvasConstants";
import { resolveSnap } from "@/lib/snap";

interface UseDragElementOptions {
  rect: SlideRect;
  scale: number;
  onDragEnd: (newRect: SlideRect) => void;
  onSnapChange: (snap: { vertical: number[]; horizontal: number[] }) => void;
  enabled: boolean;
  getSiblingRects: () => SlideRect[];
}

export function useDragElement({
  rect,
  scale,
  onDragEnd,
  onSnapChange,
  enabled,
  getSiblingRects,
}: UseDragElementOptions) {
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startRect = useRef<SlideRect>(rect);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();

      isDragging.current = true;
      didDrag.current = false;
      startPointer.current = { x: e.clientX, y: e.clientY };
      startRect.current = { ...rect };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [enabled, rect]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isDragging.current) return;

      const dx = (e.clientX - startPointer.current.x) / scale;
      const dy = (e.clientY - startPointer.current.y) / scale;

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) didDrag.current = true;

      const newX = Math.round(startRect.current.x + dx);
      const newY = Math.round(startRect.current.y + dy);

      const clampedX = Math.max(0, Math.min(CANVAS_WIDTH - rect.width, newX));
      const clampedY = Math.max(0, Math.min(CANVAS_HEIGHT - rect.height, newY));

      const { snapX, snapY } = resolveSnap(
        [clampedX, clampedX + rect.width],
        [clampedY, clampedY + rect.height],
        getSiblingRects(),
        clampedX + rect.width / 2,
        clampedY + rect.height / 2
      );

      const snappedX = snapX ? clampedX + snapX.position : clampedX;
      const snappedY = snapY ? clampedY + snapY.position : clampedY;

      onSnapChange({
        vertical: snapX?.linePositions ?? [],
        horizontal: snapY?.linePositions ?? [],
      });
      onDragEnd({ ...startRect.current, x: snappedX, y: snappedY });
    },
    [scale, rect.width, rect.height, onDragEnd, onSnapChange, getSiblingRects]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      onSnapChange({ vertical: [], horizontal: [] });
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    },
    [onSnapChange]
  );

  const clearDidDrag = useCallback(() => {
    didDrag.current = false;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, didDrag, clearDidDrag };
}
