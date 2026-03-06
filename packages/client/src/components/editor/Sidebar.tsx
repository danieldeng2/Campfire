"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { useSlideDrag } from "@/hooks/useSlideDrag";
import { c, ink } from "@/lib/colors";
import { SlideThumbnail, THUMBNAIL_WIDTH } from "./SlideThumbnail";
import { DropZone } from "./DragDrop";
import { ContextMenu } from "@/components/UILibrary/ContextMenu";

interface SlideContextMenu {
  x: number;
  y: number;
  slideId: string;
}

export function Sidebar() {
  const slides = useSlidesStore((s) => s.deck.slides);
  const addSlide = useSlidesStore((s) => s.addSlide);
  const reorderSlide = useSlidesStore((s) => s.reorderSlide);
  const deleteSlide = useSlidesStore((s) => s.deleteSlide);
  const { activeSlideId, setActiveSlide } = useEditorStore();

  const [contextMenu, setContextMenu] = useState<SlideContextMenu | null>(null);

  const { dragFromIndex, dragOverIndex, getDragHandlers, dropZoneProps } = useSlideDrag({
    slideCount: slides.length,
    reorderSlide,
  });

  const handleAddSlide = () => {
    const newId = addSlide();
    setActiveSlide(newId);
  };

  const handleDelete = (slideId: string) => {
    const index = slides.findIndex((s) => s.id === slideId);
    deleteSlide(slideId);
    if (activeSlideId === slideId) {
      const remaining = slides.filter((s) => s.id !== slideId);
      const next = remaining[index] ?? remaining[index - 1];
      if (next) setActiveSlide(next.id);
    }
  };

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{
        width: 208,
        background: c.surface,
        borderRight: `1px solid ${ink(0.08)}`,
        paddingTop: 8,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ height: 32, paddingLeft: 16, paddingRight: 12 }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: ink(0.85) }}>Slides</span>
        <button
          onClick={handleAddSlide}
          title="New slide"
          className="flex items-center justify-center rounded transition-colors"
          style={{
            width: 22,
            height: 22,
            color: ink(0.4),
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = ink(0.06);
            (e.currentTarget as HTMLButtonElement).style.color = ink(0.7);
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = ink(0.4);
          }}
        >
          <Plus size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Slide list */}
      <div
        className="flex flex-col gap-4 py-4 scrollbar-track-transparent"
        style={{ overflowY: "scroll", paddingLeft: 16, flex: 1, minHeight: 0, marginRight: 2 }}
      >
        {slides.map((slide, index) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            index={index}
            isActive={slide.id === activeSlideId}
            isDragging={dragFromIndex === index}
            isDragOver={dragOverIndex === index && dragFromIndex !== index}
            onClick={() => setActiveSlide(slide.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, slideId: slide.id });
            }}
            {...getDragHandlers(index)}
          />
        ))}

        <DropZone width={THUMBNAIL_WIDTH} {...dropZoneProps} />
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: "Delete",
              icon: <Trash2 size={13} />,
              danger: true,
              disabled: slides.length <= 1,
              onClick: () => handleDelete(contextMenu.slideId),
            },
          ]}
        />
      )}
    </aside>
  );
}
