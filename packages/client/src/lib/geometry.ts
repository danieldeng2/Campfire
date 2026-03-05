import type { SlideRect } from "@/types/slides";

export function rectsOverlap(a: SlideRect, b: SlideRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
