import { useEffect, useState } from "react";

function isKeyStrokeCharacter(key: string) {
  return /^[a-zA-Z0-9]+$/.test(key) && !isSpecialKey(key);
}

function isSpecialKey(key: string) {
  return (
    key === "Backspace" ||
    key === "Delete" ||
    // key === "Enter" ||
    key === "Tab" ||
    key === "Control" ||
    key === "Shift" ||
    key === "Alt" ||
    key === "Meta" ||
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "ArrowUp" ||
    key === "ArrowDown" ||
    key === "Escape" ||
    key === "Space" ||
    key === "Backquote" ||
    key === "Quote" ||
    key === "Semicolon" ||
    key === "BracketLeft" ||
    key === "BracketRight" ||
    key === "Comma" ||
    key === "Period" ||
    key === "Slash" ||
    key === "Backslash"
  );
}

export function useDetectKeyStrokes(enabled: boolean = true) {
  const [keyStrokes, setKeyStrokes] = useState("");

  function onResetKeyStrokes() {
    setKeyStrokes("");
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enabled) {
        onResetKeyStrokes();
        return;
      }

      const pressedKey = e.key;

      if (!isKeyStrokeCharacter(pressedKey)) return;

      setKeyStrokes((prev) => prev + pressedKey);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  return { keyStrokes, onResetKeyStrokes };
}
