import { c } from "@/lib/colors";

interface CampfireIconProps {
  size?: number;
}

export function CampfireIcon({ size = 20 }: CampfireIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2C10 2 5 7 5 11a5 5 0 0010 0C15 7 10 2 10 2z"
        fill={c.flameOuter}
        opacity="0.9"
      />
      <path d="M10 6C10 6 7.5 9 7.5 11a2.5 2.5 0 005 0C12.5 9 10 6 10 6z" fill={c.flameInner} />
    </svg>
  );
}
