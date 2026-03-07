import type { SlideRect } from "@/types/slides";
import { CANVAS_CX, CANVAS_CY } from "@/lib/canvasConstants";

const SNAP_THRESHOLD = 10;

export interface SnapResult {
  position: number;
  linePositions: number[];
}

export function findSnap(elEdges: number[], targets: number[]): SnapResult | null {
  let best: { delta: number; linePos: number } | null = null;

  for (const target of targets) {
    for (const edge of elEdges) {
      const delta = target - edge;
      if (Math.abs(delta) < SNAP_THRESHOLD && (!best || Math.abs(delta) < Math.abs(best.delta))) {
        best = { delta, linePos: target };
      }
    }
  }

  if (!best) return null;

  const snappedEdges = elEdges.map((e) => e + best!.delta);
  const linePositions = targets.filter((t) => snappedEdges.some((se) => Math.abs(se - t) < 1));

  return { position: best.delta, linePositions };
}

/** Collect left/right and top/bottom edges from a set of rects */
export function buildSnapTargets(siblings: SlideRect[]): { x: number[]; y: number[] } {
  const x: number[] = [];
  const y: number[] = [];
  for (const sr of siblings) {
    x.push(sr.x, sr.x + sr.width);
    y.push(sr.y, sr.y + sr.height);
  }
  return { x, y };
}

/** Pick the best snap between edge-to-sibling and center-to-canvas-center */
export function resolveAxisSnap(
  movingEdges: number[],
  siblingEdgeTargets: number[],
  elementCenter: number,
  canvasCenter: number
): SnapResult | null {
  const edgeSnap = movingEdges.length ? findSnap(movingEdges, siblingEdgeTargets) : null;
  const centerSnap = movingEdges.length ? findSnap([elementCenter], [canvasCenter]) : null;
  if (edgeSnap && centerSnap) {
    return Math.abs(edgeSnap.position) <= Math.abs(centerSnap.position) ? edgeSnap : centerSnap;
  }
  return edgeSnap ?? centerSnap;
}

/** Resolve both X and Y axis snaps for a rect against siblings */
export function resolveSnap(
  movingXEdges: number[],
  movingYEdges: number[],
  siblings: SlideRect[],
  centerX: number,
  centerY: number
): { snapX: SnapResult | null; snapY: SnapResult | null } {
  const targets = buildSnapTargets(siblings);
  return {
    snapX: resolveAxisSnap(movingXEdges, targets.x, centerX, CANVAS_CX),
    snapY: resolveAxisSnap(movingYEdges, targets.y, centerY, CANVAS_CY),
  };
}
