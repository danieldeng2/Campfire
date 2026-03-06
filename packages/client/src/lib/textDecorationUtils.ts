export type TextDecoration = "none" | "underline" | "line-through" | "underline line-through";

export function toggleUnderline(current: string): TextDecoration {
  const hasUnderline = current === "underline" || current === "underline line-through";
  const hasStrike = current === "line-through" || current === "underline line-through";
  if (hasUnderline) return hasStrike ? "line-through" : "none";
  return hasStrike ? "underline line-through" : "underline";
}

export function toggleStrikethrough(current: string): TextDecoration {
  const hasStrike = current === "line-through" || current === "underline line-through";
  const hasUnderline = current === "underline" || current === "underline line-through";
  if (hasStrike) return hasUnderline ? "underline" : "none";
  return hasUnderline ? "underline line-through" : "line-through";
}
