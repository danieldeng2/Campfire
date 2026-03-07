"use client";

import { useRef, useState, useCallback } from "react";
import { useCanvasScale } from "@/hooks/useCanvasScale";
import { useCanvasInteraction } from "@/hooks/useCanvasInteraction";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { Tool } from "@/types/editor";
import { c } from "@/lib/colors";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvasConstants";
import { TextElement } from "./elements/TextElement";
import { ImageElement } from "./elements/ImageElement";
import { ScaledCanvas } from "./ScaledCanvas";

const PREVIEW_MAX_W = 200;

export function SlideCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scale, containerRef } = useCanvasScale();

  const {
    activeSlideId,
    activeTool,
    selectElements,
    setEditingElement,
    setActiveTool,
    snapLines,
    pendingImage,
    setPendingImage,
  } = useEditorStore();
  const slides = useSlidesStore((s) => s.deck.slides);
  const addElement = useSlidesStore((s) => s.addElement);
  const activeSlide = slides.find((s) => s.id === activeSlideId);

  const isTextTool = activeTool === Tool.Text;
  const isImageTool = activeTool === Tool.Image;

  // Track mouse position for image placement preview (in canvas coords)
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);

  const { drawRect, bandRect, handlePointerDown, handlePointerMove, handlePointerUp } =
    useCanvasInteraction({
      scale,
      wrapperRef,
      isTextTool,
      activeSlide: activeSlide!,
      addElement,
      selectElements,
      setEditingElement,
      setActiveTool,
    });

  const handleWrapperPointerMove = useCallback(
    (e: React.PointerEvent) => {
      handlePointerMove(e);
      if (pendingImage && wrapperRef.current) {
        const bounds = wrapperRef.current.getBoundingClientRect();
        setPreviewPos({
          x: (e.clientX - bounds.left) / scale,
          y: (e.clientY - bounds.top) / scale,
        });
      }
    },
    [handlePointerMove, pendingImage, scale]
  );

  const handleWrapperPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (pendingImage && wrapperRef.current) {
        e.preventDefault();
        e.stopPropagation();
        const bounds = wrapperRef.current.getBoundingClientRect();
        const cx = (e.clientX - bounds.left) / scale;
        const cy = (e.clientY - bounds.top) / scale;

        // Compute element size: fit within canvas, max 50% of canvas width
        const maxW = CANVAS_WIDTH * 0.5;
        const ar = pendingImage.width / pendingImage.height;
        let w = Math.min(pendingImage.width, maxW);
        let h = w / ar;
        if (h > CANVAS_HEIGHT * 0.5) {
          h = CANVAS_HEIGHT * 0.5;
          w = h * ar;
        }

        // Center the image on the click point, clamped to canvas
        let x = cx - w / 2;
        let y = cy - h / 2;
        x = Math.max(0, Math.min(CANVAS_WIDTH - w, x));
        y = Math.max(0, Math.min(CANVAS_HEIGHT - h, y));

        const id = crypto.randomUUID();
        addElement(activeSlide!.id, {
          id,
          type: "image",
          rect: {
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(w),
            height: Math.round(h),
          },
          zIndex: activeSlide!.elements.length + 1,
          src: pendingImage.src,
          objectFit: "cover",
          borderRadius: 12,
        });
        selectElements([id]);
        setPendingImage(null);
        setPreviewPos(null);
        return;
      }
      handlePointerDown(e);
    },
    [
      pendingImage,
      scale,
      activeSlide,
      addElement,
      selectElements,
      setPendingImage,
      handlePointerDown,
    ]
  );

  if (!activeSlide) return null;

  const scaledWidth = CANVAS_WIDTH * scale;
  const scaledHeight = CANVAS_HEIGHT * scale;

  // Preview dimensions for the pending image
  let previewW = 0;
  let previewH = 0;
  if (pendingImage) {
    const ar = pendingImage.width / pendingImage.height;
    previewW = PREVIEW_MAX_W;
    previewH = previewW / ar;
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center w-full h-full"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          selectElements([]);
          setEditingElement(null);
          if (!pendingImage) setActiveTool(Tool.Move);
        }
      }}
    >
      {/* Outer wrapper: sized to scaled dimensions */}
      <div
        ref={wrapperRef}
        style={{
          width: scaledWidth,
          height: scaledHeight,
          position: "relative",
          borderRadius: 6,
          boxShadow: `0 8px 40px ${activeSlide.background.value}99, 0 2px 8px ${activeSlide.background.value}66`,
          overflow: "hidden",
          cursor: isTextTool || isImageTool ? "crosshair" : "default",
        }}
        onPointerDown={handleWrapperPointerDown}
        onPointerMove={handleWrapperPointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Inner canvas: always 1920x1080, scaled via CSS transform */}
        <ScaledCanvas
          scale={scale}
          background={activeSlide.background.value}
          pointerEvents={isTextTool || isImageTool ? "none" : "auto"}
        >
          {activeSlide.elements.map((el) => {
            if (el.type === "text") {
              return (
                <TextElement key={el.id} element={el} slideId={activeSlide.id} scale={scale} />
              );
            }
            if (el.type === "image") {
              return (
                <ImageElement key={el.id} element={el} slideId={activeSlide.id} scale={scale} />
              );
            }
            return null;
          })}

          {/* Image placement preview */}
          {pendingImage && previewPos && (
            <img
              src={pendingImage.src}
              alt=""
              style={{
                position: "absolute",
                left: previewPos.x - previewW / 2,
                top: previewPos.y - previewH / 2,
                width: previewW,
                height: previewH,
                objectFit: "cover",
                borderRadius: 12,
                opacity: 0.6,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Text draw preview */}
          {drawRect && drawRect.width > 0 && (
            <div
              style={{
                position: "absolute",
                left: drawRect.x,
                top: drawRect.y,
                width: drawRect.width,
                height: drawRect.height,
                border: `2px dashed ${c.brand}`,
                background: c.brandGhost,
                pointerEvents: "none",
                borderRadius: 2,
              }}
            />
          )}

          {/* Center snap lines */}
          {snapLines.showV && (
            <div
              style={{
                position: "absolute",
                left: 959,
                top: 0,
                width: 2,
                height: 1080,
                backgroundColor: c.danger,
                pointerEvents: "none",
              }}
            />
          )}
          {snapLines.showH && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 539,
                width: 1920,
                height: 2,
                backgroundColor: c.danger,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Rubber-band selection */}
          {bandRect && bandRect.width > 2 && bandRect.height > 2 && (
            <div
              style={{
                position: "absolute",
                left: bandRect.x,
                top: bandRect.y,
                width: bandRect.width,
                height: bandRect.height,
                border: `1px solid ${c.brand}`,
                background: c.brandGhost,
                pointerEvents: "none",
                borderRadius: 2,
              }}
            />
          )}
        </ScaledCanvas>
      </div>
    </div>
  );
}
