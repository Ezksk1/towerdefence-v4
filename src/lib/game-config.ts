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
  WAVE_TIMER_DURATION: 15,
};

export const TOWERS: Record<TowerId, TowerData> = {
    turret: { id: 'turret', name: 'Turret', cost: 50, range: 120, damage: 10, rate: 40, color: '#4CAF50', ...getTowerIcon('turret_icon') },
    sniper: { id: 'sniper', name: 'Sniper', cost: 100, range: 250, damage: 40, rate: 100, color: '#2196F3', ...getTowerIcon('sniper_icon') },
    blaster: { id: 'blaster', name: 'Blaster', cost: 150, range: 90, damage: 5, rate: 10, color: '#FF9800', ...getTowerIcon('blaster_icon') },
    bomber: { id: 'bomber', name: 'Bomber', cost: 200, range: 140, damage: 20, rate: 80, color: '#F44336', splash: 50, ...getTowerIcon('bomber_icon') },
    rapid_fire: { id: 'rapid_fire', name: 'Rapid', cost: 75, range: 100, damage: 3, rate: 8, color: '#FFEB3B', ...getTowerIcon('rapid_fire_icon') },
    m4_trooper: { id: 'm4_trooper', name: 'M4 Trooper', cost: 100, range: 120, damage: 15, rate: 30, color: '#795548', ...getTowerIcon('m4_trooper_icon') },
    barrett_50: { id: 'barrett_50', name: 'Barrett .50', cost: 350, range: 400, damage: 150, rate: 120, color: '#3E2723', ...getTowerIcon('barrett_50_icon') },
    m2_browning: { id: 'm2_browning', name: 'M2 Browning', cost: 250, range: 180, damage: 25, rate: 10, color: '#212121', ...getTowerIcon('m2_browning_icon') },
    m1_abrams: { id: 'm1_abrams', name: 'M1 Abrams', cost: 600, range: 250, damage: 80, rate: 80, color: '#4CAF50', splash: 60, ...getTowerIcon('m1_abrams_icon') },
    apache: { id: 'apache', name: 'Apache', cost: 800, range: 300, damage: 40, rate: 15, color: '#607D8B', splash: 30, ...getTowerIcon('apache_icon') },
    patriot: { id: 'patriot', name: 'Patriot', cost: 1200, range: 500, damage: 300, rate: 200, color: '#1A237E', splash: 100, ...getTowerIcon('patriot_icon') },
    ciws: { id: 'ciws', name: 'CIWS Phalanx', cost: 1500, range: 220, damage: 8, rate: 1, color: '#ECEFF1', ...getTowerIcon('ciws_icon') },
    javelin: { id: 'javelin', name: 'Javelin Team', cost: 400, range: 300, damage: 120, rate: 150, color: '#4E342E', type: 'javelin', ...getTowerIcon('javelin_icon') },
    ac130: { id: 'ac130', name: 'AC-130', cost: 3000, range: 600, damage: 50, rate: 10, color: '#37474F', type: 'ac130', ...getTowerIcon('ac130_icon') },
    commando: { id: 'commando', name: 'Commando', cost: 600, range: 150, damage: 30, rate: 20, color: '#1B5E20', type: 'commando', ...getTowerIcon('commando_icon') },
    s400: { id: 's400', name: 'S-400 Triumf', cost: 1800, range: 550, damage: 350, rate: 180, color: '#8B0000', splash: 120, ...getTowerIcon('s400_icon') },
    challenger2: { id: 'challenger2', name: 'Challenger 2', cost: 700, range: 280, damage: 90, rate: 90, color: '#556B2F', splash: 65, ...getTowerIcon('challenger2_icon') },
    caesar: { id: 'caesar', name: 'CAESAR Artillery', cost: 900, range: 400, damage: 120, rate: 110, color: '#191970', splash: 85, ...getTowerIcon('caesar_icon') },
    leopard2: { id: 'leopard2', name: 'Leopard 2', cost: 750, range: 270, damage: 95, rate: 85, color: '#2F4F4F', splash: 70, ...getTowerIcon('leopard2_icon') },
    irondome: { id: 'irondome', name: 'Iron Dome', cost: 2000, range: 500, damage: 280, rate: 120, color: '#4169E1', type: 'irondome', ...getTowerIcon('irondome_icon') },
    type99: { id: 'type99', name: 'Type 99', cost: 650, range: 260, damage: 85, rate: 80, color: '#DC143C', splash: 60, ...getTowerIcon('type99_icon') },
    type10: { id: 'type10', name: 'Type 10', cost: 800, range: 290, damage: 100, rate: 75, color: '#696969', splash: 75, ...getTowerIcon('type10_icon') },
    eagle_usa: { id: 'eagle_usa', name: 'Bald Eagle', cost: 500, range: 280, damage: 40, rate: 35, color: '#003366', type: 'eagle', speed: 1.5, ...getTowerIcon('eagle_usa_icon') },
    panda_china: { id: 'panda_china', name: 'Giant Panda', cost: 450, range: 140, damage: 60, rate: 100, color: '#000', type: 'panda', stun: 40, ...getTowerIcon('panda_china_icon') },
    bear_russia: { id: 'bear_russia', name: 'Brown Bear', cost: 700, range: 120, damage: 100, rate: 120, color: '#654321', type: 'bear', knockback: 30, ...getTowerIcon('bear_russia_icon') },
    tiger_india: { id: 'tiger_india', name: 'Bengal Tiger', cost: 800, range: 150, damage: 110, rate: 60, color: '#FF8C00', type: 'tiger', crit: 2.0, ...getTowerIcon('tiger_india_icon') },
    kangaroo_aus: { id: 'kangaroo_aus', name: 'Kangaroo', cost: 400, range: 180, damage: 35, rate: 25, color: '#FFD700', type: 'kangaroo', multishot: 2, ...getTowerIcon('kangaroo_aus_icon') },
    beaver_canada: { id: 'beaver_canada', name: 'Beaver', cost: 350, range: 130, damage: 25, rate: 80, color: '#8B4513', type: 'beaver', slow: 0.6, ...getTowerIcon('beaver_canada_icon') },
    lion_uk: { id: 'lion_uk', name: 'Lion', cost: 900, range: 160, damage: 120, rate: 90, color: '#B8860B', type: 'lion', splash: 40, ...getTowerIcon('lion_uk_icon') },
    dragon_wales: { id: 'dragon_wales', name: 'Welsh Dragon', cost: 1200, range: 200, damage: 150, rate: 100, color: '#DC143C', type: 'dragon', burn: 5, splash: 80, ...getTowerIcon('dragon_wales_icon') },
    barracks: { id: 'barracks', name: 'Barracks', cost: 500, range: 100, rate: 600, color: '#558B2F', type: 'barracks', ...getTowerIcon('barracks_icon') },
    missile_silo: { id: 'missile_silo', name: 'Missile Silo', cost: 2000, range: 800, damage: 1000, rate: 400, color: '#37474F', splash: 150, ...getTowerIcon('missile_silo_icon') },
    a10_warthog: { id: 'a10_warthog', name: 'A-10 Strike', cost: 2500, range: 1000, damage: 500, rate: 600, color: '#455A64', type: 'a10', ...getTowerIcon('a10_warthog_icon') },
    ballista: { id: 'ballista', name: 'Ballista', cost: 300, range: 280, damage: 120, rate: 100, color: '#8D6E63', pierce: 3, ...getTowerIcon('ballista_icon') },
    ice: { id: 'ice', name: 'Ice', cost: 125, range: 130, damage: 5, rate: 60, color: '#00BCD4', slow: 0.5, ...getTowerIcon('ice_icon') },
    poison: { id: 'poison', name: 'Poison', cost: 175, range: 110, damage: 2, rate: 50, color: '#9C27B0', poison: 3, ...getTowerIcon('poison_icon') },
    laser: { id: 'laser', name: 'Laser', cost: 250, range: 300, damage: 50, rate: 80, color: '#E91E63', laser: true, ...getTowerIcon('laser_icon') },
    tesla: { id: 'tesla', name: 'Tesla', cost: 300, range: 150, damage: 15, rate: 60, color: '#3F51B5', chain: 3, ...getTowerIcon('tesla_icon') },
    rocket: { id: 'rocket', name: 'Rocket', cost: 400, range: 200, damage: 40, rate: 120, color: '#607D8B', splash: 80, ...getTowerIcon('rocket_icon') },
    flame: { id: 'flame', name: 'Flame', cost: 180, range: 100, damage: 8, rate: 15, color: '#FF5722', burn: 2, ...getTowerIcon('flame_icon') },
    storm: { id: 'storm', name: 'Storm', cost: 220, range: 180, damage: 12, rate: 70, color: '#00E5FF', stun: 30, ...getTowerIcon('storm_icon') },
    earth: { id: 'earth', name: 'Earth', cost: 160, range: 120, damage: 18, rate: 90, color: '#795548', splash: 40, ...getTowerIcon('earth_icon') },
    wind: { id: 'wind', name: 'Wind', cost: 140, range: 200, damage: 6, rate: 30, color: '#B2DFDB', knockback: 20, ...getTowerIcon('wind_icon') },
    buff: { id: 'buff', name: 'Buffer', cost: 200, range: 150, damage: 0, rate: 120, color: '#FFD700', buffRange: 100, buffDamage: 1.5, ...getTowerIcon('buff_icon') },
    heal: { id: 'heal', name: 'Healer', cost: 250, range: 140, damage: 0, rate: 90, color: '#76FF03', healAmount: 10, ...getTowerIcon('heal_icon') },
    slow: { id: 'slow', name: 'Slower', cost: 130, range: 160, damage: 1, rate: 60, color: '#80DEEA', slowArea: 80, slowFactor: 0.3, ...getTowerIcon('slow_icon') },
    minigun: { id: 'minigun', name: 'Minigun', cost: 190, range: 110, damage: 2, rate: 5, color: '#FF6F00', ...getTowerIcon('minigun_icon') },
    railgun: { id: 'railgun', name: 'Railgun', cost: 350, range: 400, damage: 80, rate: 150, color: '#1A237E', pierce: 3, ...getTowerIcon('railgun_icon') },
    mortar: { id: 'mortar', name: 'Mortar', cost: 280, range: 250, damage: 35, rate: 100, color: '#6D4C41', splash: 90, ...getTowerIcon('mortar_icon') },
    gatling: { id: 'gatling', name: 'Gatling', cost: 220, range: 130, damage: 4, rate: 6, color: '#F57F17', ...getTowerIcon('gatling_icon') },
    plasma: { id: 'plasma', name: 'Plasma', cost: 320, range: 170, damage: 25, rate: 70, color: '#00BFA5', melt: 0.7, ...getTowerIcon('plasma_icon') },
    quantum: { id: 'quantum', name: 'Quantum', cost: 450, range: 200, damage: 30, rate: 80, color: '#7C4DFF', teleport: true, ...getTowerIcon('quantum_icon') },
    gravity: { id: 'gravity', name: 'Gravity', cost: 380, range: 180, damage: 15, rate: 90, color: '#5E35B1', pull: 15, ...getTowerIcon('gravity_icon') },
    void: { id: 'void', name: 'Void', cost: 500, range: 150, damage: 50, rate: 120, color: '#1A1A1A', drain: 5, ...getTowerIcon('void_icon') },
    mine: { id: 'mine', name: 'Mine Layer', cost: 170, range: 100, damage: 40, rate: 200, color: '#BF360C', mines: true, ...getTowerIcon('mine_icon') },
    wall: { id: 'wall', name: 'Wall Gun', cost: 90, range: 80, damage: 12, rate: 50, color: '#757575', barrier: true, ...getTowerIcon('wall_icon') },
    spike: { id: 'spike', name: 'Spike Trap', cost: 110, range: 90, damage: 25, rate: 80, color: '#424242', melee: true, ...getTowerIcon('spike_icon') },
    nuke: { id: 'nuke', name: 'Nuke', cost: 600, range: 220, damage: 100, rate: 300, color: '#D32F2F', splash: 150, radiation: 5, ...getTowerIcon('nuke_icon') },
    omega: { id: 'omega', name: 'Omega', cost: 800, range: 250, damage: 60, rate: 60, color: '#C51162', chain: 5, splash: 60, ...getTowerIcon('omega_icon') },
    titan: { id: 'titan', name: 'Titan', cost: 700, range: 200, damage: 80, rate: 100, color: '#FF6D00', pierce: 5, splash: 70, ...getTowerIcon('titan_icon') },
    mirror: { id: 'mirror', name: 'Mirror', cost: 240, range: 160, damage: 20, rate: 70, color: '#E1BEE7', reflect: true, ...getTowerIcon('mirror_icon') },
    vampire: { id: 'vampire', name: 'Vampire', cost: 260, range: 140, damage: 18, rate: 80, color: '#880E4F', lifesteal: 0.5, ...getTowerIcon('vampire_icon') },
    swarm: { id: 'swarm', name: 'Swarm', cost: 210, range: 150, damage: 3, rate: 20, color: '#FBC02D', multishot: 5, ...getTowerIcon('swarm_icon') },
    orbital: { id: 'orbital', name: 'Orbital', cost: 420, range: 300, damage: 45, rate: 90, color: '#0277BD', satellite: true, ...getTowerIcon('orbital_icon') },
    timewarp: { id: 'timewarp', name: 'Time Warp', cost: 550, range: 250, damage: 0, rate: 300, color: '#009688', type: 'timewarp', duration: 120, ...getTowerIcon('timewarp_icon') },
    necromancer: { id: 'necromancer', name: 'Necromancer', cost: 650, range: 180, damage: 10, rate: 60, color: '#311B92', type: 'necromancer', ...getTowerIcon('necromancer_icon') },
    blackhole: { id: 'blackhole', name: 'Black Hole', cost: 900, range: 200, damage: 200, rate: 400, color: '#000', type: 'blackhole', pullForce: 5, ...getTowerIcon('blackhole_icon') }
};


