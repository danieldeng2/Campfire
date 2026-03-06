import { create } from "zustand";
import { Tool } from "@/types/editor";

interface EditorState {
  activeSlideId: string | null;
  selectedElementIds: string[];
  editingElementId: string | null;
  activeTool: Tool;
  selectionRange: { start: number; end: number } | null;
  snapLines: { showH: boolean; showV: boolean };
  /** Flushes unsaved DOM content to the store. Registered by TextElement while editing. */
  flushEditingContent: (() => void) | null;
  setActiveSlide: (id: string) => void;
  selectElements: (ids: string[]) => void;
  setEditingElement: (id: string | null) => void;
  setActiveTool: (tool: Tool) => void;
  setSelectionRange: (range: { start: number; end: number } | null) => void;
  setSnapLines: (snap: { showH: boolean; showV: boolean }) => void;
  setFlushEditingContent: (fn: (() => void) | null) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  activeSlideId: null,
  selectedElementIds: [],
  editingElementId: null,
  activeTool: Tool.Move,
  selectionRange: null,
  snapLines: { showH: false, showV: false },
  flushEditingContent: null,
  setActiveSlide: (id) =>
    set({
      activeSlideId: id,
      selectedElementIds: [],
      editingElementId: null,
      selectionRange: null,
    }),
  selectElements: (ids) => set({ selectedElementIds: ids }),
  setEditingElement: (id) =>
    set({ editingElementId: id, selectionRange: id === null ? null : undefined }),
  setActiveTool: (tool) =>
    set({ activeTool: tool, selectedElementIds: [], editingElementId: null, selectionRange: null }),
  setSelectionRange: (range) => set({ selectionRange: range }),
  setSnapLines: (snap) => set({ snapLines: snap }),
  setFlushEditingContent: (fn) => set({ flushEditingContent: fn }),
}));
