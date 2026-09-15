import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Pause } from 'lucide-react';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div
      id="pause-overlay"
      className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm select-none"
    >
      <div
        id="pause-card"
        className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-center text-white"
      >
        <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mx-auto mb-3 text-cyan-400">
          <Pause className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-extrabold mb-1 font-['Outfit',sans-serif]">Game Paused</h3>
        <p className="text-xs text-slate-400 mb-6">Press P or Escape to resume swimming</p>

        <div className="space-y-2.5">
          <button
            id="btn-pause-resume"
            onClick={onResume}
            className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Resume Game</span>
          </button>

          <button
            id="btn-pause-restart"
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors text-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Mission</span>
          </button>

          <button
            id="btn-pause-mute"
            onClick={onToggleMute}
            className="w-full py-2.5 px-4 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors text-xs cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Unmute Sound' : 'Mute Sound'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
