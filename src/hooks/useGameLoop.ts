"use client";

import { useEffect, useRef, useCallback } from "react";
import type { GameState, ActiveEnemy, PlacedTower, Projectile, Soldier } from "@/lib/types";
import { ENEMIES, LEVELS, TOWERS, GAME_CONFIG, rasterizePath } from "@/lib/game-config";

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
  handleStartWave: () => void,
  customPathPoints: {x:number, y:number}[]
) {
  const lastFrameTimeRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);
  const enemiesToSpawnRef = useRef<string[]>([]);

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
    
    // Apply game speed to delta time
    deltaTime *= gameState.gameSpeed;

    gameTimeRef.current += deltaTime;
    
    while (gameTimeRef.current >= FRAME_TIME) {
        setGameState(prev => {
            // If the speed changed, prev might be stale, use the latest from gameState
            const currentSpeed = gameState.gameSpeed;
            if (prev.status !== 'playing' || prev.lives <= 0) {
              return prev.lives <= 0 ? {...prev, status: 'game-over'} : prev;
            }

            let newLives = prev.lives;
            let newMoney = prev.money;

            // 1. Update Enemies
            let currentPath;
            if (prev.currentLevel === 5 && customPathPoints.length > 1) {
                currentPath = rasterizePath(customPathPoints);
            } else {
                const levelData = LEVELS.find(l => l.level === prev.currentLevel);
                if (levelData) {
                    currentPath = levelData.path;
                }
            }
            
            if (!currentPath) { // If path is not available, don't update enemies
              return prev;
            }

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

                if (newEnemy.pathIndex >= currentPath.length) {
                    newLives--;
                    newEnemy.active = false;
                    return newEnemy;
                }
                
                const targetNode = currentPath[newEnemy.pathIndex];
                const targetX = targetNode.x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH/2;
                const targetY = targetNode.y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT/2;
                
                const dx = targetX - newEnemy.x;
                const dy = targetY - newEnemy.y;
                const distance = Math.hypot(dx, dy);
                
                const currentMoveSpeed = newEnemy.speed * newEnemy.speedFactor;

                if (distance < currentMoveSpeed) {
                    newEnemy.pathIndex++;
                } else {
                    const moveX = (dx / distance) * currentMoveSpeed;
                    const moveY = (dy / distance) * currentMoveSpeed;
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
                    const findTargets = (center: PlacedTower, enemies: ActiveEnemy[], count: number) => {
                        return enemies.filter(e => Math.hypot(e.x - center.x, e.y - center.y) <= center.range)
                                      .sort((a,b) => Math.hypot(a.x - center.x, a.y - center.y) - Math.hypot(b.x - center.x, b.y - center.y))
                                      .slice(0, count);
                    };

                    const mainTargets = findTargets(newTower, updatedEnemies, 1);

                    if (mainTargets.length > 0) {
                        const mainTarget = mainTargets[0];
                        newTower.angle = Math.atan2(mainTarget.y - newTower.y, mainTarget.x - newTower.x);
                        
                        let chainTargets: ActiveEnemy[] = [];
                        if (newTower.chain) {
                            const potentialChainTargets = updatedEnemies.filter(e => e.idInGame !== mainTarget.idInGame && Math.hypot(e.x - mainTarget.x, e.y - mainTarget.y) <= 100); // 100 is chain range
                            chainTargets = findTargets({ ...newTower, x: mainTarget.x, y: mainTarget.y }, potentialChainTargets, newTower.chain - 1);
                        }

                        newProjectiles.push({
                            id: crypto.randomUUID(),
                            x: newTower.x,
                            y: newTower.y,
                            target: mainTarget,
                            chainTargets: chainTargets,
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
            const remainingProjectiles = [...newProjectiles];
            let enemiesAfterHits = [...updatedEnemies];

            remainingProjectiles.forEach(p => {
                if (!p.active) return;
                
                const pTarget = p.target as ActiveEnemy;
                if (!pTarget.active || pTarget.currentHp <= 0) {
                    p.active = false;
                    return;
                }

                const dx = pTarget.x - p.x;
                const dy = pTarget.y - p.y;
                const dist = Math.hypot(dx, dy);
                const currentProjectileSpeed = p.speed;

                if (dist < currentProjectileSpeed) {
                    p.active = false; // Deactivate projectile on hit

                    const applyDamage = (enemyId: string, damage: number) => {
                        enemiesAfterHits = enemiesAfterHits.map(enemy => {
                            if (enemy.idInGame === enemyId) {
                                enemy.currentHp -= damage;
                            }
                            return enemy;
                        });
                    };

                    if (p.splash > 0) {
                        enemiesAfterHits.forEach(enemy => {
                            if (Math.hypot(enemy.x - pTarget.x, enemy.y - pTarget.y) <= p.splash) {
                                applyDamage(enemy.idInGame, p.damage);
                            }
                        });
                    } else {
                        applyDamage(pTarget.idInGame, p.damage);
                        if (p.chainTargets && p.chainTargets.length > 0) {
                            p.chainTargets.forEach(chainTarget => {
                                applyDamage(chainTarget.idInGame, p.damage / 2); // Chain damage is halved
                            });
                        }
                    }
                } else {
                    // Move projectile
                    p.x += (dx / dist) * currentProjectileSpeed;
                    p.y += (dy / dist) * currentProjectileSpeed;
                }
            });


            const finalEnemies = enemiesAfterHits.filter(enemy => {
                if (enemy.currentHp <= 0) {
                    newMoney += Math.floor(enemy.totalHp / 10);
                    return false;
                }
                return true;
            });

            // 4. Wave Management
            let newWave = prev.wave;
            let newWaveActive = prev.waveActive;
            if (prev.waveActive && finalEnemies.length === 0 && enemiesToSpawnRef.current.length === 0) {
                 // Check if there are no more enemies on screen and no more to spawn
                newWaveActive = false;
                newWave++;
                newMoney += 100 + (prev.wave * 10); // End of wave bonus
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
                projectiles: remainingProjectiles.filter(p => p.active),
                soldiers: newSoldiers,
                waveTimer: prev.waveActive ? 0 : prev.waveTimer,
                gameSpeed: currentSpeed, // ensure speed is passed through
            };
        });
        
        gameTimeRef.current -= FRAME_TIME;
    }
    
    requestAnimationFrame(gameLoop);
  }, [gameState.status, gameState.gameSpeed, setGameState, customPathPoints, handleStartWave]);

  // Second-based timer for waves
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    
    const timerId = setInterval(() => {
      setGameState(prev => {
        if (!prev.waveActive && prev.lives > 0 && prev.status === 'playing') {
          if (prev.waveTimer <= 1) {
            handleStartWave();
            return { ...prev, waveTimer: GAME_CONFIG.WAVE_TIMER_DURATION };
          }
          return { ...prev, waveTimer: prev.waveTimer - 1 };
        }
        return prev;
      });
    }, 1000 / gameState.gameSpeed); // Timer respects game speed

    return () => clearInterval(timerId);
  }, [handleStartWave, setGameState, gameState.gameSpeed, gameState.status]);

  useEffect(() => {
    lastFrameTimeRef.current = 0; // Reset last frame time on speed change to prevent jumps
  }, [gameState.gameSpeed]);

  useEffect(() => {
    const animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameLoop]);
}
