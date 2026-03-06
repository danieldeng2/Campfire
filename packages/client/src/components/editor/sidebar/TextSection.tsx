"use client";

import { AlignLeft, AlignCenter, AlignRight, Italic, Underline, Strikethrough } from "lucide-react";
import type { TextElement, ResolvedStyles, TextStyle } from "@/types/slides";
import { MIXED } from "@/types/slides";
import { useSlidesStore } from "@/store/slidesStore";
import { useEditorStore } from "@/store/editorStore";
import { SidebarSection } from "@/components/UILibrary/SidebarSection";
import { NumberInput } from "@/components/UILibrary/NumberInput";
import { ColorSwatch } from "@/components/UILibrary/ColorSwatch";
import { ToggleButton } from "@/components/UILibrary/ToggleButton";
import { SelectInput } from "@/components/UILibrary/SelectInput";
import { ink } from "@/lib/colors";
import { toggleUnderline, toggleStrikethrough } from "@/lib/textDecorationUtils";

const FONT_SIZES = [
  8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 112, 128,
].map((n) => ({ label: String(n), value: n }));

const FONT_WEIGHTS = [
  { label: "Thin", value: 100 },
  { label: "Light", value: 300 },
  { label: "Regular", value: 400 },
  { label: "Medium", value: 500 },
  { label: "SemiBold", value: 600 },
  { label: "Bold", value: 700 },
  { label: "ExtraBold", value: 800 },
  { label: "Black", value: 900 },
];

interface Props {
  elements: TextElement[];
  resolvedStyles: ResolvedStyles;
  activeSlideId: string;
}

export function TextSection({ elements, resolvedStyles, activeSlideId }: Props) {
  const updateElementStyle = useSlidesStore((s) => s.updateElementStyle);
  const updateElementStyleRange = useSlidesStore((s) => s.updateElementStyleRange);
  function applyStyle(patch: Partial<TextStyle>) {
    // Read fresh values from the store to avoid stale closure issues
    const { selectionRange: currentRange, editingElementId: currentEditingId } =
      useEditorStore.getState();
    // In edit mode, only target the element being edited
    const targets = currentEditingId
      ? elements.filter((el) => el.id === currentEditingId)
      : elements;

    // textAlign is a block-level property — always apply to the element, never to runs
    const { textAlign, ...runPatch } = patch;
    const hasRunPatch = Object.keys(runPatch).length > 0;

    for (const el of targets) {
      if (textAlign !== undefined) {
        updateElementStyle(activeSlideId, el.id, { textAlign });
      }
      if (hasRunPatch) {
        if (currentRange && currentRange.start !== currentRange.end) {
          // Flush live DOM content to store first so updateElementStyleRange sees the correct text
          useEditorStore.getState().flushEditingContent?.();
          updateElementStyleRange(activeSlideId, el.id, currentRange, runPatch);
        } else {
          updateElementStyle(activeSlideId, el.id, runPatch);
        }
      }
    }
  }

  const {
    fontSize,
    fontWeight,
    fontStyle,
    textDecoration,
    color,
    textAlign,
    lineHeight,
    letterSpacing,
  } = resolvedStyles;

  const isItalic = fontStyle === "italic" ? true : fontStyle === MIXED ? MIXED : false;
  const isUnderline =
    textDecoration === MIXED
      ? MIXED
      : textDecoration === "underline" || textDecoration === "underline line-through"
        ? true
        : false;
  const isStrikethrough =
    textDecoration === MIXED
      ? MIXED
      : textDecoration === "line-through" || textDecoration === "underline line-through"
        ? true
        : false;

  return (
    <SidebarSection label="Text">
      {/* Font size + weight row */}
      <div style={{ display: "flex", gap: 8 }}>
        <SelectInput
          label="Size"
          value={fontSize}
          options={FONT_SIZES}
          onChange={(v) => applyStyle({ fontSize: v })}
        />
        <SelectInput
          label="Weight"
          value={fontWeight}
          options={FONT_WEIGHTS}
          onChange={(v) => applyStyle({ fontWeight: v })}
        />
      </div>

      {/* Style + Align row */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <span style={{ fontSize: 11, color: ink(0.85), fontWeight: 600, lineHeight: 1 }}>
            Style
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <ToggleButton
              icon={<Italic size={13} />}
              active={isItalic}
              label="Italic"
              onClick={() =>
                applyStyle({ fontStyle: fontStyle === "italic" ? "normal" : "italic" })
              }
            />
            <ToggleButton
              icon={<Underline size={13} />}
              active={isUnderline}
              label="Underline"
              onClick={() => {
                const cur = textDecoration === MIXED ? "none" : textDecoration;
                applyStyle({ textDecoration: toggleUnderline(cur) });
              }}
            />
            <ToggleButton
              icon={<Strikethrough size={13} />}
              active={isStrikethrough}
              label="Strikethrough"
              onClick={() => {
                const cur = textDecoration === MIXED ? "none" : textDecoration;
                applyStyle({ textDecoration: toggleStrikethrough(cur) });
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <span style={{ fontSize: 11, color: ink(0.85), fontWeight: 600, lineHeight: 1 }}>
            Align
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <ToggleButton
              icon={<AlignLeft size={13} />}
              active={textAlign === "left" ? true : false}
              label="Align left"
              onClick={() => applyStyle({ textAlign: "left" })}
            />
            <ToggleButton
              icon={<AlignCenter size={13} />}
              active={textAlign === "center" ? true : false}
              label="Align center"
              onClick={() => applyStyle({ textAlign: "center" })}
            />
            <ToggleButton
              icon={<AlignRight size={13} />}
              active={textAlign === "right" ? true : false}
              label="Align right"
              onClick={() => applyStyle({ textAlign: "right" })}
            />
          </div>
        </div>
      </div>

      {/* Line height + letter spacing */}
      <div style={{ display: "flex", gap: 8 }}>
        <NumberInput
          label="Line Height"
          value={lineHeight}
          min={0.5}
          max={4}
          step={0.1}
          onChange={(v) => applyStyle({ lineHeight: v })}
        />
        <NumberInput
          label="Spacing"
          value={letterSpacing}
          min={-20}
          max={40}
          step={0.5}
          unit="px"
          onChange={(v) => applyStyle({ letterSpacing: v })}
        />
      </div>

      {/* Color */}
      <ColorSwatch label="Color" value={color} onChange={(hex) => applyStyle({ color: hex })} />
    </SidebarSection>
  );
}
