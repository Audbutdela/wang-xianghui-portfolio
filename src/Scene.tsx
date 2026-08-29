import React from "react";

import { SylvaHero } from "./effects/sylva-hero/SylvaHero";
import "./effects/sylva-hero/styles.css";

export function Scene() {
  return (
    <div className="shader-frame">
      <SylvaHero
        variant="living-green"
        headingFont="instrument-serif"
        bodyFont="newsreader"
        headingWeight="400"
        bodyWeight="400"
        primaryColor="#ffffff"
        headingSize={30}
        bodySize={20}
        headingLetterSpacing={0.010}
      />
    </div>
  );
}
