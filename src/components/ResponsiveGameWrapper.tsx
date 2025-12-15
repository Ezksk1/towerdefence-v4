"use client";

import { useEffect, useState } from "react";
import { GAME_CONFIG } from "@/lib/game-config";

interface ScreenDims {
  canvasWidth: number;
  canvasHeight: number;
}

// Hook: computes a canvas size that preserves the game's aspect ratio
// and fits within the current viewport. Also sets the --vh CSS variable
// to avoid mobile browser address-bar cutoffs.
export function useScreenDimensions(): ScreenDims {
  const [dims, setDims] = useState<ScreenDims>({
    canvasWidth: GAME_CONFIG.GRID_WIDTH,
    canvasHeight: GAME_CONFIG.GRID_HEIGHT,
  });

  useEffect(() => {
    function update() {
      // Update CSS variable to represent 1% of the viewport height
      // (fixes mobile address bar / 100vh issues)
      if (typeof window !== "undefined" && window.innerHeight) {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      }

      const vw = typeof window !== "undefined" ? window.innerWidth : GAME_CONFIG.GRID_WIDTH;
      const vh = typeof window !== "undefined" ? window.innerHeight : GAME_CONFIG.GRID_HEIGHT;

      // Preserve aspect ratio of the game grid
      const aspect = GAME_CONFIG.GRID_HEIGHT / GAME_CONFIG.GRID_WIDTH;

      // Start by filling available width
      let width = Math.min(vw, GAME_CONFIG.GRID_WIDTH);
      let height = Math.round(width * aspect);

      // If height doesn't fit, scale to height instead
      if (height > vh) {
        height = Math.min(vh, GAME_CONFIG.GRID_HEIGHT);
        width = Math.round(height / aspect);
      }

      // Ensure minimum reasonable sizes
      width = Math.max(320, width);
      height = Math.max(200, height);

      setDims({ canvasWidth: width, canvasHeight: height });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return dims;
}

export default null as unknown as typeof useScreenDimensions;
