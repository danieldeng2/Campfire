import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { arrayMoveImmutable } from "array-move";
import type { Deck, SlideElement, SlideRect } from "@/types/slides";
import { HARDCODED_DECK } from "@/lib/hardcodedDeck";

interface SlidesState {
  deck: Deck;
  updateElementRect: (slideId: string, elementId: string, rect: SlideRect) => void;
  updateElementContent: (slideId: string, elementId: string, content: string) => void;
  updateTitle: (title: string) => void;
  addSlide: () => string; // returns the new slide's id
  reorderSlide: (fromIndex: number, toIndex: number) => void;
  deleteSlide: (slideId: string) => void;
  addElement: (slideId: string, element: SlideElement) => void;
  deleteElement: (slideId: string, elementId: string) => void;
}

export const useSlidesStore = create<SlidesState>()(
  immer((set) => ({
    deck: HARDCODED_DECK,

    updateElementRect: (slideId, elementId, rect) =>
      set((state) => {
        const slide = state.deck.slides.find((s) => s.id === slideId);
        const el = slide?.elements.find((e) => e.id === elementId);
        if (el) el.rect = rect;
      }),

    updateElementContent: (slideId, elementId, content) =>
      set((state) => {
        const slide = state.deck.slides.find((s) => s.id === slideId);
        const el = slide?.elements.find((e) => e.id === elementId);
        if (el && el.type === "text") el.content = content;
      }),

    updateTitle: (title) =>
      set((state) => {
        state.deck.title = title;
      }),

    reorderSlide: (from, to) =>
      set((state) => {
        state.deck.slides = arrayMoveImmutable(state.deck.slides, from, to);
      }),

    deleteSlide: (slideId) =>
      set((state) => {
        state.deck.slides = state.deck.slides.filter((s) => s.id !== slideId);
      }),

    addElement: (slideId, element) =>
      set((state) => {
        const slide = state.deck.slides.find((s) => s.id === slideId);
        if (slide) slide.elements.push(element);
      }),

    deleteElement: (slideId, elementId) =>
      set((state) => {
        const slide = state.deck.slides.find((s) => s.id === slideId);
        if (slide) slide.elements = slide.elements.filter((e) => e.id !== elementId);
      }),

    addSlide: () => {
      const id = crypto.randomUUID();
      set((state) => {
        const lastSlide = state.deck.slides.at(-1);
        const background = lastSlide
          ? { ...lastSlide.background }
          : { type: "color" as const, value: "#ffffff" };
        state.deck.slides.push({ id, background, elements: [], notes: "" });
      });
      return id;
    },
  }))
);
