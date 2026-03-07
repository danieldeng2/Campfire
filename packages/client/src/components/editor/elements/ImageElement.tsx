"use client";

import { useCallback, useState } from "react";
import { Trash2 } from "lucide-react";
import type { ImageElement as ImageElementType } from "@/types/slides";
import { useEditorStore } from "@/store/editorStore";
import { useSlidesStore } from "@/store/slidesStore";
import { useDragElement } from "@/hooks/useDragElement";
import { useResizeElement } from "@/hooks/useResizeElement";
import { SelectionBox } from "./SelectionBox";
import { ContextMenu } from "@/components/UILibrary/ContextMenu";
import { c } from "@/lib/colors";

interface Props {
  element: ImageElementType;
  slideId: string;
  scale: number;
}

export function ImageElement({ element, slideId, scale }: Props) {
  const { rect, id, objectFit, borderRadius } = element;
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  const { selectedElementIds, selectElements, setEditingElement } = useEditorStore();
  const updateElementRect = useSlidesStore((s) => s.updateElementRect);
  const deleteElement = useSlidesStore((s) => s.deleteElement);

  const isSelected = selectedElementIds.includes(id);
  const aspectRatio = rect.width / rect.height;

  const onSnapChange = useCallback((snap: { showH: boolean; showV: boolean }) => {
    useEditorStore.getState().setSnapLines(snap);
  }, []);

  const { onPointerDown, onPointerMove, onPointerUp, didDrag, clearDidDrag } = useDragElement({
    rect,
    scale,
    onDragEnd: (newRect) => updateElementRect(slideId, id, newRect),
    onSnapChange,
    enabled: true,
  });

  const {
    getHandlePointerDown,
    onPointerMove: onResizeMove,
    onPointerUp: onResizeUp,
  } = useResizeElement({
    rect,
    scale,
    onResize: (newRect) => updateElementRect(slideId, id, newRect),
    aspectRatio,
  });

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (didDrag.current) {
        clearDidDrag();
        return;
      }
      selectElements([id]);
      setEditingElement(null);
    },
    [id, selectElements, setEditingElement, didDrag, clearDidDrag]
  );

  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        zIndex: element.zIndex,
        cursor: isSelected ? "move" : "default",
        outline: isSelected ? `2px solid ${c.brand}` : "2px solid transparent",
        outlineOffset: "2px",
        userSelect: "none",
      }}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        selectElements([id]);
        setCtxMenu({ x: e.clientX, y: e.clientY });
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPointerDown(e);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <img
        src={element.src}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          borderRadius,
          pointerEvents: "none",
          display: "block",
        }}
      />

      <SelectionBox
        isSelected={isSelected}
        getHandlePointerDown={getHandlePointerDown}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeUp}
      />

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={[
            {
              label: "Delete",
              icon: <Trash2 size={13} strokeWidth={1.5} />,
              danger: true,
              onClick: () => {
                deleteElement(slideId, id);
                selectElements([]);
              },
            },
          ]}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  );
}
