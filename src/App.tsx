import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameState, GameStats, Player, ScoreMilestone } from './types';
import { GameHUD } from './components/GameHUD';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { PauseOverlay } from './components/PauseOverlay';
import { SDGModal } from './components/SDGModal';
import { TouchControls } from './components/TouchControls';
import { MilestoneNotification } from './components/MilestoneNotification';
import { soundFx } from './utils/audio';
import { Waves, Shield, Award } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('START');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    foodCollected: 0,
    plasticAvoided: 0,
    plasticCleaned: 0,
    survivalTime: 0,
    distanceCovered: 0,
  });
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeMilestone, setActiveMilestone] = useState<ScoreMilestone | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.getIsMuted());
  const [isSDGModalOpen, setIsSDGModalOpen] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(false);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Detect touch capability
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setShowTouchControls(true);
    }

    const engine = new GameEngine(
      canvas,
      (newStats) => {
        setStats(newStats);
        if (engineRef.current) {
          setPlayer({ ...engineRef.current.getPlayer() });
        }
      },
      (newState) => {
        setGameState(newState);
        if (engineRef.current) {
          setPlayer({ ...engineRef.current.getPlayer() });
        }
      },
      (milestone) => {
        setActiveMilestone(milestone);
      }
    );

    engineRef.current = engine;
    setPlayer({ ...engine.getPlayer() });
    setStats({ ...engine.stats });

    // Initial canvas resize
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current || !engineRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Maintain crisp 16:9 or fit width
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      if (width > 0 && height > 0) {
        engineRef.current.resize(width, height);
      }
    };

    handleResize();
    const observer = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Initial render of background on start screen
    engine.render();

    return () => {
      observer.disconnect();
      engine.stop();
    };
  }, []);

  const handleStartGame = useCallback(() => {
    setActiveMilestone(null);
    if (engineRef.current) {
      engineRef.current.start();
    }
  }, []);

  const handleRestartGame = useCallback(() => {
    setActiveMilestone(null);
    if (engineRef.current) {
      engineRef.current.restart();
    }
  }, []);

  const handleTogglePause = useCallback(() => {
    if (!engineRef.current) return;
    if (gameState === 'PLAYING') {
      engineRef.current.pause();
    } else if (gameState === 'PAUSED') {
      engineRef.current.resume();
    }
  }, [gameState]);

  const handleToggleMute = useCallback(() => {
    const newMuted = soundFx.toggleMute();
    setIsMuted(newMuted);
  }, []);

  const handleTouchDirection = useCallback((dx: number, dy: number) => {
    if (engineRef.current) {
      engineRef.current.setTouchDirection(dx, dy);
    }
  }, []);

  return (
    <main
      id="app-root"
      className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-between text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none"
    >
      {/* Top Application Bar */}
      <nav
        id="app-top-bar"
        className="w-full max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800/80 bg-slate-950/90 z-10 shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm tracking-tight font-['Outfit',sans-serif]">
              SDG 14: Life Below Water
            </span>
            <span className="text-slate-400 hidden sm:inline ml-2 text-xs">
              • Marine Plastic Awareness Game
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            id="innovation-indicator"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-700/50 text-[11px] font-semibold text-emerald-300"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Eco-Cleanup Drone Active</span>
          </div>

          <button
            id="top-sdg-info-btn"
            onClick={() => setIsSDGModalOpen(true)}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            SDG 14 Guide
          </button>
        </div>
      </nav>

      {/* Main Game Stage Area */}
      <div
        id="game-viewport-container"
        ref={containerRef}
        className="w-full max-w-6xl flex-1 relative flex items-center justify-center p-2 sm:p-4 min-h-0"
      >
        <div
          id="game-frame"
          className="relative w-full h-full max-h-[720px] rounded-2xl overflow-hidden border border-cyan-900/60 shadow-[0_0_50px_rgba(2,62,138,0.3)] bg-slate-900 flex items-center justify-center"
        >
          {/* HTML5 Canvas */}
          <canvas
            id="game-canvas"
            ref={canvasRef}
            className="w-full h-full block bg-slate-950 cursor-crosshair"
          />

          {/* Heads-Up Display (Score, Lives, Cleaned Counter) */}
          <GameHUD
            stats={stats}
            player={player}
            isPaused={gameState === 'PAUSED'}
            isMuted={isMuted}
            onTogglePause={handleTogglePause}
            onToggleMute={handleToggleMute}
            onOpenSDGModal={() => setIsSDGModalOpen(true)}
          />

          {/* Visual Milestone / Level Up Notification Toast */}
          <MilestoneNotification
            milestone={activeMilestone}
            onDismiss={() => setActiveMilestone(null)}
          />

          {/* Start Screen Overlay */}
          {gameState === 'START' && (
            <StartScreen
              onStartGame={handleStartGame}
              onOpenSDGModal={() => setIsSDGModalOpen(true)}
              highScore={stats.highScore}
            />
          )}

          {/* Pause Screen Overlay */}
          {gameState === 'PAUSED' && (
            <PauseOverlay
              onResume={handleTogglePause}
              onRestart={handleRestartGame}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          )}

          {/* Game Over Screen Overlay */}
          {gameState === 'GAMEOVER' && (
            <GameOverScreen
              stats={stats}
              onRestart={handleRestartGame}
              onOpenSDGModal={() => setIsSDGModalOpen(true)}
            />
          )}

          {/* On-screen Direction Controls (for touch devices or mobile viewports) */}
          {gameState === 'PLAYING' && showTouchControls && (
            <TouchControls onDirectionChange={handleTouchDirection} />
          )}
        </div>
      </div>

      {/* Bottom Educational Fact Ticker & Controls Hint */}
      <footer
        id="app-bottom-bar"
        className="w-full max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-900 text-slate-400 shrink-0"
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300 font-medium">
            Fact: Over 52% of sea turtles worldwide have ingested marine plastic.
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <span className="hidden sm:inline">Controls: [W][A][S][D] or [Arrow Keys]</span>
          <span className="hidden sm:inline">•</span>
          <button
            onClick={() => setShowTouchControls(!showTouchControls)}
            className="hover:text-slate-300 transition-colors cursor-pointer underline"
          >
            {showTouchControls ? 'Hide On-Screen D-Pad' : 'Show On-Screen D-Pad'}
          </button>
        </div>
      </footer>

      {/* SDG 14 Full Educational Modal */}
      <SDGModal
        isOpen={isSDGModalOpen}
        onClose={() => setIsSDGModalOpen(false)}
      />
    </main>
  );
}
