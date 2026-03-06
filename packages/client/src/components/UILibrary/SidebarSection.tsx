"use client";

import { ink } from "@/lib/colors";

interface Props {
  label: string;
  children: React.ReactNode;
}

export function SidebarSection({ label, children }: Props) {
  return (
    <div
      style={{
        borderBottom: `1px solid ${ink(0.06)}`,
        paddingBottom: 12,
      }}
    >
      <div
        style={{
          height: 32,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: ink(0.85),
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ padding: "10px 12px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}
