"use client";

import { useRef, useEffect, useCallback } from "react";
import { TextElement as TextElementType } from "@/types/slides";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { useDragElement } from "@/hooks/useDragElement";

interface Props {
  element: TextElementType;
  slideId: string;
  scale: number;
}

export function TextElement({ element, slideId, scale }: Props) {
  const { rect, style, content, id } = element;
  const contentRef = useRef<HTMLDivElement>(null);

  const { selectedElementId, editingElementId, selectElement, setEditingElement } = useEditorStore();
  const { updateElementRect, updateElementContent } = useSlidesStore();

  const isSelected = selectedElementId === id;
  const isEditing = editingElementId === id;

  // Sync content into DOM when not editing
  useEffect(() => {
    if (!isEditing && contentRef.current) {
      contentRef.current.textContent = content;
    }
  }, [content, isEditing]);

  // Focus when editing starts
  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  }, [isEditing]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isSelected) {
        selectElement(id);
      } else if (!isEditing) {
        setEditingElement(id);
      }
    },
    [isSelected, isEditing, id, selectElement, setEditingElement]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectElement(id);
      setEditingElement(id);
    },
    [id, selectElement, setEditingElement]
  );

  const handleBlur = useCallback(() => {
    if (contentRef.current) {
      updateElementContent(slideId, id, contentRef.current.textContent ?? "");
    }
    setEditingElement(null);
  }, [slideId, id, updateElementContent, setEditingElement]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        contentRef.current?.blur();
      }
    },
    []
  );

  const handleDragEnd = useCallback(
    (newRect: typeof rect) => {
      updateElementRect(slideId, id, newRect);
    },
    [slideId, id, updateElementRect]
  );

  const { onPointerDown, onPointerMove, onPointerUp } = useDragElement({
    rect,
    scale,
    onDragEnd: handleDragEnd,
    enabled: !isEditing,
  });

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
        outline: isSelected ? "2px solid #3b82f6" : "2px solid transparent",
        outlineOffset: "2px",
        userSelect: isEditing ? "text" : "none",
        borderRadius: 2,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={onPointerDown}
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
          pointerEvents: isEditing ? "auto" : "none",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
