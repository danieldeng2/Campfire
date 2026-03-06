"use client";

import type { ResizeHandle } from "@/hooks/useResizeElement";
import { c, ink } from "@/lib/colors";

const HANDLE_SIZE = 12;
// Outline is 2px with outlineOffset 2px → outline center is 3px outside the element edge.
// Handle is 12×12 → half = 6px. To center on the outline: -(outlineOffset + outlineWidth/2 + handleHalf) = -(2+1+6) = -9px.
const HANDLE_OFFSET = -9;

const HANDLE_DEFS: { handle: ResizeHandle; style: React.CSSProperties }[] = [
  { handle: "nw", style: { top: HANDLE_OFFSET, left: HANDLE_OFFSET, cursor: "nw-resize" } },
  {
    handle: "n",
    style: { top: HANDLE_OFFSET, left: "50%", transform: "translateX(-50%)", cursor: "n-resize" },
  },
  { handle: "ne", style: { top: HANDLE_OFFSET, right: HANDLE_OFFSET, cursor: "ne-resize" } },
  {
    handle: "e",
    style: { top: "50%", right: HANDLE_OFFSET, transform: "translateY(-50%)", cursor: "e-resize" },
  },
  { handle: "se", style: { bottom: HANDLE_OFFSET, right: HANDLE_OFFSET, cursor: "se-resize" } },
  {
    handle: "s",
    style: {
      bottom: HANDLE_OFFSET,
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "s-resize",
    },
  },
  { handle: "sw", style: { bottom: HANDLE_OFFSET, left: HANDLE_OFFSET, cursor: "sw-resize" } },
  {
    handle: "w",
    style: { top: "50%", left: HANDLE_OFFSET, transform: "translateY(-50%)", cursor: "w-resize" },
  },
];

interface Props {
  /** Whether to render the outline and handles at all. */
  isSelected: boolean;
  /** When true, shows the outline but hides resize handles (e.g. during inline text editing). */
  isEditing?: boolean;
  getHandlePointerDown: (handle: ResizeHandle) => (e: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
}

/**
 * Renders a brand-colored selection outline and eight resize handles around a
 * positioned element. Drop it as a child inside any absolutely-positioned
 * element wrapper and it will cover the full bounds via `position: absolute`.
 *
 * The parent element should have `outline` / `outlineOffset` set (or delegated
 * here via the `isSelected` prop) so that the handle offset math stays correct.
 */
export function SelectionBox({
  isSelected,
  isEditing = false,
  getHandlePointerDown,
  onPointerMove,
  onPointerUp,
}: Props) {
  if (!isSelected) return null;

  return (
    <>
      {!isEditing &&
        HANDLE_DEFS.map(({ handle, style: posStyle }) => (
          <div
            key={handle}
            style={{
              position: "absolute",
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              borderRadius: 2,
              background: c.surface,
              border: `1.5px solid ${c.brand}`,
              boxShadow: `0 0 0 1px ${ink(0.08)}`,
              zIndex: 1,
              ...posStyle,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              getHandlePointerDown(handle)(e);
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onClick={(e) => e.stopPropagation()}
          />
        ))}
    </>
  );
}
