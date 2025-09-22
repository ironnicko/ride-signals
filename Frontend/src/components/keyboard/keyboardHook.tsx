"use client";

import { useEffect, useState } from "react";

// Detect if mobile keyboard is visible
export function useKeyboardVisible() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    let initialHeight = window.innerHeight;

    const onResize = () => {
      const heightDiff = initialHeight - window.innerHeight;
      // if viewport shrinks by > 150px, assume keyboard is open
      if (heightDiff > 150) {
        setKeyboardVisible(true);
      } else {
        setKeyboardVisible(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return keyboardVisible;
}
