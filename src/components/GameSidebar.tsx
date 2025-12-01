"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { GAME_CONFIG, TOWERS } from "@/lib/game-config";
import type { GameState, TowerData } from "@/lib/types";
import ArsenalAdvisor from "./ArsenalAdvisor";
import { cn } from "@/lib/utils";
import { Heart, Coins, Waves, Timer } from "lucide-react";

interface GameSidebarProps {
  gameState: GameState;
  onDragStart: (tower: TowerData) => void;
}

export default function GameSidebar({ gameState, onDragStart }: GameSidebarProps) {
  return (
    <Card className="w-80 flex-shrink-0 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-center font-headline text-3xl tracking-wider text-primary">
          Winter Warfare
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        {/* Stats */}
        <Card>
          <CardContent className="pt-6 grid grid-cols-2 gap-4 text-lg">
            <div className="flex items-center gap-2">
                <Heart className="text-primary"/> <span className="font-bold">{gameState.lives}</span> / {GAME_CONFIG.STARTING_LIVES}
            </div>
            <div className="flex items-center gap-2">
                <Coins className="text-amber-400"/> <span className="font-bold">${gameState.money}</span>
            </div>
            <div className="flex items-center gap-2">
                <Waves className="text-blue-400"/> <span className="font-bold">Wave {gameState.wave}</span>
            </div>
            {!gameState.waveActive && gameState.waveTimer > 0 && (
                <div className="flex items-center gap-2">
                    <Timer className="text-accent"/> <span className="font-bold">{gameState.waveTimer}s</span>
                </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex flex-col flex-grow min-h-0">
            <h3 className="font-headline text-xl text-center mb-2">Arsenal</h3>
            <ScrollArea className="flex-grow border rounded-lg">
                <div className="grid grid-cols-3 gap-2 p-2">
                {Object.values(TOWERS).map((tower) => {
                    const canAfford = gameState.money >= tower.cost;
                    return (
                    <div
                        key={tower.id}
                        draggable={canAfford}
                        onDragStart={() => onDragStart(tower)}
                        className={cn(
                        "p-1 border rounded-md flex flex-col items-center justify-center aspect-square transition-all",
                        canAfford
                            ? "cursor-grab hover:bg-accent/20 hover:border-accent"
                            : "cursor-not-allowed opacity-50 bg-muted/50"
                        )}
                        title={`${tower.name} - $${tower.cost}`}
                    >
                        <Image
                        src={tower.iconUrl}
                        alt={tower.name}
                        width={40}
                        height={40}
                        data-ai-hint={tower.iconHint}
                        className="pointer-events-none"
                        />
                        <span className="text-xs font-semibold truncate block w-full text-center">
                        ${tower.cost}
                        </span>
                    </div>
                    );
                })}
                </div>
            </ScrollArea>
        </div>

        <ArsenalAdvisor gameState={gameState} />
      </CardContent>
    </Card>
  );
}
