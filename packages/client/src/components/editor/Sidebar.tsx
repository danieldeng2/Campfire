"use client";

import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { SlideThumbnail } from "./SlideThumbnail";

export function Sidebar() {
  const slides = useSlidesStore((s) => s.deck.slides);
  const { activeSlideId, setActiveSlide } = useEditorStore();

  return (
    <aside
      className="flex flex-col items-center gap-4 py-4 overflow-y-auto shrink-0"
      style={{
        width: 208,
        background: "#e8e8e8",
        borderRight: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {slides.map((slide, index) => (
        <SlideThumbnail
          key={slide.id}
          slide={slide}
          index={index}
          isActive={slide.id === activeSlideId}
          onClick={() => setActiveSlide(slide.id)}
        />
      ))}
    </aside>
  );
}
