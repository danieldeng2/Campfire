"use client";

import { MousePointer2, Type } from "lucide-react";
import { Tool } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";
import { ink } from "@/lib/colors";
import { c } from "@/lib/colors";
import { ToolButton } from "@/components/UILibrary/ToolButton";

export function ToolBar() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);

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
        icon={<MousePointer2 size={16} />}
        label="Move"
        shortcut="V"
        active={activeTool === Tool.Move}
        onClick={() => setActiveTool(Tool.Move)}
      />
      <ToolButton
        icon={<Type size={16} />}
        label="Text"
        shortcut="T"
        active={activeTool === Tool.Text}
        onClick={() => setActiveTool(Tool.Text)}
      />
    </div>
  );
}
