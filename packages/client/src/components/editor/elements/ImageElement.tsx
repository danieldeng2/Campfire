"use client";

import { useCallback } from "react";
import { Trash2 } from "lucide-react";
import type { ImageElement as ImageElementType } from "@/types/slides";
import { useEditorStore } from "@/store/editorStore";
import { useSlidesStore } from "@/store/slidesStore";
import { useDragElement } from "@/hooks/useDragElement";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useResizeElement } from "@/hooks/useResizeElement";
import { SelectionBox } from "./SelectionBox";
import { ContextMenu } from "@/components/UILibrary/ContextMenu";
import { selectionOutline } from "@/lib/elementStyles";

interface Props {
  element: ImageElementType;
  slideId: string;
  scale: number;
}

export function ImageElement({ element, slideId, scale }: Props) {
  const { rect, id, objectFit, borderRadius } = element;
  const { ctxMenu, openContextMenu, closeContextMenu } = useContextMenu();

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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (didDrag.current) {
      clearDidDrag();
      return;
    }
    selectElements([id]);
    setEditingElement(null);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        zIndex: isSelected ? 9998 : element.zIndex,
        cursor: isSelected ? "move" : "default",
        ...selectionOutline(isSelected),
        userSelect: "none",
      }}
      onClick={handleClick}
      onContextMenu={(e) => {
        selectElements([id]);
        openContextMenu(e);
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
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
