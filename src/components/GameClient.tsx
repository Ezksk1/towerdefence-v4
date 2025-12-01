"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GameState, PlacedTower, TowerData, ActiveEnemy, Soldier, Decoration } from "@/lib/types";
import { GAME_CONFIG, LEVELS, TOWERS, ENEMIES_BY_WAVE, ENEMIES } from "@/lib/game-config";
import GameBoard from "./GameBoard";
import GameSidebar from "./GameSidebar";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useToast } from "@/hooks/use-toast";
import GameControls from "./GameControls";

const generateDecorations = (count: number, path: {x:number, y:number}[]): Decoration[] => {
    const decorations: Decoration[] = [];
    const pathSet = new Set(path.map(p => `${p.x},${p.y}`));

    for(let i=0; i<count; i++){
        let x, y, gridX, gridY;
        let valid = false;
        let attempts = 0;
        while(!valid && attempts < 50){
            gridX = Math.floor(Math.random() * GAME_CONFIG.GRID_COLS);
            gridY = Math.floor(Math.random() * GAME_CONFIG.GRID_ROWS);
            if(!pathSet.has(`${gridX},${gridY}`)){
                valid = true;
            }
            attempts++;
        }
        
        if(valid){
            x = gridX * GAME_CONFIG.CELL_WIDTH + Math.random() * GAME_CONFIG.CELL_WIDTH;
            y = gridY * GAME_CONFIG.CELL_HEIGHT + Math.random() * GAME_CONFIG.CELL_HEIGHT;
            const type = (['tree', 'cane', 'ornament'] as const)[Math.floor(Math.random()*3)];
            decorations.push({
                type,
                x,
                y,
                size: Math.random() * 20 + 20,
                color: ['#D32F2F', '#FFC107', '#009688', '#2196F3'][Math.floor(Math.random()*4)],
                rotation: Math.random() * Math.PI * 2,
            });
        }
    }
    return decorations;
}

const initialGameState: GameState = {
  status: "playing",
  lives: GAME_CONFIG.STARTING_LIVES,
  money: GAME_CONFIG.STARTING_MONEY,
  wave: 1,
  currentLevel: 1,
  waveTimer: GAME_CONFIG.WAVE_TIMER_DURATION,
  towers: [],
  enemies: [],
  projectiles: [],
  decorations: generateDecorations(30, LEVELS[0].path),
  soldiers: [],
  waveActive: false,
};

export default function GameClient() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [draggingTower, setDraggingTower] = useState<TowerData | null>(null);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enemiesToSpawnRef = useRef<string[]>([]);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const spawnGroup = useCallback(() => {
    if (enemiesToSpawnRef.current.length === 0) {
        if(spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
        return;
    }

    setGameState(prev => {
        const groupSize = Math.min(enemiesToSpawnRef.current.length, 10 + Math.floor(prev.wave / 5));
        const enemiesForThisSpawn = enemiesToSpawnRef.current.splice(0, groupSize); 
        const newEnemies = enemiesForThisSpawn.map((enemyId, index) => {
            const enemyData = ENEMIES[enemyId];
            if (!enemyData) return null;
            const path = LEVELS[prev.currentLevel - 1].path;
            const totalHp = enemyData.hp(prev.wave);
            return {
                ...enemyData,
                idInGame: `${prev.wave}-${Date.now()}-${index}`,
                x: path[0].x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH/2 - (index * 25), // Offset spawn for tighter groups
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
        }).filter(e => e !== null) as ActiveEnemy[];

        return { ...prev, enemies: [...prev.enemies, ...newEnemies] };
    });
  }, [setGameState]);


  const handleStartWave = useCallback(() => {
    if (gameState.waveActive) return;

    setGameState(prev => {
      if (prev.lives <= 0) return prev;
      
      const waveConfig = ENEMIES_BY_WAVE[prev.wave] || [];
      enemiesToSpawnRef.current = [...waveConfig];

      if(spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = setInterval(spawnGroup, 1500); // Spawn a group every 1.5 seconds

      return {
          ...prev,
          waveActive: true,
          waveTimer: 0,
      };
    });
  }, [gameState.waveActive, spawnGroup]);

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

  const handlePause = () => {
    setGameState(prev => ({
        ...prev,
        status: prev.status === 'paused' ? 'playing' : 'paused'
    }));
  };

  const handleSave = () => {
      try {
          localStorage.setItem('towerDefenseSave', JSON.stringify(gameState));
          toast({ title: 'Game Saved!' });
      } catch (error) {
          console.error("Failed to save game", error);
          toast({ variant: "destructive", title: 'Save Failed', description: 'Could not save game state.' });
      }
  };

  const handleLoad = () => {
      try {
          const savedState = localStorage.getItem('towerDefenseSave');
          if (savedState) {
              const loadedState = JSON.parse(savedState);
              // Make sure to reset transient state properties
              loadedState.status = 'paused';
              enemiesToSpawnRef.current = [];
              if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
              setGameState(loadedState);
              toast({ title: 'Game Loaded!', description: 'Press Resume to continue.' });
          } else {
              toast({ variant: "destructive", title: 'Load Failed', description: 'No save file found.' });
          }
      } catch (error) {
          console.error("Failed to load game", error);
          toast({ variant: "destructive", title: 'Load Failed', description: 'Could not load game state.' });
      }
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
      <GameSidebar 
        gameState={gameState} 
        onDragStart={handleDragStart} 
        onStartWave={handleStartWave} 
        onPause={handlePause}
        onSave={handleSave}
        onLoad={handleLoad}
      />
    </div>
  );
}
