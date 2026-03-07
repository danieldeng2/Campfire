"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { CampfireIcon } from "@/components/UILibrary/CampfireIcon";
import { c, ink } from "@/lib/colors";

export function TopNav() {
  const title = useSlidesStore((s) => s.deck.title);
  const slides = useSlidesStore((s) => s.deck.slides);
  const updateTitle = useSlidesStore((s) => s.updateTitle);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const val = inputRef.current?.value.trim();
    if (val) updateTitle(val);
    setEditing(false);
  }

  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: 48,
        background: c.surface,
        borderBottom: `1px solid ${ink(0.1)}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" style={{ cursor: "default" }}>
          <CampfireIcon />
          <span className="text-sm font-semibold" style={{ color: c.ink }}>
            Campfire
          </span>
        </div>
        <span style={{ color: ink(0.2) }}>/</span>
        {editing ? (
          <input
            ref={inputRef}
            defaultValue={title}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="text-sm"
            style={{
              color: ink(0.7),
              border: `1px solid ${ink(0.2)}`,
              borderRadius: 4,
              padding: "1px 6px",
              outline: "none",
              background: c.surface,
              minWidth: 0,
              width: `${Math.max(title.length + 2, 4)}ch`,
            }}
            autoFocus
          />
        ) : (
          <span
            className="text-sm"
            style={{ color: ink(0.45), cursor: "text" }}
            onClick={startEdit}
            title="Click to rename"
          >
            {title}
          </span>
        )}
      </div>

      <button
        onClick={() => {
          const idx = slides.findIndex((s) => s.id === activeSlideId);
          router.push(`/present${idx > 0 ? `?slide=${idx}` : ""}`);
        }}
        className="flex items-center gap-2 text-sm font-semibold px-4 rounded-md transition-all"
        style={{
          height: 32,
          background: c.brand,
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = c.brandHover;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = c.brand;
        }}
      >
        <Play size={14} strokeWidth={1.5} />
        Present
      </button>
    </header>
  );
}
