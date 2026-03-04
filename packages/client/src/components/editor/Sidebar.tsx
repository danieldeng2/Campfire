"use client";

import { Plus } from "lucide-react";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { SlideThumbnail } from "./SlideThumbnail";

export function Sidebar() {
  const slides = useSlidesStore((s) => s.deck.slides);
  const addSlide = useSlidesStore((s) => s.addSlide);
  const { activeSlideId, setActiveSlide } = useEditorStore();

  const handleAddSlide = () => {
    const newId = addSlide();
    setActiveSlide(newId);
  };

  return (
    <aside
      className="flex flex-col shrink-0 overflow-hidden"
      style={{
        width: 208,
        background: "#ffffff",
        borderRight: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 shrink-0" style={{ height: 36 }}>
        <span className="text-sm font-medium" style={{ color: "#111" }}>
          Slides
        </span>
        <button
          onClick={handleAddSlide}
          title="New slide"
          className="flex items-center justify-center rounded transition-colors"
          style={{
            width: 22,
            height: 22,
            color: "rgba(0,0,0,0.4)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.06)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,0,0,0.7)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,0,0,0.4)";
          }}
        >
          <Plus size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Slide list */}
      <div className="flex flex-col items-center gap-4 py-4 overflow-y-auto">
        {slides.map((slide, index) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            index={index}
            isActive={slide.id === activeSlideId}
            onClick={() => setActiveSlide(slide.id)}
          />
        ))}
      </div>
    </aside>
  );
}
