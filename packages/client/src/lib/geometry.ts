import type { SlideRect } from "@/types/slides";

export function rectsOverlap(a: SlideRect, b: SlideRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

/** Convert client (screen) coordinates to canvas (1920×1080) coordinates */
export function toCanvasCoords(
  clientX: number,
  clientY: number,
  wrapperRect: DOMRect,
  scale: number
): { x: number; y: number } {
  return {
    x: (clientX - wrapperRect.left) / scale,
    y: (clientY - wrapperRect.top) / scale,
  };
}
