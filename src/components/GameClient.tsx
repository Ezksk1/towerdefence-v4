
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GameState, PlacedTower, TowerData, ActiveEnemy, Soldier, Decoration } from "@/lib/types";
import { GAME_CONFIG, LEVELS, TOWERS, ENEMIES_BY_WAVE, ENEMIES, rasterizePath } from "@/lib/game-config";
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
  gameSpeed: 1,
};

export default function GameClient() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [draggingTower, setDraggingTower] = useState<TowerData | null>(null);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enemiesToSpawnRef = useRef<string[]>([]);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [customPathPoints, setCustomPathPoints] = useState<{x: number, y: number}[]>([]);

  const spawnGroup = useCallback(() => {
    if (enemiesToSpawnRef.current.length === 0) {
        if(spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
        return;
    }

    setGameState(prev => {
        const groupSize = Math.min(enemiesToSpawnRef.current.length, 10 + Math.floor(prev.wave / 5));
        const enemiesForThisSpawn = enemiesToSpawnRef.current.splice(0, groupSize); 
        
        let currentPath;
        if (prev.currentLevel === 5 && customPathPoints.length > 1) {
            currentPath = rasterizePath(customPathPoints);
        } else {
            const levelData = LEVELS.find(l => l.level === prev.currentLevel);
            if (levelData) {
                currentPath = levelData.path;
            }
        }

        if (!currentPath) return prev;

        const newEnemies = enemiesForThisSpawn.map((enemyId, index) => {
            const enemyData = ENEMIES[enemyId];
            if (!enemyData) return null;
            if (!currentPath || currentPath.length === 0) return null;
            const totalHp = enemyData.hp(prev.wave);
            return {
                ...enemyData,
                idInGame: `${prev.wave}-${Date.now()}-${index}`,
                x: currentPath[0].x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH/2 - (index * 25), // Offset spawn for tighter groups
                y: currentPath[0].y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT/2,
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
  }, [setGameState, customPathPoints]);


  const handleStartWave = useCallback(() => {
    if (gameState.waveActive) return;
    
    if (gameState.currentLevel === 5 && customPathPoints.length < 2) {
      toast({ variant: "destructive", title: "Invalid Path", description: "Please draw a path for the enemies first." });
      return;
    }

    setGameState(prev => {
      if (prev.lives <= 0) return prev;
      
      let waveNumber = prev.wave;
      if(prev.currentLevel === 4) { // Impossible Level
        waveNumber = prev.wave + 25;
      } else if (prev.currentLevel === 6) { // Army Level
        waveNumber = prev.wave + 30;
      }
      const waveConfig = ENEMIES_BY_WAVE[waveNumber] || [];
      enemiesToSpawnRef.current = [...waveConfig];

      if(spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = setInterval(spawnGroup, 1500 / prev.gameSpeed); // Spawn a group every 1.5 seconds

      return {
          ...prev,
          waveActive: true,
          waveTimer: 0,
      };
    });
  }, [gameState.waveActive, spawnGroup, gameState.gameSpeed, gameState.currentLevel, customPathPoints, toast]);

  useGameLoop(gameState, setGameState, handleStartWave, customPathPoints);

  const handleDragStart = (tower: TowerData) => {
    if (gameState.money >= tower.cost) {
      setDraggingTower(tower);
    }
  };

  const handleDrop = (gridX: number, gridY: number) => {
    if (!draggingTower) return;
    
    let currentPath;
    if (gameState.currentLevel === 5 && customPathPoints.length > 1) {
        currentPath = rasterizePath(customPathPoints);
    } else {
        const levelData = LEVELS.find(l => l.level === gameState.currentLevel);
        if (levelData) {
            currentPath = levelData.path;
        }
    }
    const isOnPath = currentPath && currentPath.some(p => p.x === gridX && p.y === gridY);
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
    if (isDrawingPath) return;
    e.dataTransfer.dropEffect = "copy";
    if(canvasRef.current) canvasRef.current.classList.add("drag-over");
  };

  const handleDragLeave = () => {
    if(canvasRef.current) canvasRef.current.classList.remove("drag-over");
  };

  const handleDropEvent = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if(canvasRef.current) canvasRef.current.classList.remove("drag-over");
    if (isDrawingPath) return;

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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingPath) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor(x / GAME_CONFIG.CELL_WIDTH);
    const gridY = Math.floor(y / GAME_CONFIG.CELL_HEIGHT);

    setCustomPathPoints(prev => {
        const lastPoint = prev[prev.length -1];
        if(!lastPoint || lastPoint.x !== gridX || lastPoint.y !== gridY) {
            return [...prev, {x: gridX, y: gridY}];
        }
        return prev;
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // No longer used for drawing path
  };

  const handleMouseUp = () => {
    // No longer used for drawing path
  };

  const toggleDrawingPath = () => {
    if (isDrawingPath) {
      // If we are currently drawing, stop and save.
      setIsDrawingPath(false);
      if (customPathPoints.length > 1) {
        toast({ title: 'Path Saved!', description: 'Your custom path is ready for the next wave.' });
      } else if (customPathPoints.length > 0) {
        toast({ variant: "destructive", title: 'Path Too Short', description: 'Add at least one more point.' });
      }
    } else {
      // If we are not drawing, start.
      setIsDrawingPath(true);
      setCustomPathPoints([]); // Clear old path
      toast({ title: 'Drawing Path', description: 'Click on the map to add points to the path. Click the button again to finish.' });
    }
  };


  const handlePause = () => {
    setGameState(prev => ({
        ...prev,
        status: prev.status === 'paused' ? 'playing' : 'paused'
    }));
  };

  const handleSave = () => {
      try {
          const stateToSave = {
            ...gameState,
            customPathPoints,
          };
          localStorage.setItem('towerDefenseSave', JSON.stringify(stateToSave));
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
              if (loadedState.customPathPoints) {
                setCustomPathPoints(loadedState.customPathPoints);
              }
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
  
  const handleRestart = (level?: number) => {
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    enemiesToSpawnRef.current = [];
    const newLevel = level !== undefined ? level : gameState.currentLevel;
    let newPath;
    if(newLevel === 5) {
      newPath = [];
      setIsDrawingPath(true);
      setCustomPathPoints([]);
      toast({ title: 'Draw Your Path!', description: "Click on the map to create a path for the enemies. Click the 'Draw Path' button again when done."});
    } else {
      setIsDrawingPath(false);
      const levelData = LEVELS.find(l => l.level === newLevel);
      if(levelData) {
        newPath = levelData.path;
      }
    }
    setGameState({
        ...initialGameState,
        currentLevel: newLevel,
        decorations: generateDecorations(30, newPath || []),
    });
    const levelData = LEVELS.find(l => l.level === newLevel);
    const levelName = newLevel === 5 ? "DIY Map" : (levelData ? levelData.name : "Unknown Map");
    toast({ title: `Game Restarted on ${levelName}!`});
  };

  const handleLevelChange = (level: number) => {
    handleRestart(level);
  };

  const handleSpeedUp = () => {
    let newSpeed;
    setGameState(prev => {
      if (prev.gameSpeed === 1) newSpeed = 2;
      else if (prev.gameSpeed === 2) newSpeed = 4;
      else newSpeed = 1;
      
      return {...prev, gameSpeed: newSpeed};
    });
    // This needs to be outside the setter to avoid the re-render error
    if (gameState.gameSpeed === 1) newSpeed = 2;
    else if (gameState.gameSpeed === 2) newSpeed = 4;
    else newSpeed = 1;
    toast({ title: `Game speed set to ${newSpeed}x` });
  };

  return (
    <div id="game-container">
      <GameBoard
        canvasRef={canvasRef}
        gameState={gameState}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropEvent}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        customPathPoints={customPathPoints}
      />
      <GameSidebar 
        gameState={gameState} 
        onDragStart={handleDragStart} 
        onStartWave={handleStartWave} 
        onPause={handlePause}
        onSave={handleSave}
        onLoad={handleLoad}
        onRestart={() => handleRestart()}
        onSpeedUp={handleSpeedUp}
        onLevelChange={handleLevelChange}
        onDrawPath={toggleDrawingPath}
        isDrawingPath={isDrawingPath}
      />
    </div>
  );
}

    
