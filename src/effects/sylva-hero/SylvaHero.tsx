import React, { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

const SOURCE_URL = "/landing-pages/wang-sketchbook.html?nointro=1";
const SANDBOX = "allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts";
const STYLE_ID = "threeui-page-typography";

const HEADING_WEIGHTS = ["200", "300", "400", "500", "600"] as const;
const BODY_WEIGHTS = ["200", "300", "400", "500"] as const;
const HEADING_FAMILIES = {
  lexend: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  "instrument-serif": "'Instrument Serif', 'Songti SC', 'STSong', Georgia, serif",
} as const;
const BODY_FAMILIES = {
  lexend: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  newsreader: "'Newsreader', 'Songti SC', 'STSong', Georgia, serif",
} as const;

export type SylvaHeroProps = {
  variant?: "living-green";
  headingFont?: "lexend" | "instrument-serif";
  bodyFont?: "lexend" | "newsreader";
  headingWeight?: string;
  bodyWeight?: string;
  primaryColor?: string;
  headingSize?: number;
  bodySize?: number;
  headingLetterSpacing?: number;
  className?: string;
  style?: CSSProperties;
};

function clamp(value: number | undefined, min: number, fallback: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value as number)) : fallback;
}

function weight(value: string | undefined, allowed: readonly string[], fallback: string) {
  return allowed.includes(value ?? "") ? (value as string) : fallback;
}

function color(value: string | undefined) {
  if (!value || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value.trim())) return "#ffffff";
  const digits = value.trim().slice(1).toLowerCase();
  return `#${digits.length === 3 ? digits.replace(/./g, (digit) => digit + digit) : digits}`;
}

function rgba(hex: string, alpha: number) {
  const [red, green, blue] = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function unit(value: number) {
  return `calc(${Number(value.toFixed(3))} * var(--u))`;
}

function applyTypography(frame: HTMLIFrameElement | null, css: string) {
  const frameDocument = frame?.contentDocument;
  if (!frameDocument?.head) return;

  const style = (frameDocument.getElementById(STYLE_ID) as HTMLStyleElement | null)
    ?? frameDocument.createElement("style");
  style.id = STYLE_ID;
  if (style.textContent !== css) style.textContent = css;
  frameDocument.head.append(style);
}

export function SylvaHero({
  variant = "living-green",
  headingFont = "lexend",
  bodyFont = "lexend",
  headingWeight = "300",
  bodyWeight = "300",
  primaryColor = "#ffffff",
  headingSize = 63,
  bodySize = 16.5,
  headingLetterSpacing = -0.006,
  className = "",
  style,
}: SylvaHeroProps) {
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const customization = useMemo(() => {
    const primary = color(primaryColor);
    const resolvedHeadingWeight = weight(headingWeight, HEADING_WEIGHTS, "300");
    const resolvedBodyWeight = weight(bodyWeight, BODY_WEIGHTS, "300");
    const resolvedHeadingSize = clamp(headingSize, 40, 63, 92);
    const resolvedBodySize = clamp(bodySize, 12, 16.5, 24);
    const resolvedTracking = clamp(headingLetterSpacing, -0.06, -0.006, 0.12);

    const headingFamily = HEADING_FAMILIES[headingFont];
    const bodyFamily = BODY_FAMILIES[bodyFont];

    return `
:root {
  --ink: ${primary};
  --ink-soft: ${rgba(primary, 0.62)};
  --ink-faint: ${rgba(primary, 0.44)};
}
body { font-family: ${bodyFamily}; font-weight: ${resolvedBodyWeight}; }
.headline, .ghost {
  font-family: ${headingFamily};
}
.headline {
  font-weight: ${resolvedHeadingWeight};
  font-size: ${unit(resolvedHeadingSize)};
  line-height: ${unit((resolvedHeadingSize * 65) / 63)};
  letter-spacing: ${resolvedTracking}em;
}
.lede {
  font-weight: ${resolvedBodyWeight};
  font-size: ${unit(resolvedBodySize)};
  line-height: ${unit((resolvedBodySize * 22) / 16.5)};
}
@media (max-width: 900px) {
  .headline {
    font-size: ${unit((resolvedHeadingSize * 62) / 63)};
    line-height: ${unit((resolvedHeadingSize * 66) / 63)};
  }
  .lede {
    font-size: ${unit((resolvedBodySize * 19) / 16.5)};
    line-height: ${unit((resolvedBodySize * 27) / 16.5)};
  }
}
`;
  }, [bodyFont, bodySize, bodyWeight, headingFont, headingLetterSpacing, headingSize, headingWeight, primaryColor]);

  const customize = useCallback((frame: HTMLIFrameElement | null) => {
    applyTypography(frame, customization);
  }, [customization]);

  useEffect(() => {
    customize(frameRef.current);
  }, [customize]);

  return (
    <div
      className={`sylva-hero${className ? ` ${className}` : ""}`}
      data-state={ready ? "ready" : "loading"}
      data-variant={variant}
      style={style}
    >
      <iframe
        ref={frameRef}
        className="sylva-hero__frame"
        title="王祥辉 — 互联网招聘作品集"
        src={SOURCE_URL}
        sandbox={SANDBOX}
        loading="eager"
        onLoad={(event) => {
          customize(event.currentTarget);
          setReady(true);
        }}
      />
    </div>
  );
}
