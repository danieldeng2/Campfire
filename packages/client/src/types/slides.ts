export interface SlideRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline" | "line-through" | "underline line-through";
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
}

export type ElementType = "text";

export interface BaseElement {
  id: string;
  type: ElementType;
  rect: SlideRect;
  zIndex: number;
}

export interface StyleRun {
  text: string;
  style: Partial<TextStyle>;
}

export const MIXED = "Mixed" as const;
export type MixedValue = typeof MIXED;
export type StyleValue<T> = T | MixedValue;

export interface ResolvedStyles {
  fontSize: StyleValue<number>;
  fontWeight: StyleValue<number>;
  fontStyle: StyleValue<"normal" | "italic">;
  textDecoration: StyleValue<"none" | "underline" | "line-through" | "underline line-through">;
  color: StyleValue<string>;
  textAlign: StyleValue<"left" | "center" | "right">;
  lineHeight: StyleValue<number>;
  letterSpacing: StyleValue<number>;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  runs: StyleRun[];
  style: TextStyle;
}

export type SlideElement = TextElement;

export interface SlideBackground {
  type: "color";
  value: string;
}

export interface Slide {
  id: string;
  background: SlideBackground;
  elements: SlideElement[];
  notes: string;
}

export interface Deck {
  id: string;
  title: string;
  slides: Slide[];
}
