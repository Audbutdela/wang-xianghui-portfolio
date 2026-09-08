import React, { useEffect, useMemo, useRef, useState } from "react";

const GLYPHS = ["·", "○", "◇", "／", "△", "□"];

export default function EncryptedText({ text, delay = 0, duration = 900, onComplete, className = "" }) {
  const characters = useMemo(() => Array.from(text), [text]);
  const [revealed, setRevealed] = useState(0);
  const [noise, setNoise] = useState("");
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setRevealed(characters.length);
      setNoise("");
      completeRef.current?.();
      return undefined;
    }

    setRevealed(0);
    const startedAt = performance.now() + delay;
    const update = () => {
      const progress = Math.max(0, Math.min(1, (performance.now() - startedAt) / duration));
      const nextRevealed = Math.floor(characters.length * progress);
      setRevealed(nextRevealed);
      setNoise(
        characters
          .slice(nextRevealed, nextRevealed + 3)
          .map((character, index) => (/\s/.test(character) ? character : GLYPHS[(index + nextRevealed) % GLYPHS.length]))
          .join("")
      );
      if (progress === 1) {
        window.clearInterval(timer);
        setRevealed(characters.length);
        setNoise("");
        completeRef.current?.();
      }
    };
    const timer = window.setInterval(update, 64);
    update();
    return () => window.clearInterval(timer);
  }, [characters, delay, duration]);

  return (
    <span className={`encrypted-text${className ? ` ${className}` : ""}`} aria-label={text}>
      <span className="encrypted-text__measure" aria-hidden="true">{text}</span>
      <span className="encrypted-text__value" aria-hidden="true">
        {characters.slice(0, revealed).join("")}<span className="encrypted-text__noise">{noise}</span>
      </span>
    </span>
  );
}
