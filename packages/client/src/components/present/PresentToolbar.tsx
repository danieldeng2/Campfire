"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { c, ink } from "@/lib/colors";

interface PresentToolbarProps {
  visible: boolean;
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PresentToolbar({ visible, current, total, onPrev, onNext }: PresentToolbarProps) {
  const [hoveredBtn, setHoveredBtn] = useState<"prev" | "next" | null>(null);

  const isFirst = current === 1;
  const isLast = current === total;

  function btnStyle(key: "prev" | "next", disabled: boolean) {
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 28,
      height: 28,
      background: !disabled && hoveredBtn === key ? ink(0.06) : "transparent",
      border: "none",
      borderRadius: 4,
      cursor: disabled ? "default" : "pointer",
      color: disabled ? ink(0.25) : c.ink,
      padding: 0,
    };
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 10px",
        background: c.surface,
        border: `1px solid ${ink(0.1)}`,
        borderRadius: 8,
        boxShadow: `0 4px 16px ${ink(0.12)}`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.2s ease",
        zIndex: 9999,
      }}
    >
      <button
        onClick={isFirst ? undefined : onPrev}
        onMouseEnter={() => !isFirst && setHoveredBtn("prev")}
        onMouseLeave={() => setHoveredBtn(null)}
        disabled={isFirst}
        style={btnStyle("prev", isFirst)}
      >
        <ChevronLeft size={18} />
      </button>

      <span
        style={{
          color: ink(0.45),
          fontSize: 13,
          minWidth: 44,
          textAlign: "center",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {current} / {total}
      </span>

      <button
        onClick={isLast ? undefined : onNext}
        onMouseEnter={() => !isLast && setHoveredBtn("next")}
        onMouseLeave={() => setHoveredBtn(null)}
        disabled={isLast}
        style={btnStyle("next", isLast)}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
