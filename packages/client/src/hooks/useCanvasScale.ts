"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

export function useCanvasScale(containerRef: React.RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const scaleX = width / CANVAS_WIDTH;
      const scaleY = height / CANVAS_HEIGHT;
      setScale(Math.min(scaleX, scaleY) * 0.94);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  return { scale, canvasWidth: CANVAS_WIDTH, canvasHeight: CANVAS_HEIGHT };
}
