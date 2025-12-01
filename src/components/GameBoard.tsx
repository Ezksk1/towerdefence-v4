"use client";

import { useRef, useEffect, useCallback } from "react";
import type { GameState, PlacedTower, ActiveEnemy } from "@/lib/types";
import { GAME_CONFIG, LEVELS } from "@/lib/game-config";
import { useToast } from "@/hooks/use-toast";

interface GameBoardProps {
  gameState: GameState;
  onDrop: (gridX: number, gridY: number) => void;
}

// Helper to lighten color
function lightenColor(color:string, percent:number) {
    if (color.startsWith('#')) {
        let num = parseInt(color.slice(1), 16);
        let amt = Math.round(2.55 * percent);
        let R = (num >> 16) + amt;
        let G = ((num >> 8) & 0x00FF) + amt;
        let B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
    }
    return color;
}

// Enhanced Realistic Tower Drawing Function
function drawRealisticTower(ctx: CanvasRenderingContext2D, t: PlacedTower) {
    const x = t.x;
    const y = t.y;
    const color = t.color || '#ccc';
    const type = t.name.toLowerCase();

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 4, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    const gradBase = ctx.createRadialGradient(x - 5, y - 5, 5, x, y, 18);
    gradBase.addColorStop(0, '#666');
    gradBase.addColorStop(0.7, '#444');
    gradBase.addColorStop(1, '#222');
    ctx.fillStyle = gradBase;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#333';
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const bx = x + Math.cos(angle) * 14;
        const by = y + Math.sin(angle) * 14;
        ctx.beginPath();
        ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t.angle || 0);

    if (type.includes('turret')) {
        const gradBody = ctx.createRadialGradient(-3, -3, 2, 0, 0, 12);
        gradBody.addColorStop(0, lightenColor(color, 40));
        gradBody.addColorStop(1, color);
        ctx.fillStyle = gradBody;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#222';
        ctx.fillRect(6, -3, 14, 6);
        ctx.fillStyle = color;
        ctx.fillRect(0, -4, 6, 8);
    } else if (type.includes('ciws') || type.includes('phalanx')) {
        const gradDome = ctx.createRadialGradient(-2, -8, 2, 0, -4, 10);
        gradDome.addColorStop(0, '#fff');
        gradDome.addColorStop(0.5, '#ECEFF1');
        gradDome.addColorStop(1, '#CFD8DC');
        ctx.fillStyle = gradDome;
        ctx.beginPath();
        ctx.moveTo(-9, 10);
        ctx.lineTo(-9, -4);
        ctx.arc(0, -4, 9, Math.PI, 0);
        ctx.lineTo(9, 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#90A4AE';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.fillStyle = '#37474F';
        ctx.fillRect(7, -3, 16, 8);
    } else {
        const gradBody = ctx.createRadialGradient(-3, -3, 2, 0, 0, 12);
        gradBody.addColorStop(0, lightenColor(color, 40));
        gradBody.addColorStop(1, color);
        ctx.fillStyle = gradBody;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#222';
        ctx.fillRect(6, -3, 14, 6);
        ctx.fillStyle = color;
        ctx.fillRect(0, -4, 6, 8);
    }

    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawRealisticEnemy(ctx: CanvasRenderingContext2D, e: ActiveEnemy) {
    const x = e.x;
    const y = e.y;

    ctx.save();
    ctx.translate(x, y);

    if (e.type === 'tank') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-20, -16, 40, 32);
        ctx.fillStyle = '#1b1b1b';
        ctx.fillRect(-20, -16, 40, 8);
        ctx.fillRect(-20, 8, 40, 8);
        ctx.fillStyle = '#333';
        for (let i = -18; i < 18; i += 6) {
            ctx.fillRect(i, -16, 2, 8);
            ctx.fillRect(i, 8, 2, 8);
        }
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(-18, -10, 36, 20);
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(0, -3, 22, 6);
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (e.type === 'humvee') {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(-14, -8, 28, 16);
        ctx.fillStyle = '#81D4FA';
        ctx.fillRect(-6, -6, 12, 12);
        ctx.fillStyle = '#212121';
        ctx.fillRect(-14, -10, 6, 2);
        ctx.fillRect(8, -10, 6, 2);
        ctx.fillRect(-14, 8, 6, 2);
        ctx.fillRect(8, 8, 6, 2);
    } else { // Troop
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(2, -4, 8, 2);
    }

    ctx.restore();

    const hpPct = e.currentHp / e.totalHp;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(e.x - 12, e.y - 24, 24, 6);
    ctx.fillStyle = '#f44336';
    ctx.fillRect(e.x - 11, e.y - 23, 22, 4);
    ctx.fillStyle = '#00E676';
    ctx.fillRect(e.x - 11, e.y - 23, 22 * hpPct, 4);
}


