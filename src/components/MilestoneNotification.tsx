import React, { useEffect } from 'react';
import { ScoreMilestone } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, X, ChevronRight, Trophy } from 'lucide-react';

interface MilestoneNotificationProps {
  milestone: ScoreMilestone | null;
  onDismiss: () => void;
}

export const MilestoneNotification: React.FC<MilestoneNotificationProps> = ({
  milestone,
  onDismiss,
}) => {
  useEffect(() => {
    if (!milestone) return;

    // Auto dismiss after 4 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [milestone, onDismiss]);

  return (
    <aside
      id="milestone-notification-container"
      aria-live="polite"
      className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-full max-w-md px-4"
    >
      <AnimatePresence>
        {milestone && (
          <motion.div
            key={`milestone-${milestone.threshold}`}
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${milestone.borderClass} ${milestone.bgClass} backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-4 text-slate-100 flex flex-col gap-2`}
          >
            {/* Top decorative sheen */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/20 shadow-inner shrink-0"
                  style={{ backgroundColor: `${milestone.color}22` }}
                >
                  {milestone.threshold >= 2000 ? (
                    <Trophy className="w-6 h-6 text-amber-300 animate-bounce" />
                  ) : milestone.threshold >= 1000 ? (
                    <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
                  ) : (
                    <Award className="w-6 h-6 text-emerald-300 animate-pulse" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/15 ${milestone.textClass} bg-black/40`}
                    >
                      {milestone.title}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Level {milestone.level}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-extrabold text-white font-['Outfit',sans-serif] tracking-tight mt-0.5">
                    {milestone.badge}
                  </h4>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onDismiss}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss notification"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitle / SDG Context */}
            <p className="text-xs text-slate-300 pl-1 font-medium leading-relaxed">
              {milestone.subtitle}
            </p>

            {/* Bottom Progress Auto-dismiss bar */}
            <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden mt-1">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4.0, ease: 'linear' }}
                className="h-full rounded-full"
                style={{ backgroundColor: milestone.color }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
