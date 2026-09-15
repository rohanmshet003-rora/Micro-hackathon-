import {
  Player,
  PlasticHazard,
  FoodCollectible,
  CleanupPowerup,
  Particle,
  FloatingText,
} from '../types';

interface OceanCurrentStream {
  x: number;
  y: number;
  length: number;
  speed: number;
  width: number;
  alpha: number;
  waveFreq: number;
  waveAmp: number;
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private ambientTime: number = 0;
  private currentStreams: OceanCurrentStream[] = [];

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.initCurrentStreams();
  }

  private initCurrentStreams() {
    this.currentStreams = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      this.currentStreams.push({
        x: Math.random() * this.width,
        y: 35 + Math.random() * (this.height - 85),
        length: 50 + Math.random() * 85,
        speed: 95 + Math.random() * 95,
        width: 1.2 + Math.random() * 1.6,
        alpha: 0.12 + Math.random() * 0.18,
        waveFreq: 1.8 + Math.random() * 2.2,
        waveAmp: 3 + Math.random() * 5,
      });
    }
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initCurrentStreams();
  }

  public updateTime(dt: number, currentMultiplier: number = 1.0) {
    this.ambientTime += dt * Math.min(2.5, 0.7 + currentMultiplier * 0.3);

    // Update current streamlines
    for (const stream of this.currentStreams) {
      stream.x -= stream.speed * currentMultiplier * dt;
      if (stream.x + stream.length < -40) {
        stream.x = this.width + 30 + Math.random() * 120;
        stream.y = 35 + Math.random() * (this.height - 85);
        stream.length = 50 + Math.random() * 85;
        stream.speed = 95 + Math.random() * 95;
      }
    }
  }

  /**
   * Draw dynamic ocean current streamlines across depth layers
   */
  public drawOceanCurrents(currentMultiplier: number = 1.0) {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineCap = 'round';

    for (const stream of this.currentStreams) {
      const { x, y, length, width, alpha, waveFreq, waveAmp } = stream;
      const effectiveLength = length * (1 + (currentMultiplier - 1) * 0.4);

      const grad = ctx.createLinearGradient(x, y, x + effectiveLength, y);
      const intensity = Math.min(0.65, alpha * (0.8 + currentMultiplier * 0.4));

      grad.addColorStop(0, `rgba(255, 255, 255, ${intensity * 1.5})`);
      grad.addColorStop(0.3, `rgba(186, 230, 253, ${intensity})`);
      grad.addColorStop(0.8, `rgba(56, 189, 248, ${intensity * 0.4})`);
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = width * (1 + (currentMultiplier - 1) * 0.25);

      ctx.beginPath();
      ctx.moveTo(x, y);

      const segments = 4;
      const segLen = effectiveLength / segments;
      for (let s = 1; s <= segments; s++) {
        const segX = x + s * segLen;
        const wave = Math.sin(this.ambientTime * waveFreq * currentMultiplier + s + x * 0.02) * waveAmp;
        ctx.lineTo(segX, y + wave);
      }
      ctx.stroke();

      // At higher current speeds, draw subtle hydrodynamic micro-droplets/bubbles
      if (currentMultiplier >= 1.35 && stream.speed > 130) {
        ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.8})`;
        const bubbleX = x + 0.3 * effectiveLength;
        const bubbleY = y + Math.sin(this.ambientTime * waveFreq * currentMultiplier + x * 0.02) * waveAmp;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Draw the multi-layered ocean background with surface rays and depth gradient
   */
  public drawBackground(currentMultiplier: number = 1.0) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Ocean Depth Gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, '#023e8a'); // sunlight turquoise/blue at top
    oceanGrad.addColorStop(0.35, '#0077b6');
    oceanGrad.addColorStop(0.7, '#005288');
    oceanGrad.addColorStop(1, '#001845'); // deep abyss at bottom
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Animated Caustic Sunlight Rays from surface
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 6; i++) {
      const rayOffset = (i * 180 + Math.sin(this.ambientTime * 0.8 + i) * 60) % (w + 200) - 100;
      const rayGrad = ctx.createLinearGradient(rayOffset, 0, rayOffset + 120, h * 0.85);
      const alpha = 0.07 + Math.sin(this.ambientTime * 1.5 + i * 1.2) * 0.03;
      rayGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 1.8})`);
      rayGrad.addColorStop(0.5, `rgba(180, 240, 255, ${alpha})`);
      rayGrad.addColorStop(1, 'rgba(0, 50, 100, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(rayOffset, 0);
      ctx.lineTo(rayOffset + 60, 0);
      ctx.lineTo(rayOffset + 240, h);
      ctx.lineTo(rayOffset + 120, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Dynamic Ocean Currents
    this.drawOceanCurrents(currentMultiplier);

    // 4. Seabed Reef Silhouette & Coral at Bottom
    this.drawSeabed(currentMultiplier);
  }

  private drawSeabed(currentMultiplier: number = 1.0) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Distant dark reef hills
    ctx.fillStyle = 'rgba(0, 15, 40, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 40) {
      const y = h - 45 + Math.sin(x * 0.008 + 1) * 15 + Math.cos(x * 0.02) * 8;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Foreground swaying kelp fronds
    ctx.save();
    ctx.strokeStyle = '#004b49';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    const currentBend = (currentMultiplier - 1.0) * 12; // bend leftwards in current
    for (let k = 30; k < w; k += 80) {
      const sway = Math.sin(this.ambientTime * (1.5 * Math.min(2.2, currentMultiplier)) + k * 0.05) * (14 + currentMultiplier * 4) - currentBend;
      const kelpHeight = 60 + ((k * 37) % 45);
      ctx.beginPath();
      ctx.moveTo(k, h);
      ctx.quadraticCurveTo(k + sway * 0.5, h - kelpHeight * 0.5, k + sway, h - kelpHeight);
      ctx.stroke();

      // Small leaf nodes
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.arc(k + sway, h - kelpHeight, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Draw the player Sea Turtle with animated flippers and directional tilt
   */
  public drawTurtle(player: Player) {
    const ctx = this.ctx;

    // Blinking effect during invulnerability
    if (player.invulnerableTimer > 0) {
      const blink = Math.floor(player.invulnerableTimer * 12) % 2 === 0;
      if (blink) return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // If Cleanup Power-up is active, draw a protective shimmering eco-shield bubble
    if (player.cleanupActiveTimer > 0) {
      this.drawCleanupShield(player.cleanupActiveTimer);
    }

    const flipperSwing = Math.sin(player.flipperAngle) * 0.35;

    // 1. Back Flippers (left & right)
    ctx.fillStyle = '#2d6a4f';
    ctx.strokeStyle = '#1b4332';
    ctx.lineWidth = 1.5;

    // Upper rear flipper
    ctx.save();
    ctx.translate(-18, -12);
    ctx.rotate(-0.4 - flipperSwing * 0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Lower rear flipper
    ctx.save();
    ctx.translate(-18, 12);
    ctx.rotate(0.4 + flipperSwing * 0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Short Tail
    ctx.fillStyle = '#40916c';
    ctx.beginPath();
    ctx.moveTo(-22, -3);
    ctx.lineTo(-30, 0);
    ctx.lineTo(-22, 3);
    ctx.closePath();
    ctx.fill();

    // 3. Front Swimming Flippers (Large hydrodynamic paddles)
    // Upper front flipper
    ctx.save();
    ctx.translate(2, -14);
    ctx.rotate(-0.8 + flipperSwing);
    ctx.beginPath();
    ctx.ellipse(0, -10, 8, 22, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#40916c';
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Lower front flipper
    ctx.save();
    ctx.translate(2, 14);
    ctx.rotate(0.8 - flipperSwing);
    ctx.beginPath();
    ctx.ellipse(0, 10, 8, 22, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#40916c';
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 4. Turtle Head & Neck
    ctx.fillStyle = '#52b788';
    ctx.beginPath();
    ctx.ellipse(24, 0, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Beak snout
    ctx.fillStyle = '#74c69d';
    ctx.beginPath();
    ctx.moveTo(34, -3);
    ctx.lineTo(39, 0);
    ctx.lineTo(34, 3);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#081c15';
    ctx.beginPath();
    ctx.arc(27, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(28, -5, 1, 0, Math.PI * 2);
    ctx.fill();

    // 5. Carapace (Shell Body)
    const shellGrad = ctx.createRadialGradient(2, -2, 4, 0, 0, 24);
    shellGrad.addColorStop(0, '#74c69d');
    shellGrad.addColorStop(0.5, '#40916c');
    shellGrad.addColorStop(1, '#1b4332');

    ctx.fillStyle = shellGrad;
    ctx.strokeStyle = '#081c15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Carapace scutes (decorative shell plates pattern)
    ctx.strokeStyle = '#95d5b2';
    ctx.lineWidth = 1.2;

    // Center scute
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Lateral ridges
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(-18, 0);
    ctx.moveTo(9, 0);
    ctx.lineTo(18, 0);
    ctx.moveTo(0, -6);
    ctx.lineTo(0, -14);
    ctx.moveTo(0, 6);
    ctx.lineTo(0, 14);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Radiant eco-bubble shield active during Cleanup Powerup
   */
  private drawCleanupShield(remainingTime: number) {
    const ctx = this.ctx;
    const pulse = 1 + Math.sin(this.ambientTime * 8) * 0.06;
    const radius = 34 * pulse;

    ctx.save();
    // Rotating outer ring
    ctx.rotate(this.ambientTime * 2);
    ctx.strokeStyle = 'rgba(78, 245, 189, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Shimmering bubble body
    const bubbleGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
    bubbleGrad.addColorStop(0, 'rgba(78, 245, 189, 0.1)');
    bubbleGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.25)');
    bubbleGrad.addColorStop(1, 'rgba(78, 245, 189, 0.6)');
    ctx.fillStyle = bubbleGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw the various plastic hazards with distinct, instantly recognizable graphics
   */
  public drawPlasticHazard(hazard: PlasticHazard) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(hazard.x, hazard.y);
    ctx.rotate(hazard.rotation);

    switch (hazard.type) {
      case 'bag':
        this.drawPlasticBag();
        break;
      case 'bottle':
        this.drawPlasticBottle();
        break;
      case 'sixpack':
        this.drawSixPackRing();
        break;
      case 'ghostnet':
        this.drawGhostNet();
        break;
    }

    ctx.restore();
  }

  /**
   * Translucent plastic shopping bag with handles and billows
   * Clearly shows why sea turtles mistake it for a jellyfish!
   */
  private drawPlasticBag() {
    const ctx = this.ctx;
    const wave = Math.sin(this.ambientTime * 3) * 3;

    // Translucent white-gray plastic
    ctx.fillStyle = 'rgba(235, 245, 255, 0.65)';
    ctx.strokeStyle = 'rgba(200, 225, 245, 0.9)';
    ctx.lineWidth = 1.5;

    // Billowing bag body
    ctx.beginPath();
    ctx.moveTo(-16, -14);
    ctx.quadraticCurveTo(0, -18 + wave, 16, -14);
    ctx.lineTo(18, 12);
    // Crinkled bottom edge
    ctx.quadraticCurveTo(8, 18 - wave, 0, 12);
    ctx.quadraticCurveTo(-8, 16 + wave, -18, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bag handles (looped at left/right)
    ctx.beginPath();
    ctx.moveTo(-12, -14);
    ctx.bezierCurveTo(-15, -24, -5, -24, -6, -14);
    ctx.moveTo(6, -14);
    ctx.bezierCurveTo(5, -24, 15, -24, 12, -14);
    ctx.stroke();

    // Crinkle crease lines inside bag
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(8, 2);
    ctx.moveTo(-6, 4);
    ctx.lineTo(12, 8);
    ctx.stroke();
  }

  /**
   * Clear plastic beverage bottle with screw-cap and label
   */
  private drawPlasticBottle() {
    const ctx = this.ctx;

    // Bottle body
    ctx.fillStyle = 'rgba(180, 230, 255, 0.6)';
    ctx.strokeStyle = 'rgba(130, 200, 240, 0.85)';
    ctx.lineWidth = 1.5;

    // Main cylinder
    ctx.beginPath();
    ctx.roundRect(-12, -8, 22, 16, 4);
    ctx.fill();
    ctx.stroke();

    // Tapered neck
    ctx.beginPath();
    ctx.moveTo(10, -5);
    ctx.lineTo(16, -3);
    ctx.lineTo(16, 3);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red/White Plastic Cap
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#b91c1c';
    ctx.beginPath();
    ctx.roundRect(16, -3, 5, 6, 1);
    ctx.fill();
    ctx.stroke();

    // Blue/white label wrap
    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.fillRect(-6, -8, 8, 16);

    // Plastic reflections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(-10, -6, 18, 2);
  }

  /**
   * Dangerous six-pack beverage plastic ring
   */
  private drawSixPackRing() {
    const ctx = this.ctx;

    ctx.strokeStyle = 'rgba(220, 230, 240, 0.85)';
    ctx.lineWidth = 2.5;

    // 2x3 connected rings
    const ringRadius = 6;
    const positions = [
      [-12, -7], [0, -7], [12, -7],
      [-12, 7], [0, 7], [12, 7]
    ];

    positions.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Connector struts
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-12, -7);
    ctx.lineTo(12, -7);
    ctx.moveTo(-12, 7);
    ctx.lineTo(12, 7);
    ctx.moveTo(-12, -7);
    ctx.lineTo(-12, 7);
    ctx.moveTo(0, -7);
    ctx.lineTo(0, 7);
    ctx.moveTo(12, -7);
    ctx.lineTo(12, 7);
    ctx.stroke();
  }

  /**
   * Ghost net / tangled discarded commercial fishing gear
   */
  private drawGhostNet() {
    const ctx = this.ctx;

    ctx.strokeStyle = 'rgba(84, 110, 122, 0.85)';
    ctx.lineWidth = 1.8;

    // Diamond net mesh pattern
    ctx.beginPath();
    for (let i = -16; i <= 16; i += 8) {
      ctx.moveTo(i - 8, -14);
      ctx.lineTo(i + 8, 14);
      ctx.moveTo(i + 8, -14);
      ctx.lineTo(i - 8, 14);
    }
    ctx.stroke();

    // Tangled outer border rope
    ctx.strokeStyle = '#f59e0b'; // orange buoy float rope
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.stroke();

    // Tangled floats
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(-14, 8, 3, 0, Math.PI * 2);
    ctx.arc(12, -10, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw nutritious food collectibles (Bioluminescent Jellyfish & Marine Kelp)
   */
  public drawFoodCollectible(food: FoodCollectible) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(food.x, food.y);

    if (food.type === 'jellyfish') {
      this.drawJellyfish(food.pulsePhase);
    } else {
      this.drawSeagrassCluster(food.pulsePhase);
    }

    ctx.restore();
  }

  /**
   * Glowing bioluminescent jellyfish
   */
  private drawJellyfish(pulsePhase: number) {
    const ctx = this.ctx;
    const pulse = 1 + Math.sin(this.ambientTime * 4 + pulsePhase) * 0.15;

    // Glow aura
    const glowGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 22 * pulse);
    glowGrad.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
    glowGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.2)');
    glowGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 22 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Mushroom Bell
    const bellGrad = ctx.createRadialGradient(0, -4, 2, 0, 0, 14 * pulse);
    bellGrad.addColorStop(0, '#f472b6');
    bellGrad.addColorStop(0.7, '#c084fc');
    bellGrad.addColorStop(1, '#818cf8');

    ctx.fillStyle = bellGrad;
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -2, 13 * pulse, Math.PI, 0); // top dome
    ctx.quadraticCurveTo(0, 4, -13 * pulse, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Flowing stinging tentacles
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.8)';
    ctx.lineWidth = 1.2;
    for (let t = -8; t <= 8; t += 4) {
      const tentacleWave = Math.sin(this.ambientTime * 5 + t) * 4;
      ctx.beginPath();
      ctx.moveTo(t * pulse, 2);
      ctx.quadraticCurveTo(t + tentacleWave, 10, t * 0.5 + tentacleWave * 1.5, 18);
      ctx.stroke();
    }
  }

  /**
   * Emerald Seagrass / Kelp Cluster
   */
  private drawSeagrassCluster(pulsePhase: number) {
    const ctx = this.ctx;
    const sway = Math.sin(this.ambientTime * 3 + pulsePhase) * 5;

    // Glow
    ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Fronds
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    [-6, 0, 6].forEach((fx, idx) => {
      ctx.beginPath();
      ctx.moveTo(fx, 10);
      ctx.quadraticCurveTo(fx + sway * (idx === 1 ? -1 : 1), 0, fx + sway * 1.5, -12);
      ctx.stroke();
    });

    // Spore sparkles
    ctx.fillStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.arc(sway, -14, 2.5, 0, Math.PI * 2);
    ctx.arc(-sway, -4, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw the Innovation Feature: Ocean Cleanup Buoy / Eco-Pulse power-up
   */
  public drawCleanupPowerup(powerup: CleanupPowerup) {
    const ctx = this.ctx;
    const pulse = 1 + Math.sin(this.ambientTime * 6 + powerup.pulsePhase) * 0.12;

    ctx.save();
    ctx.translate(powerup.x, powerup.y);

    // 1. Expanding Eco-Sonar Rings
    const ringRadius = (this.ambientTime * 35 + powerup.pulsePhase * 10) % 36;
    ctx.strokeStyle = `rgba(52, 211, 153, ${Math.max(0, 1 - ringRadius / 36)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Outer Beacon Glow
    const haloGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, 24 * pulse);
    haloGrad.addColorStop(0, 'rgba(52, 211, 153, 0.9)');
    haloGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.4)');
    haloGrad.addColorStop(1, 'rgba(6, 78, 59, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 24 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // 3. Central Technological Drone Capsule
    ctx.fillStyle = '#065f46';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 14 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 4. Recycling Arrows Symbol (3 triangular arrows in loop)
    ctx.save();
    ctx.rotate(this.ambientTime * 2);
    ctx.fillStyle = '#a7f3d0';
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.arc(0, -7, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-3, -8);
      ctx.lineTo(3, -8);
      ctx.lineTo(0, -12);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  /**
   * Draw particles (bubbles, sparkles, debris, splash)
   */
  public drawParticles(particles: Particle[]) {
    const ctx = this.ctx;
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Subtle bubble shine if it's a bubble
      if (p.color.includes('255') && p.radius > 2.5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  /**
   * Floating notification scores and text (+100, RECYCLED, -1 LIFE)
   */
  public drawFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;
    texts.forEach((t) => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }

  /**
   * Draw active cleanup shockwave expanding across the ocean
   */
  public drawShockwave(x: number, y: number, radius: number, maxRadius: number) {
    const ctx = this.ctx;
    const alpha = Math.max(0, 1 - radius / maxRadius);
    ctx.save();
    ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.85})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(52, 211, 153, ${alpha * 0.15})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
