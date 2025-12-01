"use client";

import Image from "next/image";
import { TOWERS } from "@/lib/game-config";
import type { GameState, TowerData } from "@/lib/types";
import { cn } from "@/lib/utils";
import ArsenalAdvisor from "./ArsenalAdvisor";

interface GameSidebarProps {
  gameState: GameState;
  onDragStart: (tower: TowerData) => void;
  onStartWave: () => void;
}

export default function GameSidebar({ gameState, onDragStart, onStartWave }: GameSidebarProps) {
  return (
    <div id="sidebar">
      <h2>Winter Warfare</h2>
      <p className="instruction">Drag towers to the battlefield</p>
      
      <div id="tower-list">
        {Object.values(TOWERS).map((tower) => {
          const canAfford = gameState.money >= tower.cost;
          return (
            <div
              key={tower.id}
              draggable={canAfford}
              onDragStart={() => onDragStart(tower)}
              className={cn("tower-card", !canAfford && "disabled")}
              title={`${tower.name} - $${tower.cost}`}
              data-type={tower.id}
            >
              <div className={cn("icon", `${tower.id.replace(/_/g, '-')}-icon`)}></div>
              <div className="info">
                <span className="name">{tower.name}</span>
                <span className="cost">${tower.cost}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div id="stats">
        <div className="stat">Lives: <span id="lives">{gameState.lives}</span></div>
        <div className="stat">Money: $<span id="money">{gameState.money}</span></div>
        <div className="stat">Wave: <span id="wave">{gameState.wave}</span></div>
      </div>

      <div id="message-area">
        {!gameState.waveActive && gameState.waveTimer > 0 ? (
            `Next wave in: ${gameState.waveTimer}s`
        ) : `Wave ${gameState.wave} in progress...`}
      </div>

      <button onClick={onStartWave} disabled={gameState.waveActive} style={{marginTop: '10px'}}>
        Start Wave
      </button>

      <div style={{marginTop: 'auto'}}>
        <ArsenalAdvisor gameState={gameState} />
      </div>

    </div>
  );
}
