"use client";

import { useEffect } from "react";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { SlideCanvas } from "./SlideCanvas";

export function EditorLayout() {
  const slides = useSlidesStore((s) => s.deck.slides);
  const { activeSlideId, editingElementId, setActiveSlide } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate while typing in a text element
      if (editingElementId) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      const currentIndex = slides.findIndex((s) => s.id === activeSlideId);
      if (currentIndex === -1) return;

      const nextIndex =
        e.key === "ArrowRight"
          ? Math.min(currentIndex + 1, slides.length - 1)
          : Math.max(currentIndex - 1, 0);

      if (nextIndex !== currentIndex) {
        setActiveSlide(slides[nextIndex].id);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [slides, activeSlideId, editingElementId, setActiveSlide]);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "#f0f0f0", color: "#111" }}
    >
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center overflow-hidden p-8">
          <SlideCanvas />
        </main>
      </div>
    </div>
  );
}
