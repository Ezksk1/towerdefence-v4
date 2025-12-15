import type { TowerData, EnemyData, LevelData, TowerId, EnemyId, DIYChassis, DIYWeapon, DIYAccessory } from './types';
// import placeholderData from './placeholder-images.json';

// const towerPlaceholders = new Map(placeholderData.placeholderImages.map(p => [p.id, p]));

const getTowerIcon = (id: string) => {
  // const placeholder = towerPlaceholders.get(id);
  return {
    iconUrl: `https://picsum.photos/seed/${id}/64/64`,
    iconHint: 'icon'
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
  STARTING_MONEY: 5000,
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
    // -- Added from TOWERS --
    { id: 'turret_w', name: 'Basic Turret Gun', cost: 25, damage: 10, range: 120, rate: 40, color: '#4CAF50', ...getTowerIcon('turret_icon') },
    { id: 'sniper_w', name: 'Sniper Rifle', cost: 75, damage: 40, range: 250, rate: 100, color: '#2196F3', ...getTowerIcon('sniper_icon') },
    { id: 'blaster_w', name: 'Energy Blaster', cost: 125, damage: 5, range: 90, rate: 10, color: '#FF9800', ...getTowerIcon('blaster_icon') },
    { id: 'bomber_w', name: 'Bomb Dropper', cost: 175, damage: 20, range: 140, rate: 80, splash: 50, color: '#F44336', ...getTowerIcon('bomber_icon') },
    { id: 'rapid_fire_w', name: 'Rapid Fire Gun', cost: 50, damage: 3, range: 100, rate: 8, color: '#FFEB3B', ...getTowerIcon('rapid_fire_icon') },
    { id: 'm4_trooper_w', name: 'M4 Rifle', cost: 75, damage: 15, range: 120, rate: 30, color: '#795548', ...getTowerIcon('m4_trooper_icon') },
    { id: 'barrett_50_w', name: 'Barrett .50 Cal', cost: 325, damage: 150, range: 400, rate: 120, color: '#3E2723', ...getTowerIcon('barrett_50_icon') },
    { id: 'm2_browning_w', name: 'M2 Browning HMG', cost: 225, damage: 25, range: 180, rate: 10, color: '#212121', ...getTowerIcon('m2_browning_icon') },
    { id: 'ciws_w', name: 'CIWS Phalanx Vulcan', cost: 1475, damage: 8, range: 220, rate: 1, color: '#ECEFF1', ...getTowerIcon('ciws_icon') },
    { id: 'javelin_w', name: 'Javelin Missile', cost: 375, damage: 120, range: 300, rate: 150, color: '#4E342E', ...getTowerIcon('javelin_icon') },
    { id: 'commando_w', name: 'Commando SMG', cost: 575, damage: 30, range: 150, rate: 20, color: '#1B5E20', ...getTowerIcon('commando_icon') },
    { id: 's400_w', name: 'S-400 Missile', cost: 1775, damage: 350, range: 550, rate: 180, splash: 120, color: '#8B0000', ...getTowerIcon('s400_icon') },
    { id: 'caesar_w', name: 'CAESAR Howitzer', cost: 875, damage: 120, range: 400, rate: 110, splash: 85, color: '#191970', ...getTowerIcon('caesar_icon') },
    { id: 'lightning_spire_w', name: 'Lightning Spire Core', cost: 4975, damage: 100, range: 200, rate: 50, chain: 5, color: '#FFD700', ...getTowerIcon('lightning_spire_icon') },
    { id: 'railgun_w', name: 'Railgun', cost: 800, damage: 500, range: 600, rate: 200, pierce: 5, color: '#00BCD4', ...getTowerIcon('railgun_icon') },
    { id: 'plasma_w', name: 'Plasma Cannon', cost: 600, damage: 60, range: 200, rate: 40, splash: 20, color: '#9C27B0', ...getTowerIcon('plasma_icon') },
    { id: 'minigun_w', name: 'Minigun', cost: 450, damage: 8, range: 150, rate: 5, color: '#607D8B', ...getTowerIcon('minigun_icon') }

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
    { id: 'dual_target', name: 'Dual-Targeting', description: 'Can target 2 enemies at once', cost: 300, chainBonus: 2 },
    { id: 'multi_target', name: 'Multi-Targeting', description: 'Can target 3 enemies at once', cost: 500, chainBonus: 3 },
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
  f16: { id: 'f16', name: 'F-16 Falcon', cost: 1000, range: 400, damage: 60, rate: 10, color: '#90A4AE', type: 'jet_fighter', ...getTowerIcon('f16_icon') },
  f15: { id: 'f15', name: 'F-15 Eagle', cost: 1500, range: 500, damage: 150, rate: 30, color: '#546E7A', type: 'jet_fighter', ...getTowerIcon('f15_icon') },
  f35: { id: 'f35', name: 'F-35 Lightning', cost: 2200, range: 450, damage: 100, rate: 20, color: '#37474F', type: 'stealth_jet', splash: 40, ...getTowerIcon('f35_icon') },
  f22: { id: 'f22', name: 'F-22 Raptor', cost: 3000, range: 600, damage: 80, rate: 8, color: '#263238', type: 'stealth_jet', ...getTowerIcon('f22_icon') },
  sr71: { id: 'sr71', name: 'SR-71 Blackbird', cost: 5000, range: 1000, damage: 0, rate: 600, color: '#000000', buffRange: 300, buffDamage: 1.5, type: 'support_jet', ...getTowerIcon('sr71_icon') },

  mq9: { id: 'mq9', name: 'MQ-9 Reaper', cost: 1200, range: 600, damage: 200, rate: 150, color: '#78909C', type: 'drone', ...getTowerIcon('mq9_icon') },
  global_hawk: { id: 'global_hawk', name: 'Global Hawk', cost: 1800, range: 800, damage: 50, rate: 100, color: '#ECEFF1', chain: 3, type: 'drone_support', ...getTowerIcon('global_hawk_icon') },
  switchblade: { id: 'switchblade', name: 'Switchblade 600', cost: 400, range: 300, damage: 80, rate: 60, splash: 30, color: '#546E7A', type: 'drone_kamikaze', ...getTowerIcon('switchblade_icon') },
  b21_raider: { id: 'b21_raider', name: 'B-21 Raider Bomber', cost: 7500, range: 2000, damage: 2000, rate: 30, splash: 400, color: '#000000', type: 'b21_bomber', iconUrl: '/b21_cockpit_hud.png', iconHint: 'b21' },
  lightning_spire: { id: 'lightning_spire', name: 'Lightning Spire', cost: 5000, range: 200, damage: 100, rate: 50, color: '#FFD700', chain: 5, type: 'lightning_spire', ...getTowerIcon('lightning_spire_icon') },
  
  // --- ADDITIONAL MILITARY WEAPONS ---
  // Missile Vehicles (spawn as mobile units)
  tomahawk: { id: 'tomahawk', name: 'Tomahawk Cruise', cost: 2500, range: 1200, damage: 800, rate: 300, splash: 200, color: '#455A64', type: 'cruise_missile', ...getTowerIcon('tomahawk_icon') },
  himars: { id: 'himars', name: 'HIMARS', cost: 1600, range: 900, damage: 600, rate: 180, splash: 150, color: '#424242', type: 'rocket_truck', ...getTowerIcon('himars_icon') },
  thaad: { id: 'thaad', name: 'THAAD System', cost: 1950, range: 800, damage: 450, rate: 120, splash: 100, color: '#37474F', type: 'air_defense', ...getTowerIcon('thaad_icon') },
  atacms: { id: 'atacms', name: 'ATACMS', cost: 2100, range: 1000, damage: 700, rate: 200, splash: 180, color: '#546E7A', type: 'tactical_missile', ...getTowerIcon('atacms_icon') },
  
  // Advanced Aircraft (spawn as planes)
  b2_spirit: { id: 'b2_spirit', name: 'B-2 Spirit', cost: 6000, range: 1800, damage: 1500, rate: 40, splash: 350, color: '#212121', type: 'b2_bomber', ...getTowerIcon('b2_spirit_icon') },
  c130_hercules: { id: 'c130_hercules', name: 'C-130 Gunship', cost: 3500, range: 700, damage: 300, rate: 25, splash: 80, color: '#607D8B', type: 'gunship_aircraft', ...getTowerIcon('c130_icon') },
  ah64_apache: { id: 'ah64_apache', name: 'AH-64 Apache', cost: 2800, range: 600, damage: 280, rate: 35, splash: 60, color: '#455A64', type: 'attack_helicopter', ...getTowerIcon('apache_icon') },
  v22_osprey: { id: 'v22_osprey', name: 'V-22 Osprey', cost: 2200, range: 550, damage: 180, rate: 30, splash: 45, color: '#78909C', type: 'tiltrotor_aircraft', ...getTowerIcon('osprey_icon') },
  
  // Rail & Laser Weapons (mobile platform)
  laser_cannon: { id: 'laser_cannon', name: 'Laser Cannon', cost: 1400, range: 500, damage: 200, rate: 80, color: '#FF3D00', pierce: 3, type: 'laser_tank', ...getTowerIcon('laser_icon') },
  phasor_gun: { id: 'phasor_gun', name: 'Phasor Gun', cost: 1800, range: 450, damage: 250, rate: 70, color: '#FF6D00', type: 'phasor_tank', ...getTowerIcon('phasor_icon') },
  plasma_turret: { id: 'plasma_turret', name: 'Plasma Turret', cost: 1600, range: 400, damage: 280, rate: 90, splash: 70, color: '#FF5722', type: 'plasma_tank', ...getTowerIcon('plasma_icon') },
  ion_cannon: { id: 'ion_cannon', name: 'Ion Cannon', cost: 2300, range: 600, damage: 350, rate: 100, splash: 120, color: '#00BCD4', type: 'ion_tank', ...getTowerIcon('ion_icon') },
  
  // Heavy Artillery (mobile platform)
  howitzer_155mm: { id: 'howitzer_155mm', name: '155mm Howitzer', cost: 950, range: 450, damage: 280, rate: 95, splash: 100, color: '#5D4037', type: 'artillery_tank', ...getTowerIcon('howitzer_icon') },
  gun_self_propelled: { id: 'gun_sp', name: 'SP Gun', cost: 1100, range: 500, damage: 320, rate: 110, splash: 110, color: '#6D4C41', type: 'spgun_tank', ...getTowerIcon('spgun_icon') },
  mortar_120mm: { id: 'mortar_120mm', name: '120mm Mortar', cost: 700, range: 350, damage: 200, rate: 100, splash: 90, color: '#8D6E63', type: 'mortar_tank', ...getTowerIcon('mortar_icon') },
  
  // Gatling & Rapid Fire (mobile platform)
  m61_vulcan: { id: 'm61_vulcan', name: 'M61 Vulcan', cost: 1200, range: 350, damage: 80, rate: 8, color: '#424242', type: 'vulcan_tank', ...getTowerIcon('vulcan_icon') },
  goalkeeper_ciws: { id: 'goalkeeper', name: 'Goalkeeper CIWS', cost: 1800, range: 280, damage: 120, rate: 6, color: '#ECEFF1', type: 'ciws_vehicle', ...getTowerIcon('goalkeeper_icon') },
  phalanx_x: { id: 'phalanx_x', name: 'Phalanx X Advanced', cost: 2100, range: 350, damage: 150, rate: 5, color: '#90A4AE', type: 'phalanx_vehicle', ...getTowerIcon('phalanx_x_icon') },
  
  // Specialized Systems (mobile/tactical)
  remote_mine: { id: 'remote_mine', name: 'Remote Mine', cost: 400, range: 200, damage: 150, rate: 120, splash: 80, color: '#9E9E9E', ...getTowerIcon('mine_icon') },
  emp_tower: { id: 'emp_tower', name: 'EMP Tower', cost: 2000, range: 400, damage: 100, rate: 80, splash: 150, color: '#00897B', stun: 3, type: 'emp_vehicle', ...getTowerIcon('emp_icon') },
  tesla_mk2: { id: 'tesla_mk2', name: 'Tesla Mark II', cost: 1400, range: 250, damage: 120, rate: 50, chain: 4, color: '#7C4DFF', ...getTowerIcon('tesla_mk2_icon') },
  
  // Sci-Fi Weapons (mobile platform)
  particle_beam: { id: 'particle_beam', name: 'Particle Beam', cost: 3200, range: 700, damage: 450, rate: 120, pierce: 5, color: '#76FF03', type: 'particle_tank', ...getTowerIcon('particle_icon') },
  photon_cannon: { id: 'photon_cannon', name: 'Photon Cannon', cost: 2800, range: 650, damage: 400, rate: 110, color: '#B3E5FC', type: 'photon_tank', ...getTowerIcon('photon_icon') },
  antimatter_launcher: { id: 'antimatter_launcher', name: 'Antimatter Launcher', cost: 4500, range: 900, damage: 900, rate: 250, splash: 250, color: '#6A1B9A', type: 'antimatter_tank', ...getTowerIcon('antimatter_icon') },
  quantum_destabilizer: { id: 'quantum_destabilizer', name: 'Quantum Destabilizer', cost: 3800, range: 750, damage: 550, rate: 140, pierce: 3, color: '#00E5FF', type: 'quantum_tank', ...getTowerIcon('quantum_icon') },
  
  // Support Weapons
  smoke_screen: { id: 'smoke_screen', name: 'Smoke Screen', cost: 600, range: 300, damage: 20, rate: 100, slow: 0.7, color: '#BDBDBD', ...getTowerIcon('smoke_icon') },
  jammer_station: { id: 'jammer_station', name: 'Jammer Station', cost: 1100, range: 350, damage: 50, rate: 80, color: '#FF80AB', stun: 2, type: 'jammer_vehicle', ...getTowerIcon('jammer_icon') },
  force_field: { id: 'force_field', name: 'Force Field Gen', cost: 2200, range: 300, damage: 30, rate: 60, color: '#40E0D0', ...getTowerIcon('forcefield_icon') },
  
  // CHRISTMAS TOWERS ---
  snowball_launcher: { id: 'snowball_launcher', name: 'Snowball Launcher', cost: 75, range: 150, damage: 15, rate: 30, color: '#E0F7FA', type: 'snowball', slow: 0.3, ...getTowerIcon('snowball_launcher_icon') },
  candy_cannon: { id: 'candy_cannon', name: 'Candy Cannon', cost: 250, range: 200, damage: 60, rate: 90, color: '#FFCDD2', splash: 60, type: 'candy_cannon', ...getTowerIcon('candy_cannon_icon') },
  elf_sniper: { id: 'elf_sniper', name: 'Elf Sniper', cost: 200, range: 300, damage: 100, rate: 120, color: '#4CAF50', type: 'elf_sniper', ...getTowerIcon('elf_sniper_icon') },
  gingerbread_barracks: { id: 'gingerbread_barracks', name: 'Gingerbread House', cost: 450, range: 100, damage: 0, rate: 600, color: '#795548', type: 'gingerbread_barracks', ...getTowerIcon('gingerbread_barracks_icon') },
  north_pole_tesla: { id: 'north_pole_tesla', name: 'North Pole Tesla', cost: 600, range: 180, damage: 30, rate: 40, color: '#D50000', chain: 5, type: 'north_pole_tesla', ...getTowerIcon('north_pole_tesla_icon') }
};

export const DEPLOYABLE_UNITS: Record<string, { id: string; name: string; cost: number; speed: number; hp: number; damage: number; range: number; iconUrl: string; iconHint: string; } & Partial<TowerData>> = {
  m1_abrams: { id: 'm1_abrams', name: 'M1 Abrams', cost: 600, speed: 2, hp: 500, damage: 80, range: 150, iconUrl: '/m1_abrams_icon.png', iconHint: 'm1_abrams' },
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
  // --- NEW ENEMIES ---
  apc: { id: 'apc', name: 'APC', speed: 1.2, baseHp: 150, hp: (w) => baseHp(w) * 15, color: '#546E7A', flying: false, size: { width: 32, height: 20 }, type: 'apc' },
  mobile_sam: { id: 'mobile_sam', name: 'Mobile SAM', speed: 0.9, baseHp: 120, hp: (w) => baseHp(w) * 12, color: '#37474F', flying: false, size: { width: 30, height: 20 }, type: 'mobile_sam' },
  supply_truck: { id: 'supply_truck', name: 'Supply Truck', speed: 1.5, baseHp: 80, hp: (w) => baseHp(w) * 8, color: '#8D6E63', flying: false, size: { width: 28, height: 18 }, type: 'supply_truck' },
  commando_troop: { id: 'commando_troop', name: 'Commando', speed: 1.1, baseHp: 30, hp: (w) => baseHp(w) * 3, color: '#1B5E20', flying: false, size: { width: 12, height: 12 }, type: 'commando_troop' },
  sniper_troop: { id: 'sniper_troop', name: 'Sniper', speed: 0.9, baseHp: 20, hp: (w) => baseHp(w) * 2, color: '#3E2723', flying: false, size: { width: 12, height: 12 }, type: 'sniper_troop' },
  mech_walker: { id: 'mech_walker', name: 'Mech Walker', speed: 0.5, baseHp: 300, hp: (w) => baseHp(w) * 30, color: '#263238', flying: false, size: { width: 30, height: 40 }, type: 'mech_walker' },
  hover_tank: { id: 'hover_tank', name: 'Hover Tank', speed: 1.8, baseHp: 100, hp: (w) => baseHp(w) * 10, color: '#00BCD4', flying: false, size: { width: 30, height: 20 }, type: 'hover_tank' },
  drone_swarm: { id: 'drone_swarm', name: 'Drone Swarm', speed: 3.5, baseHp: 10, hp: (w) => baseHp(w) * 1, color: '#FF5252', flying: true, size: { width: 15, height: 15 }, type: 'drone_swarm' },
  attack_heli: { id: 'attack_heli', name: 'Attack Helicopter', speed: 2.5, baseHp: 180, hp: (w) => baseHp(w) * 18, color: '#4E342E', flying: true, size: { width: 35, height: 35 }, type: 'attack_heli' },
  zeppelin: { id: 'zeppelin', name: 'War Zeppelin', speed: 0.3, baseHp: 2000, hp: (w) => baseHp(w) * 200, color: '#3E2723', flying: true, size: { width: 60, height: 30 }, type: 'zeppelin' },
  yeti: { id: 'yeti', name: 'Yeti', speed: 1.4, baseHp: 250, hp: (w) => baseHp(w) * 25, color: '#E0F7FA', flying: false, size: { width: 25, height: 35 }, type: 'yeti' },
  ice_golem: { id: 'ice_golem', name: 'Ice Golem', speed: 0.4, baseHp: 600, hp: (w) => baseHp(w) * 60, color: '#81D4FA', flying: false, size: { width: 35, height: 40 }, type: 'ice_golem' },
  frost_giant: { id: 'frost_giant', name: 'Frost Giant', speed: 0.3, baseHp: 1500, hp: (w) => baseHp(w) * 150, color: '#0288D1', flying: false, size: { width: 50, height: 60 }, type: 'frost_giant' },
  snow_leopard: { id: 'snow_leopard', name: 'Snow Leopard', speed: 2.5, baseHp: 60, hp: (w) => baseHp(w) * 6, color: '#EEEEEE', flying: false, size: { width: 20, height: 15 }, type: 'snow_leopard' },
  cyborg_soldier: { id: 'cyborg_soldier', name: 'Cyborg', speed: 1.3, baseHp: 80, hp: (w) => baseHp(w) * 8, color: '#9E9E9E', flying: false, size: { width: 14, height: 14 }, type: 'cyborg_soldier' },
  exo_suit: { id: 'exo_suit', name: 'Exo-Soldier', speed: 0.8, baseHp: 120, hp: (w) => baseHp(w) * 12, color: '#607D8B', flying: false, size: { width: 18, height: 20 }, type: 'exo_suit' },
  plasma_tank: { id: 'plasma_tank', name: 'Plasma Tank', speed: 0.7, baseHp: 250, hp: (w) => baseHp(w) * 25, color: '#673AB7', flying: false, size: { width: 35, height: 25 }, type: 'plasma_tank' },
  railgun_tank: { id: 'railgun_tank', name: 'Railgun Tank', speed: 0.6, baseHp: 200, hp: (w) => baseHp(w) * 20, color: '#009688', flying: false, size: { width: 38, height: 22 }, type: 'railgun_tank' },
  stealth_operative: { id: 'stealth_operative', name: 'Ghost Operative', speed: 1.6, baseHp: 50, hp: (w) => baseHp(w) * 5, color: '#212121', flying: false, size: { width: 12, height: 12 }, type: 'stealth_operative' },
  mothership: { id: 'mothership', name: 'Alien Mothership', speed: 0.1, baseHp: 10000, hp: (w) => baseHp(w) * 1000, color: '#311B92', flying: true, size: { width: 100, height: 100 }, type: 'mothership' },
  // --- ENDGAME ENEMIES (unlocked after wave 100) ---
  void_wraith: { id: 'void_wraith', name: 'Void Wraith', speed: 3.2, baseHp: 120, hp: (w) => baseHp(w) * 12, color: '#7E57C2', flying: true, size: { width: 18, height: 18 }, type: 'void_wraith' },
  phase_drone: { id: 'phase_drone', name: 'Phase Drone', speed: 4.5, baseHp: 60, hp: (w) => baseHp(w) * 6, color: '#26C6DA', flying: true, size: { width: 14, height: 12 }, type: 'phase_drone' },
  armored_colossus: { id: 'armored_colossus', name: 'Armored Colossus', speed: 0.35, baseHp: 5000, hp: (w) => baseHp(w) * 600, color: '#37474F', flying: false, size: { width: 120, height: 80 }, type: 'armored_colossus' },
  orbital_dreadnaught: { id: 'orbital_dreadnaught', name: 'Orbital Dreadnaught', speed: 0.05, baseHp: 8000, hp: (w) => baseHp(w) * 900, color: '#90A4AE', flying: true, size: { width: 140, height: 70 }, type: 'orbital_dreadnaught' },
  ancient_titan: { id: 'ancient_titan', name: 'Ancient Titan', speed: 0.25, baseHp: 20000, hp: (w) => baseHp(w) * 2500, color: '#000000', flying: false, size: { width: 200, height: 200 }, type: 'ancient_titan' },
};

export function rasterizePath(pathPoints: { x: number, y: number }[]) {
  const path = [];
  if (pathPoints.length === 0) return [];
  let current = { ...pathPoints[0] };
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
  { x: 0, y: 9 }, { x: 4, y: 9 }, { x: 4, y: 4 }, { x: 9, y: 4 }, { x: 9, y: 15 }, { x: 14, y: 15 }, { x: 14, y: 2 }, { x: 22, y: 2 }, { x: 22, y: 18 }, { x: 29, y: 18 }
];

const gauntletPoints = [
  { x: 0, y: 2 }, { x: 25, y: 2 }, { x: 25, y: 5 }, { x: 2, y: 5 }, { x: 2, y: 8 }, { x: 25, y: 8 }, { x: 25, y: 11 }, { x: 2, y: 11 }, { x: 2, y: 14 }, { x: 25, y: 14 }, { x: 25, y: 17 }, { x: 29, y: 17 }
];

const serpentinePoints = [
  { x: 0, y: 1 }, { x: 28, y: 1 }, { x: 28, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 5 }, { x: 28, y: 5 }, { x: 28, y: 7 }, { x: 1, y: 7 }, { x: 1, y: 9 }, { x: 28, y: 9 }, { x: 28, y: 11 }, { x: 1, y: 11 }, { x: 1, y: 13 }, { x: 28, y: 13 }, { x: 28, y: 15 }, { x: 1, y: 15 }, { x: 1, y: 17 }, { x: 29, y: 17 }
];

const impossiblePoints = [
  { x: 0, y: 9 }, { x: 2, y: 9 }, { x: 2, y: 2 }, { x: 27, y: 2 }, { x: 27, y: 17 }, { x: 2, y: 17 }, { x: 2, y: 10 }, { x: 29, y: 10 }
];

const redDawnPoints = [
  { x: 0, y: 10 }, { x: 5, y: 10 }, { x: 5, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 15 }, { x: 15, y: 15 }, { x: 15, y: 5 }, { x: 20, y: 5 }, { x: 20, y: 15 }, { x: 25, y: 15 }, { x: 25, y: 10 }, { x: 29, y: 10 }
];


export const LEVELS: LevelData[] = [
  { level: 1, name: "The Frontline", path: rasterizePath(frontlinePoints) },
  { level: 2, name: "The Gauntlet", path: rasterizePath(gauntletPoints) },
  { level: 3, name: "Serpentine", path: rasterizePath(serpentinePoints) },
  { level: 4, name: "Winter's Bite (Impossible)", path: rasterizePath(impossiblePoints) },
  { level: 6, name: "Red Dawn (ARMY)", path: rasterizePath(redDawnPoints) }
];


export const ENEMIES_BY_WAVE: Record<number, EnemyId[]> = {
  1: [...Array(5).fill('reindeer'), ...Array(5).fill('elf_warrior'), ...Array(15).fill('troop')],
  2: [...Array(10).fill('troop'), ...Array(15).fill('elf_warrior'), ...Array(5).fill('toy_soldier')],
  3: [...Array(20).fill('elf_warrior'), ...Array(15).fill('toy_soldier'), ...Array(5).fill('humvee')],
  4: [...Array(20).fill('reindeer'), ...Array(15).fill('humvee'), ...Array(5).fill('tank'), ...Array(2).fill('angry_snowman')],
  5: [...Array(25).fill('humvee'), ...Array(10).fill('tank'), ...Array(15).fill('toy_soldier')],
  6: [...Array(15).fill('humvee'), ...Array(20).fill('tank'), ...Array(5).fill('angry_snowman')],
  7: [...Array(30).fill('tank')],
  8: [...Array(20).fill('tank'), ...Array(20).fill('humvee'), ...Array(30).fill('troop')],
  9: [...Array(35).fill('tank'), ...Array(15).fill('humvee'), ...Array(10).fill('angry_snowman')],
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
  // --- EXTENDED WAVES 20-50 ---
  20: [...Array(15).fill('apc'), ...Array(15).fill('commando_troop'), ...Array(5).fill('angry_snowman'), ...Array(1).fill('boss')],
  21: [...Array(30).fill('supply_truck'), ...Array(20).fill('sniper_troop'), ...Array(10).fill('drone_swarm')],
  22: [...Array(20).fill('hover_tank'), ...Array(20).fill('apc')],
  23: [...Array(10).fill('mech_walker'), ...Array(30).fill('cyborg_soldier')],
  24: [...Array(15).fill('attack_heli'), ...Array(40).fill('supply_truck'), ...Array(5).fill('mobile_sam')],
  25: [...Array(1).fill('yeti'), ...Array(40).fill('snow_leopard')],
  26: [...Array(50).fill('commando_troop'), ...Array(10).fill('exo_suit')],
  27: [...Array(20).fill('plasma_tank'), ...Array(20).fill('railgun_tank')],
  28: [...Array(5).fill('ice_golem'), ...Array(30).fill('reindeer')],
  29: [...Array(30).fill('stealth_operative'), ...Array(10).fill('stealth_bomber')],
  30: [...Array(1).fill('frost_giant'), ...Array(20).fill('yeti')],
  31: [...Array(100).fill('drone_swarm')],
  32: [...Array(20).fill('mobile_sam'), ...Array(20).fill('hover_tank'), ...Array(5).fill('attack_heli')],
  33: [...Array(5).fill('zeppelin'), ...Array(50).fill('apc')],
  34: [...Array(15).fill('mech_walker'), ...Array(15).fill('plasma_tank')],
  35: [...Array(2).fill('krampus'), ...Array(2).fill('boss'), ...Array(50).fill('exo_suit')],
  36: [...Array(60).fill('snow_leopard'), ...Array(10).fill('yeti')],
  37: [...Array(40).fill('railgun_tank'), ...Array(20).fill('heavy_tank')],
  38: [...Array(10).fill('ice_golem'), ...Array(50).fill('commando_troop')],
  39: [...Array(5).fill('frost_giant'), ...Array(10).fill('zeppelin')],
  40: [...Array(1).fill('mothership')],
  41: [...Array(100).fill('sniper_troop'), ...Array(50).fill('cyborg_soldier')],
  42: [...Array(50).fill('drone_swarm'), ...Array(50).fill('jet'), ...Array(10).fill('attack_heli')],
  43: [...Array(50).fill('hover_tank'), ...Array(50).fill('plasma_tank')],
  44: [...Array(20).fill('mech_walker'), ...Array(20).fill('ice_golem')],
  45: [...Array(5).fill('mega_boss'), ...Array(50).fill('stealth_operative')],
  46: [...Array(30).fill('heavy_tank'), ...Array(30).fill('railgun_tank'), ...Array(30).fill('mobile_sam')],
  47: [...Array(100).fill('drone_swarm'), ...Array(5).fill('mothership')],
  48: [...Array(20).fill('frost_giant'), ...Array(50).fill('yeti')],
  49: [...Array(50).fill('zeppelin'), ...Array(50).fill('attack_heli')],
  50: [...Array(3).fill('mothership'), ...Array(10).fill('mega_boss'), ...Array(200).fill('drone_swarm')],
};
