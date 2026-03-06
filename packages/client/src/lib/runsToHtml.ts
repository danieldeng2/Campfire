import type { StyleRun, TextStyle } from "@/types/slides";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

/** Returns only the CSS properties that differ from the base style */
function runStyleToCss(runStyle: Partial<TextStyle>): string {
  const parts: string[] = [];
  if (runStyle.fontSize !== undefined) parts.push(`font-size:${runStyle.fontSize}px`);
  if (runStyle.fontWeight !== undefined) parts.push(`font-weight:${runStyle.fontWeight}`);
  if (runStyle.fontStyle !== undefined) parts.push(`font-style:${runStyle.fontStyle}`);
  if (runStyle.textDecoration !== undefined)
    parts.push(`text-decoration:${runStyle.textDecoration}`);
  if (runStyle.color !== undefined) parts.push(`color:${runStyle.color}`);
  if (runStyle.letterSpacing !== undefined)
    parts.push(`letter-spacing:${runStyle.letterSpacing}px`);
  return parts.join(";");
}

/**
 * Converts a TextElement's content + runs into an HTML string for innerHTML.
 * If runs is empty, returns plain escaped text (backward-compatible).
 */
export function runsToHtml(content: string, runs: StyleRun[], _base: TextStyle): string {
  if (!runs || runs.length === 0) {
    return escapeHtml(content);
  }
  return runs
    .map((run) => {
      const css = runStyleToCss(run.style);
      const escaped = escapeHtml(run.text);
      if (css) {
        return `<span style="${css}">${escaped}</span>`;
      }
      return escaped;
    })
    .join("");
}
