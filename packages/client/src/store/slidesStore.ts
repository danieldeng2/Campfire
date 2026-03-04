import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Deck, SlideRect } from "@/types/slides";
import { HARDCODED_DECK } from "@/lib/hardcodedDeck";

interface SlidesState {
  deck: Deck;
  updateElementRect: (slideId: string, elementId: string, rect: SlideRect) => void;
  updateElementContent: (slideId: string, elementId: string, content: string) => void;
  addSlide: () => string; // returns the new slide's id
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

    addSlide: () => {
      const id = crypto.randomUUID();
      set((state) => {
        state.deck.slides.push({
          id,
          background: { type: "color", value: "#ffffff" },
          elements: [],
          notes: "",
        });
      });
      return id;
    },
  }))
);
