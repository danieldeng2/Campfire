"use client";

import type { Slide, SlideTransition } from "@/types/slides";
import { useSlidesStore } from "@/store/slidesStore";
import { SidebarSection } from "@/components/UILibrary/SidebarSection";
import { SelectInput } from "@/components/UILibrary/SelectInput";

interface Props {
  slide: Slide | undefined;
}

const TRANSITION_OPTIONS: { label: string; value: string }[] = [
  { label: "Default", value: "" },
  { label: "None", value: "none" },
  { label: "Fade", value: "fade" },
  { label: "Slide", value: "slide" },
  { label: "Convex", value: "convex" },
  { label: "Concave", value: "concave" },
  { label: "Zoom", value: "zoom" },
];

export function TransitionSection({ slide }: Props) {
  const updateSlideTransition = useSlidesStore((s) => s.updateSlideTransition);

  if (!slide) return null;

  return (
    <SidebarSection label="Transition">
      <div style={{ display: "flex", gap: 8 }}>
        <SelectInput
          label="In"
          value={slide.transitionIn ?? ""}
          options={TRANSITION_OPTIONS}
          onChange={(v) =>
            updateSlideTransition(slide.id, {
              transitionIn: (v || undefined) as SlideTransition | undefined,
            })
          }
        />
        <SelectInput
          label="Out"
          value={slide.transitionOut ?? ""}
          options={TRANSITION_OPTIONS}
          onChange={(v) =>
            updateSlideTransition(slide.id, {
              transitionOut: (v || undefined) as SlideTransition | undefined,
            })
          }
        />
      </div>
    </SidebarSection>
  );
}
