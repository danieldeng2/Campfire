"use client";

import { Slide } from "@/types/slides";

const THUMBNAIL_WIDTH = 176;
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const THUMBNAIL_SCALE = THUMBNAIL_WIDTH / CANVAS_WIDTH;
const THUMBNAIL_HEIGHT = Math.round(CANVAS_HEIGHT * THUMBNAIL_SCALE);

interface Props {
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function SlideThumbnail({ slide, index, isActive, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-1.5 cursor-pointer"
      style={{ userSelect: "none" }}
    >
      <div
        style={{
          width: THUMBNAIL_WIDTH,
          height: THUMBNAIL_HEIGHT,
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          border: isActive ? "2px solid #3b82f6" : "2px solid rgba(0,0,0,0.12)",
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
      <span
        className="text-xs text-center"
        style={{ color: isActive ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.35)" }}
      >
        {index + 1}
      </span>
    </div>
  );
}