const baseHp = (wave: number) => 10 + wave * 2;

export const ENEMIES: Record<string, EnemyData> = {
  troop: { id: 'troop', name: 'Troop', speed: 1.0, baseHp: 10, hp: baseHp, color: '#5D4037', flying: false, size: { width: 10, height: 10 }, type: 'troop' },
  humvee: { id: 'humvee', name: 'Humvee', speed: 2.0, baseHp: 25, hp: (w) => baseHp(w) * 2.5, color: '#8D6E63', flying: false, size: { width: 25, height: 18 }, type: 'humvee' },
  tank: { id: 'tank', name: 'Tank', speed: 0.6, baseHp: 80, hp: (w) => baseHp(w) * 8.0, color: '#388E3C', flying: false, size: { width: 35, height: 25 }, type: 'tank' },
  heavy_tank: { id: 'heavy_tank', name: 'Heavy Tank', speed: 0.4, baseHp: 200, hp: (w) => baseHp(w) * 20.0, color: '#1B5E20', flying: false, size: { width: 45, height: 30 }, type: 'heavy_tank' },
  jet: { id: 'jet', name: 'Jet', speed: 4.0, baseHp: 40, hp: (w) => baseHp(w) * 4.0, color: '#455A64', flying: true, size: { width: 30, height: 30 }, type: 'jet' },
  boss: { id: 'boss', name: 'Boss', speed: 0.5, baseHp: 1000, hp: (w) => baseHp(w) * 100.0, color: '#C62828', flying: false, size: { width: 50, height: 50 }, type: 'boss' },
  reindeer: { id: 'reindeer', name: 'Reindeer', speed: 1.8, baseHp: 8, hp: (w) => baseHp(w) * 0.8, color: '#795548', flying: false, size: { width: 12, height: 12 }, type: 'reindeer' },
  elf_warrior: { id: 'elf_warrior', name: 'Elf Warrior', speed: 1.5, baseHp: 12, hp: (w) => baseHp(w) * 1.2, color: '#2E7D32', flying: false, size: { width: 10, height: 10 }, type: 'elf_warrior' },
  toy_soldier: { id: 'toy_soldier', name: 'Toy Soldier', speed: 1.2, baseHp: 15, hp: (w) => baseHp(w) * 1.5, color: '#D32F2F', flying: false, size: { width: 10, height: 10 }, type: 'toy_soldier' },
  angry_snowman: { id: 'angry_snowman', name: 'Angry Snowman', speed: 0.8, baseHp: 100, hp: (w) => baseHp(w) * 10, color: '#FFFFFF', flying: false, size: { width: 20, height: 20 }, type: 'angry_snowman' },
  krampus: { id: 'krampus', name: 'Krampus', speed: 1.0, baseHp: 500, hp: (w) => baseHp(w) * 50, color: '#3E2723', flying: false, size: { width: 30, height: 30 }, type: 'krampus' },
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
    1:  [...Array(5).fill('reindeer'), ...Array(15).fill('troop')],
    2:  [...Array(10).fill('troop'), ...Array(15).fill('elf_warrior'), ...Array(5).fill('toy_soldier')],
    3:  [...Array(20).fill('elf_warrior'), ...Array(15).fill('toy_soldier'), ...Array(5).fill('humvee')],
    4:  [...Array(20).fill('reindeer'), ...Array(15).fill('humvee'), ...Array(5).fill('tank'), ...Array(2).fill('angry_snowman')],
    5:  [...Array(25).fill('humvee'), ...Array(10).fill('tank'), ...Array(15).fill('toy_soldier')],
    6:  [...Array(15).fill('humvee'), ...Array(20).fill('tank'), ...Array(5).fill('angry_snowman')],
    7:  [...Array(30).fill('tank')],
    8:  [...Array(20).fill('tank'), ...Array(20).fill('humvee'), ...Array(30).fill('troop')],
    9:  [...Array(35).fill('tank'), ...Array(15).fill('humvee'), ...Array(10).fill('angry_snowman')],
    10: [...Array(25).fill('tank'), ...Array(1).fill('krampus')],
    11: [...Array(25).fill('troop'), ...Array(25).fill('humvee'), ...Array(20).fill('tank')],
    12: [...Array(40).fill('reindeer'), ...Array(25).fill('humvee')],
    13: [...Array(30).fill('humvee'), ...Array(25).fill('tank')],
    14: [...Array(40).fill('tank')],
    15: [...Array(20).fill('humvee'), ...Array(30).fill('tank'), ...Array(5).fill('jet')],
    16: [...Array(20).fill('tank'), ...Array(10).fill('heavy_tank'), ...Array(20).fill('reindeer'), ...Array(20).fill('troop')],
    17: [...Array(40).fill('tank'), ...Array(15).fill('heavy_tank'), ...Array(10).fill('jet')],
    18: [...Array(60).fill('tank'), ...Array(10).fill('heavy_tank')],
    19: [...Array(70).fill('humvee'), ...Array(15).fill('jet')],
    20: [...Array(30).fill('tank'), ...Array(20).fill('heavy_tank'), ...Array(20).fill('angry_snowman'), ...Array(2).fill('krampus'), ...Array(1).fill('boss')],
};
