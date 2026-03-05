"use client";

import type { Slide } from "@/types/slides";
import { c, ink } from "@/lib/colors";
import { DropIndicator } from "./DragDrop";

export const THUMBNAIL_WIDTH = 176;
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const THUMBNAIL_SCALE = THUMBNAIL_WIDTH / CANVAS_WIDTH;
const THUMBNAIL_HEIGHT = Math.round(CANVAS_HEIGHT * THUMBNAIL_SCALE);

interface Props {
  slide: Slide;
  index: number;
  isActive: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export function SlideThumbnail({
  slide,
  index,
  isActive,
  isDragging = false,
  isDragOver = false,
  onClick,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: Props) {
  return (
    <div
      draggable={!!onDragStart}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className="flex flex-col gap-1.5 cursor-pointer"
      style={{ userSelect: "none", opacity: isDragging ? 0.4 : 1, position: "relative" }}
    >
      {isDragOver && <DropIndicator offset={-10} />}

      <div
        style={{
          width: THUMBNAIL_WIDTH,
          height: THUMBNAIL_HEIGHT,
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          border: isActive ? `2px solid ${c.brand}` : `2px solid ${ink(0.12)}`,
          transition: "border-color 0.15s",
          flexShrink: 0,
        }}
      >
        {/* Inner canvas scaled down */}
        <div
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: slide.background.value,
            transform: `scale(${THUMBNAIL_SCALE})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        >
          {slide.elements.map((el) => {
            if (el.type !== "text") return null;
            return (
              <div
                key={el.id}
                style={{
                  position: "absolute",
                  left: el.rect.x,
                  top: el.rect.y,
                  width: el.rect.width,
                  height: el.rect.height,
                  fontFamily: el.style.fontFamily,
                  fontSize: el.style.fontSize,
                  fontWeight: el.style.fontWeight,
                  color: el.style.color,
                  textAlign: el.style.textAlign,
                  lineHeight: el.style.lineHeight,
                  whiteSpace: "pre-wrap",
                  overflow: "hidden",
                }}
              >
                {el.content}
              </div>
            );
          })}
        </div>
      </div>
      <span className="text-xs text-center" style={{ color: isActive ? c.brand : ink(0.35) }}>
        {index + 1}
      </span>
    </div>
  );
}
