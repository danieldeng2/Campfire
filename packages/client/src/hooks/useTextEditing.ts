import { useEffect, useCallback } from "react";
import type { StyleRun, TextStyle, TextElement } from "@/types/slides";
import { runsToHtml } from "@/lib/runsToHtml";
import { useEditorStore } from "@/store/editorStore";
import { domToRuns, getCharOffset, restoreCharSelection } from "@/lib/domSelection";
import { getFormattingPatch } from "@/lib/textFormatting";

interface Options {
  id: string;
  slideId: string;
  content: string;
  runs: StyleRun[];
  style: TextStyle;
  isSelected: boolean;
  isEditing: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  updateElementContent: (slideId: string, id: string, content: string, runs?: StyleRun[]) => void;
  updateElementStyle: (slideId: string, elementId: string, patch: Partial<TextStyle>) => void;
  updateElementStyleRange: (
    slideId: string,
    elementId: string,
    range: { start: number; end: number },
    patch: Partial<TextStyle>
  ) => void;
  selectElements: (ids: string[]) => void;
  setEditingElement: (id: string | null) => void;
}

export function useTextEditing({
  id,
  slideId,
  content,
  runs,
  style,
  isSelected,
  isEditing,
  contentRef,
  updateElementContent,
  updateElementStyle,
  updateElementStyleRange,
  selectElements,
  setEditingElement,
}: Options) {
  // Sync content into DOM when not editing
  useEffect(() => {
    if (!isEditing && contentRef.current) {
      contentRef.current.innerHTML = runsToHtml(content, runs, style);
    }
  }, [content, runs, style, isEditing, contentRef]);

  // Focus and place cursor when editing starts (single-click path)
  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      const sel = window.getSelection();
      const alreadySelected =
        sel &&
        sel.rangeCount > 0 &&
        contentRef.current.contains(sel.getRangeAt(0).commonAncestorContainer);
      if (!alreadySelected) {
        const range = document.createRange();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [isEditing, contentRef]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isSelected) {
        selectElements([id]);
      } else if (!isEditing) {
        setEditingElement(id);
      }
    },
    [isSelected, isEditing, id, selectElements, setEditingElement]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const sel = window.getSelection();
      let wordOffsets: { start: number; end: number } | null = null;
      if (sel && sel.rangeCount > 0 && contentRef.current) {
        const range = sel.getRangeAt(0);
        if (contentRef.current.contains(range.commonAncestorContainer)) {
          const start = getCharOffset(contentRef.current, range.startContainer, range.startOffset);
          const end = getCharOffset(contentRef.current, range.endContainer, range.endOffset);
          if (start !== end) wordOffsets = { start, end };
        }
      }
      selectElements([id]);
      setEditingElement(id);
      if (wordOffsets) {
        const { start, end } = wordOffsets;
        requestAnimationFrame(() => {
          if (contentRef.current) {
            contentRef.current.focus();
            restoreCharSelection(contentRef.current, start, end);
            useEditorStore.getState().setSelectionRange({ start, end });
          }
        });
      }
    },
    [id, selectElements, setEditingElement, contentRef]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      if (relatedTarget?.closest("[data-sidebar]")) return;

      if (contentRef.current) {
        const { content: newContent, runs: newRuns } = domToRuns(contentRef.current);
        updateElementContent(slideId, id, newContent, newRuns);
      }
      setEditingElement(null);
    },
    [slideId, id, updateElementContent, setEditingElement, contentRef]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        contentRef.current?.blur();
        return;
      }

      const modKey = e.metaKey || e.ctrlKey;
      if (!modKey) return;

      const { selectionRange: currentRange } = useEditorStore.getState();
      const patch = getFormattingPatch(e.key, e.shiftKey, {
        element: { id, content, runs, style } as TextElement,
        selectionRange: currentRange,
      });

      if (!patch) return;
      e.preventDefault();

      if (currentRange && currentRange.start !== currentRange.end) {
        useEditorStore.getState().flushEditingContent?.();
        updateElementStyleRange(slideId, id, currentRange, patch);
      } else {
        updateElementStyle(slideId, id, patch);
      }
    },
    [contentRef, id, slideId, content, runs, style, updateElementStyle, updateElementStyleRange]
  );

  return { handleClick, handleDoubleClick, handleBlur, handleKeyDown };
}
