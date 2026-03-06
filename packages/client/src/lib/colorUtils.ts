import colors from "tailwindcss/colors";

// Columns = hue families, rows = shades light → dark
export const COLOR_COLUMNS: string[][] = [
  // Neutrals
  [
    "#ffffff",
    colors.neutral[200],
    colors.neutral[400],
    colors.neutral[500],
    colors.neutral[700],
    colors.neutral[900],
    "#000000",
  ],
  // Red
  [
    colors.red[100],
    colors.red[200],
    colors.red[300],
    colors.red[400],
    colors.red[500],
    colors.red[700],
    colors.red[900],
  ],
  // Orange
  [
    colors.orange[100],
    colors.orange[200],
    colors.orange[300],
    colors.orange[400],
    colors.orange[500],
    colors.orange[700],
    colors.orange[900],
  ],
  // Amber
  [
    colors.amber[100],
    colors.amber[200],
    colors.amber[300],
    colors.amber[400],
    colors.amber[500],
    colors.amber[700],
    colors.amber[900],
  ],
  // Yellow
  [
    colors.yellow[100],
    colors.yellow[200],
    colors.yellow[300],
    colors.yellow[400],
    colors.yellow[500],
    colors.yellow[700],
    colors.yellow[900],
  ],
  // Lime
  [
    colors.lime[100],
    colors.lime[200],
    colors.lime[300],
    colors.lime[400],
    colors.lime[500],
    colors.lime[700],
    colors.lime[900],
  ],
  // Green
  [
    colors.green[100],
    colors.green[200],
    colors.green[300],
    colors.green[400],
    colors.green[500],
    colors.green[700],
    colors.green[900],
  ],
  // Teal
  [
    colors.teal[100],
    colors.teal[200],
    colors.teal[300],
    colors.teal[400],
    colors.teal[500],
    colors.teal[700],
    colors.teal[900],
  ],
  // Blue
  [
    colors.blue[100],
    colors.blue[200],
    colors.blue[300],
    colors.blue[400],
    colors.blue[500],
    colors.blue[700],
    colors.blue[900],
  ],
  // Violet
  [
    colors.violet[100],
    colors.violet[200],
    colors.violet[300],
    colors.violet[400],
    colors.violet[500],
    colors.violet[700],
    colors.violet[900],
  ],
  // Pink
  [
    colors.pink[100],
    colors.pink[200],
    colors.pink[300],
    colors.pink[400],
    colors.pink[500],
    colors.pink[700],
    colors.pink[900],
  ],
];

export const NUM_COLS = COLOR_COLUMNS.length;
export const NUM_ROWS = COLOR_COLUMNS[0].length;

/** Parse any CSS color string into a base hex + alpha (0–100). */
export function parseColor(color: string): { hex: string; alpha: number } {
  const s = color.trim();

  // #rrggbbaa
  if (/^#[0-9a-f]{8}$/i.test(s)) {
    return {
      hex: s.slice(0, 7).toLowerCase(),
      alpha: Math.round((parseInt(s.slice(7, 9), 16) / 255) * 100),
    };
  }
  // #rrggbb or #rgb
  if (/^#[0-9a-f]{3,6}$/i.test(s)) {
    return { hex: s.toLowerCase(), alpha: 100 };
  }
  // rgba?(r, g, b[, a]) — comma syntax, any spacing
  const commaMatch = s.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i
  );
  if (commaMatch) {
    const hex =
      "#" +
      [commaMatch[1], commaMatch[2], commaMatch[3]]
        .map((n) => Math.round(parseFloat(n)).toString(16).padStart(2, "0"))
        .join("");
    const a = commaMatch[4] !== undefined ? Math.round(parseFloat(commaMatch[4]) * 100) : 100;
    return { hex: hex.toLowerCase(), alpha: a };
  }
  // Canvas fallback: handles oklch, hsl, named colors, space-syntax, etc.
  if (typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = s;
      ctx.fillRect(0, 0, 1, 1);
      const [pr, pg, pb, pa] = ctx.getImageData(0, 0, 1, 1).data;
      if (pa === 0) return { hex: "#000000", alpha: 0 };
      // Un-premultiply alpha
      const r = Math.round((pr * 255) / pa);
      const g = Math.round((pg * 255) / pa);
      const b = Math.round((pb * 255) / pa);
      const hex =
        "#" + [r, g, b].map((n) => Math.min(255, n).toString(16).padStart(2, "0")).join("");
      return { hex, alpha: Math.round((pa / 255) * 100) };
    } catch {
      // ignore
    }
  }
  return { hex: s, alpha: 100 };
}

/** Build the stored color string from a base hex and alpha (0–100). */
export function buildColor(hex: string, alpha: number): string {
  if (alpha >= 100) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${(alpha / 100).toFixed(2)})`;
}
