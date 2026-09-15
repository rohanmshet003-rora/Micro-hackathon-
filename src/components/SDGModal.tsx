import React from 'react';
import { SDG_FACTS } from '../utils/facts';
import { X, Waves, AlertCircle, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface SDGModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SDGModal: React.FC<SDGModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="sdg-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="sdg-modal-content"
        className="w-full max-w-2xl bg-slate-900 border border-cyan-800/60 rounded-2xl p-6 sm:p-8 shadow-2xl text-white relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          id="btn-close-sdg-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-2 text-cyan-400">
          <Waves className="w-6 h-6" />
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-['Outfit',sans-serif]">
            SDG 14: Life Below Water
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-cyan-300 font-semibold uppercase tracking-wider mb-4">
          Target 14.1 — Prevent & Substantially Reduce Marine Plastic Pollution
        </p>

        {/* Informative Body */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          {/* Key Issue Callout */}
          <div className="p-4 bg-cyan-950/40 border border-cyan-700/40 rounded-xl">
            <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              The Crisis Facing Sea Turtles
            </h3>
            <p>
              Sea turtles rely on visual cues to hunt prey like jellyfish. In water currents, discarded clear plastic
              grocery bags float and billow with identical movement to jellyfish bells. When ingested, plastic blocks
              the digestive tract, causes false satiety (starvation), traps internal gases preventing diving, and
              leaches synthetic additives into vital organs.
            </p>
          </div>

          {/* Fact Sheet Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SDG_FACTS.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5 text-cyan-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    {item.title}
                  </h4>
                  <p className="text-slate-300 text-xs mb-2 leading-relaxed">{item.fact}</p>
                </div>
                <div className="text-emerald-300 text-[11px] font-medium pt-2 border-t border-slate-700/50 flex items-start gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item.actionTip}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Technological Innovation in Ocean Cleanup */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-xl">
            <h3 className="font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Technology & Innovation in Marine Conservation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our game's <strong>Eco-Pulse Cleanup Drone</strong> feature reflects real-world technological solutions
              deployed by marine engineers, including automated river interceptor barriers, ocean surface cleanup
              systems, and satellite monitoring of ghost fishing nets.
            </p>
          </div>
        </div>

        {/* Modal footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            id="btn-return-to-game"
            onClick={onClose}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            Return to Game
          </button>
        </div>
      </div>
    </div>
  );
};
