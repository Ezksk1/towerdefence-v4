
"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ENEMIES, TOWERS, LEVELS, DIY_COMPONENTS } from "@/lib/game-config";
import type { GameState, TowerData, PlacedTower, EnemyData, DIYTower, DIYChassis, DIYWeapon, DIYAccessory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { drawRealisticTower, drawRealisticEnemy } from "@/components/GameBoard";
import GameControls from "./GameControls";
import { Button } from "./ui/button";
import { ShieldQuestion, X, Map, Pencil, Wrench, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

interface GameSidebarProps {
  gameState: GameState;
  onDragStart: (tower: TowerData | DIYTower) => void;
  onStartWave: () => void;
  onPause: () => void;
  onSave: () => void;
  onLoad: () => void;
  onRestart: () => void;
  onSpeedUp: () => void;
  onLevelChange: (level: number) => void;
  onDrawPath: () => void;
  isDrawingPath: boolean;
  customTowers: DIYTower[];
  onAddCustomTower: (tower: DIYTower) => void;
}

const EnemyPreview = ({ enemy }: { enemy: EnemyData }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !enemy) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const previewSize = 80;
        canvas.width = previewSize;
        canvas.height = previewSize;

        ctx.clearRect(0, 0, previewSize, previewSize);

        const activeEnemy = {
            ...enemy,
            idInGame: 'preview',
            x: previewSize / 2,
            y: previewSize / 2,
            currentHp: enemy.baseHp,
            totalHp: enemy.baseHp,
            pathIndex: 0,
            active: true,
            speedFactor: 1,
            frozenTimer: 0,
            poisonTimer: 0,
            poisonDamage: 0,
            type: enemy.type
        };
        
        drawRealisticEnemy(ctx, activeEnemy);

    }, [enemy]);

    return <canvas ref={canvasRef} />;
}

const EnemyBestiary = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
            <ShieldQuestion className="mr-2 h-4 w-4" />
            Enemy Info
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Enemy Bestiary</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.values(ENEMIES).map(enemy => (
                <div key={enemy.id} className="flex flex-col items-center p-2 rounded-lg bg-card">
                    <EnemyPreview enemy={enemy} />
                    <h3 className="font-bold">{enemy.name}</h3>
                    <p className="text-sm text-muted-foreground">HP: {enemy.baseHp} (scales)</p>
                    <p className="text-sm text-muted-foreground">Speed: {enemy.speed}</p>
                    {enemy.flying && <p className="text-sm text-blue-400">Flying</p>}
                </div>
            ))}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};


