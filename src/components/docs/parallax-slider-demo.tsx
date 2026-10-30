"use client";

import { useState } from "react";
import { ParallaxSlider, type ParallaxSliderOrientation } from "@/components/block/parallax-slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const modes: { value: ParallaxSliderOrientation; label: string }[] = [
    { value: "portrait", label: "Portrait" },
    { value: "landscape", label: "Full image" },
];

/** Docs preview with a switch between the two frame shapes. */
export function ParallaxSliderDemo() {
    const [orientation, setOrientation] = useState<ParallaxSliderOrientation>("portrait");

    return (
        <div className="flex h-full w-full flex-col items-center justify-center pt-5">
            <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={orientation}
                onValueChange={(value) => { if (value) setOrientation(value as ParallaxSliderOrientation); }}
                aria-label="Frame shape"
            >
                {modes.map((mode) => (
                    <ToggleGroupItem key={mode.value} value={mode.value} className="px-3 text-xs text-muted-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground">
                        {mode.label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
            <ParallaxSlider orientation={orientation} className="parallax-slider-docs-preview" />
        </div>
    );
}
