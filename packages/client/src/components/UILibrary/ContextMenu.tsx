"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { c, ink } from "@/lib/colors";

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  useEffect(() => {
    const close = () => onClose();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onMouseDown = (e: MouseEvent) => e.button === 0 && close();
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: y,
        left: x,
        background: c.surface,
        border: `1px solid ${ink(0.12)}`,
        borderRadius: 6,
        boxShadow: `0 4px 16px ${ink(0.12)}`,
        padding: "4px 0",
        zIndex: 1000,
        minWidth: 140,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          disabled={item.disabled}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "6px 12px",
            textAlign: "left",
            background: "none",
            border: "none",
            fontSize: 13,
            cursor: item.disabled ? "not-allowed" : "pointer",
            color: item.disabled ? ink(0.3) : item.danger ? c.danger : c.ink,
          }}
          onMouseEnter={(e) => {
            if (!item.disabled)
              (e.currentTarget as HTMLButtonElement).style.background = item.danger
                ? c.dangerBg
                : ink(0.06);
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "none";
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
}
