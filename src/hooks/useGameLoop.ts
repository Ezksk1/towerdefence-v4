"use client";

import { useEffect, useRef, useCallback } from "react";
import type { GameState, ActiveEnemy, PlacedTower, Projectile, Soldier } from "@/lib/types";
import { ENEMIES, LEVELS, TOWERS, GAME_CONFIG } from "@/lib/game-config";

const FRAME_TIME = 1000 / 60; // 60 FPS

function createSoldier(x: number, y: number, parent: PlacedTower): Soldier {
    const soldier: Partial<Soldier> = {
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        parent: parent,
        hp: 50,
        maxHp: 50,
        damage: 5,
        range: 30,
        cooldown: 0,
    };

    soldier.takeDamage = (amount: number) => {
        soldier.hp! -= amount;
    };

    return soldier as Soldier;
}


export function useGameLoop(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  handleStartWave: () => void
) {
  const lastFrameTimeRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);

  const gameLoop = useCallback((timestamp: number) => {
    if (lastFrameTimeRef.current === 0) {
      lastFrameTimeRef.current = timestamp;
    }

    let deltaTime = timestamp - lastFrameTimeRef.current;
    lastFrameTimeRef.current = timestamp;

    if (gameState.status !== "playing") {
      requestAnimationFrame(gameLoop);
      return;
    }
    
    gameTimeRef.current += deltaTime;
    
    while (gameTimeRef.current >= FRAME_TIME) {
        setGameState(prev => {
            if (prev.lives <= 0) {
              return {...prev, status: 'game-over'};
            }

            let newLives = prev.lives;
            let newMoney = prev.money;

            // 1. Update Enemies
            const path = LEVELS[prev.currentLevel - 1].path;
            const updatedEnemies = prev.enemies.map(enemy => {
                let newEnemy = {...enemy};

                if (newEnemy.frozenTimer > 0) {
                    newEnemy.frozenTimer--;
                    newEnemy.speedFactor = 0.5;
                } else {
                    newEnemy.speedFactor = 1;
                }

                if (newEnemy.poisonTimer > 0) {
                    if (newEnemy.poisonTimer % 60 === 0) newEnemy.currentHp -= newEnemy.poisonDamage;
                    newEnemy.poisonTimer--;
                }

                if (newEnemy.pathIndex >= path.length) {
                    newLives--;
                    newEnemy.active = false;
                    return newEnemy;
                }
                
                const targetNode = path[newEnemy.pathIndex];
                const targetX = targetNode.x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH/2;
                const targetY = targetNode.y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT/2;
                
                const dx = targetX - newEnemy.x;
                const dy = targetY - newEnemy.y;
                const distance = Math.hypot(dx, dy);
                
                if (distance < newEnemy.speed * newEnemy.speedFactor) {
                    newEnemy.pathIndex++;
                } else {
                    const moveX = (dx / distance) * newEnemy.speed * newEnemy.speedFactor;
                    const moveY = (dy / distance) * newEnemy.speed * newEnemy.speedFactor;
                    newEnemy.x += moveX;
                    newEnemy.y += moveY;
                }

                return newEnemy;

            }).filter(e => e.active && e.currentHp > 0);

            // 2. Update Towers and create projectiles
            let newProjectiles = [...prev.projectiles];
            let newSoldiers = [...prev.soldiers];
            
            const updatedTowers = prev.towers.map(tower => {
                let newTower = {...tower};
                if (newTower.cooldown > 0) {
                    newTower.cooldown--;
                }

                if (newTower.cooldown <= 0) {
                    // Find target
                    let target: ActiveEnemy | null = null;
                    let minDist = Infinity;
                    updatedEnemies.forEach(e => {
                        const dist = Math.hypot(e.x - newTower.x, e.y - newTower.y);
                        if (dist <= newTower.range && dist < minDist) {
                            minDist = dist;
                            target = e;
                        }
                    });

                    if (target) {
                        newTower.angle = Math.atan2(target.y - newTower.y, target.x - newTower.x);
                        
                        newProjectiles.push({
                            id: crypto.randomUUID(),
                            x: newTower.x,
                            y: newTower.y,
                            target: target,
                            config: newTower,
                            speed: 8,
                            damage: newTower.damage,
                            splash: newTower.splash || 0,
                            active: true,
                        });
                        newTower.cooldown = newTower.rate;
                    }
                }
                return newTower;
            });
            
            // 3. Update projectiles and apply damage
            const survivingEnemies = updatedEnemies.map(enemy => {
                let newEnemy = {...enemy};
                newProjectiles.forEach(p => {
                    if(!p.active) return;
                    const pTarget = p.target as ActiveEnemy;
                    if (pTarget.idInGame === newEnemy.idInGame) {
                        const dx = pTarget.x - p.x;
                        const dy = pTarget.y - p.y;
                        const dist = Math.hypot(dx, dy);

                        if (dist < p.speed) {
                            newEnemy.currentHp -= p.damage;
                            p.active = false;
                        }
                    }
                });
                return newEnemy;
            });

            const finalEnemies = survivingEnemies.filter(enemy => {
                if (enemy.currentHp <= 0) {
                    newMoney += Math.floor(enemy.totalHp / 10);
                    return false;
                }
                return true;
            });

            // 4. Wave Management
            let newWave = prev.wave;
            let newWaveActive = prev.waveActive;
            if (prev.waveActive && finalEnemies.length === 0) {
                newWaveActive = false;
                newWave++;
                newMoney += 100; // End of wave bonus
            }

            // Return new state
            return {
                ...prev,
                lives: newLives,
                money: newMoney,
                wave: newWave,
                waveActive: newWaveActive,
                enemies: finalEnemies,
                towers: updatedTowers,
                projectiles: newProjectiles.filter(p => p.active),
                soldiers: newSoldiers,
                waveTimer: prev.waveActive ? 0 : prev.waveTimer,
            };
        });
        
        gameTimeRef.current -= FRAME_TIME;
    }
    
    requestAnimationFrame(gameLoop);
  }, [gameState.status, setGameState]);

  // Second-based timer for waves
  useEffect(() => {
    const timerId = setInterval(() => {
      setGameState(prev => {
        if (!prev.waveActive && prev.lives > 0) {
          if (prev.waveTimer <= 1) {
            handleStartWave();
            return { ...prev, waveTimer: GAME_CONFIG.WAVE_TIMER_DURATION };
          }
          return { ...prev, waveTimer: prev.waveTimer - 1 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [handleStartWave, setGameState]);

  useEffect(() => {
    const animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameLoop]);
}
