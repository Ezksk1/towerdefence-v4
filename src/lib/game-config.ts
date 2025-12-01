import type { TowerData, EnemyData, LevelData, TowerId, EnemyId, DIYChassis, DIYWeapon, DIYAccessory } from './types';
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

export const DIY_COMPONENTS: {
  chassis: DIYChassis[];
  weapons: DIYWeapon[];
  accessories: DIYAccessory[];
} = {
  chassis: [
    { id: 'light', name: 'Light Chassis', cost: 25, color: '#B0BEC5' },
    { id: 'medium', name: 'Medium Chassis', cost: 50, color: '#78909C' },
    { id: 'heavy', name: 'Heavy Chassis', cost: 100, color: '#455A64' },
    { id: 'stealth', name: 'Stealth Chassis', cost: 150, color: '#212121' },
    { id: 'armored', name: 'Armored Chassis', cost: 200, color: '#BF360C' },
  ],
  weapons: [
    { id: 'gun', name: 'Machine Gun', cost: 50, damage: 10, range: 120, rate: 20, color: '#FFC107', ...getTowerIcon('rapid_fire_icon') },
    { id: 'cannon', name: 'Cannon', cost: 100, damage: 50, range: 150, rate: 80, splash: 30, color: '#F44336', ...getTowerIcon('bomber_icon') },
    { id: 'laser', name: 'Laser Beam', cost: 150, damage: 8, range: 180, rate: 5, color: '#03A9F4', ...getTowerIcon('laser_icon') },
    { id: 'rocket', name: 'Rocket Launcher', cost: 200, damage: 80, range: 200, rate: 100, splash: 50, color: '#FF5722', ...getTowerIcon('rocket_icon') },
    { id: 'flamethrower', name: 'Flamethrower', cost: 120, damage: 5, range: 80, rate: 10, burn: 2, color: '#FF9800', ...getTowerIcon('flame_icon') },
    { id: 'tesla', name: 'Tesla Coil', cost: 250, damage: 20, range: 140, rate: 60, chain: 3, color: '#3F51B5', ...getTowerIcon('tesla_icon') },
  ],
  accessories: [
    { id: 'none', name: 'None', description: 'No accessory.', cost: 0 },
    { id: 'scope', name: 'Scope', description: '+25% Range', cost: 50, rangeMultiplier: 1.25 },
    { id: 'aoe', name: 'Explosive Rounds', description: '+20 Splash Radius', cost: 75, splashBonus: 20 },
    { id: 'frost', name: 'Cryo Ammo', description: 'Slows enemies on hit', cost: 100, slow: 0.5 },
    { id: 'autoloader', name: 'Auto-Loader', description: '-50% Fire Rate Cooldown', cost: 150, rateMultiplier: 0.5 },
    { id: 'piercing', name: 'Piercing Rounds', description: 'Projectiles pierce 3 enemies', cost: 200, pierce: 3 },
    { id: 'poison', name: 'Poison Coating', description: 'Adds damage over time', cost: 125, poison: 5 },
    { id: 'rangefinder', name: 'Advanced Rangefinder', description: '+50% Range', cost: 250, rangeMultiplier: 1.5 },
  ]
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
    barracks: { id: 'barracks', name: 'Barracks', cost: 500, range: 100, rate: 600, damage: 0, color: '#558B2F', type: 'barracks', ...getTowerIcon('barracks_icon') },
    missile_silo: { id: 'missile_silo', name: 'Missile Silo', cost: 2000, range: 800, damage: 1000, rate: 400, color: '#37474F', splash: 150, ...getTowerIcon('missile_silo_icon') },
    a10_warthog: { id: 'a10_warthog', name: 'A-10 Strike', cost: 2500, range: 1000, damage: 500, rate: 600, color: '#455A64', type: 'a10', ...getTowerIcon('a10_warthog_icon') },
    lightning_spire: { id: 'lightning_spire', name: 'Lightning Spire', cost: 5000, range: 200, damage: 100, rate: 50, color: '#FFD700', chain: 5, type: 'lightning_spire', ...getTowerIcon('lightning_spire_icon') }
};


