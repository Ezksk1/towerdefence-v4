"use client";

import { Button } from "@/components/ui/button";
import type { GameState } from "@/lib/types";
import { FolderDown, Pause, Play, RefreshCw, ChevronsRight, Save } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GameControlsProps {
  onPause: () => void;
  onSave: () => void;
  onLoad: () => void;
  onRestart: () => void;
  onSpeedUp: () => void;
  gameState: GameState;
}

export default function GameControls({
  onPause,
  onSave,
  onLoad,
  onRestart,
  onSpeedUp,
  gameState,
}: GameControlsProps) {
  return (
    <TooltipProvider>
      <div
        className="flex justify-center gap-2 p-2 rounded-lg"
        style={{ backgroundColor: "#2a2a2a", border: "2px solid #444" }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onPause} variant="accent" size="icon">
              {gameState.status === "paused" ? <Play /> : <Pause />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{gameState.status === "paused" ? "Resume" : "Pause"} Game</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onSpeedUp} variant="outline" size="icon" className={cn("relative", gameState.gameSpeed > 1 && "fast-forward-active text-accent")}>
                <ChevronsRight />
                <span className="absolute bottom-1 right-1 text-xs font-bold">{gameState.gameSpeed}x</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Speed Up ({gameState.gameSpeed}x)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onRestart} variant="destructive" size="icon">
              <RefreshCw />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Restart Game</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onSave} variant="outline" size="icon">
              <Save />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save Game</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onLoad} variant="outline" size="icon">
              <FolderDown />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Load Game</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
