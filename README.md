# 🌊 Turtle Tide: Marine Plastic Awareness Game (SDG 14)

A fast, responsive, browser-based 2D marine conservation game built for the college micro-hackathon.

**Problem Statement:** UN Sustainable Development Goal 14: Life Below Water — Marine Plastic Pollution Awareness.

---

## 📖 1. Overview & SDG 14 Connection

Marine plastic pollution is one of the greatest threats to ocean biodiversity. Over **11 to 14 million metric tons** of plastic enter our oceans annually.

**The Core Scientific Premise:**
Sea turtles rely heavily on jellyfish as a staple food source. In ocean currents, clear plastic shopping bags float and billow in a manner optically indistinguishable from jellyfish bells. As a result, over **52% of sea turtles worldwide have ingested plastic debris**, leading to intestinal blockages, malnutrition, and death.

**Target 14.1 Relevance:**
The game directly models **UN SDG Target 14.1**: *"By 2025, prevent and significantly reduce marine pollution of all kinds, particularly from land-based activities, including marine debris and nutrient pollution."*

---

## 🎮 2. Gameplay & Core Mechanics

The player guides a loggerhead sea turtle swimming through the open ocean:

1. **Sea Turtle Movement:**
   - Full 8-directional swimming using **[W][A][S][D]** or **[Arrow Keys]**.
   - Features hydrodynamic acceleration, inertia damping, swimming flipper sinusoidal animations, and pitch tilting.
   - On-screen touch D-Pad support for touchscreen laptops and mobile testing.
2. **Food Collectibles:**
   - **Bioluminescent Jellyfish**: Natural prey worth **+100 points** with ambient tentacle pulse.
   - **Marine Seagrass Cluster**: Nutritious kelp worth **+150 points**.
3. **Plastic Hazards & Collision Detection:**
   - **Single-Use Plastic Bags**: Mimics jellyfish movement; causes damage and false satiety.
   - **PET Plastic Bottles**: Microplastic sources that injure marine organisms.
   - **Six-Pack Beverage Rings**: Entanglement hazards.
   - **Ghost Fishing Nets**: Commercial fishing gear drifting endlessly.
   - Precise circle-to-circle collision detection with screen-shake and underwater impact audio.
4. **Health System:**
   - Starts with **3 Lives** displayed as glowing heart indicators in the HUD.
   - Colliding with plastic decrements 1 life and grants **2.0 seconds of invulnerability blinking**.
   - Game concludes when all lives are depleted.
5. **Progressive Difficulty:**
   - Every 12 seconds, current difficulty tier increases: hazard drift speed accelerates and spawn intervals shorten.
   - Higher tiers introduce dense clusters and ghost net hazards.

---

## 💡 3. Innovation Feature: Eco-Cleanup Pulse

To showcase technological solutions for marine restoration, the game features an **Eco-Cleanup Drone Power-Up**:
- Periodically spawns as a glowing emerald ocean cleanup buoy with rotating recycling arrows.
- When collected, it triggers an **expanding marine cleanup shockwave** and envelops the sea turtle in a **6-second protective Eco-Aura**.
- Any plastic hazard entering the aura or struck by the shockwave is **recycled and disintegrated into +75 bonus points**, accompanied by audio chime and sparkle particle effects.
- Protects the turtle from hazard damage for the duration and increments the **"Plastics Cleaned"** metric.

---

## 🛠️ 4. Technology & Architecture

- **Framework:** React 18 + Vite + TypeScript.
- **Rendering:** High-performance HTML5 Canvas with procedural 2D rendering (no external image assets, eliminating 404 image load failures).
- **Sound Engine:** Procedural **Web Audio API** frequency synthesizers (whooshes, bubble pops, eat chimes, damage thuds, and victory arpeggios with zero external MP3 dependencies).
- **Styling:** Tailwind CSS with an oceanic color palette and responsive HUD overlays.
- **Persistence:** Local high scores and mute preferences saved via browser `localStorage`.

---

## 🚀 5. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open your browser at:
http://localhost:3000
```

To test production build:
```bash
npm run build
npm run preview
```

---

## 🕹️ 6. Controls

| Action | Keyboard | Touch / On-Screen |
|---|---|---|
| **Swim Up** | `W` or `Arrow Up` | Up Button |
| **Swim Down** | `S` or `Arrow Down` | Down Button |
| **Swim Left** | `A` or `Arrow Left` | Left Button |
| **Swim Right** | `D` or `Arrow Right` | Right Button |
| **Pause / Resume** | `P` or `Escape` | Pause Icon (HUD) |
| **Restart (Game Over)** | `Space` or `Enter` | Play Again Button |

---

## 🤖 7. AI Tools Usage (Hackathon Disclosure)

In adherence to academic integrity and hackathon regulations, here is how Google AI Studio / Gemini was utilized:

1. **Ideation & Biological Grounding:**
   - Consulted AI for realistic marine biology dynamics regarding sea turtles and plastic interaction. This led directly to the mechanic where plastic bags visually mimic jellyfish, delivering an educational message rather than just arbitrary obstacles.
2. **Procedural Vector Drawing & Animation Math:**
   - Leveraged AI to compute the trigonometric formulas for the sea turtle's flapping flippers (`Math.sin(player.flipperAngle)`), the swimming pitch tilt, and the wave harmonics for ambient caustic light rays.
3. **Web Audio API Sound Synthesis:**
   - Used AI assistance to construct parameter curves (`setValueAtTime`, `exponentialRampToValueAtTime`) for procedural sine and sawtooth oscillators, enabling rich sound effects without external audio files.
4. **Collision Tuning & Difficulty Pacing:**
   - Rapidly iterated on hitbox radii, speed multipliers, and invulnerability timers to ensure the game is challenging yet accessible within a 2-3 minute demo window.
5. **Code Review & Type Safety:**
   - Utilized TypeScript compiler checks (`tsc --noEmit`) to ensure clean separation between the engine, renderer, audio synthesizer, and React UI layers.
