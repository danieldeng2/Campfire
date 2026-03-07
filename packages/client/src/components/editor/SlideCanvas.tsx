"use client";

import { useRef, useCallback } from "react";
import { useCanvasScale } from "@/hooks/useCanvasScale";
import { useCanvasInteraction } from "@/hooks/useCanvasInteraction";
import { useImagePlacement } from "@/hooks/useImagePlacement";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { Tool } from "@/types/editor";
import { c } from "@/lib/colors";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvasConstants";
import { SnapLines, RubberBand } from "./CanvasOverlays";
import { TextElement } from "./elements/TextElement";
import { ImageElement } from "./elements/ImageElement";
import { ScaledCanvas } from "./ScaledCanvas";

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

  const { previewPos, previewW, previewH, trackPointer, placeImage } = useImagePlacement({
    pendingImage,
    scale,
    wrapperRef,
    activeSlide: activeSlide!,
    addElement,
    selectElements,
    setPendingImage,
  });

  const handleWrapperPointerMove = useCallback(
    (e: React.PointerEvent) => {
      handlePointerMove(e);
      trackPointer(e);
    },
    [handlePointerMove, trackPointer]
  );

  const handleWrapperPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (placeImage(e)) return;
      handlePointerDown(e);
    },
    [placeImage, handlePointerDown]
  );

  if (!activeSlide) return null;

  const scaledWidth = CANVAS_WIDTH * scale;
  const scaledHeight = CANVAS_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
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

          <SnapLines vertical={snapLines.vertical} horizontal={snapLines.horizontal} />
          <RubberBand rect={bandRect} />
        </ScaledCanvas>
      </div>
    </div>
  );
}
