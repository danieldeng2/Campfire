import type { TextStyle } from "@/types/slides";
import { c } from "@/lib/colors";

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: 40,
  fontWeight: 400,
  fontStyle: "normal",
  color: c.ink,
  textAlign: "left",
  lineHeight: 1.4,
  letterSpacing: 0,
};
