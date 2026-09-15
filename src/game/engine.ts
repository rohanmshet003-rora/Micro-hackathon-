import {
  GameState,
  Player,
  PlasticHazard,
  FoodCollectible,
  CleanupPowerup,
  Particle,
  FloatingText,
  GameStats,
  PlasticType,
  ScoreMilestone,
} from '../types';
import { GAME_CONFIG, SCORE_MILESTONES } from './constants';
import { GameRenderer } from './renderer';
import { soundFx } from '../utils/audio';

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: GameRenderer;

  private state: GameState = 'START';
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Entities
  private player: Player;
  private hazards: PlasticHazard[] = [];
  private foods: FoodCollectible[] = [];
  private powerups: CleanupPowerup[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private activeShockwaves: Shockwave[] = [];

  // Spawners & timers
  private hazardTimer: number = 0;
  private foodTimer: number = 0;
  private powerupTimer: number = 0;
  private bubbleTimer: number = 0;
  private survivalScoreTimer: number = 0;
  private difficultyLevel: number = 1;

  // Screen shake on hit
  private screenShakeTime: number = 0;
  private screenShakeIntensity: number = 0;

  // Input states
  private keys: Record<string, boolean> = {};

  // Game stats
  public stats: GameStats = {
    score: 0,
    highScore: 0,
    foodCollected: 0,
    plasticAvoided: 0,
    plasticCleaned: 0,
    survivalTime: 0,
    distanceCovered: 0,
    currentMultiplier: 1.0,
    hazardInterval: GAME_CONFIG.BASE_HAZARD_SPAWN_INTERVAL,
  };

  // UI callbacks
  private onStatsChange?: (stats: GameStats) => void;
  private onStateChange?: (state: GameState) => void;
  private onMilestoneReached?: (milestone: ScoreMilestone) => void;

  // Track milestones achieved in current session
  private achievedMilestones: Set<number> = new Set();

  constructor(
    canvas: HTMLCanvasElement,
    onStatsChange?: (stats: GameStats) => void,
    onStateChange?: (state: GameState) => void,
    onMilestoneReached?: (milestone: ScoreMilestone) => void
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context could not be acquired.');
    }
    this.ctx = context;
    this.renderer = new GameRenderer(this.ctx, canvas.width, canvas.height);
    this.onStatsChange = onStatsChange;
    this.onStateChange = onStateChange;
    this.onMilestoneReached = onMilestoneReached;

    this.player = this.createDefaultPlayer();
    this.loadHighScore();
    this.setupInputs();
  }

  /**
   * Centralized score increment with milestone threshold checking
   */
  public addScore(points: number) {
    this.stats.score += points;
    this.saveHighScore();
    this.checkMilestones();
    this.onStatsChange?.({ ...this.stats });
  }

  private checkMilestones() {
    for (const milestone of SCORE_MILESTONES) {
      if (
        this.stats.score >= milestone.threshold &&
        !this.achievedMilestones.has(milestone.threshold)
      ) {
        this.achievedMilestones.add(milestone.threshold);
        this.triggerMilestoneCelebration(milestone);
      }
    }
  }

  private triggerMilestoneCelebration(milestone: ScoreMilestone) {
    // Play distinctive celebratory chime
    soundFx.playMilestoneSound();

    // Visual fanfare on canvas: expanding high-speed shockwave
    this.activeShockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 20,
      maxRadius: Math.max(this.canvas.width, this.canvas.height) * 0.85,
      speed: 600,
    });

    // Golden/milestone celebratory burst particles
    this.spawnMilestoneBurst(this.player.x, this.player.y, milestone.color);

    // High-visibility floating text alert over player
    this.addFloatingText(
      `★ ${milestone.title.toUpperCase()}! ${milestone.badge} ★`,
      this.player.x,
      this.player.y - 35,
      milestone.color
    );

    // Notify React layer for toast overlay
    this.onMilestoneReached?.(milestone);
  }

  private spawnMilestoneBurst(x: number, y: number, color: string) {
    const palette = [color, '#ffffff', '#38bdf8', '#fbbf24', '#34d399'];
    for (let i = 0; i < 32; i++) {
      const angle = (Math.PI * 2 * i) / 32 + (Math.random() - 0.5) * 0.25;
      const speed = 70 + Math.random() * 150;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 1,
        life: 0.9 + Math.random() * 0.4,
        maxLife: 1.3,
      });
    }
  }

  private createDefaultPlayer(): Player {
    return {
      x: 120,
      y: this.canvas.height / 2,
      vx: 0,
      vy: 0,
      width: 48,
      height: 36,
      radius: GAME_CONFIG.PLAYER_BASE_RADIUS,
      angle: 0,
      flipperAngle: 0,
      health: GAME_CONFIG.MAX_HEALTH,
      maxHealth: GAME_CONFIG.MAX_HEALTH,
      invulnerableTimer: 0,
      cleanupActiveTimer: 0,
      cleanupAuraRadius: GAME_CONFIG.CLEANUP_AURA_RADIUS,
    };
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem('ocean_turtle_high_score');
      if (saved) {
        this.stats.highScore = parseInt(saved, 10) || 0;
      }
    } catch {}
  }

  private saveHighScore() {
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      try {
        localStorage.setItem('ocean_turtle_high_score', String(this.stats.highScore));
      } catch {}
    }
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderer.resize(width, height);
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      // Prevent page scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      this.keys[e.code] = true;

      // Pause toggle with Escape or P
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'PLAYING') {
          this.pause();
        } else if (this.state === 'PAUSED') {
          this.resume();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  /**
   * Set programmatic direction (for touch/mouse controls)
   */
  public setTouchDirection(dx: number, dy: number) {
    if (this.state !== 'PLAYING') return;
    this.player.vx = dx * GAME_CONFIG.PLAYER_SPEED;
    this.player.vy = dy * GAME_CONFIG.PLAYER_SPEED;
  }

  public start() {
    this.reset();
    this.state = 'PLAYING';
    this.onStateChange?.(this.state);
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public pause() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.onStateChange?.(this.state);
  }

  public resume() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.onStateChange?.(this.state);
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public restart() {
    this.start();
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public reset() {
    this.player = this.createDefaultPlayer();
    this.hazards = [];
    this.foods = [];
    this.powerups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.activeShockwaves = [];
    this.achievedMilestones.clear();

    this.hazardTimer = 0.5;
    this.foodTimer = 1.0;
    this.powerupTimer = GAME_CONFIG.POWERUP_SPAWN_INTERVAL * 0.6;
    this.bubbleTimer = 0;
    this.survivalScoreTimer = 0;
    this.difficultyLevel = 1;
    this.screenShakeTime = 0;

    const currentHighScore = this.stats.highScore;
    this.stats = {
      score: 0,
      highScore: currentHighScore,
      foodCollected: 0,
      plasticAvoided: 0,
      plasticCleaned: 0,
      survivalTime: 0,
      distanceCovered: 0,
      currentMultiplier: 1.0,
      hazardInterval: GAME_CONFIG.BASE_HAZARD_SPAWN_INTERVAL,
    };
    this.onStatsChange?.(this.stats);
  }

  public getState(): GameState {
    return this.state;
  }

  public getPlayer(): Player {
    return this.player;
  }

  private loop = (currentTime: number) => {
    if (this.state !== 'PLAYING') {
      return;
    }

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1); // clamp dt to avoid spiral
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Calculate dynamic ocean current speed multiplier driven primarily by player's score
   * Base: 1.0x at 0 score -> scales up to 2.85x at high scores
   */
  public getCurrentSpeedMultiplier(): number {
    const scoreBonus = (this.stats.score / 1000) * GAME_CONFIG.SCORE_CURRENT_SCALE_RATE;
    const timeBonus = Math.min(0.2, (this.stats.survivalTime / 60) * 0.08);
    const multiplier = GAME_CONFIG.BASE_CURRENT_SPEED_MULTIPLIER + scoreBonus + timeBonus;
    return Math.min(GAME_CONFIG.MAX_CURRENT_SPEED_MULTIPLIER, Math.max(1.0, multiplier));
  }

  /**
   * Calculate frequency interval between plastic hazard spawns
   * Base: 1.65s at 0 score -> rapidly contracts as score rises down to 0.42s
   */
  public getHazardSpawnInterval(): number {
    const scoreReduction = (this.stats.score / 1000) * GAME_CONFIG.SCORE_SPAWN_REDUCTION_RATE;
    const timeReduction = (this.difficultyLevel - 1) * 0.04;
    const targetInterval = GAME_CONFIG.BASE_HAZARD_SPAWN_INTERVAL - scoreReduction - timeReduction;
    return Math.max(GAME_CONFIG.MIN_HAZARD_SPAWN_INTERVAL, targetInterval);
  }

  private update(dt: number) {
    const currentMultiplier = this.getCurrentSpeedMultiplier();
    const hazardInterval = this.getHazardSpawnInterval();

    // 1. Difficulty progression
    this.stats.survivalTime += dt;
    this.stats.distanceCovered += dt * (12 * currentMultiplier);
    this.difficultyLevel = Math.min(
      GAME_CONFIG.MAX_DIFFICULTY_LEVEL,
      1 + Math.floor(this.stats.survivalTime / GAME_CONFIG.DIFFICULTY_RAMP_INTERVAL)
    );

    // Keep stats updated with current velocity and interval
    this.stats.currentMultiplier = currentMultiplier;
    this.stats.hazardInterval = hazardInterval;

    // Passive survival score points
    this.survivalScoreTimer += dt;
    if (this.survivalScoreTimer >= 1.0) {
      this.addScore(GAME_CONFIG.SURVIVAL_SCORE_PER_SEC);
      this.survivalScoreTimer = 0;
    }

    // 2. Player Movement via Keyboard with hydrodynamic ocean current drift
    let moveX = 0;
    let moveY = 0;

    if (this.keys['ArrowUp'] || this.keys['KeyW']) moveY -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) moveY += 1;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveX -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) moveX += 1;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      const len = Math.SQRT2;
      moveX /= len;
      moveY /= len;
    }

    const targetVx = moveX * GAME_CONFIG.PLAYER_SPEED;
    const targetVy = moveY * GAME_CONFIG.PLAYER_SPEED;

    // Smooth inertia
    this.player.vx += (targetVx - this.player.vx) * 0.2;
    this.player.vy += (targetVy - this.player.vy) * 0.2;

    // Subtle hydrodynamic current resistance/drift pushing leftward as current intensifies
    const currentDriftForce = (currentMultiplier - 1.0) * GAME_CONFIG.CURRENT_DRIFT_FORCE;
    this.player.x += (this.player.vx - currentDriftForce) * dt;
    this.player.y += this.player.vy * dt;

    // Soft clamp within ocean boundaries
    const margin = 32;
    const topMargin = 45; // surface barrier
    const bottomMargin = this.canvas.height - 40; // seabed barrier

    if (this.player.x < margin) {
      this.player.x = margin;
      this.player.vx = 0;
    } else if (this.player.x > this.canvas.width - margin) {
      this.player.x = this.canvas.width - margin;
      this.player.vx = 0;
    }

    if (this.player.y < topMargin) {
      this.player.y = topMargin;
      this.player.vy = 0;
    } else if (this.player.y > bottomMargin) {
      this.player.y = bottomMargin;
      this.player.vy = 0;
    }

    // Tilt angle based on vertical movement
    const targetAngle = (this.player.vy / GAME_CONFIG.PLAYER_SPEED) * 0.35;
    this.player.angle += (targetAngle - this.player.angle) * 0.15;

    // Flipper flapping animation rate based on movement speed
    const currentSpeed = Math.hypot(this.player.vx, this.player.vy);
    const flapSpeed = 4 + (currentSpeed / GAME_CONFIG.PLAYER_SPEED) * 8;
    this.player.flipperAngle += flapSpeed * dt;

    // 3. Turtle Bubble Trails
    this.bubbleTimer += dt;
    if (this.bubbleTimer > 0.08) {
      this.bubbleTimer = 0;
      this.spawnTurtleBubble();
    }

    // 4. Timers (Invulnerability & Cleanup Power-Up)
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer = Math.max(0, this.player.invulnerableTimer - dt);
    }

    if (this.player.cleanupActiveTimer > 0) {
      this.player.cleanupActiveTimer = Math.max(0, this.player.cleanupActiveTimer - dt);
      // Eco-pulse aura actively recycles any nearby plastic
      this.cleanseNearbyPlastics(this.player.x, this.player.y, this.player.cleanupAuraRadius);
    }

    // 5. Update Active Shockwaves
    for (let i = this.activeShockwaves.length - 1; i >= 0; i--) {
      const sw = this.activeShockwaves[i];
      sw.radius += sw.speed * dt;
      this.cleanseNearbyPlastics(sw.x, sw.y, sw.radius);

      if (sw.radius >= sw.maxRadius) {
        this.activeShockwaves.splice(i, 1);
      }
    }

    // 6. Spawning Entities
    this.updateSpawners(dt);

    // 7. Update Entities Positions & Off-screen Removal
    this.updateEntities(dt);

    // 8. Collisions Check
    this.checkCollisions();

    // 9. Update Particles & Floating Texts
    this.updateParticles(dt);

    // 10. Screen Shake decay
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
    }

    this.renderer.updateTime(dt, currentMultiplier);
  }

  private spawnTurtleBubble() {
    const angle = this.player.angle + Math.PI;
    const dist = 20;
    this.particles.push({
      x: this.player.x + Math.cos(angle) * dist + (Math.random() - 0.5) * 8,
      y: this.player.y + Math.sin(angle) * dist + (Math.random() - 0.5) * 8,
      vx: -40 - Math.random() * 30,
      vy: (Math.random() - 0.5) * 20 - 15, // float gently upward
      radius: 1.8 + Math.random() * 2.5,
      color: 'rgba(255, 255, 255, 0.7)',
      alpha: 0.8,
      life: 0.8 + Math.random() * 0.4,
      maxLife: 1.2,
    });
  }

  private updateSpawners(dt: number) {
    // Dynamic Plastic Hazard Spawner scaled by player score
    this.hazardTimer -= dt;
    const currentSpawnInterval = this.getHazardSpawnInterval();

    if (this.hazardTimer <= 0) {
      this.spawnPlasticHazard();

      // High-score convergence waves: frequent double-hazard currents
      if (
        this.stats.score >= GAME_CONFIG.BURST_SPAWN_SCORE_THRESHOLD &&
        Math.random() < Math.min(0.40, 0.12 + (this.stats.score - GAME_CONFIG.BURST_SPAWN_SCORE_THRESHOLD) / 6000)
      ) {
        // Spawn a trailing hazard slightly offset in elevation
        this.spawnPlasticHazard(true);
      }

      this.hazardTimer = currentSpawnInterval;
    }

    // Food Collectibles Spawner
    this.foodTimer -= dt;
    if (this.foodTimer <= 0) {
      this.spawnFoodCollectible();
      this.foodTimer = GAME_CONFIG.FOOD_SPAWN_INTERVAL + (Math.random() - 0.5) * 0.6;
    }

    // Innovation Cleanup Power-Up Spawner
    this.powerupTimer -= dt;
    if (this.powerupTimer <= 0) {
      this.spawnCleanupPowerup();
      this.powerupTimer = GAME_CONFIG.POWERUP_SPAWN_INTERVAL + Math.random() * 4;
    }
  }

  private spawnPlasticHazard(isBurst: boolean = false) {
    const types: PlasticType[] = ['bag', 'bottle', 'sixpack', 'ghostnet'];
    // Higher difficulties and scores unlock ghost nets and more bags
    const availableTypes = this.difficultyLevel > 2 || this.stats.score > 800 ? types : ['bag', 'bottle', 'sixpack'];
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)] as PlasticType;

    const currentMultiplier = this.getCurrentSpeedMultiplier();
    const baseSpeed = GAME_CONFIG.BASE_HAZARD_SPEED * currentMultiplier;
    const speedSpread = 35 * (1 + (currentMultiplier - 1) * 0.4);

    const names: Record<PlasticType, string> = {
      bag: 'Single-Use Plastic Bag',
      bottle: 'Discarded PET Bottle',
      sixpack: 'Plastic 6-Pack Ring',
      ghostnet: 'Ghost Fishing Net',
    };

    const notes: Record<PlasticType, string> = {
      bag: 'Turtles mistake plastic bags for jellyfish!',
      bottle: 'Breaks into toxic microplastics.',
      sixpack: 'Entangles flippers and heads.',
      ghostnet: 'Drowns marine wildlife for years.',
    };

    const spawnY = isBurst
      ? Math.max(60, Math.min(this.canvas.height - 120, this.player.y + (Math.random() > 0.5 ? 90 : -90)))
      : 60 + Math.random() * (this.canvas.height - 120);

    const spawnX = isBurst ? this.canvas.width + 110 : this.canvas.width + 40;

    this.hazards.push({
      id: `hazard-${Date.now()}-${Math.random()}`,
      type,
      x: spawnX,
      y: spawnY,
      vx: -(baseSpeed + Math.random() * speedSpread),
      vy: (Math.random() - 0.5) * (26 + currentMultiplier * 8), // buoyant vertical current bobbing
      radius: type === 'ghostnet' ? 22 : type === 'bag' ? 20 : 16,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * (1.4 + currentMultiplier * 0.5),
      bobOffset: Math.random() * Math.PI * 2,
      name: names[type],
      dangerNote: notes[type],
    });
  }

  private spawnFoodCollectible() {
    const type = Math.random() > 0.4 ? 'jellyfish' : 'seagrass';
    const spawnY = 55 + Math.random() * (this.canvas.height - 110);
    const currentMultiplier = this.getCurrentSpeedMultiplier();
    const speedMultiplier = Math.min(1.85, 1 + (currentMultiplier - 1) * 0.45);

    this.foods.push({
      id: `food-${Date.now()}-${Math.random()}`,
      type,
      x: this.canvas.width + 30,
      y: spawnY,
      vx: -(GAME_CONFIG.BASE_FOOD_SPEED * speedMultiplier),
      vy: (Math.random() - 0.5) * 20,
      radius: type === 'jellyfish' ? 18 : 15,
      points: type === 'jellyfish' ? GAME_CONFIG.SCORE_JELLYFISH : GAME_CONFIG.SCORE_SEAGRASS,
      pulsePhase: Math.random() * Math.PI * 2,
      name: type === 'jellyfish' ? 'Healthy Jellyfish' : 'Nutritious Seagrass',
    });
  }

  private spawnCleanupPowerup() {
    // Don't clutter if already one active on screen
    if (this.powerups.length > 0) return;

    const currentMultiplier = this.getCurrentSpeedMultiplier();
    const spawnY = 80 + Math.random() * (this.canvas.height - 160);
    this.powerups.push({
      id: `powerup-${Date.now()}`,
      x: this.canvas.width + 30,
      y: spawnY,
      vx: -(GAME_CONFIG.POWERUP_SPEED * Math.min(1.7, 1 + (currentMultiplier - 1) * 0.35)),
      vy: Math.sin(Math.random() * 5) * 20,
      radius: 20,
      pulsePhase: Math.random() * Math.PI * 2,
    });
  }

  private updateEntities(dt: number) {
    // 1. Hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.x += h.vx * dt;
      h.y += h.vy * dt + Math.sin(this.stats.survivalTime * 2 + h.bobOffset) * 0.4;
      h.rotation += h.rotationSpeed * dt;

      // Despawn off-screen left -> count as plastic avoided!
      if (h.x < -60) {
        this.hazards.splice(i, 1);
        this.stats.plasticAvoided += 1;
        this.onStatsChange?.({ ...this.stats });
      }
    }

    // 2. Foods
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const f = this.foods[i];
      f.x += f.vx * dt;
      f.y += f.vy * dt;

      if (f.x < -50) {
        this.foods.splice(i, 1);
      }
    }

    // 3. Powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < -50) {
        this.powerups.splice(i, 1);
      }
    }
  }

  private checkCollisions() {
    const px = this.player.x;
    const py = this.player.y;
    const pr = this.player.radius;

    // 1. Check Food Collisions
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const food = this.foods[i];
      const dist = Math.hypot(px - food.x, py - food.y);

      if (dist < pr + food.radius) {
        // Collect food!
        this.addScore(food.points);
        this.stats.foodCollected += 1;
        this.onStatsChange?.({ ...this.stats });

        soundFx.playEatSound();

        // Spawn sparkling eating particles
        this.spawnBurstParticles(food.x, food.y, food.type === 'jellyfish' ? '#f472b6' : '#34d399', 10);

        // Floating score tag
        this.addFloatingText(`+${food.points}`, food.x, food.y - 10, '#34d399');

        this.foods.splice(i, 1);
      }
    }

    // 2. Check Cleanup Power-Up Collisions (Innovation Feature)
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pup = this.powerups[i];
      const dist = Math.hypot(px - pup.x, py - pup.y);

      if (dist < pr + pup.radius) {
        // Activate Innovation Feature: Eco-Cleanup Pulse!
        this.player.cleanupActiveTimer = GAME_CONFIG.CLEANUP_DURATION;
        this.addScore(GAME_CONFIG.SCORE_CLEANUP_POWERUP);
        this.onStatsChange?.({ ...this.stats });

        soundFx.playPowerupSound();

        // Trigger expanding shockwave across the screen
        this.activeShockwaves.push({
          x: px,
          y: py,
          radius: 10,
          maxRadius: Math.max(this.canvas.width, this.canvas.height) * 0.9,
          speed: 700,
        });

        // Visual fanfare
        this.spawnBurstParticles(pup.x, pup.y, '#34d399', 24);
        this.addFloatingText('CLEANUP ACTIVE! +200', pup.x, pup.y - 15, '#a7f3d0');

        this.powerups.splice(i, 1);
      }
    }

    // 3. Check Plastic Hazard Collisions
    if (this.player.invulnerableTimer <= 0) {
      for (let i = this.hazards.length - 1; i >= 0; i--) {
        const hazard = this.hazards[i];
        const dist = Math.hypot(px - hazard.x, py - hazard.y);

        if (dist < pr + hazard.radius) {
          // If Cleanup Power-up is active, the shield destroys plastic without taking damage!
          if (this.player.cleanupActiveTimer > 0) {
            this.recycleHazard(hazard, i);
            continue;
          }

          // Damage taken
          this.player.health -= 1;
          this.player.invulnerableTimer = GAME_CONFIG.INVULNERABLE_DURATION;

          // Screen shake & audio
          this.triggerScreenShake(0.3, 8);
          soundFx.playHitSound();

          // Particle burst & damage alert
          this.spawnBurstParticles(hazard.x, hazard.y, '#ef4444', 16);
          this.addFloatingText('-1 LIFE!', px, py - 24, '#f87171');

          // Remove the collided hazard
          this.hazards.splice(i, 1);
          this.onStatsChange?.({ ...this.stats });

          // Game Over condition
          if (this.player.health <= 0) {
            this.triggerGameOver();
            return;
          }
          break;
        }
      }
    }
  }

  /**
   * Recycles nearby plastic when hit by Cleanup Aura or Shockwave
   */
  private cleanseNearbyPlastics(centerX: number, centerY: number, radius: number) {
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const hazard = this.hazards[i];
      const dist = Math.hypot(centerX - hazard.x, centerY - hazard.y);

      if (dist <= radius + hazard.radius) {
        this.recycleHazard(hazard, i);
      }
    }
  }

  private recycleHazard(hazard: PlasticHazard, index: number) {
    this.hazards.splice(index, 1);
    this.addScore(GAME_CONFIG.SCORE_RECYCLED_PLASTIC);
    this.stats.plasticCleaned += 1;
    this.onStatsChange?.({ ...this.stats });

    soundFx.playRecycleSound();

    // Disintegration sparkle
    this.spawnBurstParticles(hazard.x, hazard.y, '#34d399', 12);
    this.addFloatingText('RECYCLED! +75', hazard.x, hazard.y - 10, '#6ee7b7');
  }

  private triggerScreenShake(duration: number, intensity: number) {
    this.screenShakeTime = duration;
    this.screenShakeIntensity = intensity;
  }

  private triggerGameOver() {
    this.state = 'GAMEOVER';
    this.saveHighScore();
    soundFx.playGameOverSound();
    this.onStateChange?.(this.state);
  }

  private spawnBurstParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
      });
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: `ft-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
      life: 0.8,
      maxLife: 0.8,
    });
  }

  private updateParticles(dt: number) {
    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 35 * dt; // float upward
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / ft.maxLife);

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public render() {
    const ctx = this.ctx;
    ctx.save();

    // Apply screen shake if active
    if (this.screenShakeTime > 0) {
      const sx = (Math.random() - 0.5) * this.screenShakeIntensity;
      const sy = (Math.random() - 0.5) * this.screenShakeIntensity;
      ctx.translate(sx, sy);
    }

    // 1. Multi-layered Ocean & Reef Background with dynamic current flows
    this.renderer.drawBackground(this.getCurrentSpeedMultiplier());

    // 2. Active Shockwaves
    this.activeShockwaves.forEach((sw) => {
      this.renderer.drawShockwave(sw.x, sw.y, sw.radius, sw.maxRadius);
    });

    // 3. Power-ups
    this.powerups.forEach((pup) => {
      this.renderer.drawCleanupPowerup(pup);
    });

    // 4. Food Collectibles
    this.foods.forEach((food) => {
      this.renderer.drawFoodCollectible(food);
    });

    // 5. Plastic Hazards
    this.hazards.forEach((hazard) => {
      this.renderer.drawPlasticHazard(hazard);
    });

    // 6. Player Sea Turtle
    this.renderer.drawTurtle(this.player);

    // 7. Particle FX
    this.renderer.drawParticles(this.particles);

    // 8. Floating Texts
    this.renderer.drawFloatingTexts(this.floatingTexts);

    ctx.restore();
  }
}
