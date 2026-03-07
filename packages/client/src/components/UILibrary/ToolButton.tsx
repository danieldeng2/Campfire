"use client";

import { useState } from "react";
import { c, ink } from "@/lib/colors";

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  active: boolean;
  onClick: () => void;
}

export function ToolButton({ icon, label, shortcut, active, onClick }: ToolButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          background: active ? c.brand : hovered ? ink(0.05) : "transparent",
          color: active ? "#ffffff" : ink(1),
          transition: "background 0.1s, color 0.1s",
        }}
      >
        {icon}
      </button>

      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: ink(0.8),
            color: "#ffffff",
            borderRadius: 6,
            padding: "4px 8px",
            whiteSpace: "nowrap",
            fontSize: 12,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {label}
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: 3,
              padding: "1px 5px",
              fontSize: 11,
              fontFamily: "monospace",
            }}
          >
            {shortcut}
          </span>
        </div>
      )}
    </div>
  );
}
