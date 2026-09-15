import { ScoreMilestone } from '../types';

export const GAME_CONFIG = {
  // World bounds & default canvas resolution
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 540,

  // Player properties
  PLAYER_SPEED: 320, // pixels per second
  PLAYER_BASE_RADIUS: 24,
  MAX_HEALTH: 3,
  INVULNERABLE_DURATION: 2.0, // seconds of blinking after taking damage
  CLEANUP_DURATION: 6.0, // duration of the cleanup pulse powerup aura
  CLEANUP_AURA_RADIUS: 140, // aura radius around turtle during powerup

  // Hazard spawning & frequency scaling based on Score
  BASE_HAZARD_SPEED: 180, // pixels per second drifting from right to left
  BASE_HAZARD_SPAWN_INTERVAL: 1.65, // seconds between plastic spawns at zero score
  MIN_HAZARD_SPAWN_INTERVAL: 0.42, // high-intensity plastic density cap at high scores
  SCORE_SPAWN_REDUCTION_RATE: 0.22, // reduces interval by ~0.22s per 1,000 points
  BURST_SPAWN_SCORE_THRESHOLD: 1200, // score at which double-hazard convergence waves can occur

  // Ocean Current speed scaling based on Score
  BASE_CURRENT_SPEED_MULTIPLIER: 1.0,
  MAX_CURRENT_SPEED_MULTIPLIER: 2.85,
  SCORE_CURRENT_SCALE_RATE: 0.35, // +0.35x current velocity multiplier per 1,000 points
  CURRENT_DRIFT_FORCE: 20, // subtle leftward hydrodynamic drift scaling with current multiplier

  // Collectibles spawning
  BASE_FOOD_SPEED: 140,
  FOOD_SPAWN_INTERVAL: 2.4, // seconds

  // Cleanup power-up spawning
  POWERUP_SPAWN_INTERVAL: 16.0, // seconds between power-up appearances
  POWERUP_SPEED: 120,

  // Difficulty progression
  DIFFICULTY_RAMP_INTERVAL: 12, // every 12 seconds, increase speed and spawn density
  MAX_DIFFICULTY_LEVEL: 10,

  // Scores
  SCORE_JELLYFISH: 100,
  SCORE_SEAGRASS: 150,
  SCORE_CLEANUP_POWERUP: 200,
  SCORE_RECYCLED_PLASTIC: 75,
  SURVIVAL_SCORE_PER_SEC: 10,
};

export const SCORE_MILESTONES: ScoreMilestone[] = [
  {
    threshold: 500,
    level: 1,
    title: 'Milestone Reached!',
    badge: '500 Points',
    subtitle: 'Ocean Scout — Navigating coastal currents safely!',
    color: '#34d399',
    borderClass: 'border-emerald-500/70',
    bgClass: 'bg-emerald-950/90',
    textClass: 'text-emerald-300',
  },
  {
    threshold: 1000,
    level: 2,
    title: 'Level Up!',
    badge: '1,000 Points',
    subtitle: 'Coral Guardian — Reef ecosystem protected!',
    color: '#38bdf8',
    borderClass: 'border-cyan-500/70',
    bgClass: 'bg-cyan-950/90',
    textClass: 'text-cyan-300',
  },
  {
    threshold: 2000,
    level: 3,
    title: 'Level Up!',
    badge: '2,000 Points',
    subtitle: 'Deep Sea Champion — SDG 14 Defender!',
    color: '#fbbf24',
    borderClass: 'border-amber-500/70',
    bgClass: 'bg-amber-950/90',
    textClass: 'text-amber-300',
  },
  {
    threshold: 3500,
    level: 4,
    title: 'Legendary Milestone!',
    badge: '3,500 Points',
    subtitle: 'Pelagic Hero — Defying the Great Garbage Patch!',
    color: '#a855f7',
    borderClass: 'border-purple-500/70',
    bgClass: 'bg-purple-950/90',
    textClass: 'text-purple-300',
  },
  {
    threshold: 5000,
    level: 5,
    title: 'Master of the Abyss!',
    badge: '5,000 Points',
    subtitle: 'Ocean Sovereign — Total marine ecosystem triumph!',
    color: '#f43f5e',
    borderClass: 'border-rose-500/70',
    bgClass: 'bg-rose-950/90',
    textClass: 'text-rose-300',
  },
];
