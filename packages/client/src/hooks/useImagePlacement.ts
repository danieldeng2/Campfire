"use client";

import { useState, useCallback } from "react";
import type { Slide, SlideElement } from "@/types/slides";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/canvasConstants";
import { toCanvasCoords } from "@/lib/geometry";

const PREVIEW_MAX_W = 200;

interface PendingImage {
  src: string;
  width: number;
  height: number;
}

interface UseImagePlacementOptions {
  pendingImage: PendingImage | null;
  scale: number;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  activeSlide: Slide;
  addElement: (slideId: string, element: SlideElement) => void;
  selectElements: (ids: string[]) => void;
  setPendingImage: (img: PendingImage | null) => void;
}

export function useImagePlacement({
  pendingImage,
  scale,
  wrapperRef,
  activeSlide,
  addElement,
  selectElements,
  setPendingImage,
}: UseImagePlacementOptions) {
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);

  const trackPointer = useCallback(
    (e: React.PointerEvent) => {
      if (pendingImage && wrapperRef.current) {
        const pos = toCanvasCoords(
          e.clientX,
          e.clientY,
          wrapperRef.current.getBoundingClientRect(),
          scale
        );
        setPreviewPos(pos);
      }
    },
    [pendingImage, scale, wrapperRef]
  );

  const placeImage = useCallback(
    (e: React.PointerEvent): boolean => {
      if (!pendingImage || !wrapperRef.current) return false;

      e.preventDefault();
      e.stopPropagation();

      const { x: cx, y: cy } = toCanvasCoords(
        e.clientX,
        e.clientY,
        wrapperRef.current.getBoundingClientRect(),
        scale
      );

      // Fit within canvas, max 50% of canvas width
      const maxW = CANVAS_WIDTH * 0.5;
      const ar = pendingImage.width / pendingImage.height;
      let w = Math.min(pendingImage.width, maxW);
      let h = w / ar;
      if (h > CANVAS_HEIGHT * 0.5) {
        h = CANVAS_HEIGHT * 0.5;
        w = h * ar;
      }

      // Center on click point, clamped to canvas
      let x = cx - w / 2;
      let y = cy - h / 2;
      x = Math.max(0, Math.min(CANVAS_WIDTH - w, x));
      y = Math.max(0, Math.min(CANVAS_HEIGHT - h, y));

      const id = crypto.randomUUID();
      addElement(activeSlide.id, {
        id,
        type: "image",
        rect: {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(w),
          height: Math.round(h),
        },
        zIndex: activeSlide.elements.length + 1,
        src: pendingImage.src,
        objectFit: "cover",
        borderRadius: 12,
      });
      selectElements([id]);
      setPendingImage(null);
      setPreviewPos(null);
      return true;
    },
    [pendingImage, scale, wrapperRef, activeSlide, addElement, selectElements, setPendingImage]
  );

  // Preview dimensions
  let previewW = 0;
  let previewH = 0;
  if (pendingImage) {
    const ar = pendingImage.width / pendingImage.height;
    previewW = PREVIEW_MAX_W;
    previewH = previewW / ar;
  }

  return { previewPos, previewW, previewH, trackPointer, placeImage };
}
