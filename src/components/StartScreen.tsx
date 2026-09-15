import React from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck, Waves, Info, HelpCircle } from 'lucide-react';

interface StartScreenProps {
  onStartGame: () => void;
  onOpenSDGModal: () => void;
  highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenSDGModal,
  highScore,
}) => {
  return (
    <div
      id="start-screen-overlay"
      className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="start-screen-modal"
        className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-cyan-950/80 border border-cyan-800/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-white"
      >
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div
            id="sdg-badge"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-semibold tracking-wide"
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>UN SDG 14: Life Below Water</span>
          </div>

          {highScore > 0 && (
            <div
              id="start-high-score-badge"
              className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-700/50 px-2.5 py-1 rounded-lg"
            >
              High Score: {highScore.toLocaleString()}
            </div>
          )}
        </div>

        {/* Title */}
        <h1
          id="game-title"
          className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-['Outfit',sans-serif]"
        >
          Turtle Tide: <span className="text-cyan-400">Ocean Rescue</span>
        </h1>

        <p id="game-subtitle" className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
          Guide an endangered sea turtle through marine plastic debris. Forage natural food, dodge fatal plastic waste,
          and deploy ocean cleanup technology to protect marine ecosystems.
        </p>

        {/* Core Mechanics Quick Guide */}
        <div id="quick-guide-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Collect Food */}
          <div
            id="guide-food-card"
            className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-pink-300 font-semibold text-xs mb-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Forage Food</span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              Eat <strong className="text-pink-300">Jellyfish</strong> (+100) & <strong className="text-emerald-300">Seagrass</strong> (+150) to thrive.
            </p>
          </div>

          {/* Avoid Plastic */}
          <div
            id="guide-hazard-card"
            className="p-3.5 bg-slate-800/60 border border-rose-900/40 rounded-xl flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs mb-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Avoid Plastics</span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              Plastic bags look like jellyfish! Dodge bags, bottles, 6-pack rings & ghost nets (-1 Life).
            </p>
          </div>

          {/* Innovation: Eco Cleanup */}
          <div
            id="guide-powerup-card"
            className="p-3.5 bg-emerald-950/40 border border-emerald-700/50 rounded-xl flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Eco-Pulse Drone</span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              Collect the glowing beacon for a <strong className="text-emerald-300">6s Cleanup Aura</strong> that recycles plastics (+75 pts).
            </p>
          </div>
        </div>

        {/* Controls Info Banner */}
        <div
          id="controls-banner"
          className="flex flex-wrap items-center justify-between gap-3 p-3 bg-cyan-950/40 border border-cyan-800/30 rounded-xl mb-6 text-xs text-slate-300"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-300 uppercase tracking-wider">Controls:</span>
            <span>Use <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300 font-mono">W A S D</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300 font-mono">Arrow Keys</kbd> to swim</span>
          </div>
          <div className="text-slate-400">
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-slate-300 font-mono">P</kbd> to Pause
          </div>
        </div>

        {/* Call to action buttons */}
        <div id="start-actions" className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="btn-start-game"
            onClick={onStartGame}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Start Ocean Swim</span>
          </button>

          <button
            id="btn-learn-sdg"
            onClick={onOpenSDGModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-5 bg-slate-800 hover:bg-slate-700 border border-slate-600/80 text-cyan-300 font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span>SDG 14 Facts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
