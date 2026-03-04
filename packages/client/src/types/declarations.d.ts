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
