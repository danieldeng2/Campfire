import type { TextElement, TextStyle, ResolvedStyles, StyleValue } from "@/types/slides";
import { MIXED } from "@/types/slides";

function createStyleSets(): Record<keyof TextStyle, Set<string | number>> {
  return {
    fontSize: new Set(),
    fontWeight: new Set(),
    fontStyle: new Set(),
    textDecoration: new Set(),
    color: new Set(),
    textAlign: new Set(),
    lineHeight: new Set(),
    letterSpacing: new Set(),
    fontFamily: new Set(),
  };
}

function pickResolved<T>(
  sets: Record<keyof TextStyle, Set<string | number>>,
  key: keyof TextStyle,
  fallback: StyleValue<T>
): StyleValue<T> {
  const s = sets[key];
  if (s.size === 0) return fallback;
  if (s.size === 1) return [...s][0] as T;
  return MIXED;
}

function toResolvedStyles(
  sets: Record<keyof TextStyle, Set<string | number>>,
  base?: TextStyle
): ResolvedStyles {
  function pick<T>(key: keyof TextStyle): StyleValue<T> {
    return pickResolved<T>(sets, key, base ? (base[key] as T) : (MIXED as StyleValue<T>));
  }
  return {
    fontSize: pick<number>("fontSize"),
    fontWeight: pick<number>("fontWeight"),
    fontStyle: pick<"normal" | "italic">("fontStyle"),
    textDecoration: pick<"none" | "underline" | "line-through" | "underline line-through">(
      "textDecoration"
    ),
    color: pick<string>("color"),
    textAlign: pick<"left" | "center" | "right">("textAlign"),
    lineHeight: pick<number>("lineHeight"),
    letterSpacing: pick<number>("letterSpacing"),
  };
}

/** Resolves styles for a character range across runs */
export function resolveStylesForRange(
  element: TextElement,
  start: number,
  end: number
): ResolvedStyles {
  const base = element.style;
  const runs = element.runs.length > 0 ? element.runs : [{ text: element.content, style: {} }];

  const sets = createStyleSets();

  let pos = 0;
  for (const run of runs) {
    const runEnd = pos + run.text.length;
    if (pos < end && runEnd > start) {
      const resolved = { ...base, ...run.style };
      for (const key of Object.keys(sets) as (keyof TextStyle)[]) {
        sets[key].add(resolved[key] as string | number);
      }
    }
    pos = runEnd;
    if (pos >= end) break;
  }

  return toResolvedStyles(sets, base);
}

/** Resolves styles across multiple elements (for multi-selection, no edit mode) */
export function resolveStylesForElements(elements: TextElement[]): ResolvedStyles {
  if (elements.length === 0) {
    return {
      fontSize: MIXED,
      fontWeight: MIXED,
      fontStyle: MIXED,
      textDecoration: MIXED,
      color: MIXED,
      textAlign: MIXED,
      lineHeight: MIXED,
      letterSpacing: MIXED,
    };
  }
  if (elements.length === 1) {
    const el = elements[0];
    return resolveStylesForRange(el, 0, el.content.length || 1);
  }

  const sets = createStyleSets();

  for (const el of elements) {
    for (const key of Object.keys(sets) as (keyof TextStyle)[]) {
      sets[key].add(el.style[key] as string | number);
    }
  }

  return toResolvedStyles(sets);
}
