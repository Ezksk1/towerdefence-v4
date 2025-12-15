
"use client";

import { useEffect, useRef, useCallback, type MutableRefObject } from "react";
import type { GameState, ActiveEnemy, PlacedTower, Projectile, Soldier, Plane } from "@/lib/types";
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



const MAX_STEPS_PER_FRAME = 10; // Cap to prevent freezing

// Pure simulation step function
function updateGameStep(
    prev: GameState,
    customPathPoints: { x: number, y: number }[],
    enemiesToSpawnRef: MutableRefObject<string[]>
): GameState {

    // If the speed changed, this logical step still runs identically
    if (prev.status !== 'playing' || prev.lives <= 0) {
        return prev.lives <= 0 ? { ...prev, status: 'game-over' } : prev;
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

    if (!currentPath) {
        return prev;
    }

    const updatedEnemies = prev.enemies.map(enemy => {
        let newEnemy = { ...enemy };

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
        const targetX = targetNode.x * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH / 2;
        const targetY = targetNode.y * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT / 2;

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
    let newPlanes = [...(prev.planes || [])];

    const atcActive = prev.towers.some(t => t.id === 'sr71');
    const updatedTowers = prev.towers.map(tower => {
        let newTower = { ...tower };
        if (newTower.cooldown > 0) {
            newTower.cooldown--;
        }

        // --- RADIO AIRSTRIKE MECHANIC ---
        // Troops can call in airstrikes periodically
        if (newTower.id === 'm4_trooper' || newTower.id === 'commando') {
            // Initialize mechanic if not present
            if (newTower.lastAirstrike === undefined) newTower.lastAirstrike = 600;

            if (newTower.lastAirstrike > 0) {
                newTower.lastAirstrike--;
            }

            if (newTower.lastAirstrike <= 0) {
                // REQUIREMENT: Must have Air Support (Airbase/Hangar or ATC) to call strike
                const hasAirSupport = prev.towers.some(t =>
                    t.type?.includes('jet') ||
                    t.id === 'sr71' ||
                    t.type === 'flight_sim'
                );

                if (hasAirSupport) {
                    // Try to call airstrike
                    const strikeTargets = updatedEnemies.filter(e => Math.hypot(e.x - newTower.x, e.y - newTower.y) <= newTower.range * 1.5);
                    if (strikeTargets.length > 0) {
                        const strikeTarget = strikeTargets[0];
                        newProjectiles.push({
                            id: crypto.randomUUID(),
                            x: strikeTarget.x + (Math.random() * 40 - 20),
                            y: -50,
                            target: strikeTarget,
                            speed: 15,
                            damage: 150,
                            splash: 30,
                            active: true,
                            config: { ...newTower, type: 'drone_strike' },
                            type: 'a10_strafe'
                        });

                        // Spawn A-10 Plane Visual (Real Sim)
                        newPlanes.push({
                            id: crypto.randomUUID(),
                            x: -100,
                            y: strikeTarget.y,
                            start: { x: -100, y: strikeTarget.y },
                            target: { x: GAME_CONFIG.GRID_WIDTH + 100, y: strikeTarget.y }, // Fly across map
                            speed: 8,
                            status: 'outbound',
                            type: 'a10_warthog',
                            payloadTimer: 0,
                            config: newTower
                        });

                        newTower.lastAirstrike = atcActive ? 300 : 900;
                    }
                } else {
                    // No air support available, wait a bit before checking again
                    newTower.lastAirstrike = 60; // Check again in 1s
                }
            }
        }
        // -------------------------------

        if (newTower.id === 'gingerbread_barracks') {
            if (newTower.cooldown <= 0) {
                // We can't directly modify 'newMoney' here easily as it's outside the map, 
                // BUT we can't modify the state directly in map using setGameState.
                // However, we are in updateGameStep which returns a new state.
                // 'newMoney' IS defined in scope at line 46!
                newMoney += 25; // Generate Cookie Money
                newTower.cooldown = newTower.rate;
            }
        }

        if (newTower.cooldown <= 0) {
            const findTargets = (center: PlacedTower, enemies: ActiveEnemy[], count: number) => {
                return enemies.filter(e => Math.hypot(e.x - center.x, e.y - center.y) <= center.range)
                    .sort((a, b) => Math.hypot(a.x - center.x, a.y - center.y) - Math.hypot(b.x - center.x, b.y - center.y))
                    .slice(0, count);
            };

            const mainTargets = findTargets(newTower, updatedEnemies, 1);

            if (mainTargets.length > 0) {
                const mainTarget = mainTargets[0];
                newTower.angle = Math.atan2(mainTarget.y - newTower.y, mainTarget.x - newTower.x);

                let chainTargets: ActiveEnemy[] = [];
                if (newTower.chain) {
                    const potentialChainTargets = updatedEnemies.filter(e => e.idInGame !== mainTarget.idInGame && Math.hypot(e.x - mainTarget.x, e.y - mainTarget.y) <= 100);
                    chainTargets = findTargets({ ...newTower, x: mainTarget.x, y: mainTarget.y }, potentialChainTargets, newTower.chain - 1);
                }

                let projectileType = 'bullet';
                const tId = newTower.id?.toString().toLowerCase() || '';
                if (tId.includes('missile') || tId.includes('rocket') || tId.includes('javelin') || tId.includes('patriot') || tId.includes('s400')) {
                    projectileType = 'missile';
                } else if (tId.includes('tank') || tId.includes('cannon') || tId.includes('bomber') || tId.includes('artillery') || tId.includes('caesar') || tId.includes('abrams')) {
                    projectileType = 'shell';
                } else if (tId.includes('laser') || tId.includes('blaster') || tId.includes('plasma')) {
                    projectileType = 'energy';
                } else if (tId.includes('jet') || tId.includes('f16') || tId.includes('f15') || tId.includes('f35') || tId.includes('f22')) {
                    // Spawn Plane instead of Projectile
                    newPlanes.push({
                        id: crypto.randomUUID(),
                        x: newTower.x,
                        y: newTower.y,
                        target: { x: mainTarget.x, y: mainTarget.y },
                        start: { x: newTower.x, y: newTower.y },
                        speed: 5,
                        status: 'outbound',
                        type: tId,
                        payloadTimer: 0,
                        config: newTower
                    });
                    newTower.cooldown = newTower.rate * 2; // Longer cooldown for sortie loop
                    projectileType = 'none'; // Skip default projectile
                }

                if (projectileType !== 'none') {
                    newProjectiles.push({
                        id: crypto.randomUUID(),
                        x: newTower.x,
                        y: newTower.y,
                        target: mainTarget,
                        chainTargets: chainTargets,
                        config: newTower,
                        speed: projectileType === 'missile' ? 12 : 8,
                        damage: newTower.damage,
                        splash: newTower.splash || 0,
                        active: true,
                        type: projectileType
                    });
                }
                newTower.cooldown = newTower.rate;
            }
        }
        return newTower;
    });

    // 3. Update Planes (Real Sim Logic)
    // Process Planes
    newPlanes = newPlanes.map(plane => {
        let p = { ...plane };

        // Move Plane
        const dx = p.target.x - p.x;
        const dy = p.target.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < p.speed) {
            // Arrived at destination
            if (p.status === 'outbound') {
                // Determine action based on type
                if (p.type === 'a10_warthog') {
                    // A-10 continues flying to off-screen
                    p.status = 'inbound';
                    p.target = { x: p.start.x < 0 ? GAME_CONFIG.GRID_WIDTH + 100 : -100, y: p.y };
                } else if (p.type === 'b2_bomber') {
                    // B-2 drops a bomb and returns to base
                    p.status = 'inbound';
                    p.target = { x: p.x, y: p.y }; // Detonate at current location

                    // Drop Bomb (create a projectile that immediately explodes)
                    newProjectiles.push({
                        id: crypto.randomUUID(),
                        x: p.x, y: p.y,
                        target: { x: p.x, y: p.y }, // Detonate at current location
                        speed: 0, // Bomb explodes immediately
                        damage: p.config.damage || 1000,
                        splash: p.config.splash || 150,
                        active: true,
                        type: 'bomb_heavy',
                        config: p.config as any
                    });
                    console.log("B-2 Bomber dropped bomb at:", p.x, p.y, "Damage:", (p.config.damage || 1000), "Splash:", (p.config.splash || 150));

                } else if (p.type.includes('bomber')) { // This covers generic bombers and b2_bomber fallback if type includes 'bomber'
                    p.status = 'inbound';
                    p.target = { x: p.x, y: p.y }; // Detonate at current location

                    newProjectiles.push({
                        id: crypto.randomUUID(),
                        x: p.x, y: p.y,
                        target: { x: p.x, y: p.y },
                        speed: 0,
                        damage: p.config.damage || 100,
                        splash: p.config.splash || 20,
                        active: true,
                        type: 'bomb_heavy',
                        config: p.config as any
                    });
                    console.log("Generic Bomber dropped bomb at:", p.x, p.y, "Damage:", (p.config.damage || 100), "Splash:", (p.config.splash || 20));

                } else {
                    // Jet Hangar Sortie - Drop Payload and Return
                    p.status = 'inbound';
                    p.target = { x: p.start.x, y: p.start.y }; // Return to base

                    // Drop Bomb
                    newProjectiles.push({
                        id: crypto.randomUUID(),
                        x: p.x, y: p.y,
                        target: { x: p.x, y: p.y }, // Detonate at current location
                        speed: 0,
                        damage: p.config.damage || 100,
                        splash: p.config.splash || 20,
                        active: true,
                        type: p.type.includes('bomber') ? 'bomb_heavy' : 'missile',
                        config: p.config as any
                    });
                }
            } else if (p.status === 'inbound') {
                // Landed / Left map
                return null; // Remove plane
            }
        } else {
            // Move
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;

            // Strafing Logic for A-10
            if (p.type === 'a10_warthog') {
                if (p.payloadTimer > 0) p.payloadTimer--;
                if (p.payloadTimer <= 0) {
                    // Check for targets under flight path
                    const targets = updatedEnemies.filter(e => Math.hypot(e.x - p.x, e.y - p.y) < 50);
                    if (targets.length > 0) {
                        // BRRRT
                        p.payloadTimer = 5; // Rapid fire
                        targets.forEach(t => {
                            // Instant damage "hitscan" effect from strafing
                            t.currentHp -= 10;
                            // Visual tracer
                            newProjectiles.push({
                                id: crypto.randomUUID(), x: p.x, y: p.y, target: t, speed: 20,
                                damage: 0, splash: 0, active: true, type: 'bullet', config: p.config as any
                            });
                        });
                    }
                }
            }
        }
        return p;
    }).filter(Boolean) as Plane[]; // Filter out nulls (landed planes)

    // 4. Update projectiles, create explosions and apply damage
    const remainingProjectiles = [...newProjectiles];
    let enemiesAfterHits = [...updatedEnemies];
    let newExplosions = prev.explosions ? [...prev.explosions] : [];

    remainingProjectiles.forEach(p => {
        console.log("Processing Projectile:", p.id, "Type:", p.type, "Active:", p.active, "Speed:", p.speed, "Target:", p.target);
        if (!p.active) return;

        let detonationX = p.x;
        let detonationY = p.y;
        let hasDetonated = false;

        // A projectile is an instant-detonation bomb if it has speed 0 and its target is just coordinates (not an enemy)
        const isInstantDetonationProjectile = p.speed === 0 && !('idInGame' in p.target);

        let currentTarget: ActiveEnemy | undefined; // The actual enemy hit or targeted

        if (isInstantDetonationProjectile) {
            // For bombs/missiles that detonate at their current position
            hasDetonated = true;
            detonationX = p.x;
            detonationY = p.y;
            console.log("Instant Detonation Projectile identified at:", p.x, p.y, "Type:", p.type, "Damage:", p.damage, "Splash:", p.splash);

        } else {
            // For projectiles that target a moving enemy
            const pTarget = p.target as ActiveEnemy;
            currentTarget = enemiesAfterHits.find(e => e.idInGame === pTarget.idInGame);

            if (!currentTarget || !currentTarget.active || currentTarget.currentHp <= 0) {
                // Target lost or dead, try to re-acquire if ATC is active and projectile type supports it
                if (atcActive && (p.type === 'missile' || p.type === 'bomb_heavy' || p.type?.includes('strafing'))) {
                    const newTarget = enemiesAfterHits.find(e => e.active && e.currentHp > 0 && Math.hypot(e.x - p.x, e.y - p.y) < 200);
                    if (newTarget) {
                        p.target = newTarget;
                        currentTarget = newTarget;
                        console.log("Projectile re-acquired target:", newTarget.idInGame);
                    } else {
                        p.active = false;
                        console.log("Projectile deactivated: no new target found.", p.id);
                        return; // No new target, deactivate projectile
                    }
                } else {
                    p.active = false;
                    console.log("Projectile deactivated: target lost and no re-acquisition possible.", p.id);
                    return; // No re-acquisition, deactivate projectile
                }
            }

            detonationX = currentTarget.x;
            detonationY = currentTarget.y;

            const dx = currentTarget.x - p.x;
            const dy = currentTarget.y - p.y;
            const dist = Math.hypot(dx, dy);
            const currentProjectileSpeed = p.speed;

            if (dist < currentProjectileSpeed) {
                hasDetonated = true; // Hit the target
                console.log("Projectile hit target:", currentTarget.idInGame);
            } else {
                // Move projectile towards target
                p.x += (dx / dist) * currentProjectileSpeed;
                p.y += (dy / dist) * currentProjectileSpeed;
                console.log("Projectile moving towards target.", p.id, "New Pos:", p.x, p.y);
            }
        }

        if (hasDetonated) {
            p.active = false; // Deactivate projectile on hit/detonation

            // Create explosion if splash or specific type
            if (p.splash > 0 || p.type === 'missile' || p.type === 'shell' || p.type === 'sortie' || p.type === 'a10_strafe' || p.type === 'bomb_heavy') {
                newExplosions.push({
                    id: crypto.randomUUID(),
                    x: detonationX,
                    y: detonationY,
                    radius: p.splash > 0 ? p.splash * 0.1 : 10,
                    maxRadius: p.splash > 0 ? p.splash : 40,
                    life: 0.8,
                    color: p.type === 'energy' ? '#00FFFF' : '#FFA500'
                });
                console.log("Explosion created at:", detonationX, detonationY, "Max Radius:", (p.splash > 0 ? p.splash : 40), "Type:", p.type);
            }

            const applyDamage = (enemyId: string, damage: number) => {
                enemiesAfterHits = enemiesAfterHits.map(enemy => {
                    if (enemy.idInGame === enemyId) {
                        console.log("Applying damage to enemy:", enemyId, "Damage:", damage, "Old HP:", enemy.currentHp);
                        enemy.currentHp -= damage;
                        console.log("New HP:", enemy.currentHp, "Enemy Type:", enemy.type);
                        // Apply Slow (Snowball)
                        if (p.config.slow) {
                            enemy.frozenTimer = 60; // 1 second freeze
                            console.log("Applying slow to enemy:", enemyId);
                        }
                    }
                    return enemy;
                });
            };

            if (p.splash > 0) {
                // Apply splash damage to all enemies within radius
                enemiesAfterHits.forEach(enemy => {
                    if (Math.hypot(enemy.x - detonationX, enemy.y - detonationY) <= p.splash) {
                        applyDamage(enemy.idInGame, p.damage);
                        console.log("Splash damage applied to:", enemy.idInGame, "from projectile:", p.id);
                    }
                });
            } else if (currentTarget) { // Apply single target damage only if there was a specific enemy target
                applyDamage(currentTarget.idInGame, p.damage);
                console.log("Single target damage applied to:", currentTarget.idInGame, "from projectile:", p.id);
                if (p.chainTargets && p.chainTargets.length > 0) {
                    p.chainTargets.forEach(chainTarget => {
                        applyDamage(chainTarget.idInGame, p.damage / 2);
                        console.log("Chain damage applied to:", chainTarget.idInGame);
                    });
                }
            }
        }
    });

    // Update explosions
    newExplosions = newExplosions.map(e => ({
        ...e,
        radius: e.radius + (e.maxRadius - e.radius) * 0.2, // Increase growth rate
        life: e.life - 0.03 // Slow down fading
    })).filter(e => e.life > 0);


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
    let newWaveTimer = prev.waveTimer;

    if (prev.waveActive) {
        if (finalEnemies.length === 0 && enemiesToSpawnRef.current.length === 0) {
            newWaveActive = false;
            newWave++;
            newMoney += 100 + (prev.wave * 10);
        }
    } else {
        // Decrement timer if wave not active
        if (newWaveTimer > 0) {
            newWaveTimer -= (FRAME_TIME / 1000);
        }
    }

    return {
        ...prev,
        lives: Math.max(0, newLives), // Prevent negative lives
        money: newMoney,
        wave: newWave,
        waveActive: newWaveActive,
        enemies: finalEnemies,
        towers: updatedTowers,
        projectiles: remainingProjectiles.filter(p => p.active),
        explosions: newExplosions,
        soldiers: newSoldiers,
        planes: newPlanes,
        waveTimer: newWaveTimer,
    };
}


export function useGameLoop(
    gameState: GameState,
    setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    handleStartWave: () => void,
    customPathPoints: { x: number, y: number }[],
    enemiesToSpawnRef: MutableRefObject<string[]>
) {
    const lastFrameTimeRef = useRef<number>(0);
    const gameTimeRef = useRef<number>(0);

    const gameLoop = useCallback((timestamp: number) => {
        if (lastFrameTimeRef.current === 0) {
            lastFrameTimeRef.current = timestamp;
        }

        let deltaTime = timestamp - lastFrameTimeRef.current;
        lastFrameTimeRef.current = timestamp;

        if (gameState.status !== "playing") {
            frameIdRef.current = requestAnimationFrame(gameLoop);
            return;
        }

        // Apply game speed to delta time
        // Cap deltaTime to avoid massive jumps after background throttling
        if (deltaTime > 100) deltaTime = 100;

        deltaTime *= gameState.gameSpeed;
        gameTimeRef.current += deltaTime;

        // Perform Batched Updates
        setGameState(prev => {
            let currentState = prev;
            let steps = 0;

            // Consume accumulated time in fixed steps
            while (gameTimeRef.current >= FRAME_TIME && steps < MAX_STEPS_PER_FRAME) {
                currentState = updateGameStep(currentState, customPathPoints, enemiesToSpawnRef);
                gameTimeRef.current -= FRAME_TIME;
                steps++;
            }

            // If we hit the step limit, discard remaining time to prevent spiral of death
            if (steps >= MAX_STEPS_PER_FRAME) {
                gameTimeRef.current = 0;
            }

            return currentState;
        });

        frameIdRef.current = requestAnimationFrame(gameLoop);
    }, [gameState.status, gameState.gameSpeed, setGameState, customPathPoints, enemiesToSpawnRef]);

    // Wave timer check is now handled in the main loop or via a simple check here since we removed the interval
    // but updateGameStep handles the state. To trigger the callback, we check the state.
    useEffect(() => {
        if (!gameState.waveActive && gameState.lives > 0 && gameState.status === 'playing' && gameState.waveTimer <= 0) {
            handleStartWave();
            // Reset timer immediately to prevent multiple calls, though handleStartWave sets waveActive true
            setGameState(prev => ({ ...prev, waveTimer: GAME_CONFIG.WAVE_TIMER_DURATION }));
        }
    }, [gameState.waveTimer, gameState.waveActive, gameState.lives, gameState.status, handleStartWave, setGameState]);

    useEffect(() => {
        lastFrameTimeRef.current = 0; // Reset last frame time on speed change to prevent jumps
    }, [gameState.gameSpeed]);

    const frameIdRef = useRef<number>(0);

    useEffect(() => {
        frameIdRef.current = requestAnimationFrame(gameLoop);
        return () => {
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
            }
        };
    }, [gameLoop]);
}

