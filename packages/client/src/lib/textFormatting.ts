import type { TextElement, TextStyle } from "@/types/slides";
import { resolveStylesForRange } from "@/lib/resolveStyles";
import { toggleUnderline, toggleStrikethrough } from "@/lib/textDecorationUtils";

interface FormatContext {
  element: TextElement;
  selectionRange: { start: number; end: number } | null;
}

function resolveAtRange(element: TextElement, range: { start: number; end: number } | null) {
  const start = range?.start ?? 0;
  const end = range && range.end > range.start ? range.end : start + 1;
  return resolveStylesForRange(element, start, end);
}

/**
 * Given a keyboard shortcut key (with meta/ctrl held), returns the style
 * patch to apply — or null if the key isn't a formatting shortcut.
 */
export function getFormattingPatch(
  key: string,
  shiftKey: boolean,
  ctx: FormatContext
): Partial<TextStyle> | null {
  const resolved = resolveAtRange(ctx.element, ctx.selectionRange);

  if (key === "b" || key === "B") {
    const isBold = typeof resolved.fontWeight === "number" && resolved.fontWeight >= 700;
    return { fontWeight: isBold ? 400 : 700 };
  }

  if (key === "i" || key === "I") {
    const isItalic = resolved.fontStyle === "italic";
    return { fontStyle: isItalic ? "normal" : "italic" };
  }

  if (!shiftKey && (key === "u" || key === "U")) {
    const cur = resolved.textDecoration === "Mixed" ? "none" : resolved.textDecoration;
    return { textDecoration: toggleUnderline(cur) };
  }

  if (shiftKey && (key === "x" || key === "X")) {
    const cur = resolved.textDecoration === "Mixed" ? "none" : resolved.textDecoration;
    return { textDecoration: toggleStrikethrough(cur) };
  }

  return null;
}
