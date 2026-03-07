"use client";

import type { ImageElement, ObjectFit } from "@/types/slides";
import { useSlidesStore } from "@/store/slidesStore";
import { SidebarSection } from "@/components/UILibrary/SidebarSection";
import { SelectInput } from "@/components/UILibrary/SelectInput";
import { NumberInput } from "@/components/UILibrary/NumberInput";

const FIT_OPTIONS: { label: string; value: ObjectFit }[] = [
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Fill", value: "fill" },
  { label: "None", value: "none" },
  { label: "Scale Down", value: "scale-down" },
];

interface Props {
  elements: ImageElement[];
  activeSlideId: string;
}

export function ImageSection({ elements, activeSlideId }: Props) {
  const updateImageStyle = useSlidesStore((s) => s.updateImageStyle);

  const first = elements[0];
  const objectFit = first.objectFit;
  const borderRadius = first.borderRadius;

  return (
    <SidebarSection label="Image">
      <div style={{ display: "flex", gap: 8 }}>
        <SelectInput
          label="Fit"
          value={objectFit}
          options={FIT_OPTIONS}
          onChange={(v) => {
            for (const el of elements) {
              updateImageStyle(activeSlideId, el.id, { objectFit: v });
            }
          }}
        />
        <NumberInput
          label="Radius"
          value={borderRadius}
          min={0}
          max={999}
          step={1}
          unit="px"
          onChange={(v) => {
            for (const el of elements) {
              updateImageStyle(activeSlideId, el.id, { borderRadius: v });
            }
          }}
        />
      </div>
    </SidebarSection>
  );
}
