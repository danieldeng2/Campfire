"use client";

import type { Slide } from "@/types/slides";
import { useSlidesStore } from "@/store/slidesStore";
import { SidebarSection } from "@/components/UILibrary/SidebarSection";
import { ColorSwatch } from "@/components/UILibrary/ColorSwatch";

interface Props {
  slide: Slide | undefined;
}

export function PageSection({ slide }: Props) {
  const updateSlideBackground = useSlidesStore((s) => s.updateSlideBackground);

  if (!slide) return null;

  return (
    <SidebarSection label="Page">
      <ColorSwatch
        label="Background"
        value={slide.background.value}
        onChange={(hex) => updateSlideBackground(slide.id, { type: "color", value: hex })}
      />
    </SidebarSection>
  );
}
