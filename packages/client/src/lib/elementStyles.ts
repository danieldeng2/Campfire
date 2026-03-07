import { c } from "@/lib/colors";

/** Selection outline for canvas element wrappers. Coupled with SelectionBox HANDLE_OFFSET. */
export function selectionOutline(isSelected: boolean) {
  return {
    outline: isSelected ? `2px solid ${c.brand}` : "2px solid transparent",
    outlineOffset: "2px",
  } as const;
}
