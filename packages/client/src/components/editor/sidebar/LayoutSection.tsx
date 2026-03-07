"use client";

import type { SlideElement, SlideRect } from "@/types/slides";
import { MIXED } from "@/types/slides";
import { useSlidesStore } from "@/store/slidesStore";
import { SidebarSection } from "@/components/UILibrary/SidebarSection";
import { NumberInput } from "@/components/UILibrary/NumberInput";

interface Props {
  elements: SlideElement[];
  activeSlideId: string;
}

function resolveRect(elements: SlideElement[]) {
  if (elements.length === 0) return null;
  const first = elements[0].rect;
  const x = elements.every((e) => e.rect.x === first.x) ? first.x : MIXED;
  const y = elements.every((e) => e.rect.y === first.y) ? first.y : MIXED;
  const width = elements.every((e) => e.rect.width === first.width) ? first.width : MIXED;
  const height = elements.every((e) => e.rect.height === first.height) ? first.height : MIXED;
  return { x, y, width, height };
}

export function LayoutSection({ elements, activeSlideId }: Props) {
  const updateElementRect = useSlidesStore((s) => s.updateElementRect);

  const resolved = resolveRect(elements);
  if (!resolved) return null;

  const update = (key: keyof SlideRect, value: number) => {
    for (const el of elements) {
      updateElementRect(activeSlideId, el.id, { ...el.rect, [key]: value });
    }
  };

  return (
    <SidebarSection label="Layout">
      <div style={{ display: "flex", gap: 8 }}>
        <NumberInput
          label="X"
          value={resolved.x}
          step={1}
          unit="px"
          onChange={(v) => update("x", v)}
        />
        <NumberInput
          label="Y"
          value={resolved.y}
          step={1}
          unit="px"
          onChange={(v) => update("y", v)}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <NumberInput
          label="Width"
          value={resolved.width}
          min={1}
          step={1}
          unit="px"
          onChange={(v) => update("width", v)}
        />
        <NumberInput
          label="Height"
          value={resolved.height}
          min={1}
          step={1}
          unit="px"
          onChange={(v) => update("height", v)}
        />
      </div>
    </SidebarSection>
  );
}
