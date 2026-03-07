import { useEffect, useState } from "react";
import type { TextElement, ResolvedStyles } from "@/types/slides";
import { useEditorStore } from "@/store/editorStore";
import { getCharOffset } from "@/lib/domSelection";
import { resolveStylesForRange } from "@/lib/resolveStyles";

// Re-export so existing consumers don't need to update their imports
export { resolveStylesForRange, resolveStylesForElements } from "@/lib/resolveStyles";

/**
 * Hook that tracks the current text selection inside a contentEditable element
 * and returns the resolved styles for that selection.
 */
export function useSelectionStyles(
  contentRef: React.RefObject<HTMLDivElement | null>,
  isEditing: boolean,
  element: TextElement | null
): ResolvedStyles | null {
  const setSelectionRange = useEditorStore((s) => s.setSelectionRange);
  const [resolved, setResolved] = useState<ResolvedStyles | null>(null);

  useEffect(() => {
    if (!isEditing || !element) {
      setResolved(null);
      return;
    }

    function handleSelectionChange() {
      const container = contentRef.current;
      if (!container || !element) return;

      // Only update when the contentEditable itself has focus.
      if (document.activeElement !== container) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (!container.contains(range.commonAncestorContainer)) return;

      const start = getCharOffset(container, range.startContainer, range.startOffset);
      const end = getCharOffset(container, range.endContainer, range.endOffset);

      const effectiveStart = Math.min(start, end);
      const effectiveEnd = Math.max(start, end);

      const resolveStart = effectiveStart;
      const resolveEnd = effectiveEnd > effectiveStart ? effectiveEnd : effectiveStart + 1;

      setSelectionRange({ start: effectiveStart, end: effectiveEnd });
      setResolved(resolveStylesForRange(element, resolveStart, resolveEnd));
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    handleSelectionChange();

    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isEditing, element, contentRef, setSelectionRange]);

  return resolved;
}
