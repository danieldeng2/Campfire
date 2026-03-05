import colors from "tailwindcss/colors";

/** Translucent black — for borders, overlays, and muted text */
export const ink = (opacity: number): string => `rgba(0,0,0,${opacity})`;

export const c = {
  // Brand (Campfire orange)
  brand: colors.orange[500],
  brandHover: colors.orange[600],
  brandGhost: "rgba(249,115,22,0.06)", // very subtle brand tint

  // Surfaces
  surface: "#ffffff",
  canvas: "#f0f0f0",

  // Primary text
  ink: "#111111",

  // Destructive
  danger: colors.red[600],
  dangerBg: "rgba(220,38,38,0.07)",

  // Campfire icon (intentionally fixed — brand identity)
  flameOuter: "#f97316",
  flameInner: "#fbbf24",
  logLight: "#a0673a",
  logDark: "#7a4f2b",
} as const;
