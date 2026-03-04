"use client";

import { useRouter } from "next/navigation";
import { useSlidesStore } from "@/store/slidesStore";

export function TopNav() {
  const title = useSlidesStore((s) => s.deck.title);
  const router = useRouter();

  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: 48,
        background: "#ffffff",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5"
          style={{ cursor: "default" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C10 2 5 7 5 11a5 5 0 0010 0C15 7 10 2 10 2z" fill="#f97316" opacity="0.9" />
            <path d="M10 6C10 6 7.5 9 7.5 11a2.5 2.5 0 005 0C12.5 9 10 6 10 6z" fill="#fbbf24" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: "#111" }}>
            Campfire
          </span>
        </div>
        <span style={{ color: "rgba(0,0,0,0.2)" }}>/</span>
        <span className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>
          {title}
        </span>
      </div>

      <button
        onClick={() => router.push("/present")}
        className="flex items-center gap-2 text-sm font-semibold px-4 rounded-md transition-all"
        style={{
          height: 32,
          background: "#f97316",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#ea6c0a";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#f97316";
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 2l9 5-9 5V2z" fill="white" />
        </svg>
        Present
      </button>
    </header>
  );
}
