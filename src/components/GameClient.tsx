"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GameState, PlacedTower, TowerData, ActiveEnemy, Soldier } from "@/lib/types";
import { GAME_CONFIG, LEVELS, TOWERS, ENEMIES_BY_WAVE, ENEMIES } from "@/lib/game-config";
import GameBoard from "./GameBoard";
import GameSidebar from "./GameSidebar";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useToast } from "@/hooks/use-toast";

const initialGameState: GameState = {
  status: "playing",
  lives: GAME_CONFIG.STARTING_LIVES,
  money: GAME_CONFIG.STARTING_MONEY,
  wave: 1,
  currentLevel: 2, // Use the new complex path
  waveTimer: GAME_CONFIG.WAVE_TIMER_DURATION,
  towers: [],
  enemies: [],
  projectiles: [],
  decorations: [],
  soldiers: [],
  waveActive: false,
};

export default function GameClient() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [draggingTower, setDraggingTower] = useState<TowerData | null>(null);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStartWave = useCallback(() => {
    if (gameState.waveActive) return;

    setGameState(prev => {
      if (prev.lives <= 0) return prev;

      const enemiesToSpawn = (ENEMIES_BY_WAVE[prev.wave] || []).map((enemyId, index) => {
        const enemyData = ENEMIES[enemyId];
        const path = LEVELS[prev.currentLevel - 1].path;
        const totalHp = enemyData.hp(prev.wave);
        return {
            ...enemyData,
            idInGame: `${prev.wave}-${index}`,
            x: path[0].x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH/2,
            y: path[0].y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT/2,
            currentHp: totalHp,
            totalHp: totalHp,
            pathIndex: 0,
            active: true,
            speedFactor: 1,
            frozenTimer: 0,
            poisonTimer: 0,
            poisonDamage: 0,
        } as ActiveEnemy;
      });

      return {
          ...prev,
          waveActive: true,
          enemies: enemiesToSpawn,
          waveTimer: 0,
      };
    });
  }, [gameState.waveActive, gameState.currentLevel]);

  useGameLoop(gameState, setGameState, handleStartWave);

  const handleDragStart = (tower: TowerData) => {
    if (gameState.money >= tower.cost) {
      setDraggingTower(tower);
    }
  };

  const handleDrop = (gridX: number, gridY: number) => {
    if (!draggingTower) return;
    
    const path = LEVELS[gameState.currentLevel - 1].path;
    const isOnPath = path.some(p => p.x === gridX && p.y === gridY);
    const isOccupied = gameState.towers.some(t => t.gridX === gridX && t.gridY === gridY);
    
    if (isOnPath || isOccupied) {
       toast({ variant: "destructive", title: "Placement Error", description: "Cannot place tower here." });
       setDraggingTower(null);
       return;
    }

    setGameState((prev) => ({
      ...prev,
      money: prev.money - draggingTower.cost,
      towers: [
        ...prev.towers,
        {
          ...(TOWERS[draggingTower.id] as TowerData),
          idInGame: crypto.randomUUID(),
          x: gridX * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH / 2,
          y: gridY * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT / 2,
          gridX,
          gridY,
          cooldown: 0,
          angle: 0,
        },
      ],
    }));
    setDraggingTower(null);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if(canvasRef.current) canvasRef.current.classList.add("drag-over");
  };

  const handleDragLeave = () => {
    if(canvasRef.current) canvasRef.current.classList.remove("drag-over");
  };

  const handleDropEvent = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if(canvasRef.current) canvasRef.current.classList.remove("drag-over");

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = Math.floor(x / GAME_CONFIG.CELL_WIDTH);
    const gridY = Math.floor(y / GAME_CONFIG.CELL_HEIGHT);
    
    if (gridX < 0 || gridX >= GAME_CONFIG.GRID_COLS || gridY < 0 || gridY >= GAME_CONFIG.GRID_ROWS) {
        return;
    }

    handleDrop(gridX, gridY);
  };

  return (
    <div id="game-container">
      <GameBoard
        canvasRef={canvasRef}
        gameState={gameState}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropEvent}
      />
      <GameSidebar gameState={gameState} onDragStart={handleDragStart} onStartWave={handleStartWave} />
    </div>
  );
}
