import type { TowerData, EnemyData, LevelData, TowerId, EnemyId } from './types';
import placeholderData from './placeholder-images.json';

const towerPlaceholders = new Map(placeholderData.placeholderImages.map(p => [p.id, p]));

const getTowerIcon = (id: string) => {
  const placeholder = towerPlaceholders.get(id);
  return {
    iconUrl: placeholder?.imageUrl || `https://picsum.photos/seed/${id}/64/64`,
    iconHint: placeholder?.imageHint || 'icon'
  };
};

export const GAME_CONFIG = {
  GRID_WIDTH: 1200,
  GRID_HEIGHT: 800,
  GRID_COLS: 30,
  GRID_ROWS: 20,
  CELL_WIDTH: 40,
  CELL_HEIGHT: 40,
  STARTING_LIVES: 20,
  STARTING_MONEY: 250,
  WAVE_TIMER_DURATION: 10,
};

export const TOWERS: Record<string, TowerData> = {
    // Basic Towers
    turret: { id: 'turret', name: 'Turret', cost: 50, range: 120, damage: 10, rate: 40, ...getTowerIcon('turret_icon') },
    sniper: { id: 'sniper', name: 'Sniper', cost: 100, range: 250, damage: 40, rate: 100, ...getTowerIcon('sniper_icon') },
    blaster: { id: 'blaster', name: 'Blaster', cost: 150, range: 90, damage: 5, rate: 10, ...getTowerIcon('blaster_icon') },
    bomber: { id: 'bomber', name: 'Bomber', cost: 200, range: 140, damage: 20, rate: 80, splash: 50, ...getTowerIcon('bomber_icon') },
    rapid_fire: { id: 'rapid_fire', name: 'Rapid', cost: 75, range: 100, damage: 3, rate: 8, ...getTowerIcon('rapid_fire_icon') },

    // NEW: US Military Towers
    m4_trooper: { id: 'm4_trooper', name: 'M4 Trooper', cost: 100, range: 120, damage: 15, rate: 30, ...getTowerIcon('m4_trooper_icon') },
    barrett_50: { id: 'barrett_50', name: 'Barrett .50', cost: 350, range: 400, damage: 150, rate: 120, ...getTowerIcon('barrett_50_icon') },
    m2_browning: { id: 'm2_browning', name: 'M2 Browning', cost: 250, range: 180, damage: 25, rate: 10, ...getTowerIcon('m2_browning_icon') },
    m1_abrams: { id: 'm1_abrams', name: 'M1 Abrams', cost: 600, range: 250, damage: 80, rate: 80, splash: 60, ...getTowerIcon('m1_abrams_icon') },
    apache: { id: 'apache', name: 'Apache', cost: 800, range: 300, damage: 40, rate: 15, splash: 30, ...getTowerIcon('apache_icon') },
    patriot: { id: 'patriot', name: 'Patriot', cost: 1200, range: 500, damage: 300, rate: 200, splash: 100, ...getTowerIcon('patriot_icon') },
    ciws: { id: 'ciws', name: 'CIWS Phalanx', cost: 1500, range: 220, damage: 8, rate: 1, ...getTowerIcon('ciws_icon') }, // Rate 1 = Insane fire rate
    javelin: { id: 'javelin', name: 'Javelin Team', cost: 400, range: 300, damage: 120, rate: 150, type: 'javelin', ...getTowerIcon('javelin_icon') },
    ac130: { id: 'ac130', name: 'AC-130', cost: 3000, range: 600, damage: 50, rate: 10, type: 'ac130', ...getTowerIcon('ac130_icon') },
    commando: { id: 'commando', name: 'Commando', cost: 600, range: 150, damage: 30, rate: 20, type: 'commando', ...getTowerIcon('commando_icon') },

    // NEW: International Military
    s400: { id: 's400', name: 'S-400 Triumf', cost: 1800, range: 550, damage: 350, rate: 180, splash: 120, ...getTowerIcon('s400_icon') },
    challenger2: { id: 'challenger2', name: 'Challenger 2', cost: 700, range: 280, damage: 90, rate: 90, splash: 65, ...getTowerIcon('challenger2_icon') },
    caesar: { id: 'caesar', name: 'CAESAR Artillery', cost: 900, range: 400, damage: 120, rate: 110, splash: 85, ...getTowerIcon('caesar_icon') },
    leopard2: { id: 'leopard2', name: 'Leopard 2', cost: 750, range: 270, damage: 95, rate: 85, splash: 70, ...getTowerIcon('leopard2_icon') },
    irondome: { id: 'irondome', name: 'Iron Dome', cost: 2000, range: 500, damage: 280, rate: 120, type: 'irondome', ...getTowerIcon('irondome_icon') },
    type99: { id: 'type99', name: 'Type 99', cost: 650, range: 260, damage: 85, rate: 80, splash: 60, ...getTowerIcon('type99_icon') },
    type10: { id: 'type10', name: 'Type 10', cost: 800, range: 290, damage: 100, rate: 75, splash: 75, ...getTowerIcon('type10_icon') },

    // NEW: National Animal Turrets
    eagle_usa: { id: 'eagle_usa', name: 'Bald Eagle', cost: 500, range: 280, damage: 40, rate: 35, type: 'eagle', speed: 1.5, ...getTowerIcon('eagle_usa_icon') },
    panda_china: { id: 'panda_china', name: 'Giant Panda', cost: 450, range: 140, damage: 60, rate: 100, type: 'panda', stun: 40, ...getTowerIcon('panda_china_icon') },
    bear_russia: { id: 'bear_russia', name: 'Brown Bear', cost: 700, range: 120, damage: 100, rate: 120, type: 'bear', knockback: 30, ...getTowerIcon('bear_russia_icon') },
    tiger_india: { id: 'tiger_india', name: 'Bengal Tiger', cost: 800, range: 150, damage: 110, rate: 60, type: 'tiger', crit: 2.0, ...getTowerIcon('tiger_india_icon') },
    kangaroo_aus: { id: 'kangaroo_aus', name: 'Kangaroo', cost: 400, range: 180, damage: 35, rate: 25, type: 'kangaroo', multishot: 2, ...getTowerIcon('kangaroo_aus_icon') },
    beaver_canada: { id: 'beaver_canada', name: 'Beaver', cost: 350, range: 130, damage: 25, rate: 80, type: 'beaver', slow: 0.6, ...getTowerIcon('beaver_canada_icon') },
    lion_uk: { id: 'lion_uk', name: 'Lion', cost: 900, range: 160, damage: 120, rate: 90, type: 'lion', splash: 40, ...getTowerIcon('lion_uk_icon') },
    dragon_wales: { id: 'dragon_wales', name: 'Welsh Dragon', cost: 1200, range: 200, damage: 150, rate: 100, type: 'dragon', burn: 5, splash: 80, ...getTowerIcon('dragon_wales_icon') },

    // NEW: Advanced Support
    barracks: { id: 'barracks', name: 'Barracks', cost: 500, range: 100, rate: 600, type: 'barracks', ...getTowerIcon('barracks_icon') }, // Spawns troops
    missile_silo: { id: 'missile_silo', name: 'Missile Silo', cost: 2000, range: 800, damage: 1000, rate: 400, splash: 150, ...getTowerIcon('missile_silo_icon') },
    a10_warthog: { id: 'a10_warthog', name: 'A-10 Strike', cost: 2500, range: 1000, damage: 500, rate: 600, type: 'a10', ...getTowerIcon('a10_warthog_icon') },

    // Legacy Towers (Optional, kept for compatibility or can be removed)
    ballista: { id: 'ballista', name: 'Ballista', cost: 300, range: 280, damage: 120, rate: 100, pierce: 3, ...getTowerIcon('ballista_icon') },

    // Status Effect Towers
    ice: { id: 'ice', name: 'Ice', cost: 125, range: 130, damage: 5, rate: 60, slow: 0.5, ...getTowerIcon('ice_icon') },
    poison: { id: 'poison', name: 'Poison', cost: 175, range: 110, damage: 2, rate: 50, poison: 3, ...getTowerIcon('poison_icon') },

    // Advanced Towers
    laser: { id: 'laser', name: 'Laser', cost: 250, range: 300, damage: 50, rate: 80, laser: true, ...getTowerIcon('laser_icon') },
    tesla: { id: 'tesla', name: 'Tesla', cost: 300, range: 150, damage: 15, rate: 60, chain: 3, ...getTowerIcon('tesla_icon') },
    rocket: { id: 'rocket', name: 'Rocket', cost: 400, range: 200, damage: 40, rate: 120, splash: 80, ...getTowerIcon('rocket_icon') },

    // NEW: Elemental Towers
    flame: { id: 'flame', name: 'Flame', cost: 180, range: 100, damage: 8, rate: 15, burn: 2, ...getTowerIcon('flame_icon') },
    storm: { id: 'storm', name: 'Storm', cost: 220, range: 180, damage: 12, rate: 70, stun: 30, ...getTowerIcon('storm_icon') },
    earth: { id: 'earth', name: 'Earth', cost: 160, range: 120, damage: 18, rate: 90, splash: 40, ...getTowerIcon('earth_icon') },
    wind: { id: 'wind', name: 'Wind', cost: 140, range: 200, damage: 6, rate: 30, knockback: 20, ...getTowerIcon('wind_icon') },

    // NEW: Support Towers
    buff: { id: 'buff', name: 'Buffer', cost: 200, range: 150, damage: 0, rate: 120, buffRange: 100, buffDamage: 1.5, ...getTowerIcon('buff_icon') },
    heal: { id: 'heal', name: 'Healer', cost: 250, range: 140, damage: 0, rate: 90, healAmount: 10, ...getTowerIcon('heal_icon') },
    slow: { id: 'slow', name: 'Slower', cost: 130, range: 160, damage: 1, rate: 60, slowArea: 80, slowFactor: 0.3, ...getTowerIcon('slow_icon') },

    // NEW: Special Mechanic Towers
    minigun: { id: 'minigun', name: 'Minigun', cost: 190, range: 110, damage: 2, rate: 5, ...getTowerIcon('minigun_icon') },
    railgun: { id: 'railgun', name: 'Railgun', cost: 350, range: 400, damage: 80, rate: 150, pierce: 3, ...getTowerIcon('railgun_icon') },
    mortar: { id: 'mortar', name: 'Mortar', cost: 280, range: 250, damage: 35, rate: 100, splash: 90, ...getTowerIcon('mortar_icon') },
    gatling: { id: 'gatling', name: 'Gatling', cost: 220, range: 130, damage: 4, rate: 6, ...getTowerIcon('gatling_icon') },

    // NEW: Exotic Towers
    plasma: { id: 'plasma', name: 'Plasma', cost: 320, range: 170, damage: 25, rate: 70, melt: 0.7, ...getTowerIcon('plasma_icon') },
    quantum: { id: 'quantum', name: 'Quantum', cost: 450, range: 200, damage: 30, rate: 80, teleport: true, ...getTowerIcon('quantum_icon') },
    gravity: { id: 'gravity', name: 'Gravity', cost: 380, range: 180, damage: 15, rate: 90, pull: 15, ...getTowerIcon('gravity_icon') },
    void: { id: 'void', name: 'Void', cost: 500, range: 150, damage: 50, rate: 120, drain: 5, ...getTowerIcon('void_icon') },

    // NEW: Area Control Towers
    mine: { id: 'mine', name: 'Mine Layer', cost: 170, range: 100, damage: 40, rate: 200, mines: true, ...getTowerIcon('mine_icon') },
    wall: { id: 'wall', name: 'Wall Gun', cost: 90, range: 80, damage: 12, rate: 50, barrier: true, ...getTowerIcon('wall_icon') },
    spike: { id: 'spike', name: 'Spike Trap', cost: 110, range: 90, damage: 25, rate: 80, melee: true, ...getTowerIcon('spike_icon') },

    // NEW: Ultimate Towers
    nuke: { id: 'nuke', name: 'Nuke', cost: 600, range: 220, damage: 100, rate: 300, splash: 150, radiation: 5, ...getTowerIcon('nuke_icon') },
    omega: { id: 'omega', name: 'Omega', cost: 800, range: 250, damage: 60, rate: 60, chain: 5, splash: 60, ...getTowerIcon('omega_icon') },
    titan: { id: 'titan', name: 'Titan', cost: 700, range: 200, damage: 80, rate: 100, pierce: 5, splash: 70, ...getTowerIcon('titan_icon') },

    // NEW: Unique Mechanic Towers
    mirror: { id: 'mirror', name: 'Mirror', cost: 240, range: 160, damage: 20, rate: 70, reflect: true, ...getTowerIcon('mirror_icon') },
    vampire: { id: 'vampire', name: 'Vampire', cost: 260, range: 140, damage: 18, rate: 80, lifesteal: 0.5, ...getTowerIcon('vampire_icon') },
    swarm: { id: 'swarm', name: 'Swarm', cost: 210, range: 150, damage: 3, rate: 20, multishot: 5, ...getTowerIcon('swarm_icon') },
    orbital: { id: 'orbital', name: 'Orbital', cost: 420, range: 300, damage: 45, rate: 90, satellite: true, ...getTowerIcon('orbital_icon') },

    // NEW: Cosmic/Magic Towers
    timewarp: { id: 'timewarp', name: 'Time Warp', cost: 550, range: 250, damage: 0, rate: 300, type: 'timewarp', duration: 120, ...getTowerIcon('timewarp_icon') },
    necromancer: { id: 'necromancer', name: 'Necromancer', cost: 650, range: 180, damage: 10, rate: 60, type: 'necromancer', ...getTowerIcon('necromancer_icon') },
    blackhole: { id: 'blackhole', name: 'Black Hole', cost: 900, range: 200, damage: 200, rate: 400, type: 'blackhole', pullForce: 5, ...getTowerIcon('blackhole_icon') }
};


