"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { TOWERS } from "@/lib/game-config";
import type { GameState, TowerData, PlacedTower } from "@/lib/types";
import { cn } from "@/lib/utils";
import { drawRealisticTower } from "@/components/GameBoard";

interface GameSidebarProps {
  gameState: GameState;
  onDragStart: (tower: TowerData) => void;
  onStartWave: () => void;
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


export default function GameSidebar({ gameState, onDragStart, onStartWave }: GameSidebarProps) {
  const [selectedTower, setSelectedTower] = useState<TowerData | null>(null);

  const handleTowerClick = (tower: TowerData) => {
    setSelectedTower(tower);
  };
  
  useEffect(() => {
    if(!selectedTower) {
        setSelectedTower(TOWERS.turret);
    }
  }, [selectedTower]);


  return (
    <div id="sidebar">
      <h2>Winter Warfare</h2>
      <p className="instruction">Drag towers to the battlefield</p>

      {selectedTower && (
        <div id="tower-preview">
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
        {Object.values(TOWERS).filter(tower => tower && tower.id).map((tower) => {
          if (!tower || !tower.id) return null;
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
              <div className={cn("icon", `${tower.id.replace(/_/g, '-')}-icon`)}>
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

    </div>
  );
}
