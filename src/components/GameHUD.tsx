import React from 'react';
import { GameStats, Player } from '../types';
import { SCORE_MILESTONES } from '../game/constants';
import { Heart, Trophy, Sparkles, Volume2, VolumeX, Pause, Play, Info, ShieldCheck, Award, Waves } from 'lucide-react';

interface GameHUDProps {
  stats: GameStats;
  player: Player | null;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onOpenSDGModal: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  player,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
  onOpenSDGModal,
}) => {
  const health = player ? player.health : 3;
  const cleanupTimer = player ? player.cleanupActiveTimer : 0;
  const isCleanupActive = cleanupTimer > 0;

  const currentMilestone = [...SCORE_MILESTONES]
    .reverse()
    .find((m) => stats.score >= m.threshold);

  const nextMilestone = SCORE_MILESTONES.find((m) => stats.score < m.threshold);

  return (
    <header
      id="game-hud-container"
      className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none flex flex-wrap items-center justify-between gap-3 select-none z-20"
    >
      {/* Left: Health Hearts & Eco Status */}
      <div id="hud-left-panel" className="flex items-center gap-3 pointer-events-auto">
        {/* Lives Counter */}
        <div
          id="hud-lives-card"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-lg"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
            Health
          </span>
          {[0, 1, 2].map((idx) => {
            const isFilled = idx < health;
            return (
              <Heart
                key={idx}
                id={`hud-heart-${idx}`}
                className={`w-5 h-5 transition-transform duration-300 ${
                  isFilled
                    ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                    : 'text-slate-600 fill-slate-800 scale-90'
                }`}
              />
            );
          })}
        </div>

        {/* Cleanup Power-Up Active Aura Badge */}
        {isCleanupActive && (
          <div
            id="hud-cleanup-badge"
            className="animate-pulse flex items-center gap-2 px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/80 rounded-xl text-emerald-300 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ECO-AURA ACTIVE: {cleanupTimer.toFixed(1)}s</span>
          </div>
        )}
      </div>

      {/* Center: Score & Cleaned Plastic Metric */}
      <div id="hud-center-panel" className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        <div
          id="hud-score-card"
          className="flex flex-col px-3.5 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
            <span className="text-base sm:text-xl font-extrabold text-cyan-300 font-mono tracking-tight">
              {stats.score.toLocaleString()}
            </span>
          </div>
          {nextMilestone && (
            <span className="text-[10px] text-slate-400 font-medium tracking-tight">
              Goal: {nextMilestone.threshold.toLocaleString()} pts
            </span>
          )}
        </div>

        {/* Current Level / Milestone Badge */}
        {currentMilestone && (
          <div
            id="hud-level-badge"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${currentMilestone.borderClass} ${currentMilestone.bgClass} backdrop-blur-md shadow-md text-xs font-bold ${currentMilestone.textClass}`}
            title={currentMilestone.subtitle}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Lvl {currentMilestone.level}: {currentMilestone.badge}</span>
          </div>
        )}

        {/* Ocean Current Speed Flow Badge */}
        {stats.currentMultiplier && stats.currentMultiplier > 1.05 && (
          <div
            id="hud-current-badge"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/50 backdrop-blur-md shadow-md text-xs font-bold text-cyan-300"
            title="Ocean current flow velocity multiplier driven by score"
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{stats.currentMultiplier.toFixed(1)}x Current</span>
          </div>
        )}

        <div
          id="hud-recycled-card"
          className="hidden md:flex items-center gap-2 px-3 py-2 bg-emerald-950/60 backdrop-blur-md border border-emerald-800/50 rounded-xl text-emerald-300 text-xs font-semibold"
          title="Plastic hazards neutralized with Eco-Cleanup"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cleaned: {stats.plasticCleaned}</span>
        </div>

        <div
          id="hud-highscore-card"
          className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-amber-950/50 backdrop-blur-md border border-amber-700/40 rounded-xl text-amber-300 text-xs font-semibold"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Best: {stats.highScore.toLocaleString()}</span>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div id="hud-right-panel" className="flex items-center gap-2 pointer-events-auto ml-auto">
        {/* SDG 14 Info Button */}
        <button
          id="hud-sdg-info-btn"
          onClick={onOpenSDGModal}
          className="p-2 bg-slate-900/80 hover:bg-cyan-950/80 border border-slate-700/60 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 rounded-xl transition-colors shadow-lg cursor-pointer"
          title="SDG 14 Marine Facts"
          aria-label="SDG 14 Marine Facts"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          id="hud-sound-toggle-btn"
          onClick={onToggleMute}
          className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white rounded-xl transition-colors shadow-lg cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Pause/Resume */}
        <button
          id="hud-pause-btn"
          onClick={onTogglePause}
          className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white rounded-xl transition-colors shadow-lg cursor-pointer"
          title={isPaused ? 'Resume Game' : 'Pause Game'}
          aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
        >
          {isPaused ? <Play className="w-4 h-4 text-cyan-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
        </button>
      </div>
    </header>
  );
};
