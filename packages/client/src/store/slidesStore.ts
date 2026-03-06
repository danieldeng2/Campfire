import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { arrayMoveImmutable } from "array-move";
import type {
  Deck,
  SlideBackground,
  SlideElement,
  SlideRect,
  StyleRun,
  TextStyle,
} from "@/types/slides";
import { HARDCODED_DECK } from "@/lib/hardcodedDeck";

// Module-level helpers to avoid repeating the slide + element lookup in every action
function findEl(state: { deck: Deck }, slideId: string, elementId: string) {
  return (
    state.deck.slides.find((s) => s.id === slideId)?.elements.find((e) => e.id === elementId) ??
    null
  );
}
function findTextEl(state: { deck: Deck }, slideId: string, elementId: string) {
  const el = findEl(state, slideId, elementId);
  return el?.type === "text" ? el : null;
}

interface SlidesState {
  deck: Deck;
  updateElementRect: (slideId: string, elementId: string, rect: SlideRect) => void;
  updateElementContent: (
    slideId: string,
    elementId: string,
    content: string,
    runs?: StyleRun[]
  ) => void;
  updateSlideBackground: (slideId: string, background: SlideBackground) => void;
  updateElementStyle: (slideId: string, elementId: string, patch: Partial<TextStyle>) => void;
  updateElementStyleRange: (
    slideId: string,
    elementId: string,
    range: { start: number; end: number },
    patch: Partial<TextStyle>
  ) => void;
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
        const el = findEl(state, slideId, elementId);
        if (el) el.rect = rect;
      }),

    updateElementContent: (slideId, elementId, content, runs) =>
      set((state) => {
        const el = findTextEl(state, slideId, elementId);
        if (!el) return;
        el.content = content;
        if (runs !== undefined) el.runs = runs;
      }),

    updateSlideBackground: (slideId, background) =>
      set((state) => {
        const slide = state.deck.slides.find((s) => s.id === slideId);
        if (slide) slide.background = background;
      }),

    updateElementStyle: (slideId, elementId, patch) =>
      set((state) => {
        const el = findTextEl(state, slideId, elementId);
        if (el) {
          Object.assign(el.style, patch);
          // Strip patched properties from all runs so the base style takes effect everywhere
          const patchKeys = Object.keys(patch) as (keyof TextStyle)[];
          for (const run of el.runs) {
            for (const key of patchKeys) {
              delete (run.style as Record<string, unknown>)[key];
            }
          }
          const allEmpty = el.runs.every((r) => Object.keys(r.style).length === 0);
          if (allEmpty) el.runs = [];
        }
      }),

    updateElementStyleRange: (slideId, elementId, range, patch) =>
      set((state) => {
        const el = findTextEl(state, slideId, elementId);
        if (!el) return;

        // Flatten content into per-character style entries
        const text = el.content;
        type CharEntry = { char: string; style: Partial<TextStyle> };
        const chars: CharEntry[] = [];
        let pos = 0;
        const runs = el.runs.length > 0 ? el.runs : [{ text, style: {} }];
        for (const run of runs) {
          for (const char of run.text) {
            chars.push({
              char,
              style:
                pos >= range.start && pos < range.end
                  ? { ...run.style, ...patch }
                  : { ...run.style },
            });
            pos++;
          }
        }

        // Re-group into compacted runs
        const newRuns: StyleRun[] = [];
        for (const { char, style } of chars) {
          const last = newRuns.at(-1);
          const styleKey = JSON.stringify(style);
          const lastKey = last ? JSON.stringify(last.style) : null;
          if (last && styleKey === lastKey) {
            last.text += char;
          } else {
            newRuns.push({ text: char, style });
          }
        }

        // If all runs have the same style as base, collapse to empty
        const allEmpty = newRuns.every((r) => Object.keys(r.style).length === 0);
        el.runs = allEmpty ? [] : newRuns;
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
        slide?.elements.push(element);
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
