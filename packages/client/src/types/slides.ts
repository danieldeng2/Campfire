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

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
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
