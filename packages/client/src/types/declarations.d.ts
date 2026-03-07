declare module "reveal.js" {
  interface RevealOptions {
    controls?: boolean;
    progress?: boolean;
    center?: boolean;
    hash?: boolean;
    transition?: string;
    width?: number;
    height?: number;
    margin?: number;
    keyboard?: boolean | Record<number, (() => void) | null>;
  }

  class Reveal {
    constructor(element: HTMLElement, options?: RevealOptions);
    initialize(): Promise<void>;
    destroy(): void;
  }

  export default Reveal;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "material-colors" {
  type Shade = Record<string, string>;
  const colors: {
    red: Shade;
    pink: Shade;
    purple: Shade;
    deepPurple: Shade;
    indigo: Shade;
    blue: Shade;
    lightBlue: Shade;
    cyan: Shade;
    teal: Shade;
    green: Shade;
    lightGreen: Shade;
    lime: Shade;
    yellow: Shade;
    amber: Shade;
    orange: Shade;
    deepOrange: Shade;
    brown: Shade;
    grey: Shade;
    blueGrey: Shade;
    white: string;
    black: string;
  };
  export default colors;
}
