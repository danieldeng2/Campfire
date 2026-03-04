import { create } from "zustand";
import { Tool } from "@/types/editor";

interface EditorState {
  activeSlideId: string | null;
  selectedElementId: string | null;
  editingElementId: string | null;
  activeTool: Tool;
  setActiveSlide: (id: string) => void;
  selectElement: (id: string | null) => void;
  setEditingElement: (id: string | null) => void;
  setActiveTool: (tool: Tool) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  activeSlideId: null,
  selectedElementId: null,
  editingElementId: null,
  activeTool: Tool.Move,
  setActiveSlide: (id) =>
    set({ activeSlideId: id, selectedElementId: null, editingElementId: null }),
  selectElement: (id) => set({ selectedElementId: id }),
  setEditingElement: (id) => set({ editingElementId: id }),
  setActiveTool: (tool) =>
    set({ activeTool: tool, selectedElementId: null, editingElementId: null }),
}));
