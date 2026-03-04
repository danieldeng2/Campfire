"use client";

import { useEffect } from "react";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { useEditorStore } from "@/store/editorStore";
import { useSlidesStore } from "@/store/slidesStore";

export default function EditorPage() {
  const setActiveSlide = useEditorStore((s) => s.setActiveSlide);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const firstSlideId = useSlidesStore((s) => s.deck.slides[0]?.id);

  useEffect(() => {
    // Only initialize if no slide is already selected (i.e. first load, not returning from /present)
    if (!activeSlideId && firstSlideId) setActiveSlide(firstSlideId);
  }, [activeSlideId, firstSlideId, setActiveSlide]);

  return <EditorLayout />;
}