const baseHp = (wave: number) => 10 + wave * 2;

export const ENEMIES: Record<string, EnemyData> = {
  troop: { id: 'troop', name: 'Troop', speed: 1.0, baseHp: 10, hp: baseHp, color: 'red', flying: false, size: { width: 10, height: 10 } },
  humvee: { id: 'humvee', name: 'Humvee', speed: 2.0, baseHp: 25, hp: (w) => baseHp(w) * 2.5, color: '#1565C0', flying: false, size: { width: 25, height: 18 } },
  tank: { id: 'tank', name: 'Tank', speed: 0.6, baseHp: 80, hp: (w) => baseHp(w) * 8.0, color: 'green', flying: false, size: { width: 35, height: 25 } },
  reindeer: { id: 'reindeer', name: 'Reindeer', speed: 1.8, baseHp: 8, hp: (w) => baseHp(w) * 0.8, color: '#795548', flying: false, size: { width: 10, height: 10 } },
};

export const LEVELS: LevelData[] = [
  { level: 1, name: "Winding Path", path: [ {x:0,y:4},{x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4},{x:4,y:5},{x:4,y:6},{x:3,y:6},{x:2,y:6},{x:2,y:7},{x:2,y:8},{x:2,y:9},{x:3,y:9},{x:4,y:9},{x:5,y:9},{x:6,y:9},{x:6,y:8},{x:6,y:7},{x:6,y:6},{x:7,y:6},{x:8,y:6},{x:9,y:6},{x:10,y:6},{x:11,y:6},{x:12,y:6},{x:12,y:7},{x:12,y:8},{x:12,y:9},{x:12,y:10},{x:12,y:11},{x:13,y:11},{x:14,y:11},{x:15,y:11},{x:16,y:11},{x:17,y:11},{x:18,y:11},{x:19,y:11},{x:20,y:11},{x:21,y:11},{x:22,y:11},{x:22,y:10},{x:22,y:9},{x:22,y:8},{x:21,y:8},{x:20,y:8},{x:19,y:8},{x:18,y:8},{x:18,y:7},{x:18,y:6},{x:18,y:5},{x:18,y:4},{x:19,y:4},{x:20,y:4},{x:21,y:4},{x:22,y:4},{x:23,y:4},{x:24,y:4},{x:25,y:4},{x:26,y:4},{x:27,y:4},{x:28,y:4},{x:29,y:4} ]},
  { level: 2, name: "Complex Path", path: [] },
];