export default function GameBoard({ gameState, onDrop }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.GRID_HEIGHT);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, GAME_CONFIG.GRID_WIDTH, GAME_CONFIG.GRID_HEIGHT);

    ctx.fillStyle = '#B0C4DE';
    ctx.beginPath();
    ctx.moveTo(0, GAME_CONFIG.GRID_HEIGHT * 0.5);
    ctx.lineTo(GAME_CONFIG.GRID_WIDTH * 0.2, GAME_CONFIG.GRID_HEIGHT * 0.3);
    ctx.lineTo(GAME_CONFIG.GRID_WIDTH * 0.4, GAME_CONFIG.GRID_HEIGHT * 0.4);
    ctx.lineTo(GAME_CONFIG.GRID_WIDTH * 0.6, GAME_CONFIG.GRID_HEIGHT * 0.25);
    ctx.lineTo(GAME_CONFIG.GRID_WIDTH * 0.8, GAME_CONFIG.GRID_HEIGHT * 0.35);
    ctx.lineTo(GAME_CONFIG.GRID_WIDTH, GAME_CONFIG.GRID_HEIGHT * 0.45);
    ctx.lineTo(GAME_CONFIG.GRID_WIDTH, GAME_CONFIG.GRID_HEIGHT);
    ctx.lineTo(0, GAME_CONFIG.GRID_HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#F0F8FF';
    ctx.fillRect(0, GAME_CONFIG.GRID_HEIGHT * 0.85, GAME_CONFIG.GRID_WIDTH, GAME_CONFIG.GRID_HEIGHT * 0.15);
  }, []);

  const drawPath = useCallback((ctx: CanvasRenderingContext2D) => {
    const path = LEVELS[gameState.currentLevel - 1].path;
    if (!path || path.length === 0) return;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineWidth = GAME_CONFIG.CELL_WIDTH + 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.moveTo(path[0].x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH/2, path[0].y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT/2);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH/2, path[i].y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT/2);
    }
    ctx.stroke();

    ctx.lineWidth = GAME_CONFIG.CELL_WIDTH - 2;
    ctx.strokeStyle = '#795548';
    ctx.stroke();

    ctx.lineWidth = GAME_CONFIG.CELL_WIDTH - 10;
    ctx.strokeStyle = '#8D6E63';
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [gameState.currentLevel]);

  const drawTowers = useCallback((ctx: CanvasRenderingContext2D) => {
    gameState.towers.forEach(tower => {
      drawRealisticTower(ctx, tower);
    });
  }, [gameState.towers]);

  const drawEnemies = useCallback((ctx: CanvasRenderingContext2D) => {
    gameState.enemies.forEach(enemy => {
      drawRealisticEnemy(ctx, enemy);
    });
  }, [gameState.enemies]);
  
  const drawProjectiles = useCallback((ctx: CanvasRenderingContext2D) => {
    gameState.projectiles.forEach(p => {
        if(!p.active) return;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
  }, [gameState.projectiles]);

  const drawPausedOverlay = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, GAME_CONFIG.GRID_WIDTH, GAME_CONFIG.GRID_HEIGHT);
    ctx.font = "bold 60px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", GAME_CONFIG.GRID_WIDTH / 2, GAME_CONFIG.GRID_HEIGHT / 2);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground(ctx);
    drawPath(ctx);
    drawTowers(ctx);
    drawEnemies(ctx);
    drawProjectiles(ctx);

    if (gameState.status === 'paused') {
      drawPausedOverlay(ctx);
    }
  }, [gameState, drawBackground, drawPath, drawTowers, drawEnemies, drawProjectiles, drawPausedOverlay]);

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const handleDropEvent = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
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

    onDrop(gridX, gridY);
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-card rounded-lg border">
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.GRID_WIDTH}
        height={GAME_CONFIG.GRID_HEIGHT}
        className="rounded-lg"
        onDragOver={handleDragOver}
        onDrop={handleDropEvent}
      />
    </div>
  );
}
