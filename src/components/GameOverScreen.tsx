import React, { useEffect, useState } from 'react';
import { GameStats, SDGFact } from '../types';
import { getRandomFact } from '../utils/facts';
import { RotateCcw, Trophy, Sparkles, AlertTriangle, ShieldCheck, HeartCrack, BookOpen, Clock, Waves } from 'lucide-react';

interface GameOverScreenProps {
  stats: GameStats;
  onRestart: () => void;
  onOpenSDGModal: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  stats,
  onRestart,
  onOpenSDGModal,
}) => {
  const [fact, setFact] = useState<SDGFact | null>(null);
  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  useEffect(() => {
    setFact(getRandomFact());

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div
      id="game-over-overlay"
      className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="game-over-modal"
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-white relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header with Game Over banner */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm tracking-wider uppercase">
            <HeartCrack className="w-5 h-5 text-rose-500" />
            <span>Marine Plastic Hazard</span>
          </div>

          {isNewHighScore && (
            <div
              id="new-high-score-badge"
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-300 text-xs font-extrabold animate-bounce"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>NEW HIGH SCORE!</span>
            </div>
          )}
        </div>

        <h2
          id="game-over-title"
          className="text-2xl sm:text-3xl font-extrabold text-white mb-2 font-['Outfit',sans-serif]"
        >
          Turtle Journey Concluded
        </h2>

        {/* Big Score Display */}
        <div
          id="final-score-display"
          className="p-4 mb-5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 border border-slate-700 flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Final Ocean Score</div>
            <div className="text-3xl sm:text-4xl font-black text-cyan-300 font-mono tracking-tight">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Score</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
              {stats.highScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div id="game-over-stats-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 text-xs">
          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="text-slate-400 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Survived</span>
            </div>
            <div className="font-bold text-white text-sm font-mono">{formatMinutes(stats.survivalTime)}</div>
          </div>

          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="text-slate-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Food Eaten</span>
            </div>
            <div className="font-bold text-white text-sm font-mono">{stats.foodCollected}</div>
          </div>

          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="text-slate-400 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Avoided</span>
            </div>
            <div className="font-bold text-white text-sm font-mono">{stats.plasticAvoided}</div>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl">
            <div className="text-emerald-300 mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cleaned</span>
            </div>
            <div className="font-bold text-emerald-300 text-sm font-mono">{stats.plasticCleaned}</div>
          </div>
        </div>

        {/* Ocean Current Speed Reached & Distance */}
        <div className="flex items-center justify-between px-3.5 py-2 mb-4 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-slate-300">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ocean Current:</span>
            <span className="font-bold text-cyan-300 font-mono">
              {stats.currentMultiplier ? stats.currentMultiplier.toFixed(1) : '1.0'}x Flow
            </span>
          </div>
          <div className="text-slate-400 flex items-center gap-1">
            <span>Distance:</span>
            <span className="font-bold text-white font-mono">{Math.floor(stats.distanceCovered)}m</span>
          </div>
        </div>

        {/* SDG 14 Real-world Awareness Message Card */}
        {fact && (
          <div
            id="game-over-sdg-card"
            className="p-4 bg-cyan-950/40 border border-cyan-700/40 rounded-xl mb-6 text-left text-xs leading-relaxed text-slate-200"
          >
            <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1.5 uppercase tracking-wide">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>SDG 14 Insight: {fact.title}</span>
            </div>
            <p className="mb-2 text-slate-300">{fact.fact}</p>
            <div className="text-emerald-300 font-medium">
              <strong>Action Tip:</strong> {fact.actionTip}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div id="game-over-actions" className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="btn-restart-game"
            onClick={onRestart}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again (Space/Enter)</span>
          </button>

          <button
            id="btn-game-over-sdg"
            onClick={onOpenSDGModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Read SDG 14 Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
