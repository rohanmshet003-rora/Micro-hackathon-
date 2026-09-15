export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type PlasticType = 'bag' | 'bottle' | 'sixpack' | 'ghostnet';
export type FoodType = 'jellyfish' | 'seagrass';

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  radius: number;
  angle: number;
  flipperAngle: number;
  health: number;
  maxHealth: number;
  invulnerableTimer: number; // in seconds
  cleanupActiveTimer: number; // in seconds
  cleanupAuraRadius: number;
}

export interface PlasticHazard {
  id: string;
  type: PlasticType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  bobOffset: number;
  name: string;
  dangerNote: string;
}

export interface FoodCollectible {
  id: string;
  type: FoodType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  points: number;
  pulsePhase: number;
  name: string;
}

export interface CleanupPowerup {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  foodCollected: number;
  plasticAvoided: number;
  plasticCleaned: number;
  survivalTime: number; // in seconds
  distanceCovered: number; // in meters
  currentMultiplier: number; // Ocean current speed multiplier (1.0x to 2.85x)
  hazardInterval: number; // Seconds between plastic hazard spawns
}

export interface SDGFact {
  id: number;
  title: string;
  fact: string;
  actionTip: string;
}

export interface ScoreMilestone {
  threshold: number;
  level: number;
  title: string;
  badge: string;
  subtitle: string;
  color: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
}
