import { c } from "@/lib/colors";

interface CampfireIconProps {
  size?: number;
}

export function CampfireIcon({ size = 20 }: CampfireIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 24" fill="none">
      {/* Flame */}
      <path
        d="M10 2C10 2 5 7 5 11a5 5 0 0010 0C15 7 10 2 10 2z"
        fill={c.flameOuter}
        opacity="0.9"
      />
      <path d="M10 6C10 6 7.5 9 7.5 11a2.5 2.5 0 005 0C12.5 9 10 6 10 6z" fill={c.flameInner} />
      {/* Log pile — two crossed logs */}
      <rect
        x="3"
        y="15"
        width="14"
        height="2.5"
        rx="1.25"
        fill={c.logLight}
        transform="rotate(-12 10 16.25)"
      />
      <rect
        x="3"
        y="15"
        width="14"
        height="2.5"
        rx="1.25"
        fill={c.logDark}
        transform="rotate(12 10 16.25)"
      />
    </svg>
  );
}
