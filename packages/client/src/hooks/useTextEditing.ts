import { useEffect, useCallback } from "react";

interface Options {
  id: string;
  slideId: string;
  content: string;
  isSelected: boolean;
  isEditing: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  updateElementContent: (slideId: string, id: string, content: string) => void;
  selectElements: (ids: string[]) => void;
  setEditingElement: (id: string | null) => void;
}

export function useTextEditing({
  id,
  slideId,
  content,
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
      contentRef.current.textContent = content;
    }
  }, [content, isEditing, contentRef]);

  // Focus and move cursor to end when editing starts
  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
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
      selectElements([id]);
      setEditingElement(id);
    },
    [id, selectElements, setEditingElement]
  );

  const handleBlur = useCallback(() => {
    if (contentRef.current) {
      updateElementContent(slideId, id, contentRef.current.textContent ?? "");
    }
    setEditingElement(null);
  }, [slideId, id, updateElementContent, setEditingElement, contentRef]);

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
