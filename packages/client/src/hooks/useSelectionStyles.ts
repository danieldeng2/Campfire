import { useEffect, useState } from "react";
import type { TextElement, TextStyle, ResolvedStyles, StyleValue } from "@/types/slides";
import { MIXED } from "@/types/slides";
import { useEditorStore } from "@/store/editorStore";
import { getCharOffset } from "@/lib/domSelection";

function createStyleSets(): Record<keyof TextStyle, Set<string | number>> {
  return {
    fontSize: new Set(),
    fontWeight: new Set(),
    fontStyle: new Set(),
    textDecoration: new Set(),
    color: new Set(),
    textAlign: new Set(),
    lineHeight: new Set(),
    letterSpacing: new Set(),
    fontFamily: new Set(),
  };
}

/** Pure function: resolves styles for a character range across runs */
export function resolveStylesForRange(
  element: TextElement,
  start: number,
  end: number
): ResolvedStyles {
  const base = element.style;
  const runs = element.runs.length > 0 ? element.runs : [{ text: element.content, style: {} }];

  // Collect values for each property across runs that overlap [start, end)
  const sets = createStyleSets();

  let pos = 0;
  for (const run of runs) {
    const runEnd = pos + run.text.length;
    const overlaps = pos < end && runEnd > start;
    if (overlaps) {
      const resolved = { ...base, ...run.style };
      for (const key of Object.keys(sets) as (keyof TextStyle)[]) {
        sets[key].add(resolved[key] as string | number);
      }
    }
    pos = runEnd;
    if (pos >= end) break;
  }

  function pick<T>(key: keyof TextStyle): StyleValue<T> {
    const s = sets[key];
    if (s.size === 0) return base[key] as T;
    if (s.size === 1) return [...s][0] as T;
    return MIXED;
  }

  return {
    fontSize: pick<number>("fontSize"),
    fontWeight: pick<number>("fontWeight"),
    fontStyle: pick<"normal" | "italic">("fontStyle"),
    textDecoration: pick<"none" | "underline" | "line-through" | "underline line-through">(
      "textDecoration"
    ),
    color: pick<string>("color"),
    textAlign: pick<"left" | "center" | "right">("textAlign"),
    lineHeight: pick<number>("lineHeight"),
    letterSpacing: pick<number>("letterSpacing"),
  };
}

/** Resolves styles across multiple elements (for multi-selection, no edit mode) */
export function resolveStylesForElements(elements: TextElement[]): ResolvedStyles {
  if (elements.length === 0) {
    return {
      fontSize: MIXED,
      fontWeight: MIXED,
      fontStyle: MIXED,
      textDecoration: MIXED,
      color: MIXED,
      textAlign: MIXED,
      lineHeight: MIXED,
      letterSpacing: MIXED,
    };
  }
  if (elements.length === 1) {
    const el = elements[0];
    return resolveStylesForRange(el, 0, el.content.length || 1);
  }

  const sets = createStyleSets();

  for (const el of elements) {
    for (const key of Object.keys(sets) as (keyof TextStyle)[]) {
      sets[key].add(el.style[key] as string | number);
    }
  }

  function pick<T>(key: keyof TextStyle): StyleValue<T> {
    const s = sets[key];
    if (s.size === 1) return [...s][0] as T;
    return MIXED;
  }

  return {
    fontSize: pick<number>("fontSize"),
    fontWeight: pick<number>("fontWeight"),
    fontStyle: pick<"normal" | "italic">("fontStyle"),
    textDecoration: pick<"none" | "underline" | "line-through" | "underline line-through">(
      "textDecoration"
    ),
    color: pick<string>("color"),
    textAlign: pick<"left" | "center" | "right">("textAlign"),
    lineHeight: pick<number>("lineHeight"),
    letterSpacing: pick<number>("letterSpacing"),
  };
}

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
      // When focus moves to the sidebar (handleBlur returns early), the browser may
      // collapse the selection and fire selectionchange — ignore those events so
      // selectionRange retains the last real selection for use by applyStyle.
      if (document.activeElement !== container) return;

      // Bail if the selection isn't inside our contentEditable
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (!container.contains(range.commonAncestorContainer)) return;

      const start = getCharOffset(container, range.startContainer, range.startOffset);
      const end = getCharOffset(container, range.endContainer, range.endOffset);

      const effectiveStart = Math.min(start, end);
      const effectiveEnd = Math.max(start, end);

      // If no text selected, resolve at cursor position (treat as single char range)
      const resolveStart = effectiveStart;
      const resolveEnd = effectiveEnd > effectiveStart ? effectiveEnd : effectiveStart + 1;

      setSelectionRange({ start: effectiveStart, end: effectiveEnd });
      setResolved(resolveStylesForRange(element, resolveStart, resolveEnd));
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    // Run once immediately
    handleSelectionChange();

    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isEditing, element, contentRef, setSelectionRange]);

  return resolved;
}