const baseHp = (wave: number) => 10 + wave * 2;

export const ENEMIES: Record<string, EnemyData> = {
  troop: { id: 'troop', name: 'Troop', speed: 1.0, baseHp: 10, hp: baseHp, color: '#5D4037', flying: false, size: { width: 10, height: 10 }, type: 'troop' },
  humvee: { id: 'humvee', name: 'Humvee', speed: 2.0, baseHp: 25, hp: (w) => baseHp(w) * 2.5, color: '#8D6E63', flying: false, size: { width: 25, height: 18 }, type: 'humvee' },
  tank: { id: 'tank', name: 'Tank', speed: 0.6, baseHp: 80, hp: (w) => baseHp(w) * 8.0, color: '#388E3C', flying: false, size: { width: 35, height: 25 }, type: 'tank' },
  heavy_tank: { id: 'heavy_tank', name: 'Heavy Tank', speed: 0.4, baseHp: 200, hp: (w) => baseHp(w) * 20.0, color: '#1B5E20', flying: false, size: { width: 45, height: 30 }, type: 'heavy_tank' },
  jet: { id: 'jet', name: 'Jet', speed: 4.0, baseHp: 40, hp: (w) => baseHp(w) * 4.0, color: '#455A64', flying: true, size: { width: 30, height: 30 }, type: 'jet' },
  stealth_bomber: { id: 'stealth_bomber', name: 'Stealth Bomber', speed: 5.0, baseHp: 150, hp: (w) => baseHp(w) * 15.0, color: '#212121', flying: true, size: { width: 40, height: 20 }, type: 'stealth_bomber' },
  boss: { id: 'boss', name: 'Boss', speed: 0.5, baseHp: 1000, hp: (w) => baseHp(w) * 100.0, color: '#C62828', flying: false, size: { width: 50, height: 50 }, type: 'boss' },
  mega_boss: { id: 'mega_boss', name: 'Mega Boss', speed: 0.3, baseHp: 5000, hp: (w) => baseHp(w) * 500.0, color: '#000000', flying: false, size: { width: 80, height: 80 }, type: 'mega_boss' },
  reindeer: { id: 'reindeer', name: 'Reindeer', speed: 1.8, baseHp: 12, hp: (w) => baseHp(w) * 1.2, color: '#795548', flying: false, size: { width: 12, height: 12 }, type: 'reindeer' },
  elf_warrior: { id: 'elf_warrior', name: 'Elf Warrior', speed: 1.5, baseHp: 15, hp: (w) => baseHp(w) * 1.5, color: '#2E7D32', flying: false, size: { width: 10, height: 10 }, type: 'elf_warrior' },
  toy_soldier: { id: 'toy_soldier', name: 'Toy Soldier', speed: 1.2, baseHp: 15, hp: (w) => baseHp(w) * 1.5, color: '#D32F2F', flying: false, size: { width: 10, height: 10 }, type: 'toy_soldier' },
  angry_snowman: { id: 'angry_snowman', name: 'Angry Snowman', speed: 0.8, baseHp: 100, hp: (w) => baseHp(w) * 10, color: '#FFFFFF', flying: false, size: { width: 20, height: 20 }, type: 'angry_snowman' },
  krampus: { id: 'krampus', name: 'Krampus', speed: 1.0, baseHp: 500, hp: (w) => baseHp(w) * 50, color: '#3E2723', flying: false, size: { width: 30, height: 30 }, type: 'krampus' },
};

