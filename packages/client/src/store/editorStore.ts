import { create } from "zustand";

interface EditorState {
  activeSlideId: string | null;
  selectedElementId: string | null;
  editingElementId: string | null;
  setActiveSlide: (id: string) => void;
  selectElement: (id: string | null) => void;
  setEditingElement: (id: string | null) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  activeSlideId: null,
  selectedElementId: null,
  editingElementId: null,
  setActiveSlide: (id) => set({ activeSlideId: id, selectedElementId: null, editingElementId: null }),
  selectElement: (id) => set({ selectedElementId: id }),
  setEditingElement: (id) => set({ editingElementId: id }),
}));
