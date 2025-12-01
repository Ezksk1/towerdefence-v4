export type TowerId =
  | 'turret' | 'rapid_fire' | 'blaster' | 'bomber'
  | 'm4_trooper' | 'm2_browning' | 'barrett_50'
  | 'm1_abrams' | 'bradley_ifv' | 'stryker'
  | 'apache' | 'f35' | 'f22' | 'ac130'
  | 'ciws' | 'javelin' | 'm109_paladin' | 'himars'
  | 'patriot' | 'missile_silo' | 'a10_warthog'
  | 'barracks'
  | 'sniper' | 'ballista' | 'ice' | 'poison' | 'laser' | 'tesla' | 'rocket'
  | 'flame' | 'storm' | 'earth' | 'wind'
  | 'buff' | 'heal' | 'slow'
  | 'minigun' | 'railgun' | 'mortar' | 'gatling'
  | 'plasma' | 'quantum' | 'gravity' | 'void'
  | 'mine' | 'wall' | 'spike'
  | 'nuke' | 'omega' | 'titan'
  | 'mirror' | 'vampire' | 'swarm' | 'orbital'
  | 'timewarp' | 'necromancer' | 'blackhole'
  | 's400' | 'challenger2' | 'caesar' | 'leopard2' | 'irondome' | 'type99' | 'type10'
  | 'eagle_usa' | 'panda_china' | 'bear_russia' | 'tiger_india' | 'kangaroo_aus' | 'beaver_canada' | 'lion_uk' | 'dragon_wales'
  | 'commando' | 'lightning_spire';


export interface TowerData {
  id: TowerId | string; // Allow string for custom towers
  name: string;
  cost: number;
  range: number;
  damage: number;
  rate: number; // in frames
  splash?: number; // splash radius
  effect?: string;
  iconUrl: string;
  iconHint: string;
  type?: string;
  pierce?: number;
  slow?: number;
  poison?: number;
  laser?: boolean;
  chain?: number;
  burn?: number;
  stun?: number;
  knockback?: number;
  buffRange?: number;
  buffDamage?: number;
  healAmount?: number;
  slowArea?: number;
  slowFactor?: number;
  melt?: number;
  teleport?: boolean;
  pull?: number;
  drain?: number;
  mines?: boolean;
  barrier?: boolean;
  melee?: boolean;
  radiation?: number;
  reflect?: boolean;
  lifesteal?: number;
  multishot?: number;
  satellite?: boolean;
  duration?: number;
  pullForce?: number;
  crit?: number;
  speed?: number;
  color?: string;
}

export type DIYChassisId = 'light' | 'medium' | 'heavy' | 'stealth' | 'armored';
export type DIYWeaponId = 'gun' | 'cannon' | 'laser' | 'rocket' | 'flamethrower' | 'tesla' | 'turret_w' | 'sniper_w' | 'blaster_w' | 'bomber_w' | 'rapid_fire_w' | 'm4_trooper_w' | 'barrett_50_w' | 'm2_browning_w' | 'm1_abrams_w' | 'ciws_w' | 'javelin_w' | 'commando_w' | 's400_w' | 'caesar_w' | 'lightning_spire_w';
export type DIYAccessoryId = 'none' | 'scope' | 'aoe' | 'frost' | 'autoloader' | 'piercing' | 'poison' | 'rangefinder' | 'dual_target' | 'multi_target';

export interface DIYChassis {
  id: DIYChassisId;
  name: string;
  cost: number;
  color: string;
}

export interface DIYWeapon {
  id: DIYWeaponId;
  name: string;
  cost: number;
  damage: number;
  range: number;
  rate: number;
  splash?: number;
  burn?: number;
  chain?: number;
  color: string;
  iconUrl: string;
  iconHint: string;
}

export interface DIYAccessory {
  id: DIYAccessoryId;
  name: string;
  description: string;
  cost: number;
  damageMultiplier?: number;
  rangeMultiplier?: number;
  rateMultiplier?: number;
  splashBonus?: number;
  slow?: number;
  pierce?: number;
  poison?: number;
  chainBonus?: number;
}


export interface DIYTower extends TowerData {
    isCustom: true;
    chassis: DIYChassisId;
    weapon: DIYWeaponId;
    accessory: DIYAccessoryId;
}


export interface PlacedTower extends TowerData {
  idInGame: string; // unique id for each placed tower
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  cooldown: number;
  target?: string; // enemy id
  angle?: number;
  isCustom?: boolean; // For DIY towers
  chassis?: DIYChassisId;
  weapon?: DIYWeaponId;
  accessory?: DIYAccessoryId;
}

export type EnemyId =
  | 'troop' | 'scout_bike' | 'technical' | 'jeep'
  | 'humvee' | 'btr80' | 'bmp2' | 'apc'
  | 'tank' | 't72' | 't90' | 'heavy_tank'
  | 'mi24_hind' | 'su25_frogfoot' | 'jet'
  | 'boss' | 'scud_launcher' | 'reindeer'
  | 'elf_warrior' | 'toy_soldier' | 'angry_snowman' | 'krampus'
  | 'mega_boss' | 'stealth_bomber';

export interface EnemyData {
  id: EnemyId;
  name: string;
  speed: number;
  baseHp: number;
  hp: (wave: number) => number;
  color: string;
  flying: boolean;
  size: { width: number, height: number };
  type: string;
}

export interface ActiveEnemy extends EnemyData {
  idInGame: string; // unique id for each active enemy
  x: number;
  y: number;
  currentHp: number;
  totalHp: number;
  pathIndex: number;
  active: boolean;
  speedFactor: number;
  frozenTimer: number;
  poisonTimer: number;
  poisonDamage: number;
  blocked?: boolean;
}

export type LevelData = {
  level: number;
  name: string;
  path: { x: number; y: number }[];
};

export interface Decoration {
    type: 'tree' | 'cane' | 'ornament' | 'reindeer';
    x: number;
    y: number;
    size?: number;
    color?: string;
    rotation?: number;
}

export interface Projectile {
    id: string;
    x: number;
    y: number;
    target: ActiveEnemy | {x: number, y: number};
    speed: number;
    damage: number;
    splash: number;
    active: boolean;
    config: Partial<TowerData>;
    type?: string;
    chainTargets?: ActiveEnemy[];
}

export type GameStatus = 'playing' | 'paused' | 'game-over' | 'level-complete';

export type Soldier = {
  x: number;
  y: number;
  parent: PlacedTower;
  hp: number;
  maxHp: number;
  damage: number;
  range: number;
  cooldown: number;
  takeDamage: (amount: number) => void;
  update: () => void;
}

export type GameState = {
  status: GameStatus;
  lives: number;
  money: number;
  wave: number;
  currentLevel: number;
  waveTimer: number; // countdown to next wave
  towers: PlacedTower[];
  enemies: ActiveEnemy[];
  projectiles: Projectile[];
  decorations: Decoration[];
  soldiers: Soldier[];
  waveActive: boolean;
  gameSpeed: number;
};
