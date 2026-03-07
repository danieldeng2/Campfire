"use client";

import { useRef, useEffect } from "react";
import { MousePointer2, Type, ImagePlus } from "lucide-react";
import { Tool } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";
import { ink } from "@/lib/colors";
import { c } from "@/lib/colors";
import { ToolButton } from "@/components/UILibrary/ToolButton";

export function ToolBar() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const setPendingImage = useEditorStore((s) => s.setPendingImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => fileInputRef.current?.click();
    document.addEventListener("campfire:open-image-picker", handler);
    return () => document.removeEventListener("campfire:open-image-picker", handler);
  }, []);

  function handleImageClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-selected
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new window.Image();
      img.onload = () => {
        setPendingImage({ src, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: 4,
        background: c.surface,
        borderRadius: 12,
        boxShadow: `0 4px 20px ${ink(0.15)}, 0 1px 4px ${ink(0.08)}`,
        pointerEvents: "auto",
      }}
    >
      <ToolButton
        icon={<MousePointer2 size={20} strokeWidth={1.5} />}
        label="Move"
        shortcut="V"
        active={activeTool === Tool.Move}
        onClick={() => setActiveTool(Tool.Move)}
      />
      <ToolButton
        icon={<Type size={20} strokeWidth={1.5} />}
        label="Text"
        shortcut="T"
        active={activeTool === Tool.Text}
        onClick={() => setActiveTool(Tool.Text)}
      />
      <ToolButton
        icon={<ImagePlus size={20} strokeWidth={1.5} />}
        label="Image"
        shortcut="I"
        active={activeTool === Tool.Image}
        onClick={handleImageClick}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
