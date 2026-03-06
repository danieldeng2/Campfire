"use client";

import { useState } from "react";
import { c, ink } from "@/lib/colors";
import { MIXED } from "@/types/slides";
import type { MixedValue } from "@/types/slides";

interface Props {
  icon: React.ReactNode;
  active: boolean | MixedValue;
  label: string;
  onClick: () => void;
}

export function ToggleButton({ icon, active, label, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const isMixed = active === MIXED;
  const isActive = active === true;

  return (
    <button
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        border: "none",
        borderRadius: 5,
        cursor: "pointer",
        background: isActive
          ? c.brandGhost
          : isMixed
            ? ink(0.05)
            : hovered
              ? ink(0.05)
              : "transparent",
        color: isActive ? c.brand : isMixed ? ink(0.3) : ink(0.55),
        transition: "background 0.1s, color 0.1s",
        flexShrink: 0,
      }}
    >
      {icon}
    </button>
  );
}