function rasterizePath(pathPoints: {x:number, y:number}[]) {
    const path = [];
    if (pathPoints.length === 0) return [];
    let current = pathPoints[0];
    path.push({ ...current });

    for (let i = 1; i < pathPoints.length; i++) {
        const next = pathPoints[i];
        while (current.x !== next.x || current.y !== next.y) {
            if (current.x < next.x) current.x++;
            else if (current.x > next.x) current.x--;
            else if (current.y < next.y) current.y++;
            else if (current.y > next.y) current.y--;
            path.push({ ...current });
        }
    }
    return path;
}

const complexPathPoints = [
    { x: 0, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 15 }, { x: 12, y: 15 },
    { x: 12, y: 4 }, { x: 20, y: 4 }, { x: 20, y: 12 }, { x: 15, y: 12 },
    { x: 15, y: 17 }, { x: 25, y: 17 }, { x: 25, y: 8 }, { x: 29, y: 8 }
];
LEVELS[1].path = rasterizePath(complexPathPoints);


export const ENEMIES_BY_WAVE: Record<number, EnemyId[]> = {
    1: ['troop', 'troop', 'troop', 'troop', 'troop'],
    2: ['troop', 'troop', 'reindeer', 'troop', 'reindeer'],
    3: ['reindeer', 'reindeer', 'humvee'],
    4: ['humvee', 'humvee', 'humvee'],
    5: ['humvee', 'humvee', 'tank'],
    6: ['tank', 'tank', 'humvee'],
    7: ['tank', 'tank', 'tank'],
};
