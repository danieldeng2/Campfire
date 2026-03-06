import { useEffect, useCallback } from "react";
import type { StyleRun, TextStyle } from "@/types/slides";
import { runsToHtml } from "@/lib/runsToHtml";
import { useEditorStore } from "@/store/editorStore";
import { domToRuns, getCharOffset, restoreCharSelection } from "@/lib/domSelection";

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
      // The inner div has userSelect:"text" so the browser performs native word selection.
      // Capture offsets NOW (before selectElements/setEditingElement trigger a re-render that
      // may clear the browser selection). Then restore after React paints via rAF — this works
      // even when isEditing was already true (focus effect only fires on false→true transition).
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
      // If focus is moving into the sidebar, defer the blur so sidebar controls
      // can read selectionRange and apply styles before edit mode exits.
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
      }
    },
    [contentRef]
  );

  return { handleClick, handleDoubleClick, handleBlur, handleKeyDown };
}
