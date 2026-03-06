"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { Trash2 } from "lucide-react";
import { TextElement as TextElementType } from "@/types/slides";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { useDragElement } from "@/hooks/useDragElement";
import { useTextEditing } from "@/hooks/useTextEditing";
import { useSelectionStyles } from "@/hooks/useSelectionStyles";
import { useResizeElement } from "@/hooks/useResizeElement";
import type { ResizeHandle } from "@/hooks/useResizeElement";
import { runsToHtml } from "@/lib/runsToHtml";
import { restoreCharSelection } from "@/lib/domSelection";
import { c, ink } from "@/lib/colors";
import { ContextMenu } from "@/components/UILibrary/ContextMenu";

interface Props {
  element: TextElementType;
  slideId: string;
  scale: number;
}

// Outline is 2px with outlineOffset 2px → outline center is 3px outside the element edge.
// Handle is 12×12 → half = 6px. To center on the outline: -(outlineOffset + outlineWidth/2 + handleHalf) = -(2+1+6) = -9px.
const HANDLE_SIZE = 12;
const HANDLE_OFFSET = -9;

const HANDLE_DEFS: { handle: ResizeHandle; style: React.CSSProperties }[] = [
  { handle: "nw", style: { top: HANDLE_OFFSET, left: HANDLE_OFFSET, cursor: "nw-resize" } },
  {
    handle: "n",
    style: {
      top: HANDLE_OFFSET,
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "n-resize",
    },
  },
  { handle: "ne", style: { top: HANDLE_OFFSET, right: HANDLE_OFFSET, cursor: "ne-resize" } },
  {
    handle: "e",
    style: {
      top: "50%",
      right: HANDLE_OFFSET,
      transform: "translateY(-50%)",
      cursor: "e-resize",
    },
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
    style: {
      top: "50%",
      left: HANDLE_OFFSET,
      transform: "translateY(-50%)",
      cursor: "w-resize",
    },
  },
];

export function TextElement({ element, slideId, scale }: Props) {
  const { rect, style, content, runs, id } = element;
  const contentRef = useRef<HTMLDivElement>(null);
  const prevRunsRef = useRef(runs);

  const {
    selectedElementIds,
    editingElementId,
    selectionRange,
    selectElements,
    setEditingElement,
  } = useEditorStore();
  const { updateElementRect, updateElementContent, deleteElement } = useSlidesStore();

  const isSelected = selectedElementIds.includes(id);
  const isEditing = editingElementId === id;

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  // Updates selectionRange in editorStore on every selectionchange event while editing
  useSelectionStyles(contentRef, isEditing, element);

  const { handleClick, handleDoubleClick, handleBlur, handleKeyDown } = useTextEditing({
    id,
    slideId,
    content,
    runs,
    style,
    isSelected,
    isEditing,
    contentRef,
    updateElementContent,
    selectElements,
    setEditingElement,
  });

  const { onPointerDown, onPointerMove, onPointerUp } = useDragElement({
    rect,
    scale,
    onDragEnd: (newRect) => updateElementRect(slideId, id, newRect),
    enabled: !isEditing,
  });

  const {
    getHandlePointerDown,
    onPointerMove: onResizeMove,
    onPointerUp: onResizeUp,
  } = useResizeElement({
    rect,
    scale,
    onResize: (newRect) => updateElementRect(slideId, id, newRect),
  });

  // When runs change while already editing (style mutation from sidebar), update DOM and restore selection
  useLayoutEffect(() => {
    if (!isEditing || !contentRef.current) return;
    if (runs === prevRunsRef.current) return;
    prevRunsRef.current = runs;
    contentRef.current.innerHTML = runsToHtml(content, runs, style);
    if (selectionRange) {
      contentRef.current.focus();
      restoreCharSelection(contentRef.current, selectionRange.start, selectionRange.end);
    }
  }, [runs, isEditing, selectionRange, content, style]);

  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        zIndex: element.zIndex,
        cursor: isEditing ? "text" : isSelected ? "move" : "default",
        outline: isSelected ? `2px solid ${c.brand}` : "2px solid transparent",
        outlineOffset: "2px",
        userSelect: isEditing ? "text" : "none",
        borderRadius: 2,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        selectElements([id]);
        setCtxMenu({ x: e.clientX, y: e.clientY });
      }}
      onPointerDown={(e) => {
        if (isEditing) {
          e.stopPropagation();
          return;
        }
        onPointerDown(e);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          color: style.color,
          textAlign: style.textAlign,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          width: "100%",
          height: "100%",
          outline: "none",
          userSelect: "text",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      />

      {isSelected &&
        !isEditing &&
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
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            onClick={(e) => e.stopPropagation()}
          />
        ))}

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onClose={() => setCtxMenu(null)}
          items={[
            {
              label: "Delete",
              icon: <Trash2 size={13} />,
              danger: true,
              onClick: () => {
                deleteElement(slideId, id);
                selectElements([]);
              },
            },
          ]}
        />
      )}
    </div>
  );
}
