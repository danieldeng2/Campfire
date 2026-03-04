import { create } from "zustand";
import { Tool } from "@/types/editor";

interface EditorState {
  activeSlideId: string | null;
  selectedElementIds: string[];
  editingElementId: string | null;
  activeTool: Tool;
  setActiveSlide: (id: string) => void;
  selectElements: (ids: string[]) => void;
  setEditingElement: (id: string | null) => void;
  setActiveTool: (tool: Tool) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  activeSlideId: null,
  selectedElementIds: [],
  editingElementId: null,
  activeTool: Tool.Move,
  setActiveSlide: (id) =>
    set({ activeSlideId: id, selectedElementIds: [], editingElementId: null }),
  selectElements: (ids) => set({ selectedElementIds: ids }),
  setEditingElement: (id) => set({ editingElementId: id }),
  setActiveTool: (tool) =>
    set({ activeTool: tool, selectedElementIds: [], editingElementId: null }),
}));