export function rasterizePath(pathPoints: {x:number, y:number}[]) {
    const path = [];
    if (pathPoints.length === 0) return [];
    let current = {...pathPoints[0]};
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

const frontlinePoints = [
    {x: 0, y: 9}, {x: 4, y: 9}, {x: 4, y: 4}, {x: 9, y: 4}, {x: 9, y: 15}, {x: 14, y: 15}, {x: 14, y: 2}, {x: 22, y: 2}, {x: 22, y: 18}, {x: 29, y: 18}
];

const gauntletPoints = [
    {x: 0, y: 2}, {x: 25, y: 2}, {x: 25, y: 5}, {x: 2, y: 5}, {x: 2, y: 8}, {x: 25, y: 8}, {x: 25, y: 11}, {x: 2, y: 11}, {x: 2, y: 14}, {x: 25, y: 14}, {x: 25, y: 17}, {x: 29, y: 17}
];

const serpentinePoints = [
    {x: 0, y: 1}, {x: 28, y: 1}, {x: 28, y: 3}, {x: 1, y: 3}, {x: 1, y: 5}, {x: 28, y: 5}, {x: 28, y: 7}, {x: 1, y: 7}, {x: 1, y: 9}, {x: 28, y: 9}, {x: 28, y: 11}, {x: 1, y: 11}, {x: 1, y: 13}, {x: 28, y: 13}, {x: 28, y: 15}, {x: 1, y: 15}, {x: 1, y: 17}, {x: 29, y: 17}
];

const impossiblePoints = [
    {x: 0, y: 9}, {x: 2, y: 9}, {x: 2, y: 2}, {x: 27, y: 2}, {x: 27, y: 17}, {x: 2, y: 17}, {x: 2, y: 10}, {x: 29, y: 10}
];

const redDawnPoints = [
    {x: 0, y: 10}, {x: 5, y: 10}, {x: 5, y: 5}, {x: 10, y: 5}, {x: 10, y: 15}, {x: 15, y: 15}, {x: 15, y: 5}, {x: 20, y: 5}, {x: 20, y: 15}, {x: 25, y: 15}, {x: 25, y: 10}, {x: 29, y: 10}
];


export const LEVELS: LevelData[] = [
  { level: 1, name: "The Frontline", path: rasterizePath(frontlinePoints) },
  { level: 2, name: "The Gauntlet", path: rasterizePath(gauntletPoints) },
  { level: 3, name: "Serpentine", path: rasterizePath(serpentinePoints) },
  { level: 4, name: "Winter's Bite (Impossible)", path: rasterizePath(impossiblePoints) },
  { level: 6, name: "Red Dawn (ARMY)", path: rasterizePath(redDawnPoints) }
];


export const ENEMIES_BY_WAVE: Record<number, EnemyId[]> = {
  1:  [...Array(5).fill('reindeer'), ...Array(5).fill('elf_warrior'), ...Array(15).fill('troop')],
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
  21: [...Array(50).fill('troop'), ...Array(25).fill('jet')],
  22: [...Array(40).fill('humvee'), ...Array(25).fill('heavy_tank')],
  23: [...Array(80).fill('tank')],
  24: [...Array(50).fill('heavy_tank'), ...Array(20).fill('jet')],
  25: [...Array(2).fill('boss'), ...Array(4).fill('krampus'), ...Array(50).fill('heavy_tank')],
  // Waves for Impossible Level
  26: [...Array(100).fill('heavy_tank')],
  27: [...Array(50).fill('heavy_tank'), ...Array(50).fill('jet')],
  28: [...Array(20).fill('krampus'), ...Array(40).fill('heavy_tank')],
  29: [...Array(10).fill('boss'), ...Array(50).fill('heavy_tank')],
  30: [...Array(1).fill('mega_boss'), ...Array(5).fill('boss'), ...Array(10).fill('krampus')],
  // Waves for Red Dawn
  31: [...Array(100).fill('troop')],
  32: [...Array(50).fill('troop'), ...Array(50).fill('humvee')],
  33: [...Array(50).fill('humvee'), ...Array(25).fill('tank')],
  34: [...Array(50).fill('tank'), ...Array(10).fill('heavy_tank')],
  35: [...Array(25).fill('heavy_tank'), ...Array(25).fill('jet')],
  36: [...Array(50).fill('jet'), ...Array(10).fill('stealth_bomber')],
  37: [...Array(100).fill('humvee'), ...Array(50).fill('tank')],
  38: [...Array(50).fill('heavy_tank'), ...Array(20).fill('stealth_bomber')],
  39: [...Array(5).fill('boss'), ...Array(50).fill('heavy_tank'), ...Array(50).fill('jet')],
  40: [...Array(2).fill('mega_boss'), ...Array(20).fill('stealth_bomber'), ...Array(50).fill('heavy_tank')],
};
