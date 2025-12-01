"use client";

import { Button } from "@/components/ui/button";
import type { GameState } from "@/lib/types";
import { FolderDown, Loader2, Pause, Play, Save, Waves } from "lucide-react";

interface GameControlsProps {
  onPause: () => void;
  onSave: () => void;
  onLoad: () => void;
  gameState: GameState;
}

export default function GameControls({
  onPause,
  onSave,
  onLoad,
  gameState,
}: GameControlsProps) {

  return (
    <div className="flex gap-2 p-2 rounded-lg" style={{backgroundColor: '#2a2a2a', border: '2px solid #444'}}>
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
    </div>
  );
}
