"use client";

import { useEffect } from "react";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { Tool } from "@/types/editor";
import { c } from "@/lib/colors";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { SlideCanvas } from "./SlideCanvas";
import { ToolBar } from "./ToolBar";
import { RightSidebar } from "./sidebar/RightSidebar";

export function EditorLayout() {
  const slides = useSlidesStore((s) => s.deck.slides);
  const deleteElement = useSlidesStore((s) => s.deleteElement);
  const {
    activeSlideId,
    editingElementId,
    selectedElementIds,
    selectElements,
    setActiveSlide,
    setActiveTool,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts while typing in a text element or sidebar input
      if (editingElementId) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "v" || e.key === "V") {
        setActiveTool(Tool.Move);
        return;
      }
      if (e.key === "t" || e.key === "T") {
        setActiveTool(Tool.Text);
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementIds.length > 0) {
        e.preventDefault();
        if (!activeSlideId) return;
        for (const id of selectedElementIds) {
          deleteElement(activeSlideId, id);
        }
        selectElements([]);
        return;
      }

      if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const slide = slides.find((s) => s.id === activeSlideId);
        if (slide) selectElements(slide.elements.map((el) => el.id));
        return;
      }

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
  }, [
    slides,
    activeSlideId,
    editingElementId,
    selectedElementIds,
    selectElements,
    deleteElement,
    setActiveSlide,
    setActiveTool,
  ]);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: c.canvas, color: c.ink }}
    >
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className="flex flex-1 items-center justify-center overflow-hidden p-8"
          style={{ position: "relative" }}
        >
          <SlideCanvas />
          <ToolBar />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
