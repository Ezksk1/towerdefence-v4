"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { TOWERS } from "@/lib/game-config";
import type { GameState, TowerData, PlacedTower } from "@/lib/types";
import { cn } from "@/lib/utils";
import { drawRealisticTower } from "@/components/GameBoard";
import GameControls from "./GameControls";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface GameSidebarProps {
  gameState: GameState;
  onDragStart: (tower: TowerData) => void;
  onStartWave: () => void;
  onPause: () => void;
  onSave: () => void;
  onLoad: () => void;
}

const TowerPreview = ({ tower }: { tower: TowerData }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    const angle = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !tower) return;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;

        const previewSize = 120;
        canvas.width = previewSize;
        canvas.height = previewSize;

        const animate = () => {
            angle.current += 0.01; // Rotation speed
            
            ctx.clearRect(0, 0, previewSize, previewSize);
    
            const placedTower: PlacedTower = {
                ...tower,
                idInGame: 'preview',
                x: previewSize / 2,
                y: previewSize / 2,
                gridX: 0,
                gridY: 0,
                cooldown: 0,
                angle: angle.current,
            };
            
            drawRealisticTower(ctx, placedTower);
            animationFrameId.current = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            if(animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [tower]);

    return <canvas ref={canvasRef} />;
}


export default function GameSidebar({ gameState, onDragStart, onStartWave, onPause, onSave, onLoad }: GameSidebarProps) {
  const [selectedTower, setSelectedTower] = useState<TowerData | null>(null);

  const handleTowerClick = (tower: TowerData) => {
    setSelectedTower(tower);
  };
  
  useEffect(() => {
    if(!selectedTower) {
        // We can set a default tower to show on load if we want
        // setSelectedTower(TOWERS.turret);
    }
  }, [selectedTower]);


  return (
    <div id="sidebar">
      <h2>Winter Warfare</h2>
      <p className="instruction">Drag towers to the battlefield</p>

      {selectedTower && (
        <div id="tower-preview" className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-6 w-6"
            onClick={() => setSelectedTower(null)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close preview</span>
          </Button>
          <TowerPreview tower={selectedTower} />
          <h3>{selectedTower.name}</h3>
          <p>Cost: ${selectedTower.cost}</p>
          <p>Damage: {selectedTower.damage}</p>
          <p>Range: {selectedTower.range}</p>
          <p>Rate: {selectedTower.rate}</p>
          {selectedTower.splash && <p>Splash: {selectedTower.splash}</p>}
        </div>
      )}
      
      <div id="tower-list">
        {Object.values(TOWERS).map((tower) => {
          if (!tower || !tower.id) return null;
          
          if (tower.id === 'lightning_spire' && gameState.wave < 1000) {
            return null;
          }

          const canAfford = gameState.money >= tower.cost;
          return (
            <div
              key={tower.id}
              draggable={canAfford}
              onDragStart={() => onDragStart(tower)}
              onClick={() => handleTowerClick(tower)}
              className={cn("tower-card", !canAfford && "disabled")}
              title={`${tower.name} - $${tower.cost}`}
              data-type={tower.id}
            >
              <div className="icon">
                 <Image src={tower.iconUrl} alt={tower.name} width={32} height={32} data-ai-hint={tower.iconHint} />
              </div>
              <div className="info">
                <span className="name">{tower.name}</span>
                <span className="cost">${tower.cost}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-auto flex flex-col gap-2">
        <GameControls onPause={onPause} onSave={onSave} onLoad={onLoad} gameState={gameState} />

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

        <Button onClick={onStartWave} disabled={gameState.waveActive || gameState.lives <= 0} className="w-full">
          {gameState.lives <= 0 ? 'Game Over' : gameState.waveActive ? 'Wave in Progress' : 'Start Wave'}
        </Button>
      </div>

    </div>
  );
}
