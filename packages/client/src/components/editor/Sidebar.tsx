"use client";

import { useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { useSlideDrag } from "@/hooks/useSlideDrag";
import { c, ink } from "@/lib/colors";
import { SlideThumbnail, SIDEBAR_PADDING } from "./SlideThumbnail";
import { DropZone } from "./DragDrop";
import { ContextMenu } from "@/components/UILibrary/ContextMenu";

interface SlideContextMenu {
  x: number;
  y: number;
  slideId: string;
}

interface SidebarProps {
  width: number;
}

export function Sidebar({ width }: SidebarProps) {
  const slides = useSlidesStore((s) => s.deck.slides);
  const addSlide = useSlidesStore((s) => s.addSlide);
  const reorderSlide = useSlidesStore((s) => s.reorderSlide);
  const deleteSlide = useSlidesStore((s) => s.deleteSlide);
  const duplicateSlide = useSlidesStore((s) => s.duplicateSlide);
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

  const thumbnailWidth = width - SIDEBAR_PADDING * 2;

  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        width,
        background: c.surface,
        paddingTop: 8,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          height: 32,
          paddingLeft: SIDEBAR_PADDING,
          paddingRight: SIDEBAR_PADDING,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: ink(0.85) }}>Slides</span>
        <button
          onClick={handleAddSlide}
          title="New slide"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            transition: "background 0.15s, color 0.15s",
            padding: 2,
            color: ink(1),
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = ink(0.06);
            (e.currentTarget as HTMLButtonElement).style.color = ink(1);
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = ink(1);
          }}
        >
          <Plus size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Slide list */}
      <div
        className="sidebar-slide-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingTop: 10,
          paddingBottom: 10,
          overflowY: "scroll",
          paddingLeft: SIDEBAR_PADDING,
          paddingRight: SIDEBAR_PADDING,
          flex: 1,
          minHeight: 0,
          // Gap for the scrolling track
          marginRight: 2,
        }}
      >
        {slides.map((slide, index) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            index={index}
            isActive={slide.id === activeSlideId}
            thumbnailWidth={thumbnailWidth}
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

        <DropZone width={thumbnailWidth} {...dropZoneProps} />
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: "Duplicate",
              icon: <Copy size={13} strokeWidth={1.5} />,
              onClick: () => {
                const newId = duplicateSlide(contextMenu.slideId);
                setActiveSlide(newId);
              },
            },
            {
              label: "Delete",
              icon: <Trash2 size={13} strokeWidth={1.5} />,
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
