

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GameState, PlacedTower, TowerData, ActiveEnemy, Soldier, Decoration, DIYTower } from "@/lib/types";
import { GAME_CONFIG, LEVELS, TOWERS, ENEMIES_BY_WAVE, ENEMIES, rasterizePath } from "@/lib/game-config";
import GameBoard from "./GameBoard";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useToast } from "@/hooks/use-toast";
import { useScreenDimensions } from "./ResponsiveGameWrapper";
// import GameControls from "./GameControls";
// import RadioCoordination from "./RadioCoordination";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

const generateDecorations = (count: number, path: { x: number, y: number }[]): Decoration[] => {
  const decorations: Decoration[] = [];
  const pathSet = new Set(path.map(p => `${p.x},${p.y}`));

  for (let i = 0; i < count; i++) {
    let x, y, gridX = 0, gridY = 0;
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 50) {
      gridX = Math.floor(Math.random() * GAME_CONFIG.GRID_COLS);
      gridY = Math.floor(Math.random() * GAME_CONFIG.GRID_ROWS);
      if (!pathSet.has(`${gridX},${gridY}`)) {
        valid = true;
      }
      attempts++;
    }

    if (valid) {
      x = gridX * GAME_CONFIG.CELL_WIDTH + Math.random() * GAME_CONFIG.CELL_WIDTH;
      y = gridY * GAME_CONFIG.CELL_HEIGHT + Math.random() * GAME_CONFIG.CELL_HEIGHT;
      const type = (['tree', 'cane', 'ornament', 'present', 'snowman'] as const)[Math.floor(Math.random() * 5)];
      decorations.push({
        type,
        x,
        y,
        size: Math.random() * 20 + 20,
        color: ['#D32F2F', '#FFC107', '#009688', '#2196F3'][Math.floor(Math.random() * 4)],
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
  explosions: [], // Initialize explosions
  decorations: generateDecorations(30, LEVELS[0].path),
  soldiers: [],
  planes: [],
  deployedTanks: [],
  waveActive: false,
  gameSpeed: 1,
};

export default function GameClient() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [draggingTower, setDraggingTower] = useState<TowerData | DIYTower | null>(null);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enemiesToSpawnRef = useRef<string[]>([]);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [customPathPoints, setCustomPathPoints] = useState<{ x: number, y: number }[]>([]);
  const [customTowers, setCustomTowers] = useState<DIYTower[]>([]);

  const { canvasWidth, canvasHeight } = useScreenDimensions();

  const addCustomTower = (tower: DIYTower) => {
    setCustomTowers(prev => [...prev, tower]);
  };

  const spawnGroup = useCallback(() => {
    if (enemiesToSpawnRef.current.length === 0) {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
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

      if (!currentPath || currentPath.length < 1) return prev;

      const newEnemies = enemiesForThisSpawn.map((enemyId, index) => {
        const enemyData = ENEMIES[enemyId];
        if (!enemyData) return null;

        const totalHp = enemyData.hp(prev.wave);
        return {
          ...enemyData,
          idInGame: `${prev.wave}-${Date.now()}-${index}`,
          x: currentPath![0].x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH / 2 - (index * 25), // Offset spawn for tighter groups
          y: currentPath![0].y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT / 2,
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
      if (prev.currentLevel === 4) { // Impossible Level
        waveNumber = prev.wave + 25;
      } else if (prev.currentLevel === 6) { // Army Level
        waveNumber = prev.wave + 30;
      }
      // Fetch predefined wave config or generate one procedurally for high wave numbers
      const proceduralWave = (w: number): string[] => {
        const enemies: string[] = [];
        const difficulty = Math.max(1, w);

        // Ultra-epic waves: scale appropriately for extreme difficulties
        let count: number;
        if (difficulty >= 500) {
          // Waves 500+: ULTIMATE BOSS GAUNTLET - fewer enemies but extremely dangerous
          count = Math.min(100 + Math.floor(difficulty * 0.5), 600);
        } else if (difficulty >= 200) {
          // Waves 200-499: Extreme difficulty with many endgame enemies
          count = Math.min(80 + Math.floor(difficulty * 1.5), 500);
        } else if (difficulty >= 100) {
          // Waves 100-199: Late-game elite enemy mix
          count = Math.min(50 + Math.floor(difficulty * 2), 400);
        } else {
          // Waves 1-99: Standard progression
          count = Math.min(50 + Math.floor(difficulty * 2), 300);
        }

        for (let i = 0; i < count; i++) {
          if (difficulty >= 500) {
            // === ULTIMATE BOSS GAUNTLET (Wave 500+) ===
            // Predominantly bosses and titan-class units
            if (i % 300 === 0) enemies.push('ancient_titan'); // Every 300 = 2 Ancient Titans per wave
            else if (i % 150 === 0) enemies.push('mothership'); // Multiple motherships
            else if (i % 80 === 0) enemies.push('armored_colossus'); // Multiple colossi
            else if (i % 40 === 0) enemies.push('mega_boss'); // Many mega bosses
            else if (i % 30 === 0) enemies.push('frost_giant'); // Frost giants
            else if (i % 20 === 0) enemies.push('zeppelin'); // War zeppelins
            else if (i % 12 === 0) enemies.push('ice_golem'); // Ice golems
            else if (i % 8 === 0) enemies.push('orbital_dreadnaught'); // Orbital dreadnaughts
            else if (i % 5 === 0) enemies.push('void_wraith'); // Void wraiths
            else if (i % 3 === 0) enemies.push('phase_drone'); // Phase drones
            else enemies.push('drone_swarm'); // Filler drones
          } else if (difficulty >= 200) {
            // === EXTREME DIFFICULTY (Wave 200-499) ===
            // Heavy mix of elite and boss units
            if (i % 250 === 0) enemies.push('ancient_titan');
            else if (i % 120 === 0) enemies.push('mothership');
            else if (i % 70 === 0) enemies.push('armored_colossus');
            else if (i % 50 === 0) enemies.push('mega_boss');
            else if (i % 35 === 0) enemies.push('frost_giant');
            else if (i % 25 === 0) enemies.push('zeppelin');
            else if (i % 15 === 0) enemies.push('ice_golem');
            else if (i % 10 === 0) enemies.push('orbital_dreadnaught');
            else if (i % 6 === 0) enemies.push('void_wraith');
            else if (i % 3 === 0) enemies.push('phase_drone');
            else enemies.push('drone_swarm');
          } else if (difficulty >= 100) {
            // Late-game elite enemy mix
            if (i % 200 === 0) enemies.push('ancient_titan');
            else if (i % 50 === 0) enemies.push('armored_colossus');
            else if (i % 20 === 0) enemies.push('orbital_dreadnaught');
            else if (i % 6 === 0) enemies.push('void_wraith');
            else if (i % 2 === 0) enemies.push('phase_drone');
            else enemies.push('drone_swarm');
          } else if (difficulty < 10) {
            enemies.push(i % 4 === 0 ? 'elf_warrior' : 'troop');
          } else if (difficulty < 20) {
            enemies.push(i % 6 === 0 ? 'humvee' : 'troop');
          } else if (difficulty < 30) {
            enemies.push(i % 5 === 0 ? 'tank' : 'humvee');
          } else if (difficulty < 40) {
            enemies.push(i % 8 === 0 ? 'heavy_tank' : 'tank');
          } else if (difficulty < 60) {
            enemies.push(i % 25 === 0 ? 'boss' : (i % 6 === 0 ? 'heavy_tank' : 'tank'));
          } else if (difficulty < 90) {
            enemies.push(i % 40 === 0 ? 'mega_boss' : (i % 10 === 0 ? 'mothership' : 'heavy_tank'));
          } else {
            enemies.push(i % 50 === 0 ? 'mothership' : 'mega_boss');
          }
        }

        return enemies;
      };

      const waveConfig = ENEMIES_BY_WAVE[waveNumber] || proceduralWave(waveNumber);
      enemiesToSpawnRef.current = [...waveConfig];

      if (prev.wave === 500) {
        setTimeout(() => {
          toast({
            title: "🔥 ULTIMATE GAUNTLET UNLOCKED! 🔥",
            description: "Wave 500+! You've reached the BOSS APOCALYPSE! Only the most powerful tower combinations will survive. Ancient Titans and Motherships flood the battlefield!"
          });
        }, 500);
      } else if (prev.wave === 200) {
        setTimeout(() => {
          toast({
            title: "💥 EXTREME DIFFICULTY ACTIVATED! 💥",
            description: "Wave 200: EXTREME MODE engaged! Elite enemies and multiple bosses incoming. This is the true test of your defense!"
          });
        }, 500);
      } else if (prev.wave === 100) {
        setTimeout(() => {
          toast({
            title: "⚡ LEGENDARY UNLOCK! ⚡",
            description: "You have unlocked the LIGHTNING SPIRE! This Super Tesla Tower is now available in your build menu."
          });
        }, 500);
      }

      return {
        ...prev,
        waveActive: true,
        waveTimer: 0,
        status: 'playing', // Auto-resume if paused when starting wave
      };
    });
  }, [gameState.waveActive, gameState.currentLevel, customPathPoints, toast]);

  // Update spawn interval when game speed changes or wave starts
  useEffect(() => {
    if (gameState.waveActive && enemiesToSpawnRef.current.length > 0 && gameState.status === 'playing') {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = setInterval(spawnGroup, 1500 / gameState.gameSpeed);
    } else {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    }

    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, [gameState.gameSpeed, gameState.waveActive, gameState.status, spawnGroup]);

  useGameLoop(gameState, setGameState, handleStartWave, customPathPoints, enemiesToSpawnRef);

  const handleDragStart = (tower: TowerData | DIYTower) => {
    // BUG FIX: Prevent dragging/placing if game is paused or over
    if (gameState.status !== 'playing') {
      toast({ variant: "destructive", title: "Cannot Build", description: "Resume game to build towers." });
      return;
    }
    if (gameState.money >= tower.cost) {
      setDraggingTower(tower);
    }
  };

  const handleDrop = (gridX: number, gridY: number) => {
    if (!draggingTower) return;

    // BUG FIX: Prevent placing if game is paused or over
    if (gameState.status !== 'playing') {
      setDraggingTower(null);
      return;
    }

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

    let towerToAdd: PlacedTower;

    if ('isCustom' in draggingTower) {
      towerToAdd = {
        ...(draggingTower as DIYTower),
        idInGame: crypto.randomUUID(),
        x: gridX * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH / 2,
        y: gridY * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT / 2,
        gridX,
        gridY,
        cooldown: 0,
        angle: 0,
      };
    } else {
      towerToAdd = {
        ...(TOWERS[draggingTower.id as keyof typeof TOWERS] as TowerData),
        idInGame: crypto.randomUUID(),
        x: gridX * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH / 2,
        y: gridY * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT / 2,
        gridX,
        gridY,
        cooldown: 0,
        angle: 0,
      };
    }

    setGameState((prev) => ({
      ...prev,
      money: prev.money - draggingTower.cost,
      towers: [...prev.towers, towerToAdd],
    }));
    setDraggingTower(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isDrawingPath) return;
    e.dataTransfer.dropEffect = "copy";
    if (canvasRef.current) canvasRef.current.classList.add("drag-over");
  };

  const handleDragLeave = () => {
    if (canvasRef.current) canvasRef.current.classList.remove("drag-over");
  };

  const handleDropEvent = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (canvasRef.current) canvasRef.current.classList.remove("drag-over");
    if (isDrawingPath) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Scale coordinates from screen space to game space
    const scaleX = GAME_CONFIG.GRID_WIDTH / canvasWidth;
    const scaleY = GAME_CONFIG.GRID_HEIGHT / canvasHeight; // Use height for Y scaling

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

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

    const scaleX = GAME_CONFIG.GRID_WIDTH / canvasWidth;
    const scaleY = GAME_CONFIG.GRID_HEIGHT / canvasHeight;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const gridX = Math.floor(x / GAME_CONFIG.CELL_WIDTH);
    const gridY = Math.floor(y / GAME_CONFIG.CELL_HEIGHT);

    setCustomPathPoints(prev => {
      const lastPoint = prev[prev.length - 1];
      if (!lastPoint || lastPoint.x !== gridX || lastPoint.y !== gridY) {
        return [...prev, { x: gridX, y: gridY }];
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
    if (gameState.waveActive) {
      toast({ variant: "destructive", title: "Cannot Edit Path", description: "Wait for the wave to finish." });
      return;
    }
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

  const handleSave = (silent = false) => {
    try {
      const stateToSave = {
        ...gameState,
        customPathPoints,
        customTowers,
        savedEnemiesToSpawn: enemiesToSpawnRef.current // Persist pending enemies
      };
      localStorage.setItem('towerDefenseSave', JSON.stringify(stateToSave));
      if (!silent) {
        toast({ title: 'Game Saved!' });
      }
    } catch (error) {
      console.error("Failed to save game", error);
      if (!silent) {
        toast({ variant: "destructive", title: 'Save Failed', description: 'Could not save game state.' });
      }
    }
  };

  // Auto-Save Logic with Refs to prevent interval resets
  const latestStateRef = useRef({ gameState, customPathPoints, customTowers });
  useEffect(() => {
    latestStateRef.current = { gameState, customPathPoints, customTowers };
  }, [gameState, customPathPoints, customTowers]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { gameState: currentGS, customPathPoints: currentCPP, customTowers: currentCT } = latestStateRef.current;

      if (currentGS.status === 'playing' && currentGS.lives > 0) {
        try {
          const stateToSave = {
            ...currentGS,
            customPathPoints: currentCPP,
            customTowers: currentCT,
            savedEnemiesToSpawn: enemiesToSpawnRef.current
          };
          localStorage.setItem('towerDefenseSave', JSON.stringify(stateToSave));
          console.log("Auto-save completed");
        } catch (e) {
          console.error("Auto-save failed", e);
        }
      }
    }, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto-save on Wave Complete
  useEffect(() => {
    if (gameState.wave > 1 && !gameState.waveActive) {
      handleSave(true);
    }
  }, [gameState.wave, gameState.waveActive]);

  const handleLoad = () => {
    try {
      const savedState = localStorage.getItem('towerDefenseSave');
      if (savedState) {
        const loadedData = JSON.parse(savedState);

        // Restore pending enemies
        if (loadedData.savedEnemiesToSpawn) {
          enemiesToSpawnRef.current = loadedData.savedEnemiesToSpawn;
        } else {
          enemiesToSpawnRef.current = [];
        }

        // Clean up transient objects that fail to serialize validly or cause issues
        const cleanState: GameState = {
          ...loadedData,
          status: 'paused', // Always load paused
          soldiers: [], // Clear soldiers (functions lost)
          projectiles: [], // Clear projectiles
          explosions: [], // Clear explosions
        };

        if (loadedData.customPathPoints) {
          setCustomPathPoints(loadedData.customPathPoints);
        }
        if (loadedData.customTowers) {
          setCustomTowers(loadedData.customTowers);
        }

        if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
        setGameState(cleanState);
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
    if (newLevel === 5) {
      newPath = [];
      setIsDrawingPath(true);
      setCustomPathPoints([]);
      toast({ title: 'Draw Your Path!', description: "Click on the map to create a path for the enemies. Click the 'Draw Path' button again when done." });
    } else {
      setIsDrawingPath(false);
      const levelData = LEVELS.find(l => l.level === newLevel);
      if (levelData) {
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
    toast({ title: `Game Restarted on ${levelName}!` });
  };

  const handleLevelChange = (level: number) => {
    handleRestart(level);
  };

  const handleSpeedUp = () => {
    setGameState(prev => {
      let newSpeed = 1;
      if (prev.gameSpeed === 1) newSpeed = 2;
      else if (prev.gameSpeed === 2) newSpeed = 4;
      else if (prev.gameSpeed === 4) newSpeed = 8;
      else if (prev.gameSpeed === 8) newSpeed = 16;
      else newSpeed = 1;

      toast({ title: `Game speed set to ${newSpeed}x` });
      return { ...prev, gameSpeed: newSpeed };
    });
  };

  /* Flight Sim Logic */
  const [flightSimActive, setFlightSimActive] = useState(false);
  const [flightSimTowerId, setFlightSimTowerId] = useState<string | null>(null);
  const [flightData, setFlightData] = useState({ roll: 0, pitch: 0, mouseX: 0, mouseY: 0 });

  const handleFlightMouseMove = (e: React.MouseEvent) => {
    if (!flightSimActive) return;
    const { innerWidth, innerHeight } = window;
    // Normalize -1 to 1
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = (e.clientY / innerHeight) * 2 - 1;

    // Calculate bank (roll) and tilt (pitch)
    setFlightData({
      roll: x * 20, // Max 20 degree bank
      pitch: y * 15, // Max 15 degree pitch
      mouseX: e.clientX,
      mouseY: e.clientY
    });
  };

  const handleFlightClick = useCallback((e: React.MouseEvent) => {
    if (!flightSimActive || !flightSimTowerId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // Map screen click to game coordinates (taking into account the 3D transform slightly offset)
    // For simplicity in this 'sim', we assume center aim but let's try to map it
    const scaleX = GAME_CONFIG.GRID_WIDTH / canvasWidth;
    const scaleY = GAME_CONFIG.GRID_HEIGHT / canvasHeight;

    const gameX = (e.clientX - rect.left) * scaleX;
    const gameY = (e.clientY - rect.top) * scaleY;

    // Drop bomb
    setGameState(prev => {
      const tower = prev.towers.find(t => t.idInGame === flightSimTowerId);
      if (!tower) return prev;

      return {
        ...prev,
        projectiles: [
          ...prev.projectiles,
          {
            id: crypto.randomUUID(),
            x: tower.x, // Bombs start from the hangar (imagination: plane is flying over)
            y: tower.y,
            target: { x: gameX, y: gameY },
            speed: 15,
            damage: 2000, // Massive damage
            splash: 250,
            active: true,
            type: 'bomb_heavy',
            config: tower
          }
        ]
      };
    });

    // Camera shake effect
    const hud = document.getElementById('flight-hud');
    if (hud) {
      hud.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
      setTimeout(() => { hud.style.transform = 'none'; }, 50);
    }
  }, [flightSimActive, flightSimTowerId, canvasWidth, canvasHeight]);

  const hasBigExplosion = gameState.explosions && gameState.explosions.some(e => e.life > 0.8 && e.maxRadius > 100);
  const shakeX = hasBigExplosion ? Math.random() * 10 - 5 : 0;
  const shakeY = hasBigExplosion ? Math.random() * 10 - 5 : 0;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 text-white flex flex-col md:flex-row" onMouseMove={handleFlightMouseMove}>
      {/* FLIGHT SIM OVERLAY */}
      {flightSimActive && (
        <div
          id="flight-hud"
          className="absolute inset-0 z-50 cursor-crosshair overflow-hidden"
          onClick={handleFlightClick}
          style={{
            background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
          }}
        >
          {/* Cockpit Frame (CSS shapes) */}
          <div className="absolute bottom-0 left-0 w-1/4 h-full bg-slate-900 origin-bottom-left transform -skew-x-12 opacity-90 border-r-4 border-slate-700"></div>
          <div className="absolute bottom-0 right-0 w-1/4 h-full bg-slate-900 origin-bottom-right transform skew-x-12 opacity-90 border-l-4 border-slate-700"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-slate-800 border-t-8 border-slate-700 flex items-center justify-center">
            <div className="text-green-500 font-mono text-xs mb-20 bg-black p-2 border border-green-500 rounded">
              WEAPON ARMED<br />
              JDAM-84<br />
              READY
            </div>
          </div>

          {/* HUD Graphics (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.8 }}>
            {/* Center Crosshair */}
            <g stroke="#00FF00" strokeWidth="2" fill="none">
              <circle cx="50%" cy="50%" r="20" />
              <line x1="50%" y1="45%" x2="50%" y2="55%" />
              <line x1="45%" y1="50%" x2="55%" y2="50%" />
            </g>

            {/* Artificial Horizon Lines */}
            <g stroke="#00FF00" strokeWidth="1" strokeOpacity="0.5" style={{ transform: `rotate(${-flightData.roll}deg)`, transformOrigin: 'center' }}>
              <line x1="30%" y1="50%" x2="40%" y2="50%" />
              <line x1="60%" y1="50%" x2="70%" y2="50%" />
              <line x1="35%" y1="40%" x2="65%" y2="40%" strokeDasharray="5,5" />
              <line x1="35%" y1="60%" x2="65%" y2="60%" strokeDasharray="5,5" />
            </g>

            {/* Text Stats */}
            <text x="5%" y="40%" fill="#00FF00" fontFamily="monospace" fontSize="14">
              ALT: 45,000 FT
            </text>
            <text x="5%" y="43%" fill="#00FF00" fontFamily="monospace" fontSize="14">
              SPD: MAC 0.85
            </text>
            <text x="5%" y="46%" fill="#00FF00" fontFamily="monospace" fontSize="14">
              G-FORCE: {(1 + Math.abs(flightData.roll) / 10).toFixed(1)}
            </text>

            <text x="85%" y="40%" fill="#00FF00" fontFamily="monospace" fontSize="14">
              TGT: LOCKED
            </text>
            <text x="85%" y="43%" fill="#00FF00" fontFamily="monospace" fontSize="14">
              WPN: JDAM
            </text>
          </svg>

          <div className="absolute top-4 right-4 pointer-events-auto">
            <button onClick={() => setFlightSimActive(false)} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>EJECT / EXIT SIM</button>
          </div>

          {/* Aim Marker */}
          <div className="absolute w-8 h-8 border-2 border-red-500 rounded-full animate-ping pointer-events-none"
            style={{ left: flightData.mouseX - 16, top: flightData.mouseY - 16 }}></div>
        </div>
      )}

      <div className="flex-1 relative flex items-center justify-center bg-black perspective-container">
        <div className="relative shadow-2xl transition-transform duration-75 ease-out"
          style={{
            transform: flightSimActive
              ? `perspective(800px) rotateX(${45 + flightData.pitch}deg) rotateZ(${-flightData.roll}deg) scale(1.4) translate(${shakeX}px, ${shakeY + 100}px)`
              : `translate(${shakeX}px, ${shakeY}px)`
          }}>
          <GameBoard
            gameState={gameState}
            onDrop={handleDropEvent}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            canvasRef={canvasRef}
            customPathPoints={customPathPoints}
          />
        </div>
      </div>

      {/* Tower Sidebar */}
      <div style={{
        width: "320px",
        background: "linear-gradient(to bottom, #111111, #000000)",
        borderLeft: "1px solid #374151",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "system-ui, sans-serif"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px",
          background: "#000000",
          borderBottom: "1px solid #374151",
          gap: "8px",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "#06b6d4", margin: 0 }}>TOWER DEFENSE</h1>
            <span style={{ fontSize: "12px", background: "#7f1d1d", padding: "4px 8px", borderRadius: "4px", color: "#fff" }}>Wave {gameState.wave}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", fontSize: "14px" }}>
            <span style={{ color: "#4ade80" }}>💰 ${gameState.money}</span>
            <span style={{ color: "#f87171" }}>❤️ {gameState.lives}</span>
          </div>
        </div>

        {/* Game Controls */}
        <div style={{
          padding: "12px",
          background: "#111111",
          borderBottom: "1px solid #374151",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <button
            onClick={handleStartWave}
            disabled={gameState.waveActive || gameState.lives <= 0}
            style={{
              width: "100%",
              padding: "8px",
              background: gameState.waveActive || gameState.lives <= 0 ? "#666666" : "#15803d",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: gameState.waveActive || gameState.lives <= 0 ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            Start Wave
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handlePause}
              style={{
                flex: 1,
                padding: "8px",
                background: "#374151",
                color: "#fff",
                border: "1px solid #555555",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              {gameState.status === "paused" ? "Resume" : "Pause"}
            </button>
            <button
              onClick={handleSpeedUp}
              style={{
                flex: 1,
                padding: "8px",
                background: "#374151",
                color: "#fff",
                border: "1px solid #555555",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              2x Speed
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button
              onClick={() => handleSave()}
              style={{
                padding: "8px",
                background: "#374151",
                color: "#fff",
                border: "1px solid #555555",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Save
            </button>
            <button
              onClick={handleLoad}
              style={{
                padding: "8px",
                background: "#374151",
                color: "#fff",
                border: "1px solid #555555",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Load
            </button>
          </div>
        </div>

        {/* Tower List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {Object.entries(TOWERS).map(([towerKey, tower]) => {
            const canAfford = gameState.money >= tower.cost;
            return (
              <div
                key={tower.id}
                draggable
                onDragStart={() => handleDragStart(tower)}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #1f2937",
                  cursor: canAfford ? "move" : "not-allowed",
                  background: canAfford ? "#1e3a8a" : "#374151",
                  color: canAfford ? "#dbeafe" : "#9ca3af",
                  opacity: canAfford ? 1 : 0.5,
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (canAfford) {
                    e.currentTarget.style.background = "#1e40af";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = canAfford ? "#1e3a8a" : "#374151";
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "14px" }}>{tower.name}</div>
                <div style={{ fontSize: "12px", marginTop: "4px", color: canAfford ? "#bfdbfe" : "#9ca3af" }}>
                  💰 {tower.cost} | 🔫 {tower.damage} | 📏 {tower.range}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px",
          background: "#000000",
          borderTop: "1px solid #374151",
          fontSize: "12px",
          color: "#9ca3af",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <div>💡 Drag towers to place</div>
          <button
            onClick={() => handleRestart()}
            style={{
              width: "100%",
              padding: "8px",
              background: "#7f1d1d",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#991b1b")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#7f1d1d")}
          >
            Restart Game
          </button>
        </div>
      </div>

      {/* Radio Coordination UI */}
      {/* <RadioCoordination gameState={gameState} /> */}
    </div>
  );
}
