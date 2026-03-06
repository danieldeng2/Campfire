"use client";

import { useRef, useState, useLayoutEffect, useCallback, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { TextElement as TextElementType } from "@/types/slides";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { useDragElement } from "@/hooks/useDragElement";
import { useTextEditing } from "@/hooks/useTextEditing";
import { useSelectionStyles } from "@/hooks/useSelectionStyles";
import { useResizeElement } from "@/hooks/useResizeElement";
import { runsToHtml } from "@/lib/runsToHtml";
import { domToRuns, restoreCharSelection } from "@/lib/domSelection";
import { c } from "@/lib/colors";
import { ContextMenu } from "@/components/UILibrary/ContextMenu";
import { SelectionBox } from "./SelectionBox";

interface Props {
  element: TextElementType;
  slideId: string;
  scale: number;
}

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
    setSnapLines,
    setFlushEditingContent,
  } = useEditorStore();

  const onSnapChange = useCallback(
    (snap: { showH: boolean; showV: boolean }) => setSnapLines(snap),
    [setSnapLines]
  );
  const {
    updateElementRect,
    updateElementContent,
    updateElementStyle,
    updateElementStyleRange,
    deleteElement,
  } = useSlidesStore();

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
    updateElementStyle,
    updateElementStyleRange,
    selectElements,
    setEditingElement,
  });

  const { onPointerDown, onPointerMove, onPointerUp, didDrag, clearDidDrag } = useDragElement({
    rect,
    scale,
    onDragEnd: (newRect) => updateElementRect(slideId, id, newRect),
    onSnapChange,
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

  // Register a flush callback so sidebar/keyboard handlers can save live DOM content
  // to the store before applying a style range (avoids stale el.content when user has typed unsaved text).
  useEffect(() => {
    if (!isEditing) {
      setFlushEditingContent(null);
      return;
    }
    setFlushEditingContent(() => {
      if (contentRef.current) {
        const { content: liveContent, runs: liveRuns } = domToRuns(contentRef.current);
        updateElementContent(slideId, id, liveContent, liveRuns);
      }
    });
    return () => setFlushEditingContent(null);
  }, [isEditing, slideId, id, setFlushEditingContent, updateElementContent]);

  // When runs change while already editing (style mutation from sidebar), update DOM and restore selection
  useLayoutEffect(() => {
    if (!isEditing || !contentRef.current) return;
    if (runs === prevRunsRef.current) return;
    prevRunsRef.current = runs;
    // Use live DOM content so unsaved typed text isn't lost (store content is stale during editing)
    const { content: liveContent } = domToRuns(contentRef.current);
    contentRef.current.innerHTML = runsToHtml(liveContent, runs, style);
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
      onClick={(e) => {
        if (didDrag.current) {
          clearDidDrag();
          return;
        }
        handleClick(e);
      }}
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
          textDecoration: style.textDecoration,
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

      <SelectionBox
        isSelected={isSelected}
        isEditing={isEditing}
        getHandlePointerDown={getHandlePointerDown}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeUp}
      />

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
