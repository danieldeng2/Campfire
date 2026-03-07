import mc from "material-colors";

// Pick 7 evenly-spaced shades from Material's shade scale
const pick = (shade: Record<string, string>): string[] => [
  shade["50"],
  shade["100"],
  shade["300"],
  shade["400"],
  shade["600"],
  shade["700"],
  shade["900"],
];

// Columns = hue families, rows = shades light → dark
export const COLOR_COLUMNS: string[][] = [
  // Neutrals
  [
    mc.white,
    mc.grey["200"],
    mc.grey["400"],
    mc.grey["500"],
    mc.grey["700"],
    mc.grey["800"],
    mc.black,
  ],
  // Red
  pick(mc.red),
  // Deep Orange
  pick(mc.deepOrange),
  // Orange
  pick(mc.orange),
  // Amber
  pick(mc.amber),
  // Yellow
  pick(mc.yellow),
  // Green
  pick(mc.green),
  // Teal
  pick(mc.teal),
  // Blue
  pick(mc.blue),
  // Purple
  pick(mc.purple),
  // Pink
  pick(mc.pink),
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
