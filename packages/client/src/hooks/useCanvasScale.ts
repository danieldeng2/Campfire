"use client";

import { useCallback, useRef, useState } from "react";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const CANVAS_SCALE = 0.94;

export function computeScale(width: number, height: number) {
  const scaleX = width / CANVAS_WIDTH;
  const scaleY = height / CANVAS_HEIGHT;
  return Math.min(scaleX, scaleY) * CANVAS_SCALE;
}

export function useCanvasScale() {
  const [scale, setScale] = useState(0.5);
  const observerRef = useRef<ResizeObserver | null>(null);

  const containerRef = useCallback((container: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    setScale(computeScale(width, height));

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(computeScale(width, height));
    });

    observer.observe(container);
    observerRef.current = observer;
  }, []);

  return { scale, canvasWidth: CANVAS_WIDTH, canvasHeight: CANVAS_HEIGHT, containerRef };
}
