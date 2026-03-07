import { useState, useCallback } from "react";

export function useContextMenu() {
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  const openContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => setCtxMenu(null), []);

  return { ctxMenu, openContextMenu, closeContextMenu };
}
