"use client";

import { useEditorKeyboardShortcuts } from "@/hooks/useEditorKeyboardShortcuts";
import { c } from "@/lib/colors";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { SlideCanvas } from "./SlideCanvas";
import { ToolBar } from "./ToolBar";
import { RightSidebar } from "./sidebar/RightSidebar";

export function EditorLayout() {
  useEditorKeyboardShortcuts();

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: c.canvas, color: c.ink }}
    >
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className="flex flex-1 items-center justify-center overflow-hidden p-8"
          style={{ position: "relative" }}
        >
          <SlideCanvas />
          <ToolBar />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
