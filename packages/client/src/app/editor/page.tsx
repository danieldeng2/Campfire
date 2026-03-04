"use client";

import { useEffect } from "react";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { useEditorStore } from "@/store/editorStore";
import { useSlidesStore } from "@/store/slidesStore";

export default function EditorPage() {
  const setActiveSlide = useEditorStore((s) => s.setActiveSlide);
  const firstSlideId = useSlidesStore((s) => s.deck.slides[0]?.id);

  useEffect(() => {
    if (firstSlideId) setActiveSlide(firstSlideId);
  }, [firstSlideId, setActiveSlide]);

  return <EditorLayout />;
}