const TowerPreview = ({ tower }: { tower: TowerData | DIYTower }) => {
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

const DIYTowerBuilder = ({ onSave }: { onSave: (tower: DIYTower) => void }) => {
  const [name, setName] = useState("Custom Tower");
  const [chassis, setChassis] = useState<DIYChassis>(DIY_COMPONENTS.chassis[0]);
  const [weapon, setWeapon] = useState<DIYWeapon>(DIY_COMPONENTS.weapons[0]);
  const [accessory, setAccessory] = useState<DIYAccessory>(DIY_COMPONENTS.accessories[0]);
  const [finalTower, setFinalTower] = useState<DIYTower | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Calculate final tower stats
    const cost = chassis.cost + weapon.cost + accessory.cost;
    const damage = weapon.damage * (accessory.damageMultiplier || 1);
    const range = weapon.range * (accessory.rangeMultiplier || 1);
    const rate = weapon.rate * (accessory.rateMultiplier || 1);
    const splash = (weapon.splash || 0) + (accessory.splashBonus || 0);

    const newTower: DIYTower = {
      id: `custom_${Date.now()}`,
      name,
      cost,
      damage,
      range,
      rate,
      splash: splash > 0 ? splash : undefined,
      burn: weapon.burn,
      chain: weapon.chain,
      slow: accessory.slow,
      pierce: accessory.pierce,
      poison: accessory.poison,
      isCustom: true,
      chassis: chassis.id,
      weapon: weapon.id,
      accessory: accessory.id,
      iconUrl: weapon.iconUrl,
      iconHint: weapon.iconHint,
    };
    setFinalTower(newTower);
  }, [name, chassis, weapon, accessory]);

  const handleSave = () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Invalid Name", description: "Please give your tower a name."});
      return;
    }
    if (finalTower) {
      onSave({ ...finalTower, name });
      toast({ title: "Tower Saved!", description: `Your "${name}" tower is ready for battle.`});
    }
  };
  
  if (!finalTower) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="accent" className="w-full">
          <Wrench className="mr-2 h-4 w-4" />
          Build a Tower
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>DIY Tower Builder</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side: Controls */}
          <div className="flex flex-col gap-4">
             <div className="grid gap-2">
              <Label htmlFor="tower-name">Tower Name</Label>
              <Input id="tower-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Chassis</Label>
              <Select onValueChange={(val) => setChassis(DIY_COMPONENTS.chassis.find(c => c.id === val)!)} defaultValue={chassis.id}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIY_COMPONENTS.chassis.map(c => <SelectItem key={c.id} value={c.id}>{c.name} (+${c.cost})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="grid gap-2">
              <Label>Weapon</Label>
              <Select onValueChange={(val) => setWeapon(DIY_COMPONENTS.weapons.find(w => w.id === val)!)} defaultValue={weapon.id}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIY_COMPONENTS.weapons.map(w => <SelectItem key={w.id} value={w.id}>{w.name} (+${w.cost})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="grid gap-2">
              <Label>Accessory</Label>
              <Select onValueChange={(val) => setAccessory(DIY_COMPONENTS.accessories.find(a => a.id === val)!)} defaultValue={accessory.id}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIY_COMPONENTS.accessories.map(a => <SelectItem key={a.id} value={a.id}>{a.name} (+${a.cost})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Right Side: Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-card rounded-lg">
             <h3 className="text-xl font-bold">{finalTower.name}</h3>
             <TowerPreview tower={finalTower} />
             <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm w-full">
                <span>Cost: <span className="font-bold text-yellow-400">${finalTower.cost}</span></span>
                <span>Damage: <span className="font-bold">{finalTower.damage}</span></span>
                <span>Range: <span className="font-bold">{finalTower.range}</span></span>
                <span>Fire Rate: <span className="font-bold">{finalTower.rate}</span></span>
                {finalTower.splash ? <span>Splash: <span className="font-bold">{finalTower.splash}</span></span> : null}
                {finalTower.burn ? <span>Burn: <span className="font-bold">{finalTower.burn}</span></span> : null}
                {finalTower.chain ? <span>Chain: <span className="font-bold">{finalTower.chain}</span></span> : null}
                {finalTower.slow ? <span>Slow: <span className="font-bold">{finalTower.slow}</span></span> : null}
                {finalTower.pierce ? <span>Pierce: <span className="font-bold">{finalTower.pierce}</span></span> : null}
                {finalTower.poison ? <span>Poison: <span className="font-bold">{finalTower.poison}</span></span> : null}
             </div>
             <p className="text-xs text-muted-foreground mt-2 text-center">{accessory.description}</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Save and Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function GameSidebar({ gameState, onDragStart, onStartWave, onPause, onSave, onLoad, onRestart, onSpeedUp, onLevelChange, onDrawPath, isDrawingPath, customTowers, onAddCustomTower }: GameSidebarProps) {
  const [selectedTower, setSelectedTower] = useState<TowerData | DIYTower | null>(null);

  const handleTowerClick = (tower: TowerData | DIYTower) => {
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
      <p className="instruction">Build or drag towers to fight!</p>

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
        {customTowers.map((tower) => {
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
        <GameControls onPause={onPause} onSave={onSave} onLoad={onLoad} onRestart={onRestart} onSpeedUp={onSpeedUp} gameState={gameState} />

        <div className="flex flex-col gap-2">
            <DIYTowerBuilder onSave={onAddCustomTower} />
            <EnemyBestiary />
             {gameState.currentLevel === 5 && (
              <Button onClick={onDrawPath} variant={isDrawingPath ? "secondary" : "outline"}>
                <Pencil className="mr-2 h-4 w-4" />
                {isDrawingPath ? "Finish Path" : "Draw Path"}
              </Button>
            )}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="level-select" className="flex items-center">
                <Map className="mr-2 h-4 w-4" />
                Select Map
              </Label>
              <Select
                value={String(gameState.currentLevel)}
                onValueChange={(value) => onLevelChange(Number(value))}
              >
                <SelectTrigger id="level-select">
                  <SelectValue placeholder="Select a map" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level.level} value={String(level.level)}>
                      {level.name}
                    </SelectItem>
                  ))}
                   <SelectItem value="5">DIY Map</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>

        <div id="stats">
          <div className="stat">Lives: <span id="lives">{gameState.lives}</span></div>
          <div className="stat">Money: $<span id="money">{gameState.money}</span></div>
          <div className="stat">Wave: <span id="wave">{gameState.wave}</span></div>
        </div>

        <div id="message-area">
          {!gameState.waveActive && gameState.waveTimer > 0 && gameState.lives > 0 ? (
              `Next wave in: ${gameState.waveTimer}s`
          ) : gameState.lives <= 0 ? (
              'Game Over'
          ) : isDrawingPath ? (
              'Click to draw your path...'
          ) : `Wave ${gameState.wave} in progress...`}
        </div>

        <Button onClick={onStartWave} disabled={gameState.waveActive || gameState.lives <= 0 || isDrawingPath} className="w-full">
          {gameState.lives <= 0 ? 'Game Over' : gameState.waveActive ? 'Wave in Progress' : 'Start Wave'}
        </Button>
      </div>

    </div>
  );
}
