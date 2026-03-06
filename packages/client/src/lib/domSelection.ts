import type { StyleRun, TextStyle } from "@/types/slides";

/** Extract text treating <br> as \n and block elements as newline-prefixed */
function extractText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  const el = node as Element;
  if (el.tagName === "BR") return "\n";
  const inner = Array.from(node.childNodes).map(extractText).join("");
  if (el.tagName === "DIV" || el.tagName === "P") return "\n" + inner;
  return inner;
}

/** Serialize the contentEditable DOM back to StyleRun[] by reading span structure */
export function domToRuns(container: HTMLElement): { content: string; runs: StyleRun[] } {
  const content = Array.from(container.childNodes).map(extractText).join("");
  const children = Array.from(container.childNodes);

  // If no styled spans (br-only elements don't count), return empty runs (plain text)
  const hasSpans = children.some(
    (n) => n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName !== "BR"
  );
  if (!hasSpans) return { content, runs: [] };

  const runs: StyleRun[] = [];
  for (const node of children) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text) runs.push({ text, style: {} });
    } else if ((node as Element).tagName === "BR") {
      runs.push({ text: "\n", style: {} });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const text = extractText(el);
      if (!text) continue;
      const style: Partial<TextStyle> = {};
      if (el.style.fontSize) style.fontSize = parseFloat(el.style.fontSize);
      if (el.style.fontWeight) style.fontWeight = parseInt(el.style.fontWeight, 10);
      if (el.style.fontStyle && el.style.fontStyle !== "normal")
        style.fontStyle = el.style.fontStyle as "italic";
      const td = el.style.textDecoration;
      if (td) {
        const hasUnderline = td.includes("underline");
        const hasStrike = td.includes("line-through");
        if (hasUnderline && hasStrike) style.textDecoration = "underline line-through";
        else if (hasUnderline) style.textDecoration = "underline";
        else if (hasStrike) style.textDecoration = "line-through";
      }
      if (el.style.color) style.color = el.style.color;
      if (el.style.letterSpacing) style.letterSpacing = parseFloat(el.style.letterSpacing);
      runs.push({ text, style });
    }
  }

  // If all runs have empty style, collapse to []
  const allEmpty = runs.every((r) => Object.keys(r.style).length === 0);
  return { content, runs: allEmpty ? [] : runs };
}

/** Returns the character offset of a DOM position within a container */
export function getCharOffset(container: HTMLElement, node: Node, offset: number): number {
  let charCount = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    if (current === node) return charCount + offset;
    charCount += (current.textContent ?? "").length;
    current = walker.nextNode();
  }
  return charCount + offset;
}

/** Restores a character-offset selection range inside a contentEditable */
export function restoreCharSelection(container: HTMLElement, start: number, end: number) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let charCount = 0;
  let startNode: Node | null = null;
  let startOffset = 0;
  let endNode: Node | null = null;
  let endOffset = 0;

  let node = walker.nextNode();
  while (node) {
    const len = (node.textContent ?? "").length;
    if (!startNode && charCount + len >= start) {
      startNode = node;
      startOffset = start - charCount;
    }
    if (!endNode && charCount + len >= end) {
      endNode = node;
      endOffset = end - charCount;
    }
    if (startNode && endNode) break;
    charCount += len;
    node = walker.nextNode();
  }

  if (!startNode || !endNode) return;
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}
