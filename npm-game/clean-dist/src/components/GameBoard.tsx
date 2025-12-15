"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import type { GameState, PlacedTower, ActiveEnemy, Decoration, Projectile, DIYTower } from "@/lib/types";
import { GAME_CONFIG, LEVELS, rasterizePath, DIY_COMPONENTS } from "@/lib/game-config";
import { useToast } from "@/hooks/use-toast";
import { useScreenDimensions } from "./ResponsiveGameWrapper";

interface GameBoardProps {
  gameState: GameState;
  onDragOver: (e: React.DragEvent<HTMLCanvasElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLCanvasElement>) => void;
  onDrop: (e: React.DragEvent<HTMLCanvasElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  customPathPoints: { x: number, y: number }[];
}

// Helper to lighten color
function lightenColor(color: string, percent: number) {
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

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 4, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Custom Tower Logic ---
  if ('isCustom' in t) {
    const customTower = t as PlacedTower & DIYTower;
    const chassis = DIY_COMPONENTS.chassis.find(c => c.id === customTower.chassis);
    const weapon = DIY_COMPONENTS.weapons.find(w => w.id === customTower.weapon);

    if (chassis) {
      const chassisGrad = ctx.createRadialGradient(x - 5, y - 5, 5, x, y, 18);
      chassisGrad.addColorStop(0, lightenColor(chassis.color, 20));
      chassisGrad.addColorStop(0.7, chassis.color);
      chassisGrad.addColorStop(1, lightenColor(chassis.color, -20));
      ctx.fillStyle = chassisGrad;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t.angle || 0);

    if (weapon) {
      ctx.fillStyle = lightenColor(weapon.color, 10);
      ctx.strokeStyle = weapon.color;
      ctx.lineWidth = 2;

      switch (weapon.id) {
        case 'gun':
          ctx.fillRect(8, -3, 16, 6);
          ctx.strokeRect(8, -3, 16, 6);
          break;
        case 'cannon':
          ctx.fillRect(8, -4, 20, 8);
          ctx.strokeRect(8, -4, 20, 8);
          break;
        case 'laser':
          ctx.beginPath();
          ctx.moveTo(8, -2); ctx.lineTo(25, -4); ctx.lineTo(25, 4); ctx.lineTo(8, 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        case 'railgun_w':
          ctx.fillStyle = '#444';
          ctx.fillRect(4, -3, 22, 6);
          ctx.fillStyle = '#00BCD4'; // Glowing rails
          ctx.fillRect(4, -4, 22, 1);
          ctx.fillRect(4, 3, 22, 1);
          break;
        case 'plasma_w':
          ctx.fillStyle = '#333';
          ctx.beginPath(); ctx.arc(10, 0, 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#9C27B0'; // Plasma core
          ctx.beginPath(); ctx.arc(10, 0, 3, 0, Math.PI * 2); ctx.fill();
          break;
        case 'minigun_w':
          ctx.fillStyle = '#222';
          ctx.fillRect(6, -4, 16, 8);
          ctx.fillStyle = '#555'; // Barrels
          for (let i = -3; i <= 3; i += 2) {
            ctx.fillRect(22, i, 4, 1);
          }
          break;
      }
    }

    ctx.restore();
    return;
  }

  // --- Original Tower Logic ---
  const type = t.id.toLowerCase(); // Use ID instead of name for reliable checks
  if (!type) return;

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

  } else if (type.includes('trooper') || type.includes('commando') || type.includes('sniper') || type.includes('javelin')) {
    // Enhanced Realistic Top-Down Soldier
    const isSniper = type.includes('sniper');
    const isJavelin = type.includes('javelin');
    const isCommando = type.includes('commando');
    const rotation = t.angle || 0;

    // Scale up the soldier for better visibility
    const soldierScale = 1.5;

    // 1. Draw Static Body (Non-rotating torso and head)
    ctx.save();
    ctx.rotate(-rotation);

    // Tactical Vest/Body Armor (Larger, more detailed)
    ctx.fillStyle = isCommando ? '#1B5E20' : '#3E2723';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;

    // Main torso (rectangular with rounded edges)
    ctx.beginPath();
    ctx.roundRect(-8 * soldierScale, -6 * soldierScale, 16 * soldierScale, 12 * soldierScale, 2);
    ctx.fill();
    ctx.stroke();

    // Vest pouches/details
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-6 * soldierScale, -4 * soldierScale, 5 * soldierScale, 3 * soldierScale);
    ctx.fillRect(1 * soldierScale, -4 * soldierScale, 5 * soldierScale, 3 * soldierScale);

    // Helmet (Larger and more detailed)
    ctx.fillStyle = isCommando ? '#2E7D32' : '#4E342E';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;

    // Helmet main shape
    ctx.beginPath();
    ctx.ellipse(0, -10 * soldierScale, 7 * soldierScale, 6 * soldierScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helmet visor/NVG mount
    ctx.fillStyle = '#222';
    ctx.fillRect(-3 * soldierScale, -12 * soldierScale, 6 * soldierScale, 2 * soldierScale);

    // Face/Goggles
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.ellipse(-2 * soldierScale, -9 * soldierScale, 1.5 * soldierScale, 1.5 * soldierScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(2 * soldierScale, -9 * soldierScale, 1.5 * soldierScale, 1.5 * soldierScale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Restore for weapon rotation

    // 2. Draw Rotating Arms + Weapon
    ctx.fillStyle = isCommando ? '#1B5E20' : '#3E2723';

    // Right arm (trigger hand)
    ctx.beginPath();
    ctx.ellipse(10 * soldierScale, 5 * soldierScale, 3 * soldierScale, 7 * soldierScale, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left arm (support hand)
    ctx.beginPath();
    ctx.ellipse(10 * soldierScale, -5 * soldierScale, 3 * soldierScale, 7 * soldierScale, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Weapon (Enhanced detail)
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    if (isJavelin) {
      // Javelin launcher tube
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(2 * soldierScale, -4 * soldierScale, 28 * soldierScale, 8 * soldierScale);
      ctx.strokeRect(2 * soldierScale, -4 * soldierScale, 28 * soldierScale, 8 * soldierScale);

      // Sight/Optic
      ctx.fillStyle = '#333';
      ctx.fillRect(8 * soldierScale, -6 * soldierScale, 6 * soldierScale, 3 * soldierScale);

      // Missile tip visible
      ctx.fillStyle = '#C62828';
      ctx.beginPath();
      ctx.moveTo(30 * soldierScale, 0);
      ctx.lineTo(35 * soldierScale, -2 * soldierScale);
      ctx.lineTo(35 * soldierScale, 2 * soldierScale);
      ctx.fill();

    } else if (isSniper) {
      // Sniper rifle with long barrel
      ctx.fillStyle = '#111';
      ctx.fillRect(6 * soldierScale, -1.5 * soldierScale, 32 * soldierScale, 3 * soldierScale);
      ctx.strokeRect(6 * soldierScale, -1.5 * soldierScale, 32 * soldierScale, 3 * soldierScale);

      // Stock
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(0, -2 * soldierScale, 10 * soldierScale, 4 * soldierScale);

      // Scope (detailed)
      ctx.fillStyle = '#000';
      ctx.fillRect(12 * soldierScale, -4 * soldierScale, 10 * soldierScale, 2 * soldierScale);
      ctx.fillStyle = '#1E88E5';
      ctx.fillRect(13 * soldierScale, -3.5 * soldierScale, 2 * soldierScale, 1 * soldierScale);

      // Bipod
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(28 * soldierScale, 1.5 * soldierScale);
      ctx.lineTo(28 * soldierScale, 6 * soldierScale);
      ctx.stroke();

    } else {
      // M4/AR-15 style rifle
      ctx.fillStyle = '#111';

      // Receiver
      ctx.fillRect(6 * soldierScale, -2 * soldierScale, 18 * soldierScale, 4 * soldierScale);
      ctx.strokeRect(6 * soldierScale, -2 * soldierScale, 18 * soldierScale, 4 * soldierScale);

      // Barrel
      ctx.fillRect(24 * soldierScale, -1.5 * soldierScale, 8 * soldierScale, 3 * soldierScale);

      // Stock
      ctx.fillStyle = '#333';
      ctx.fillRect(0, -1.5 * soldierScale, 8 * soldierScale, 3 * soldierScale);

      // Magazine
      ctx.fillStyle = '#222';
      ctx.fillRect(12 * soldierScale, 2 * soldierScale, 4 * soldierScale, 6 * soldierScale);

      // Foregrip
      ctx.fillRect(18 * soldierScale, 2 * soldierScale, 3 * soldierScale, 4 * soldierScale);

      // Red dot sight
      ctx.fillStyle = '#C62828';
      ctx.beginPath();
      ctx.arc(16 * soldierScale, -3 * soldierScale, 1.5 * soldierScale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hands (more detailed)
    ctx.fillStyle = '#D7CCC8';
    ctx.strokeStyle = '#A1887F';
    ctx.lineWidth = 0.5;

    // Trigger hand
    ctx.beginPath();
    ctx.arc(12 * soldierScale, 3 * soldierScale, 2.5 * soldierScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Support hand
    ctx.beginPath();
    ctx.arc(20 * soldierScale, 0, 2.5 * soldierScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Radio Indicator (If calling airstrike)
    if (t.lastAirstrike && t.lastAirstrike > 0) {
      ctx.restore();
      ctx.save();
      ctx.translate(0, -20 * soldierScale);

      const blink = Math.floor(Date.now() / 500) % 2 === 0;

      // Radio antenna
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -5);
      ctx.stroke();

      // Radio signal
      ctx.fillStyle = blink ? '#00E676' : '#66BB6A';
      ctx.beginPath();
      ctx.arc(0, -5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Signal waves
      ctx.strokeStyle = blink ? '#00E676' : 'rgba(0,230,118,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -5, 5, -Math.PI / 3, -2 * Math.PI / 3, true);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -5, 8, -Math.PI / 3, -2 * Math.PI / 3, true);
      ctx.stroke();

      ctx.restore();
      ctx.save();
    }


  } else if (type.includes('warthog')) {
    // Warehouse / Forward Air Controller Post
    ctx.fillStyle = '#78909c'; // Blue-grey metallic
    ctx.fillRect(-14, -10, 28, 20); // Main building

    // Roof details
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(-14, -10, 28, 4); // Roof trim

    // Antenna / Radar Dish
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, -10); ctx.lineTo(8, -18); // Antenna pole
    ctx.stroke();

    // Dish
    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.arc(8, -18, 5, Math.PI, 0); // Semi-circle dish
    ctx.fill();

  } else if (type.includes('f16') || type.includes('f15')) {
    // Standard Airbase / Hangar WITH ATC
    ctx.fillStyle = '#546E7A'; // Blue-grey hangar
    ctx.fillRect(-18, -10, 24, 20); // Hangar building
    ctx.fillStyle = '#37474F'; // Door
    ctx.fillRect(-18, -6, 4, 12);

    // Attached ATC Tower (Taller and more detailed)
    ctx.fillStyle = '#455A64';
    ctx.fillRect(8, -18, 10, 24); // Tower base
    ctx.fillStyle = '#81D4FA'; // Glass control room
    ctx.fillRect(7, -20, 12, 8);

    // Radar Dish on top
    ctx.save();
    ctx.translate(13, -24);
    ctx.rotate((Date.now() / 1000) % (Math.PI * 2)); // Rotating radar
    ctx.strokeStyle = '#CFD8DC';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, 6);
    ctx.stroke();
    ctx.restore();

    // Runway extending from hangar
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(6, -4, 40, 8); // Main runway

    // Runway markings
    ctx.strokeStyle = '#ECF0F1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(46, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Runway edge lights
    for (let i = 10; i < 46; i += 8) {
      ctx.fillStyle = i % 16 === 2 ? '#FFD700' : '#fff';
      ctx.fillRect(i, -5, 2, 1);
      ctx.fillRect(i, 4, 2, 1);
    }

    // Aircraft Type Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    const aircraftType = type.includes('f16') ? 'F-16' : 'F-15';
    ctx.fillText(aircraftType, -6, -14);

    // Status Display
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);

    let statusText = '';
    let statusColor = '#00FF00';

    const rate = t.rate || 100; // Default rate if undefined
    if (t.cooldown > rate * 1.5) {
      statusText = 'LOADING';
      statusColor = '#FFA500';
    } else if (t.cooldown > rate * 0.7) {
      statusText = 'BOARDING';
      statusColor = '#FFFF00';
    } else if (t.cooldown > rate * 0.3) {
      statusText = 'TAXIING';
      statusColor = '#00BFFF';
    } else if (t.cooldown > 0) {
      statusText = 'READY';
      statusColor = '#00FF00';
    } else {
      statusText = 'STANDBY';
      statusColor = '#00FF00';
    }

    ctx.fillStyle = statusColor;
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(statusText, 0, 18);

  } else if (type.includes('f35') || type.includes('f22')) {
    // Advanced Stealth Hangar WITH ATC
    ctx.fillStyle = '#263238'; // Dark metallic
    ctx.beginPath();
    ctx.moveTo(-15, -12); ctx.lineTo(5, -12); ctx.lineTo(15, 0); ctx.lineTo(5, 12); ctx.lineTo(-15, 12);
    ctx.fill();

    // High-tech ATC Integration (Taller)
    ctx.fillStyle = '#37474F';
    ctx.fillRect(8, -16, 8, 16);
    ctx.fillStyle = '#00BCD4'; // Neon control windows
    ctx.fillRect(8, -16, 8, 3);

    // Radar array
    ctx.save();
    ctx.translate(12, -20);
    ctx.rotate((Date.now() / 800) % (Math.PI * 2));
    ctx.strokeStyle = '#00BCD4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // High-tech details
    ctx.fillStyle = '#00BCD4'; // Blue neon accent
    ctx.fillRect(-10, -2, 12, 4);

    // Stealth Runway (Darker, more tactical)
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(15, -6, 35, 12);

    // Neon Runway lights
    ctx.strokeStyle = '#00BCD4';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(50, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Edge lights (blue for stealth)
    for (let i = 18; i < 50; i += 8) {
      ctx.fillStyle = '#00BCD4';
      ctx.fillRect(i, -7, 2, 1);
      ctx.fillRect(i, 6, 2, 1);
    }

    // Aircraft Type Label
    ctx.fillStyle = '#00BCD4';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    const stealthType = type.includes('f22') ? 'F-22' : 'F-35';
    ctx.fillText(stealthType, -5, -16);

    // Status Display
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);

    let statusText = '';
    let statusColor = '#00FF00';

    const rate = t.rate || 100; // Default rate if undefined
    if (t.cooldown > rate * 1.5) {
      statusText = 'ARMING';
      statusColor = '#FF4500';
    } else if (t.cooldown > rate * 0.7) {
      statusText = 'PREFLIGHT';
      statusColor = '#FFA500';
    } else if (t.cooldown > rate * 0.3) {
      statusText = 'TAXI';
      statusColor = '#00BFFF';
    } else if (t.cooldown > 0) {
      statusText = 'READY';
      statusColor = '#00FF00';
    } else {
      statusText = 'ARMED';
      statusColor = '#00FF00';
    }

    ctx.fillStyle = statusColor;
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(statusText, 0, 18);

  } else if (type.includes('b21') || type.includes('raider')) {
    // Top Secret Flight Sim Hangar
    ctx.fillStyle = '#111';
    ctx.fillRect(-22, -14, 44, 28);

    // Red Alert Lighting
    ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.shadowColor = '#f00';
    ctx.shadowBlur = 10;
    ctx.fillRect(-20, -2, 40, 4); // Glowing strip
    ctx.shadowBlur = 0;

    // "sim" label or cockpit glass hint
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(0, -14); ctx.lineTo(10, 0); ctx.lineTo(0, 14); ctx.lineTo(-10, 0);
    ctx.fill();

  } else if (type.includes('sr71') || type.includes('atc')) {
    // Air Traffic Control (ATC) Tower
    ctx.fillStyle = '#90A4AE';
    ctx.fillRect(-6, -15, 12, 30); // Tower shaft

    // Control Room (Glass)
    ctx.fillStyle = '#81D4FA';
    ctx.beginPath();
    ctx.arc(0, -15, 10, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Radar on top
    ctx.save();
    ctx.translate(0, -28);
    ctx.rotate((Date.now() / 500) % (Math.PI * 2)); // Auto-rotate radar
    ctx.fillStyle = '#CFD8DC';
    ctx.fillRect(-8, -2, 16, 4); // Radar dish
    ctx.restore();

  } else if (type.includes('mq9') || type.includes('global_hawk')) {
    // Drone Ground Control Station
    ctx.fillStyle = type.includes('global_hawk') ? '#ECEFF1' : '#546E7A';
    ctx.fillRect(-15, -10, 30, 20); // Trailer/Container

    // Antenna Array
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -10); ctx.lineTo(-10, -20); // Antenna 1
    ctx.moveTo(10, -10); ctx.lineTo(10, -20); // Antenna 2
    ctx.stroke();

    // Dish
    ctx.fillStyle = '#90A4AE';
    ctx.beginPath(); ctx.arc(0, -15, 6, 0, Math.PI, true); ctx.fill();

  } else if (type.includes('switchblade')) {
    // Loitering Munition Launcher (Tube Box)
    ctx.fillStyle = '#455A64';
    ctx.fillRect(-12, -12, 24, 24);

    // Launch Tubes
    ctx.fillStyle = '#263238';
    ctx.beginPath(); ctx.arc(-6, -6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-6, 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, 6, 4, 0, Math.PI * 2); ctx.fill();

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
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
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
    ctx.beginPath(); ctx.arc(22, -6, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(22, 6, 2, 0, Math.PI * 2); ctx.fill();
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

    // --- CHRISTMAS TOWER VISUALS ---
  } else if (type.includes('gingerbread')) {
    // Gingerbread House (Barracks)
    const sz = 16;
    ctx.fillStyle = '#795548'; // Gingerbread
    ctx.fillRect(-sz, -sz, sz * 2, sz * 2);
    // Icing Roof
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-sz - 2, -sz); ctx.lineTo(0, -sz * 1.8); ctx.lineTo(sz + 2, -sz);
    ctx.lineTo(sz + 2, -sz + 4); ctx.lineTo(0, -sz * 1.8 + 4); ctx.lineTo(-sz - 2, -sz + 4);
    ctx.fill();
    // Gumdrops
    ['#F44336', '#4CAF50', '#2196F3'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(-10 + i * 10, sz - 4, 3, 0, Math.PI, true); ctx.fill();
    });
  } else if (type.includes('snowball')) {
    // Snowman Turret
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 8, 10, 0, Math.PI * 2); ctx.fill(); // Bottom
    ctx.beginPath(); ctx.arc(0, -2, 8, 0, Math.PI * 2); ctx.fill(); // Middle
    ctx.beginPath(); ctx.arc(0, -10, 6, 0, Math.PI * 2); ctx.fill(); // Head
    // Hat
    ctx.fillStyle = '#222';
    ctx.fillRect(-6, -16, 12, 6);
    ctx.fillRect(-8, -10, 16, 2);
    // Nose
    ctx.fillStyle = 'orange';
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(8, -8); ctx.lineTo(0, -6); ctx.fill();
  } else if (type.includes('candy_cannon')) {
    // Candy Cane Cannon
    ctx.fillStyle = '#D32F2F'; // Red frame
    ctx.fillRect(-10, -8, 20, 16);
    // Striped Barrel
    ctx.rotate(0);
    const barrelL = 24;
    const barrelW = 8;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, -barrelW / 2, barrelL, barrelW);
    ctx.fillStyle = '#F44336';
    for (let i = 0; i < barrelL; i += 6) {
      ctx.fillRect(i, -barrelW / 2, 3, barrelW);
    }
  } else if (type.includes('elf_sniper')) {
    // Elf Sniper
    ctx.fillStyle = '#4CAF50'; // Green coat
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    // Hat
    ctx.fillStyle = '#F44336';
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(-6, 6); ctx.lineTo(6, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -4, 2, 0, Math.PI * 2); ctx.fill();
    // Rifle
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(4, -2, 22, 4);
    // Bow
    ctx.fillStyle = 'gold';
    ctx.fillRect(10, -4, 2, 8);
  } else if (type.includes('north_pole_tesla')) {
    // Festive Tesla
    ctx.fillStyle = '#B71C1C';
    ctx.fillRect(-4, -15, 8, 30);
    // Spiral
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = -15; i < 15; i += 4) {
      ctx.moveTo(-4, i); ctx.lineTo(4, i + 2);
    }
    ctx.stroke();
    // Glowing Orb
    const time = Date.now() / 200;
    const pulse = Math.sin(time) * 3 + 8;
    ctx.fillStyle = '#00E676';
    ctx.beginPath(); ctx.arc(0, -20, pulse, 0, Math.PI * 2); ctx.fill();
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

export function drawRealisticEnemy(ctx: CanvasRenderingContext2D, e: ActiveEnemy) {
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
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(-w / 2, -h / 2, w, h / 4);
    ctx.fillRect(-w / 2, h / 4, w, h / 4);
    ctx.fillStyle = '#333';
    for (let i = -w / 2 + 2; i < w / 2 - 2; i += 6 * scale) {
      ctx.fillRect(i, -h / 2, 2 * scale, h / 4);
      ctx.fillRect(i, h / 4, 2 * scale, h / 4);
    }
    ctx.fillStyle = isHeavy ? '#2E7D32' : '#388E3C';
    ctx.fillRect(-w / 2 + 2, -h / 2 + h / 4, w - 4, h / 2);
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
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(-w / 2 + 8 * scale, -h / 2 + 2 * scale, 12 * scale, 12 * scale);
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

  } else if (e.type === 'krampus' || e.type === 'boss' || e.type === 'mega_boss') {
    const isBoss = e.type === 'boss';
    const isMega = e.type === 'mega_boss';
    let s = scale;
    if (isBoss) s *= 1.2;
    if (isMega) s *= 1.5;

    const w = (isBoss ? 24 : 20) * s;
    const h = (isBoss ? 40 : 35) * s;
    // Body
    ctx.fillStyle = isMega ? '#4A148C' : isBoss ? '#880E4F' : '#5D4037';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    // Head
    ctx.fillStyle = isMega ? '#6A1B9A' : isBoss ? '#C2185B' : '#3E2723';
    ctx.fillRect(-w / 2 + 2 * s, -h / 2, w - 4 * s, 15 * s);
    // Horns
    ctx.fillStyle = isMega ? '#E1BEE7' : isBoss ? '#F8BBD0' : '#E0E0E0';
    ctx.strokeStyle = isMega ? '#9C27B0' : isBoss ? '#AD1457' : '#9E9E9E';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(-8 * s, -18 * s); ctx.quadraticCurveTo(-15 * s, -25 * s, -12 * s, -30 * s); ctx.stroke();
    ctx.moveTo(8 * s, -18 * s); ctx.quadraticCurveTo(15 * s, -25 * s, 12 * s, -30 * s); ctx.stroke();
    // Red eyes
    ctx.fillStyle = isMega ? '#FFEB3B' : 'red';
    ctx.beginPath(); ctx.arc(-4 * s, -12 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4 * s, -12 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
  } else if (e.type === 'jet' || e.type === 'stealth_bomber' || e.type === 'attack_heli' || e.type === 'zeppelin' || e.type === 'drone_swarm' || e.type === 'mothership') {
    const isStealth = e.type === 'stealth_bomber';
    const isHeli = e.type === 'attack_heli';
    const isZeppelin = e.type === 'zeppelin';
    const isDrone = e.type === 'drone_swarm';
    const isMothership = e.type === 'mothership';

    if (isMothership) {
      // Huge Mothership
      const w = 100 * scale;
      ctx.fillStyle = '#311B92';
      ctx.beginPath(); ctx.arc(0, 0, w / 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#673AB7'; ctx.lineWidth = 3; ctx.stroke();
      // Lights
      const time = Date.now() / 200;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time;
        ctx.fillStyle = i % 2 === 0 ? '#00E676' : '#FF1744';
        ctx.beginPath(); ctx.arc(Math.cos(angle) * w / 2.5, Math.sin(angle) * w / 2.5, 4, 0, Math.PI * 2); ctx.fill();
      }
    } else if (isZeppelin) {
      // Zeppelin
      ctx.fillStyle = '#3E2723';
      ctx.beginPath(); ctx.ellipse(0, 0, 50 * scale, 20 * scale, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(-20 * scale, 10 * scale, 40 * scale, 6 * scale); // Gondola
    } else if (isHeli) {
      // Helicopter
      ctx.fillStyle = '#4E342E';
      ctx.beginPath(); ctx.ellipse(0, 0, 15 * scale, 8 * scale, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-20 * scale, -2 * scale, 25 * scale, 4 * scale); // Tail
      // Rotor
      ctx.strokeStyle = 'rgba(20,20,20,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 30 * scale, 0, Math.PI * 2); ctx.stroke();
    } else if (isDrone) {
      // Drone Swarm (draw 3 small drones)
      ctx.fillStyle = '#FF5252';
      const positions = [{ x: -5, y: -5 }, { x: 5, y: -5 }, { x: 0, y: 5 }];
      positions.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x * scale, p.y * scale, 3 * scale, 0, Math.PI * 2); ctx.fill();
      });
    } else {
      // Jet / Bomber
      const w = (isStealth ? 45 : 40) * scale;
      const h = (isStealth ? 18 : 16) * scale;
      ctx.fillStyle = isStealth ? '#212121' : '#37474F';
      ctx.beginPath();
      if (isStealth) {
        ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 4, -h / 2); ctx.lineTo(w / 2, 0); ctx.lineTo(-w / 4, h / 2);
      } else {
        ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 4, -h / 2); ctx.lineTo(w / 2, 0); ctx.lineTo(w / 4, h / 2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = isStealth ? '#FF5252' : '#B0BEC5';
      ctx.fillRect(-w / 8, -h / 4, w / 4, h / 2);
    }

  } else if (e.type === 'mech_walker' || e.type === 'ice_golem' || e.type === 'frost_giant' || e.type === 'yeti' || e.type === 'snow_leopard') {
    // Walkers & Monsters
    const isMech = e.type === 'mech_walker';
    const isYeti = e.type === 'yeti';
    const isLeopard = e.type === 'snow_leopard';

    if (isMech) {
      ctx.fillStyle = '#263238';
      ctx.fillRect(-10 * scale, -10 * scale, 20 * scale, 20 * scale); // Body
      ctx.fillStyle = '#00BCD4'; // Cockpit
      ctx.fillRect(-5 * scale, -5 * scale, 10 * scale, 5 * scale);
      // Legs (simple hint)
      ctx.fillStyle = '#37474F';
      ctx.fillRect(-12 * scale, 0, 4 * scale, 12 * scale);
      ctx.fillRect(8 * scale, 0, 4 * scale, 12 * scale);
    } else if (isLeopard) {
      ctx.fillStyle = '#EEEEEE';
      ctx.beginPath(); ctx.ellipse(0, 0, 15 * scale, 6 * scale, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(10 * scale, -2 * scale, 5 * scale, 0, Math.PI * 2); ctx.fill(); // Head
    } else {
      // Yeti / Golem / Giant
      const sz = e.size.width * 0.8;
      ctx.fillStyle = e.color;
      ctx.beginPath(); ctx.arc(0, -5 * scale, sz / 2, 0, Math.PI * 2); ctx.fill(); // Head/Body blob
      // Arms
      ctx.fillRect(-sz, -sz / 2, sz * 2, sz / 2);
    }

  } else if (['apc', 'mobile_sam', 'supply_truck', 'hover_tank', 'plasma_tank', 'railgun_tank'].includes(e.type)) {
    // Advanced Vehicles
    const w = e.size.width * scale;
    const h = e.size.height * scale;
    ctx.fillStyle = e.color;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // Detail
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    if (e.type === 'hover_tank') {
      ctx.beginPath(); ctx.ellipse(0, 0, w / 1.8, h / 1.8, 0, 0, Math.PI * 2); ctx.fill();
    } else if (e.type === 'plasma_tank') {
      ctx.fillStyle = '#7E57C2';
      ctx.beginPath(); ctx.arc(0, 0, 8 * scale, 0, Math.PI * 2); ctx.fill();
    } else if (e.type === 'railgun_tank') {
      ctx.fillStyle = '#009688';
      ctx.fillRect(0, -2 * scale, 20 * scale, 4 * scale);
    } else if (e.type === 'mobile_sam') {
      ctx.fillStyle = '#333';
      ctx.fillRect(-5 * scale, -8 * scale, 10 * scale, 16 * scale); // Launcher box
    }

  } else if (['commando_troop', 'sniper_troop', 'cyborg_soldier', 'exo_suit', 'stealth_operative'].includes(e.type)) {
    // Specialized Troops
    const isCyborg = e.type === 'cyborg_soldier';
    const isExo = e.type === 'exo_suit';
    const w = 12 * scale;

    ctx.fillStyle = e.color;
    ctx.beginPath(); ctx.arc(0, 0, w / 2, 0, Math.PI * 2); ctx.fill();

    if (isCyborg) {
      ctx.fillStyle = 'red'; ctx.fillRect(-2 * scale, -1 * scale, 4 * scale, 2 * scale); // Eye
    } else if (isExo) {
      ctx.strokeStyle = '#455A64'; ctx.lineWidth = 2; ctx.stroke();
    }
  } else { // Default Fallback (for troops/elves)
    const w = 12 * scale;
    const h = 7 * scale;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, 8 * scale, 0, Math.PI * 2);
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
    ctx.fillRect(2 * scale, -4 * scale, 8 * scale, 2 * scale);
  }

  ctx.restore();

  // Draw hat on top of everything else for this enemy
  if (e.type !== 'mega_boss') {
    drawChristmasHat(ctx, x, y, e.size.width * 0.4 * scale);
  }

  const hpPct = e.currentHp / e.totalHp;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(e.x - 12 * scale, e.y - 24 * scale, 24 * scale, 6 * scale);
  ctx.fillStyle = '#f44336';
  ctx.fillRect(e.x - 11 * scale, e.y - 23 * scale, 22 * scale, 4 * scale);
  ctx.fillStyle = '#00E676';
  ctx.fillRect(e.x - 11 * scale, e.y - 23 * scale, 22 * scale * hpPct, 4 * scale);
}


export default function GameBoard({
  gameState,
  onDrop,
  onDragOver,
  onDragLeave,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  canvasRef,
  customPathPoints
}: GameBoardProps) {

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

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
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
      ctx.arc(texture.x * (W / GAME_CONFIG.GRID_WIDTH), texture.y * (H / GAME_CONFIG.GRID_HEIGHT), texture.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [snowTextures]);

  // Falling Snow Logic
  const snowParticles = useRef<{ x: number, y: number, speed: number, size: number }[]>([]);

  // Initialize snow particles
  useEffect(() => {
    const W = GAME_CONFIG.GRID_WIDTH;
    const H = GAME_CONFIG.GRID_HEIGHT;
    if (snowParticles.current.length === 0) {
      for (let i = 0; i < 100; i++) {
        snowParticles.current.push({
          x: Math.random() * W,
          y: Math.random() * H,
          speed: Math.random() * 2 + 1,
          size: Math.random() * 2 + 1
        });
      }
    }
  }, []);

  const drawFallingSnow = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    snowParticles.current.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Update position
      p.y += p.speed;
      p.x += Math.sin(p.y * 0.05) * 0.5; // Slight sway

      // Reset if out of bounds
      if (p.y > H) {
        p.y = -5;
        p.x = Math.random() * W;
      }
    });
  }, []);

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
        // Baubles
        ctx.fillStyle = '#F44336'; ctx.beginPath(); ctx.arc(-size * 0.2, -size * 0.3, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(size * 0.1, -size * 0.5, 2, 0, Math.PI * 2); ctx.fill();

      } else if (d.type === 'cane') {
        ctx.lineWidth = size * 0.15;
        for (let i = 0; i < 6; i++) {
          ctx.strokeStyle = i % 2 === 0 ? '#FFFFFF' : '#D32F2F';
          ctx.beginPath();
          ctx.arc(0, -size * 0.2, size * 0.2, Math.PI + (i / 6) * Math.PI, Math.PI + ((i + 1) / 6) * Math.PI);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(size * 0.2, -size * 0.2);
        ctx.lineTo(size * 0.2, size * 0.3);
        ctx.stroke();
      } else if (d.type === 'ornament') {
        ctx.fillStyle = d.color || '#D32F2F';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(-size * 0.15, -size * 0.15, size / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.type === 'present') {
        ctx.fillStyle = d.color || '#D32F2F';
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-size / 2, -size / 10, size, size / 5); // Horizontal ribbon
        ctx.fillRect(-size / 10, -size / 2, size / 5, size); // Vertical ribbon
      } else if (d.type === 'snowman') {
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(0, size * 0.2, size * 0.4, 0, Math.PI * 2); ctx.fill(); // Bottom
        ctx.beginPath(); ctx.arc(0, -size * 0.4, size * 0.25, 0, Math.PI * 2); ctx.fill(); // Top
        // Hat
        ctx.fillStyle = '#333';
        ctx.fillRect(-size * 0.25, -size * 0.65, size * 0.5, size * 0.05); // Brim
        ctx.fillRect(-size * 0.15, -size * 0.9, size * 0.3, size * 0.25); // Top hat
        // Nose
        ctx.fillStyle = 'orange';
        ctx.beginPath(); ctx.moveTo(0, -size * 0.4); ctx.lineTo(size * 0.2, -size * 0.35); ctx.lineTo(0, -size * 0.3); ctx.fill();
      }

      ctx.restore();
    });
  }, [gameState.decorations]);

  const drawPath = useCallback((ctx: CanvasRenderingContext2D) => {
    let path;
    if (gameState.currentLevel === 5 && customPathPoints.length > 1) {
      path = rasterizePath(customPathPoints);
    } else {
      const levelData = LEVELS.find(l => l.level === gameState.currentLevel);
      if (levelData) {
        path = levelData.path;
      }
    }

    if (!path || path.length === 0) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Make the path wider
    const pathWidth = GAME_CONFIG.CELL_WIDTH * 1.5;

    // Shadow/border layer
    ctx.lineWidth = pathWidth + 8;
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(path[0].x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH / 2, path[0].y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT / 2);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH / 2, path[i].y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT / 2);
    }
    ctx.stroke();

    // Main path layer
    ctx.lineWidth = pathWidth;
    ctx.strokeStyle = '#E0E0E0'; // Icy path
    ctx.stroke();

    // Texture layer
    ctx.lineWidth = pathWidth - 12;
    ctx.strokeStyle = '#B3E5FC'; // Blueish ice
    ctx.setLineDash([15, 15]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [gameState.currentLevel, customPathPoints]);

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

  const drawExplosions = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!gameState.explosions) return;
    gameState.explosions.forEach(e => {
      ctx.save();
      ctx.globalAlpha = e.life;
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();

      // Shockwave ring
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }, [gameState.explosions]);

  const drawProjectiles = useCallback((ctx: CanvasRenderingContext2D) => {
    gameState.projectiles.forEach(p => {
      if (!p.active) return;

      if (p.config.chain && p.chainTargets) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;

        let lastTarget: ActiveEnemy | { x: number, y: number } = p.target;
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
        ctx.save();
        ctx.translate(p.x, p.y);

        // Calculate rotation towards target
        const angle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
        ctx.rotate(angle);

        // Check for Jet Types first
        const towerType = p.config.type || '';
        if (towerType.includes('jet_fighter')) { // F-16, F-15
          // Draw F-16/F-15 Jet Projectile
          ctx.fillStyle = '#90A4AE';
          ctx.beginPath();
          ctx.moveTo(10, 0); ctx.lineTo(-6, -6); ctx.lineTo(-6, 6); ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#CFD8DC';
          ctx.beginPath(); ctx.ellipse(2, 0, 2, 1, 0, 0, Math.PI * 2); ctx.fill();
        } else if (towerType.includes('stealth_jet')) { // F-35, F-22
          // Draw Stealth Jet Projectile
          ctx.fillStyle = '#263238';
          ctx.beginPath();
          ctx.moveTo(10, 0); ctx.lineTo(-6, -8); ctx.lineTo(-4, 0); ctx.lineTo(-6, 8); ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#00BCD4'; // Engine glow
          ctx.beginPath(); ctx.arc(-6, 0, 1, 0, Math.PI * 2); ctx.fill();
        } else if (towerType.includes('bomber_jet')) { // B-2
          // Draw B-2 Projectile
          ctx.fillStyle = '#212121';
          ctx.beginPath();
          ctx.moveTo(8, 0); ctx.lineTo(-6, -10); ctx.lineTo(-2, 0); ctx.lineTo(-6, 10); ctx.closePath();
          ctx.fill();
        } else if (towerType.includes('drone')) {
          // Drone Projectile (MQ-9, Global Hawk)
          ctx.fillStyle = towerType.includes('support') ? '#ECEFF1' : '#78909C';
          // Fuselage
          ctx.fillRect(-6, -1.5, 12, 3);
          // Wings (Straight)
          ctx.fillRect(-2, -8, 4, 16);
          // V-Tail
          ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-9, -4); ctx.lineTo(-9, 4); ctx.fill();
        } else if (towerType.includes('kamikaze')) { // Switchblade
          // Switchblade Projectile
          ctx.fillStyle = '#455A64';
          ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-6, -4); ctx.lineTo(-6, 4); ctx.fill();
          // Propeller blur
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath(); ctx.arc(-6, 0, 3, 0, Math.PI * 2); ctx.fill();
        } else if (p.type === 'bomb_b21') {
          // B-21 Mega Bomb - Much Larger and More Destructive
          ctx.fillStyle = '#000';
          ctx.fillRect(-15, -8, 30, 16); // Bigger bomb body
          // Reinforced Fins
          ctx.fillStyle = '#222';
          ctx.fillRect(-15, -12, 8, 24);
          // Multiple Warning Stripes
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(4, -8, 6, 16);
          ctx.fillRect(-12, -8, 3, 16);
          // Tactical Markings
          ctx.fillStyle = '#FF6B6B';
          ctx.fillRect(0, -5, 2, 10);
        } else if (p.type === 'bomb_heavy') {
          // B-21 Heavy JDAM / Nuke
          ctx.fillStyle = '#000';
          ctx.fillRect(-10, -5, 20, 10);
          // Fins
          ctx.fillStyle = '#333';
          ctx.fillRect(-10, -8, 6, 16);
          // Warning Strip
          ctx.fillStyle = '#FFD700'; // Gold band
          ctx.fillRect(4, -5, 4, 10);
        } else if (p.type === 'a10_strafe') {
          // Draw A-10 Warthog Strafe Run
          // Main Body
          ctx.fillStyle = '#546E7A';
          ctx.beginPath();
          ctx.moveTo(15, 0);
          ctx.lineTo(-10, -5); ctx.lineTo(-15, 0); ctx.lineTo(-10, 5);
          ctx.closePath();
          ctx.fill();

          // Wings (Straight)
          ctx.fillStyle = '#455A64';
          ctx.fillRect(-5, -15, 8, 30);

          // Engines (Top Rear)
          ctx.fillStyle = '#37474F';
          ctx.fillRect(-12, -8, 6, 4);
          ctx.fillRect(-12, 4, 6, 4);

          // GAU-8 Avenger (Nose Gun) - Spinning Fire Effect
          ctx.fillStyle = '#111';
          ctx.fillRect(15, -1, 4, 2);

          // Muzzle Flash
          if (Math.random() > 0.5) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath(); ctx.lineTo(18, 0); ctx.lineTo(25, -2); ctx.lineTo(25, 2); ctx.fill();
          }

        } else if (p.type === 'missile') {
          // Draw Missile - Enhanced with realistic details
          // Missile nose cone (sharp point)
          ctx.fillStyle = '#E53935';
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(6, -2.5);
          ctx.lineTo(6, 2.5);
          ctx.closePath();
          ctx.fill();

          // Main missile body (tapered)
          ctx.fillStyle = '#C62828'; // Dark red body
          ctx.beginPath();
          ctx.moveTo(6, -2.5);
          ctx.lineTo(-4, -2);
          ctx.lineTo(-8, 0);
          ctx.lineTo(-4, 2);
          ctx.lineTo(6, 2.5);
          ctx.closePath();
          ctx.fill();

          // Missile guidance fins (rear)
          ctx.fillStyle = '#1565C0'; // Blue fins
          ctx.fillRect(-8, -3.5, 2, 7);
          ctx.fillRect(-7, -4, 1.5, 8);

          // Stabilizer fins (small)
          ctx.fillStyle = '#0D47A1'; // Darker blue
          ctx.fillRect(-8.5, -2.5, 1.5, 2);
          ctx.fillRect(-8.5, 0.5, 1.5, 2);

          // Engine nozzles
          ctx.fillStyle = '#333';
          ctx.fillRect(-8.5, -1, 0.5, 2);

          // Engine exhaust/thruster glow (intense)
          ctx.fillStyle = 'rgba(255, 140, 0, 0.8)';
          ctx.beginPath();
          ctx.ellipse(-9, 0, 3, 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Missile trail flame (streak behind)
          ctx.fillStyle = 'rgba(255, 87, 34, 0.6)';
          ctx.beginPath();
          ctx.moveTo(-8, -1.5);
          ctx.lineTo(-14, -1);
          ctx.lineTo(-14, 1);
          ctx.lineTo(-8, 1.5);
          ctx.closePath();
          ctx.fill();

          // Inner flame (bright orange)
          ctx.fillStyle = 'rgba(255, 193, 7, 0.7)';
          ctx.beginPath();
          ctx.moveTo(-8, -0.8);
          ctx.lineTo(-12, -0.5);
          ctx.lineTo(-12, 0.5);
          ctx.lineTo(-8, 0.8);
          ctx.closePath();
          ctx.fill();
        } else if (towerType.includes('snowball')) {
          // Snowball Projectile
          ctx.fillStyle = '#fff';
          ctx.shadowColor = '#B3E5FC';
          ctx.shadowBlur = 5;
          ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        } else if (towerType.includes('candy_cannon')) {
          // Candy Cane Projectile (Rotating)
          const time = Date.now() / 100;
          ctx.rotate(time);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#fff';
          ctx.beginPath();
          ctx.arc(0, -5, 5, Math.PI, 0); // Hook
          ctx.lineTo(5, 10);
          ctx.stroke();
          // Red stripes
          ctx.strokeStyle = '#D32F2F';
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (p.type === 'shell') {
          // Draw Shell (Tank/Artillery) - Enhanced
          // Main shell body (streamlined)
          ctx.fillStyle = '#212121';
          ctx.beginPath();
          ctx.moveTo(5, 0);
          ctx.lineTo(4, -2);
          ctx.lineTo(-4, -1.8);
          ctx.lineTo(-6, 0);
          ctx.lineTo(-4, 1.8);
          ctx.lineTo(4, 2);
          ctx.closePath();
          ctx.fill();

          // Shell nose cone (hardened)
          ctx.fillStyle = '#37474F';
          ctx.beginPath();
          ctx.moveTo(5, 0);
          ctx.lineTo(7, -1);
          ctx.lineTo(7, 1);
          ctx.closePath();
          ctx.fill();

          // Rifling grooves (spiral pattern for detail)
          ctx.strokeStyle = 'rgba(0,0,0,0.4)';
          ctx.lineWidth = 0.3;
          ctx.setLineDash([1, 1]);
          ctx.beginPath();
          ctx.ellipse(0, 0, 4.5, 1.5, 0.2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Copper projectile jacket (rim)
          ctx.strokeStyle = '#B0824D';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(0, 0, 4, 1.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === 'energy') {
          // Draw Energy Ball - Enhanced with pulsing glow
          const pulseSize = 3 + Math.sin(Date.now() / 200) * 1.5;
          
          // Outer glow (large and dim)
          ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.arc(0, 0, pulseSize + 3, 0, Math.PI * 2);
          ctx.fill();

          // Inner glow (medium)
          ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(0, 0, pulseSize + 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Core energy ball
          ctx.fillStyle = '#00FFFF';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00FFFF';
          ctx.beginPath();
          ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
          ctx.fill();

          // Inner core (bright white)
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(0, 0, pulseSize * 0.5, 0, Math.PI * 2);
          ctx.fill();

          // Spiral energy pattern
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
          ctx.lineWidth = 0.5;
          const spiralTime = Date.now() / 50;
          ctx.beginPath();
          for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
            const r = (pulseSize * 0.8) + Math.sin(angle * 3 + spiralTime) * 0.5;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        } else if (p.type === 'b2_bomber') {
          // B-2 Spirit Stealth Bomber
          ctx.fillStyle = '#212121'; // Dark stealth color
          ctx.beginPath();
          ctx.moveTo(15, 0);
          ctx.lineTo(-10, -25); // Wide wing span
          ctx.lineTo(-25, -5); // Angled back
          ctx.lineTo(-25, 5);  // Angled back
          ctx.lineTo(-10, 25);
          ctx.closePath();
          ctx.fill();

          // Engine exhaust glow (subtle)
          ctx.fillStyle = 'rgba(0, 188, 212, 0.1)'; // Faint blue glow
          ctx.beginPath();
          ctx.arc(-20, 0, 8, 0, Math.PI * 2);
          ctx.fill();

          // Very subtle contrail
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(-40, 0);
          ctx.stroke();

        } else {
          // Standard Bullet
          ctx.fillStyle = '#FFFF00';
          ctx.fillRect(-3, -1, 6, 2);
        }
        ctx.restore();
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

  const drawPlanes = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!gameState.planes) return;
    gameState.planes.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);

      // Calculate rotation
      const angle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
      ctx.rotate(angle);

      // Scale up planes for better visibility (B-21 is bigger)
      const planeScale = p.type === 'b21_bomber' ? 3.5 : 2.0;
      ctx.scale(planeScale, planeScale);

      // --- DRAW PLANE MODELS ---
      if (p.type === 'b21_bomber') {
        // B-21 Raider - Advanced Stealth Flying Wing Bomber
        ctx.fillStyle = '#0a0a0a'; // Deep black stealth
        
        // Main flying wing body with proper aerodynamic shape
        ctx.beginPath();
        ctx.moveTo(15, 0);      // Nose cone
        ctx.quadraticCurveTo(8, -12, -2, -18);  // Left wing leading edge
        ctx.lineTo(-15, -14);   // Left wing tip
        ctx.lineTo(-18, 0);     // Tail section
        ctx.lineTo(-15, 14);    // Right wing tip
        ctx.lineTo(-2, 18);     // Right wing leading edge
        ctx.quadraticCurveTo(8, 12, 15, 0);  // Back to nose
        ctx.fill();
        
        // Cockpit window
        ctx.fillStyle = '#00796B';
        ctx.beginPath();
        ctx.ellipse(8, 0, 2.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Stealth panel lines (radar absorbing geometry)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 0.7;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(-8, -16);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(-8, 16);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Engine exhaust ports (twin engines)
        ctx.fillStyle = '#FF8F00';
        ctx.beginPath(); ctx.arc(-12, -6, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-12, 6, 1.5, 0, Math.PI * 2); ctx.fill();
        
        // Engine glow effect
        ctx.fillStyle = 'rgba(255, 140, 0, 0.25)';
        ctx.beginPath(); ctx.arc(-12, -6, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-12, 6, 3, 0, Math.PI * 2); ctx.fill();
        
        // Heavy contrail (produces visible exhaust)
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-12, -6);
        ctx.quadraticCurveTo(-25, -8, -40, -10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-12, 6);
        ctx.quadraticCurveTo(-25, 8, -40, 10);
        ctx.stroke();
        
        // Heat shimmer effect around engines
        ctx.strokeStyle = 'rgba(255, 100, 0, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.arc(-12, i === 0 ? -6 : 6, 4 + Math.sin(Date.now() / 200) * 0.5, 0, Math.PI * 2);
          ctx.stroke();
        }

      } else if (p.type === 'b2_spirit' || p.type === 'b2_bomber') {
        // B-2 Spirit - Refined Stealth Bomber
        ctx.fillStyle = '#1A1A1A'; // Dark gray-black
        
        // Sleek flying wing design
        ctx.beginPath();
        ctx.moveTo(14, 0);      // Sharp nose
        ctx.lineTo(-4, -14);    // Left wing
        ctx.lineTo(-16, -10);   // Left wing tip
        ctx.lineTo(-18, 0);     // Tail
        ctx.lineTo(-16, 10);    // Right wing tip
        ctx.lineTo(-4, 14);     // Right wing
        ctx.quadraticCurveTo(8, 8, 14, 0);
        ctx.fill();
        
        // Canopy
        ctx.fillStyle = '#004D40';
        ctx.beginPath();
        ctx.ellipse(6, 0, 2.2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Engine nozzles with afterburner effect
        ctx.fillStyle = '#E65100';
        ctx.beginPath(); ctx.arc(-14, -5, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-14, 5, 1.3, 0, Math.PI * 2); ctx.fill();
        
        // Afterburner glow
        ctx.fillStyle = 'rgba(255, 87, 34, 0.3)';
        ctx.beginPath(); ctx.arc(-14, -5, 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-14, 5, 2.8, 0, Math.PI * 2); ctx.fill();
        
        // Contrails
        ctx.strokeStyle = 'rgba(220, 220, 220, 0.35)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-14, -5);
        ctx.lineTo(-35, -8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-14, 5);
        ctx.lineTo(-35, 8);
        ctx.stroke();

      } else if (p.type === 'c130_hercules' || p.type === 'gunship_aircraft') {
        // C-130 Hercules Gunship - Large transport/gunship
        ctx.fillStyle = '#616161';
        
        // Large fuselage (wider and longer)
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(-12, -10);
        ctx.lineTo(-20, -8);
        ctx.lineTo(-20, 8);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.fill();
        
        // Large cargo wing
        ctx.fillStyle = '#424242';
        ctx.fillRect(-8, -16, 12, 32);
        
        // Four engines
        ctx.fillStyle = '#37474F';
        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.arc(-6 + i * 6, -14, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-6 + i * 6, 14, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Engine exhaust
        ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
        for (let i = 0; i < 2; i++) {
          ctx.fillRect(-8 + i * 6, -18, 3, -5);
          ctx.fillRect(-8 + i * 6, 18, 3, 5);
        }
        
        // Gun ports (side-firing)
        ctx.fillStyle = '#212121';
        ctx.fillRect(12, -3, 4, 6);
        
        // Muzzle flash
        if (p.payloadTimer && p.payloadTimer > 0 && Math.random() > 0.6) {
          ctx.fillStyle = '#FFEB3B';
          ctx.beginPath();
          ctx.moveTo(16, 0);
          ctx.lineTo(28, -2);
          ctx.lineTo(28, 2);
          ctx.closePath();
          ctx.fill();
        }

      } else if (p.type === 'ah64_apache' || p.type === 'attack_helicopter') {
        // AH-64 Apache Attack Helicopter
        ctx.fillStyle = '#558B2F';
        
        // Main fuselage (tandem)
        ctx.beginPath();
        ctx.moveTo(12, -3);
        ctx.lineTo(12, 3);
        ctx.lineTo(-10, 2);
        ctx.lineTo(-10, -2);
        ctx.closePath();
        ctx.fill();
        
        // Cockpit bubble (front)
        ctx.fillStyle = '#00695C';
        ctx.beginPath();
        ctx.ellipse(10, 0, 2, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pilot bubble (back)
        ctx.fillStyle = '#004D40';
        ctx.beginPath();
        ctx.ellipse(4, 0, 1.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Main rotor (top)
        ctx.strokeStyle = '#37474F';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(8, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#455A64';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + Date.now() / 100;
          ctx.beginPath();
          ctx.moveTo(8 + Math.cos(angle) * 8, Math.sin(angle) * 8);
          ctx.lineTo(8 + Math.cos(angle + Math.PI) * 8, Math.sin(angle + Math.PI) * 8);
          ctx.stroke();
        }
        
        // Tail boom
        ctx.strokeStyle = '#37474F';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-16, 0);
        ctx.stroke();
        
        // Stub wings with weapons
        ctx.fillStyle = '#558B2F';
        ctx.fillRect(-2, -8, 10, 4);
        ctx.fillRect(-2, 4, 10, 4);
        
        // Rocket pods
        ctx.fillStyle = '#D32F2F';
        ctx.fillRect(2, -10, 2, 2);
        ctx.fillRect(2, 8, 2, 2);
        ctx.fillRect(6, -10, 2, 2);
        ctx.fillRect(6, 8, 2, 2);
        
        // Turret gun
        ctx.fillStyle = '#212121';
        ctx.fillRect(9, -1, 4, 2);

      } else if (p.type === 'v22_osprey' || p.type === 'tiltrotor_aircraft') {
        // V-22 Osprey Tiltrotor
        ctx.fillStyle = '#546E7A';
        
        // Central fuselage
        ctx.fillRect(-6, -4, 12, 8);
        
        // Tilting rotors (showing rotation)
        const rotorAngle = Date.now() / 50;
        ctx.save();
        
        // Front rotor
        ctx.translate(4, 0);
        ctx.rotate(rotorAngle);
        ctx.strokeStyle = '#37474F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 7, Math.sin(angle) * 7);
          ctx.lineTo(Math.cos(angle + Math.PI) * 7, Math.sin(angle + Math.PI) * 7);
          ctx.stroke();
        }
        ctx.restore();
        
        // Rear rotor
        ctx.save();
        ctx.translate(-4, 0);
        ctx.rotate(rotorAngle + Math.PI / 2);
        ctx.strokeStyle = '#37474F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 7, Math.sin(angle) * 7);
          ctx.lineTo(Math.cos(angle + Math.PI) * 7, Math.sin(angle + Math.PI) * 7);
          ctx.stroke();
        }
        ctx.restore();
        
        // Wings/nacelles
        ctx.fillStyle = '#455A64';
        ctx.fillRect(-8, -2, 16, 1);
        
        // Cockpit
        ctx.fillStyle = '#00796B';
        ctx.beginPath();
        ctx.ellipse(0, 0, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type.includes('f16') || p.type.includes('f15')) {
        // F-16 / F-15 Fighter Jet
        ctx.fillStyle = '#90CAF9';
        
        // Needle nose fighter
        ctx.beginPath();
        ctx.moveTo(14, 0);      // Nose
        ctx.lineTo(-6, -8);     // Left wing
        ctx.lineTo(-12, -6);    // Left wing tip
        ctx.lineTo(-14, 0);     // Tail
        ctx.lineTo(-12, 6);     // Right wing tip
        ctx.lineTo(-6, 8);      // Right wing
        ctx.closePath();
        ctx.fill();
        
        // Cockpit
        ctx.fillStyle = '#0D47A1';
        ctx.beginPath();
        ctx.ellipse(4, 0, 2, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Canopy glint
        ctx.fillStyle = '#E3F2FD';
        ctx.beginPath();
        ctx.arc(5, -0.5, 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Engine exhaust
        ctx.fillStyle = '#FF6F00';
        ctx.beginPath(); ctx.arc(-14, 0, 1.2, 0, Math.PI * 2); ctx.fill();
        
        // Afterburner glow
        ctx.fillStyle = 'rgba(255, 111, 0, 0.3)';
        ctx.beginPath(); ctx.arc(-14, 0, 2.5, 0, Math.PI * 2); ctx.fill();
        
        // Contrail
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(-32, 0);
        ctx.stroke();

      } else if (p.type.includes('f22') || p.type.includes('f35') || p.type.includes('stealth')) {
        // F-22 / F-35 Stealth Fighter
        ctx.fillStyle = '#263238';
        
        // Angular stealth body
        ctx.beginPath();
        ctx.moveTo(12, 0);      // Nose
        ctx.lineTo(-4, -9);     // Left wing
        ctx.lineTo(-14, -6);    // Left wing tip
        ctx.lineTo(-15, 0);     // Tail
        ctx.lineTo(-14, 6);     // Right wing tip
        ctx.lineTo(-4, 9);      // Right wing
        ctx.closePath();
        ctx.fill();
        
        // Cockpit
        ctx.fillStyle = '#00BCD4';
        ctx.beginPath();
        ctx.ellipse(3, 0, 1.5, 1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Engine
        ctx.fillStyle = '#E91E63';
        ctx.beginPath(); ctx.arc(-14, 0, 1.3, 0, Math.PI * 2); ctx.fill();
        
        // Minimal contrail (stealth mode)
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(-26, 0);
        ctx.stroke();

      } else if (p.type.includes('bomber')) {
        // Generic Bomber
        ctx.fillStyle = '#546E7A';
        
        // Flying Wing
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-6, -11);
        ctx.lineTo(-14, -8);
        ctx.lineTo(-14, 8);
        ctx.lineTo(-6, 11);
        ctx.closePath();
        ctx.fill();
        
        // Cockpit
        ctx.fillStyle = '#37474F';
        ctx.beginPath();
        ctx.ellipse(2, 0, 1.5, 1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Engines
        ctx.fillStyle = '#FF8F00';
        ctx.beginPath(); ctx.arc(-10, -4, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-10, 4, 1, 0, Math.PI * 2); ctx.fill();
        
        // Contrail from engines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, -4);
        ctx.lineTo(-28, -6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-10, 4);
        ctx.lineTo(-28, 6);
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [gameState.planes]);

  const drawTanks = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!gameState.deployedTanks) return;
    gameState.deployedTanks.forEach(tank => {
      ctx.save();
      ctx.translate(tank.x, tank.y);
      ctx.rotate(tank.angle);

      // Scale up tanks for better visibility
      const tankScale = 2.0;
      ctx.scale(tankScale, tankScale);

      // Determine tank color based on type
      let bodyColor = '#4CAF50'; // Default green
      let accentColor = '#558B2F';
      let trackColor = '#1B5E20';
      
      if (tank.id.includes('abrams')) {
        bodyColor = '#FF5722'; // Orange
        accentColor = '#E64A19';
        trackColor = '#BF360C';
      } else if (tank.id.includes('leopard')) {
        bodyColor = '#9C27B0'; // Purple
        accentColor = '#7B1FA2';
        trackColor = '#4A148C';
      } else if (tank.id.includes('challenger')) {
        bodyColor = '#3F51B5'; // Blue
        accentColor = '#1A237E';
        trackColor = '#0D47A1';
      } else if (tank.id.includes('type99') || tank.id.includes('type10')) {
        bodyColor = '#E91E63'; // Pink
        accentColor = '#C2185B';
        trackColor = '#880E4F';
      } else if (tank.id.includes('laser')) {
        bodyColor = '#00BCD4'; // Cyan
        accentColor = '#0097A7';
        trackColor = '#006064';
      } else if (tank.id.includes('plasma')) {
        bodyColor = '#9C27B0'; // Purple
        accentColor = '#6A1B9A';
        trackColor = '#38006B';
      } else if (tank.id.includes('tesla')) {
        bodyColor = '#FFEB3B'; // Yellow
        accentColor = '#FBC02D';
        trackColor = '#F57F17';
      }

      // Tank main body (hull) - sloped front
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.lineTo(-8, -10);
      ctx.lineTo(8, -10);
      ctx.lineTo(12, -8);
      ctx.lineTo(12, 8);
      ctx.lineTo(-12, 8);
      ctx.closePath();
      ctx.fill();

      // Hull armor plating detail
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(-11, -8, 22, 16);
      ctx.setLineDash([]);

      // Track assemblies (left and right treads)
      ctx.fillStyle = trackColor;
      // Left track
      ctx.fillRect(-14, -9, 3, 18);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-14, -9, 3, 18);
      // Right track
      ctx.fillRect(11, -9, 3, 18);
      ctx.strokeRect(11, -9, 3, 18);

      // Track link detail (chevrons)
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.3;
      for (let i = -8; i <= 6; i += 4) {
        ctx.beginPath();
        ctx.moveTo(-13.5, i);
        ctx.lineTo(-14.5, i + 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(12.5, i);
        ctx.lineTo(11.5, i + 2);
        ctx.stroke();
      }

      // Turret base ring
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(0, -1, 7, 0, Math.PI * 2);
      ctx.fill();

      // Turret (main rotating part)
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(0, -1, 6, 0, Math.PI * 2);
      ctx.fill();

      // Turret shape (rounded rectangle on top)
      ctx.beginPath();
      ctx.moveTo(-4, -5);
      ctx.quadraticCurveTo(-6, -3, -5, 0);
      ctx.lineTo(-5, 2);
      ctx.lineTo(5, 2);
      ctx.lineTo(5, 0);
      ctx.quadraticCurveTo(6, -3, 4, -5);
      ctx.closePath();
      ctx.fill();

      // Gun barrel (tapered for realism)
      ctx.strokeStyle = '#2C3E50';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(4, -1);
      ctx.lineTo(16, -0.5);
      ctx.stroke();

      // Barrel inner shadow
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(16, 0.3);
      ctx.stroke();

      // Coaxial machine gun (smaller barrel on top)
      ctx.strokeStyle = '#1B1B1B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(3, -3);
      ctx.lineTo(12, -2.8);
      ctx.stroke();

      // Turret top hatch (circular detail)
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(0, -3, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Turret viewing port
      ctx.fillStyle = '#00796B';
      ctx.fillRect(-1, -4.5, 2, 1.5);

      // Mudguards (fenders over tracks)
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(-14, -10, 3, 3);
      ctx.fillRect(11, -10, 3, 3);
      ctx.fillRect(-14, 7, 3, 3);
      ctx.fillRect(11, 7, 3, 3);

      // ERA blocks (Explosive Reactive Armor) - small squares on hull
      if (!tank.id.includes('laser') && !tank.id.includes('plasma') && !tank.id.includes('tesla')) {
        ctx.fillStyle = 'rgba(100,100,100,0.6)';
        ctx.fillRect(-10, -7, 2, 2);
        ctx.fillRect(8, -7, 2, 2);
        ctx.fillRect(-10, 5, 2, 2);
        ctx.fillRect(8, 5, 2, 2);
      }

      // Energy weapon glow for special tanks
      if (tank.id.includes('laser')) {
        ctx.fillStyle = 'rgba(0, 188, 212, 0.3)';
        ctx.beginPath();
        ctx.arc(0, -1, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (tank.id.includes('plasma')) {
        ctx.fillStyle = 'rgba(156, 39, 176, 0.2)';
        ctx.beginPath();
        ctx.arc(0, -1, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (tank.id.includes('tesla')) {
        ctx.fillStyle = 'rgba(255, 193, 7, 0.25)';
        ctx.beginPath();
        ctx.arc(0, -1, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tank health bar
      const healthPercent = tank.currentHp / tank.totalHp;
      ctx.fillStyle = healthPercent > 0.6 ? '#4CAF50' : healthPercent > 0.3 ? '#FF9800' : '#F44336';
      ctx.fillRect(-10, -15, 20 * healthPercent, 2);

      // Outline health bar
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(-10, -15, 20, 2);

      ctx.restore();
    });
  }, [gameState.deployedTanks]);

  const { canvasWidth, canvasHeight } = useScreenDimensions();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate scale factors
    const scaleX = canvasWidth / GAME_CONFIG.GRID_WIDTH;
    const scaleY = canvasHeight / GAME_CONFIG.GRID_HEIGHT;

    // Clear and reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply scaling so all drawing happens at base resolution
    ctx.scale(scaleX, scaleY);

    drawBackground(ctx, GAME_CONFIG.GRID_WIDTH, GAME_CONFIG.GRID_HEIGHT);
    drawDecorations(ctx);
    drawPath(ctx);
    drawTowers(ctx);
    drawEnemies(ctx);
    drawProjectiles(ctx);
    drawPlanes(ctx); // Added planes to render loop
    drawTanks(ctx); // Added tanks to render loop
    drawExplosions(ctx);
    drawFallingSnow(ctx, GAME_CONFIG.GRID_WIDTH, GAME_CONFIG.GRID_HEIGHT);

    if (gameState.status === 'paused') {
      drawPausedOverlay(ctx);
    }

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [gameState, customPathPoints, drawBackground, drawPath, drawTowers, drawEnemies, drawProjectiles, drawExplosions, drawPlanes, drawTanks, drawFallingSnow, drawPausedOverlay, canvasRef, drawDecorations, canvasWidth, canvasHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        display: 'block'
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    />
  );
}


