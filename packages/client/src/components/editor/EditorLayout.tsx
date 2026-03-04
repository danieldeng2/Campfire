"use client";

import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { SlideCanvas } from "./SlideCanvas";

export function EditorLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#f0f0f0", color: "#111" }}>
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center overflow-hidden p-8">
          <SlideCanvas />
        </main>
      </div>
    </div>
  );
}
