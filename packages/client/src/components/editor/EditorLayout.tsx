"use client";

import { useCallback, useState } from "react";
import { useEditorKeyboardShortcuts } from "@/hooks/useEditorKeyboardShortcuts";
import { c } from "@/lib/colors";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { SlideCanvas } from "./SlideCanvas";
import { ToolBar } from "./ToolBar";
import { RightSidebar } from "./sidebar/RightSidebar";
import { ResizeHandle } from "@/components/UILibrary/ResizeHandle";

const LEFT_DEFAULT = 220;
const RIGHT_DEFAULT = 280;
const MIN_WIDTH = 160;
const MAX_WIDTH = 400;

function clamp(v: number) {
  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, v));
}

export function EditorLayout() {
  useEditorKeyboardShortcuts();
  const [leftWidth, setLeftWidth] = useState(LEFT_DEFAULT);
  const [rightWidth, setRightWidth] = useState(RIGHT_DEFAULT);

  const onResizeLeft = useCallback((delta: number) => setLeftWidth((w) => clamp(w + delta)), []);
  const onResizeRight = useCallback((delta: number) => setRightWidth((w) => clamp(w + delta)), []);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: c.canvas, color: c.ink }}
    >
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar width={leftWidth} />
        <ResizeHandle side="right" onResize={onResizeLeft} />
        <main
          className="flex flex-1 items-center justify-center overflow-hidden p-8"
          style={{ position: "relative" }}
        >
          <SlideCanvas />
          <ToolBar />
        </main>
        <ResizeHandle side="left" onResize={onResizeRight} />
        <RightSidebar width={rightWidth} />
      </div>
    </div>
  );
}
