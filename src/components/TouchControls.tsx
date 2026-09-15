import React, { useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface TouchControlsProps {
  onDirectionChange: (dx: number, dy: number) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onDirectionChange }) => {
  const activeKeysRef = useRef({ up: false, down: false, left: false, right: false });

  const updateDirection = () => {
    let dx = 0;
    let dy = 0;
    if (activeKeysRef.current.up) dy -= 1;
    if (activeKeysRef.current.down) dy += 1;
    if (activeKeysRef.current.left) dx -= 1;
    if (activeKeysRef.current.right) dx += 1;

    if (dx !== 0 && dy !== 0) {
      dx /= Math.SQRT2;
      dy /= Math.SQRT2;
    }
    onDirectionChange(dx, dy);
  };

  const handlePointerDown = (dir: 'up' | 'down' | 'left' | 'right') => (e: React.PointerEvent) => {
    e.preventDefault();
    activeKeysRef.current[dir] = true;
    updateDirection();
  };

  const handlePointerUp = (dir: 'up' | 'down' | 'left' | 'right') => (e: React.PointerEvent) => {
    e.preventDefault();
    activeKeysRef.current[dir] = false;
    updateDirection();
  };

  return (
    <div
      id="touch-controls-container"
      className="absolute bottom-4 right-4 z-20 flex flex-col items-center select-none pointer-events-auto sm:opacity-80 hover:opacity-100 transition-opacity"
    >
      <div className="text-[10px] text-cyan-300/80 font-bold uppercase tracking-wider mb-1 pointer-events-none">
        Swim Controls
      </div>
      <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-xl">
        <div />
        <button
          id="touch-up"
          onPointerDown={handlePointerDown('up')}
          onPointerUp={handlePointerUp('up')}
          onPointerCancel={handlePointerUp('up')}
          className="w-11 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl flex items-center justify-center text-slate-200 active:text-white shadow touch-none"
          aria-label="Swim Up"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          id="touch-left"
          onPointerDown={handlePointerDown('left')}
          onPointerUp={handlePointerUp('left')}
          onPointerCancel={handlePointerUp('left')}
          className="w-11 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl flex items-center justify-center text-slate-200 active:text-white shadow touch-none"
          aria-label="Swim Left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          id="touch-down"
          onPointerDown={handlePointerDown('down')}
          onPointerUp={handlePointerUp('down')}
          onPointerCancel={handlePointerUp('down')}
          className="w-11 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl flex items-center justify-center text-slate-200 active:text-white shadow touch-none"
          aria-label="Swim Down"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        <button
          id="touch-right"
          onPointerDown={handlePointerDown('right')}
          onPointerUp={handlePointerUp('right')}
          onPointerCancel={handlePointerUp('right')}
          className="w-11 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl flex items-center justify-center text-slate-200 active:text-white shadow touch-none"
          aria-label="Swim Right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
