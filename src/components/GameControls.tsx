"use client";

import { Button } from "@/components/ui/button";
import type { GameState } from "@/lib/types";
import { FolderDown, Loader2, Pause, Play, Save, Waves } from "lucide-react";

interface GameControlsProps {
  onPause: () => void;
  onSave: () => void;
  onLoad: () => void;
  onStartWave: () => void;
  gameState: GameState;
}

export default function GameControls({
  onPause,
  onSave,
  onLoad,
  onStartWave,
  gameState,
}: GameControlsProps) {
  const isWaveInProgress = gameState.waveActive;

  return (
    <div className="flex gap-2 bg-card p-2 rounded-lg border">
      <Button onClick={onPause} variant="accent" size="sm">
        {gameState.status === "paused" ? <Play /> : <Pause />}
        {gameState.status === "paused" ? "Resume" : "Pause"}
      </Button>
      <Button onClick={onSave} variant="outline" size="sm">
        <Save />
        Save
      </Button>
      <Button onClick={onLoad} variant="outline" size="sm">
        <FolderDown />
        Load
      </Button>
      <div className="flex-grow" />
      <Button
        onClick={onStartWave}
        disabled={isWaveInProgress}
        size="sm"
        className="font-bold"
      >
        {isWaveInProgress ? <Loader2 className="animate-spin" /> : <Waves />}
        {isWaveInProgress ? `Wave ${gameState.wave} in Progress` : "Start Wave"}
      </Button>
    </div>
  );
}
