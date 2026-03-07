"use client";

import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import type { TextElement, ImageElement, ResolvedStyles } from "@/types/slides";
import { c } from "@/lib/colors";
import { resolveStylesForRange, resolveStylesForElements } from "@/hooks/useSelectionStyles";
import { PageSection } from "./PageSection";
import { TextSection } from "./TextSection";
import { ImageSection } from "./ImageSection";
import { LayoutSection } from "./LayoutSection";

interface RightSidebarProps {
  width: number;
}

export function RightSidebar({ width }: RightSidebarProps) {
  const { activeSlideId, selectedElementIds, editingElementId, selectionRange } = useEditorStore();
  const slides = useSlidesStore((s) => s.deck.slides);

  const activeSlide = slides.find((s) => s.id === activeSlideId);
  const allElements = activeSlide?.elements ?? [];
  const selectedElements = allElements.filter((e) => selectedElementIds.includes(e.id));
  const allText = selectedElements.length > 0 && selectedElements.every((e) => e.type === "text");
  const allImage = selectedElements.length > 0 && selectedElements.every((e) => e.type === "image");

  // Compute resolved styles
  let resolvedStyles: ResolvedStyles | null = null;
  if (allText) {
    if (editingElementId && selectionRange) {
      // In edit mode: resolve styles for the selection range
      const editingEl = allElements.find((e) => e.id === editingElementId) as
        | TextElement
        | undefined;
      if (editingEl) {
        resolvedStyles = resolveStylesForRange(
          editingEl,
          selectionRange.start,
          Math.max(selectionRange.end, selectionRange.start + 1)
        );
      }
    }
    if (!resolvedStyles) {
      resolvedStyles = resolveStylesForElements(selectedElements as TextElement[]);
    }
  }

  return (
    <aside
      data-sidebar=""
      style={{
        width,
        flexShrink: 0,
        background: c.surface,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {selectedElements.length === 0 && <PageSection slide={activeSlide} />}
      {allText && resolvedStyles && (
        <TextSection
          elements={selectedElements as TextElement[]}
          resolvedStyles={resolvedStyles}
          activeSlideId={activeSlideId!}
        />
      )}
      {allImage && (
        <ImageSection
          elements={selectedElements as ImageElement[]}
          activeSlideId={activeSlideId!}
        />
      )}
      {selectedElements.length > 0 && (
        <LayoutSection elements={selectedElements} activeSlideId={activeSlideId!} />
      )}
    </aside>
  );
}
