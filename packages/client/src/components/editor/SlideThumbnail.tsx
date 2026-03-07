"use client";

import type { Slide } from "@/types/slides";
import { c, ink } from "@/lib/colors";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvasConstants";
import { DropIndicator } from "./DragDrop";
import { ScaledCanvas } from "./ScaledCanvas";

export const SIDEBAR_PADDING = 16;

interface Props {
  slide: Slide;
  index: number;
  isActive: boolean;
  thumbnailWidth: number;
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
  thumbnailWidth,
  isDragging = false,
  isDragOver = false,
  onClick,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: Props) {
  const thumbScale = thumbnailWidth / CANVAS_WIDTH;
  const thumbHeight = Math.round(CANVAS_HEIGHT * thumbScale);
  return (
    <div
      draggable={!!onDragStart}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        cursor: "pointer",
        userSelect: "none",
        opacity: isDragging ? 0.4 : 1,
        position: "relative",
      }}
    >
      {isDragOver && <DropIndicator offset={-10} />}

      <div
        style={{
          width: thumbnailWidth,
          height: thumbHeight,
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          border: isActive ? `2px solid ${c.brand}` : `2px solid ${ink(0.12)}`,
          transition: "border-color 0.15s",
          flexShrink: 0,
        }}
      >
        {/* Inner canvas scaled down */}
        <ScaledCanvas scale={thumbScale} background={slide.background.value}>
          {slide.elements.map((el) => {
            if (el.type === "text") {
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
                    textDecoration: el.style.textDecoration,
                    color: el.style.color,
                    textAlign: el.style.textAlign,
                    lineHeight: el.style.lineHeight,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {el.content}
                </div>
              );
            }
            if (el.type === "image") {
              return (
                <img
                  key={el.id}
                  src={el.src}
                  alt=""
                  style={{
                    position: "absolute",
                    left: el.rect.x,
                    top: el.rect.y,
                    width: el.rect.width,
                    height: el.rect.height,
                    objectFit: el.objectFit,
                    borderRadius: el.borderRadius,
                    pointerEvents: "none",
                  }}
                />
              );
            }
            return null;
          })}
        </ScaledCanvas>
      </div>
      <span style={{ fontSize: 12, textAlign: "center", color: isActive ? c.brand : ink(0.35) }}>
        {index + 1}
      </span>
    </div>
  );
}
