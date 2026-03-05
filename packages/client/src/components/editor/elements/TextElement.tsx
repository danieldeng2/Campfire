"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { TextElement as TextElementType } from "@/types/slides";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { useDragElement } from "@/hooks/useDragElement";
import { useTextEditing } from "@/hooks/useTextEditing";
import { c } from "@/lib/colors";
import { ContextMenu } from "@/components/UILibrary/ContextMenu";

interface Props {
  element: TextElementType;
  slideId: string;
  scale: number;
}

export function TextElement({ element, slideId, scale }: Props) {
  const { rect, style, content, id } = element;
  const contentRef = useRef<HTMLDivElement>(null);

  const { selectedElementIds, editingElementId, selectElements, setEditingElement } =
    useEditorStore();
  const { updateElementRect, updateElementContent, deleteElement } = useSlidesStore();

  const isSelected = selectedElementIds.includes(id);
  const isEditing = editingElementId === id;

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  const { handleClick, handleDoubleClick, handleBlur, handleKeyDown } = useTextEditing({
    id,
    slideId,
    content,
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
