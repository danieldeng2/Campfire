import { useState } from "react";

interface Options {
  slideCount: number;
  reorderSlide: (from: number, to: number) => void;
}

export function useSlideDrag({ slideCount, reorderSlide }: Options) {
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function getDragHandlers(index: number) {
    return {
      onDragStart: () => setDragFromIndex(index),
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        if (dragFromIndex !== null && dragFromIndex !== index) {
          setDragOverIndex(index);
        }
      },
      onDrop: () => {
        if (dragFromIndex !== null && dragOverIndex !== null) {
          reorderSlide(dragFromIndex, dragOverIndex);
        }
        setDragFromIndex(null);
        setDragOverIndex(null);
      },
      onDragEnd: () => {
        setDragFromIndex(null);
        setDragOverIndex(null);
      },
    };
  }

  const dropZoneProps = {
    active: dragFromIndex !== null && dragFromIndex !== slideCount - 1,
    showIndicator: dragOverIndex === slideCount,
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverIndex(slideCount);
    },
    onDrop: () => {
      if (dragFromIndex !== null) {
        reorderSlide(dragFromIndex, slideCount - 1);
      }
      setDragFromIndex(null);
      setDragOverIndex(null);
    },
  };

  return { dragFromIndex, dragOverIndex, getDragHandlers, dropZoneProps };
}
