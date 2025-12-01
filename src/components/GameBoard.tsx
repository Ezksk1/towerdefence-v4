"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import type { GameState, PlacedTower, ActiveEnemy, Decoration, Projectile } from "@/lib/types";
import { GAME_CONFIG, LEVELS } from "@/lib/game-config";
import { useToast } from "@/hooks/use-toast";

interface GameBoardProps {
  gameState: GameState;
  onDragOver: (e: React.DragEvent<HTMLCanvasElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLCanvasElement>) => void;
  onDrop: (e: React.DragEvent<HTMLCanvasElement>) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

// Helper to lighten color
function lightenColor(color:string, percent:number) {
    if (color.startsWith('#')) {
        let num = parseInt(color.slice(1), 16);
        let amt = Math.round(2.55 * percent);
        let R = (num >> 16) + amt;
        let G = ((num >> 8) & 0x00FF) + amt;
        let B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
}

// Enhanced Realistic Tower Drawing Function
export function drawRealisticTower(ctx: CanvasRenderingContext2D, t: PlacedTower) {
    const x = t.x;
    const y = t.y;
    const color = t.color || '#ccc';
    const type = t.name.toLowerCase();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 4, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Base platform - consistent for all
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

    // Base bolts
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

    // --- Tower Specific Designs ---
    if (type.includes('lightning spire')) {
        // Large crystal structure
        ctx.fillStyle = lightenColor(color, 20);
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(10, 0);
        ctx.lineTo(-10, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Glowing Core
        const coreGrad = ctx.createRadialGradient(0, -5, 2, 0, -5, 8);
        coreGrad.addColorStop(0, '#fff');
        coreGrad.addColorStop(0.5, color);
        coreGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, -5, 8, 0, Math.PI * 2);
        ctx.fill();

    } else if (type.includes('trooper') || type.includes('commando')) {
        // Sandbag wall
        ctx.fillStyle = '#C2B280';
        ctx.beginPath();
        ctx.arc(0, 0, 14, Math.PI * 0.7, Math.PI * 2.3);
        ctx.fill();
        ctx.fillStyle = '#A49670';
        ctx.fillRect(-10, -1, 8, 2); ctx.fillRect(-12, 1, 8, 2); ctx.fillRect(-12, 3, 10, 2);
        // Rifle
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, -1.5, 20, 3);
        ctx.fillStyle = '#222';
        ctx.fillRect(0, -3.5, 4, 2);
    } else if (type.includes('browning') || type.includes('gatling') || type.includes('minigun')) {
        // Turret body
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        // Barrel
        ctx.fillStyle = '#333';
        ctx.fillRect(6, -2.5, 18, 5);
    } else if (type.includes('sniper') || type.includes('barrett') || type.includes('railgun')) {
        // Sniper nest style
        ctx.fillStyle = '#A49670';
        ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI*2); ctx.fill();
        // Long barrel
        ctx.fillStyle = '#222';
        ctx.fillRect(-2, -2, 25, 4);
        ctx.fillStyle = color;
        ctx.fillRect(23, -3, 5, 6);
    } else if (type.includes('bomber') || type.includes('mortar') || type.includes('artillery') || type.includes('caesar') || type.includes('rocket')) {
        // Artillery-style base
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-10, 8); ctx.lineTo(10, 8); ctx.lineTo(8, -8); ctx.lineTo(-8, -8);
        ctx.closePath();
        ctx.fill();
        // Angled Barrel
        ctx.fillStyle = '#333';
        ctx.save();
        ctx.rotate(-Math.PI / 6);
        ctx.fillRect(0, -4, 25, 8);
        ctx.restore();
    } else if (type.includes('abrams') || type.includes('challenger') || type.includes('leopard') || type.includes('type')) {
         // Tank-like chassis
        ctx.fillStyle = color;
        ctx.fillRect(-14, -12, 28, 24); // Hull
        // Turret
        const gradTurret = ctx.createRadialGradient(-2, -2, 1, 0, 0, 8);
        gradTurret.addColorStop(0, lightenColor(color, 30));
        gradTurret.addColorStop(1, color);
        ctx.fillStyle = gradTurret;
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        // Barrel
        ctx.fillStyle = '#333';
        ctx.fillRect(6, -2.5, 20, 5);
    } else if (type.includes('ciws') || type.includes('phalanx')) {
        // Dome base
        const gradDome = ctx.createRadialGradient(-2, -8, 2, 0, -4, 10);
        gradDome.addColorStop(0, '#fff'); gradDome.addColorStop(0.5, '#ECEFF1'); gradDome.addColorStop(1, '#CFD8DC');
        ctx.fillStyle = gradDome;
        ctx.beginPath();
        ctx.moveTo(-9, 10); ctx.lineTo(-9, -4); ctx.arc(0, -4, 9, Math.PI, 0); ctx.lineTo(9, 10);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = 1; ctx.stroke();
        // Gun box
        ctx.fillStyle = '#37474F';
        ctx.fillRect(7, -4, 16, 8);
    } else if (type.includes('patriot') || type.includes('s-400') || type.includes('iron dome') || type.includes('javelin')) {
        // Missile launcher box
        ctx.fillStyle = lightenColor(color, -20);
        ctx.fillRect(-10, -12, 20, 24);
        ctx.fillStyle = color;
        ctx.fillRect(4, -10, 18, 8); // Top tube
        ctx.fillRect(4, 2, 18, 8);  // Bottom tube
        ctx.fillStyle = 'red';
        ctx.beginPath(); ctx.arc(22, -6, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(22, 6, 2, 0, Math.PI*2); ctx.fill();
    } else if (type.includes('blaster') || type.includes('laser') || type.includes('plasma')) {
        const gradBody = ctx.createRadialGradient(-3, -3, 2, 0, 0, 12);
        gradBody.addColorStop(0, lightenColor(color, 40));
        gradBody.addColorStop(1, color);
        ctx.fillStyle = gradBody;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.moveTo(8, -4); ctx.lineTo(18, -2); ctx.lineTo(18, 2); ctx.lineTo(8, 4);
        ctx.closePath();
        ctx.fill();
    }
     else { // Default Turret
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

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawChristmasHat(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.save();
    ctx.translate(x, y - size * 1.5);

    // Hat body (red cone)
    ctx.fillStyle = '#D32F2F';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size / 2, size);
    ctx.lineTo(size / 2, size);
    ctx.closePath();
    ctx.fill();

    // White brim
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-size / 1.8, size, size * 1.1, size * 0.3);

    // White pom-pom
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawRealisticEnemy(ctx: CanvasRenderingContext2D, e: ActiveEnemy) {
    const x = e.x;
    const y = e.y;
    const scale = 1.2; // 20% bigger

    ctx.save();
    ctx.translate(x, y);

    if (e.type === 'tank' || e.type === 'heavy_tank') {
        const isHeavy = e.type === 'heavy_tank';
        const w = 40 * scale;
        const h = 32 * scale;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.fillStyle = '#1b1b1b';
        ctx.fillRect(-w/2, -h/2, w, h/4);
        ctx.fillRect(-w/2, h/4, w, h/4);
        ctx.fillStyle = '#333';
        for (let i = -w/2 + 2; i < w/2 -2; i += 6 * scale) {
            ctx.fillRect(i, -h/2, 2 * scale, h/4);
            ctx.fillRect(i, h/4, 2 * scale, h/4);
        }
        ctx.fillStyle = isHeavy ? '#2E7D32' : '#388E3C';
        ctx.fillRect(-w/2 + 2, -h/2 + h/4, w - 4, h/2);
        ctx.fillStyle = isHeavy ? '#388E3C' : '#4CAF50';
        ctx.beginPath();
        ctx.arc(0, 0, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(0, -3 * scale, (isHeavy ? 28 : 22) * scale, (isHeavy ? 8 : 6) * scale);
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.arc(0, 0, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
    } else if (e.type === 'humvee') {
        const w = 28 * scale;
        const h = 16 * scale;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.fillStyle = '#81D4FA';
        ctx.fillRect(-w/2 + 8 * scale, -h/2 + 2*scale, 12 * scale, 12 * scale);
        ctx.fillStyle = '#212121';
        ctx.fillRect(-14 * scale, -10 * scale, 6 * scale, 2 * scale);
        ctx.fillRect(8 * scale, -10 * scale, 6 * scale, 2 * scale);
        ctx.fillRect(-14 * scale, 8 * scale, 6 * scale, 2 * scale);
        ctx.fillRect(8 * scale, 8 * scale, 6 * scale, 2 * scale);
    } else if (e.type === 'angry_snowman') {
        // Body
        const r1 = 12 * scale;
        const r2 = 8 * scale;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 5 * scale, r1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -8 * scale, r2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Coal eyes and mouth
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-3 * scale, -10 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3 * scale, -10 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-3 * scale, -5 * scale, 6 * scale, 1 * scale);

    } else if (e.type === 'krampus' || e.type === 'boss') {
        const isBoss = e.type === 'boss';
        const w = (isBoss ? 24 : 20) * scale;
        const h = (isBoss ? 40 : 35) * scale;
        // Body
        ctx.fillStyle = isBoss ? '#880E4F' : '#5D4037';
        ctx.fillRect(-w/2, -h/2, w, h);
        // Head
        ctx.fillStyle = isBoss ? '#C2185B' :'#3E2723';
        ctx.fillRect(-w/2 + 2*scale, -h/2, w-4*scale, 15*scale);
        // Horns
        ctx.fillStyle = isBoss ? '#F8BBD0' : '#E0E0E0';
        ctx.strokeStyle = isBoss ? '#AD1457' : '#9E9E9E';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(-8*scale, -18*scale); ctx.quadraticCurveTo(-15*scale, -25*scale, -12*scale, -30*scale); ctx.stroke();
        ctx.moveTo(8*scale, -18*scale); ctx.quadraticCurveTo(15*scale, -25*scale, 12*scale, -30*scale); ctx.stroke();
        // Red eyes
        ctx.fillStyle = 'red';
        ctx.beginPath(); ctx.arc(-4*scale, -12*scale, 2*scale, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(4*scale, -12*scale, 2*scale, 0, Math.PI * 2); ctx.fill();
    } else if (e.type === 'jet') {
        const w = 40 * scale;
        const h = 16 * scale;
        ctx.fillStyle = '#37474F';
        ctx.beginPath();
        ctx.moveTo(-w/2, 0);
        ctx.lineTo(w/4, -h/2);
        ctx.lineTo(w/2, 0);
        ctx.lineTo(w/4, h/2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(-w/4, -h/4, w/2, h/2);

        ctx.fillStyle = '#1976D2';
        ctx.fillRect(w/4, -h/8, w/8, h/4);

    } else { // Troop, elf, toy soldier
        const w = 12 * scale;
        const h = 7 * scale;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 8*scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = lightenColor(e.color, -20);
        ctx.beginPath();
        ctx.arc(0, 0, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(2*scale, -4*scale, 8*scale, 2*scale);
    }

    ctx.restore();

    // Draw hat on top of everything else for this enemy
    drawChristmasHat(ctx, x, y, e.size.width * 0.4 * scale);

    const hpPct = e.currentHp / e.totalHp;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(e.x - 12 * scale, e.y - 24 * scale, 24 * scale, 6 * scale);
    ctx.fillStyle = '#f44336';
    ctx.fillRect(e.x - 11 * scale, e.y - 23 * scale, 22 * scale, 4 * scale);
    ctx.fillStyle = '#00E676';
    ctx.fillRect(e.x - 11 * scale, e.y - 23 * scale, 22 * scale * hpPct, 4 * scale);
}


export default function GameBoard({ gameState, onDrop, onDragOver, onDragLeave, canvasRef }: GameBoardProps) {

  const snowTextures = useMemo(() => {
    const textures = [];
    const W = GAME_CONFIG.GRID_WIDTH;
    const H = GAME_CONFIG.GRID_HEIGHT;
    for (let i = 0; i < 50; i++) {
        textures.push({
            x: Math.random() * W,
            y: H * 0.65 + Math.random() * (H * 0.35),
            radius: Math.random() * 20 + 5,
        });
    }
    return textures;
  }, []);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const W = GAME_CONFIG.GRID_WIDTH;
    const H = GAME_CONFIG.GRID_HEIGHT;

    // Sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    skyGradient.addColorStop(0, '#0d1a2f');
    skyGradient.addColorStop(0.5, '#234a7c');
    skyGradient.addColorStop(1, '#87CEEB');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, W, H);

    // Far mountains
    ctx.fillStyle = '#394867';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.6);
    ctx.bezierCurveTo(W * 0.1, H * 0.45, W * 0.2, H * 0.55, W * 0.3, H * 0.5);
    ctx.bezierCurveTo(W * 0.4, H * 0.4, W * 0.55, H * 0.5, W * 0.7, H * 0.45);
    ctx.bezierCurveTo(W * 0.8, H * 0.4, W * 0.9, H * 0.55, W, H * 0.5);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Near mountains
    ctx.fillStyle = '#607D8B';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.7);
    ctx.bezierCurveTo(W * 0.2, H * 0.5, W * 0.35, H * 0.65, W * 0.5, H * 0.6);
    ctx.bezierCurveTo(W * 0.6, H * 0.55, W * 0.8, H * 0.7, W, H * 0.65);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Snowy ground layers
    const groundGradient = ctx.createLinearGradient(0, H * 0.6, 0, H);
    groundGradient.addColorStop(0, '#F0F8FF');
    groundGradient.addColorStop(0.3, '#FFFFFF');
    groundGradient.addColorStop(1, '#E0F0FF');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, H * 0.65, W, H * 0.35);

    // Add some subtle texture to snow
    ctx.fillStyle = 'rgba(210, 220, 230, 0.3)';
    snowTextures.forEach(texture => {
        ctx.beginPath();
        ctx.arc(texture.x, texture.y, texture.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}, [snowTextures]);

  const drawDecorations = useCallback((ctx: CanvasRenderingContext2D) => {
    gameState.decorations.forEach(d => {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation || 0);
        const size = d.size || 30;

        if (d.type === 'tree') {
            ctx.fillStyle = '#654321';
            ctx.fillRect(-size * 0.1, 0, size * 0.2, size * 0.3);
            ctx.fillStyle = '#2E7D32';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(0, -size * (0.7 - i * 0.2));
                ctx.lineTo(-size * (0.5 - i * 0.1), 0 - i * size * 0.15);
                ctx.lineTo(size * (0.5 - i * 0.1), 0 - i * size * 0.15);
                ctx.closePath();
                ctx.fill();
            }
        } else if (d.type === 'cane') {
            ctx.lineWidth = size * 0.15;
            for(let i=0; i < 6; i++){
                ctx.strokeStyle = i % 2 === 0 ? '#FFFFFF' : '#D32F2F';
                ctx.beginPath();
                ctx.arc(0, -size*0.2, size*0.2, Math.PI + (i/6)*Math.PI, Math.PI + ((i+1)/6)*Math.PI);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(size*0.2, -size*0.2);
            ctx.lineTo(size*0.2, size*0.3);
            ctx.stroke();
        } else if (d.type === 'ornament') {
            ctx.fillStyle = d.color || '#D32F2F';
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(-size*0.15, -size*0.15, size / 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    });
}, [gameState.decorations]);


  const drawPath = useCallback((ctx: CanvasRenderingContext2D) => {
    const path = LEVELS[gameState.currentLevel - 1].path;
    if (!path || path.length === 0) return;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Make the path wider
    const pathWidth = GAME_CONFIG.CELL_WIDTH * 1.5;

    // Shadow/border layer
    ctx.lineWidth = pathWidth + 8;
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(path[0].x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH/2, path[0].y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT/2);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH/2, path[i].y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT/2);
    }
    ctx.stroke();

    // Main path layer
    ctx.lineWidth = pathWidth;
    ctx.strokeStyle = '#A0522D'; // A dirt/mud color
    ctx.stroke();

    // Texture layer
    ctx.lineWidth = pathWidth - 12;
    ctx.strokeStyle = '#8B4513'; // Darker dirt color
    ctx.setLineDash([15, 15]);
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
        
        if (p.config.chain && p.chainTargets) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.8;

            let lastTarget: ActiveEnemy | {x:number, y:number} = p.target;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(lastTarget.x, lastTarget.y);
            
            p.chainTargets.forEach(chainTarget => {
                ctx.lineTo(chainTarget.x, chainTarget.y);
                lastTarget = chainTarget;
            });
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        } else {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
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
    drawDecorations(ctx);
    drawPath(ctx);
    drawTowers(ctx);
    drawEnemies(ctx);
    drawProjectiles(ctx);

    if (gameState.status === 'paused') {
      drawPausedOverlay(ctx);
    }
  }, [gameState, drawBackground, drawPath, drawTowers, drawEnemies, drawProjectiles, drawPausedOverlay, canvasRef, drawDecorations]);
  
  return (
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.GRID_WIDTH}
        height={GAME_CONFIG.GRID_HEIGHT}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      />
  );
}

    