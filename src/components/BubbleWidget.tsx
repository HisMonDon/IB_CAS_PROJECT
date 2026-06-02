/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid, Sparkles, RefreshCcw, Award, Volume2, Info } from 'lucide-react';
import { useStore } from '../store';
import { audio } from '../utils/audio';

interface Bubble {
  id: number;
  popped: boolean;
  wiggle: boolean;
}

const BUBBLE_COLORS = [
  { 
    id: 'pink', 
    name: 'Cosmic Pink', 
    hex: '#ec4899',
    glowColor: 'rgba(244, 114, 182, 0.45)', 
    coreColor: 'rgba(219, 39, 119, 0.35)', 
    borderClass: 'border-pink-400/30', 
    shadowColor: 'rgba(219, 39, 119, 0.12)', 
    textClass: 'text-pink-400', 
    bgClass: 'bg-pink-500/10' 
  },
  { 
    id: 'blue', 
    name: 'Ocean Blue', 
    hex: '#0ea5e9',
    glowColor: 'rgba(56, 189, 248, 0.45)', 
    coreColor: 'rgba(2, 132, 199, 0.35)', 
    borderClass: 'border-sky-400/30', 
    shadowColor: 'rgba(2, 132, 199, 0.12)', 
    textClass: 'text-sky-450', 
    bgClass: 'bg-sky-500/10' 
  },
  { 
    id: 'lime', 
    name: 'Neon Lime', 
    hex: '#8eec16',
    glowColor: 'rgba(163, 230, 53, 0.45)', 
    coreColor: 'rgba(77, 124, 15, 0.35)', 
    borderClass: 'border-lime-400/30', 
    shadowColor: 'rgba(77, 124, 15, 0.12)', 
    textClass: 'text-lime-400', 
    bgClass: 'bg-lime-500/10' 
  },
  { 
    id: 'purple', 
    name: 'Royal Violet', 
    hex: '#8b5cf6',
    glowColor: 'rgba(192, 132, 252, 0.45)', 
    coreColor: 'rgba(147, 51, 234, 0.35)', 
    borderClass: 'border-purple-400/30', 
    shadowColor: 'rgba(147, 51, 234, 0.12)', 
    textClass: 'text-purple-405', 
    bgClass: 'bg-purple-500/10' 
  },
  { 
    id: 'sunset', 
    name: 'Sunset Amber', 
    hex: '#f97316',
    glowColor: 'rgba(251, 146, 60, 0.45)', 
    coreColor: 'rgba(234, 88, 12, 0.35)', 
    borderClass: 'border-amber-400/30', 
    shadowColor: 'rgba(234, 88, 12, 0.12)', 
    textClass: 'text-amber-500', 
    bgClass: 'bg-amber-500/10' 
  }
];

export default function BubbleWidget() {
  const {
    bubblePops,
    addBubblePops,
    unlockedFivePop,
    unlockedHundredPop,
    unlockedFiveHundredPop,
    soundEnabled,
    incrementMinSpent
  } = useStore();

  const [gridSize, setGridSize] = useState({ rows: 8, cols: 12 });
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedColor, setSelectedColor] = useState(BUBBLE_COLORS[0]);

  // Trigger relaxation minutes spent tracking
  useEffect(() => {
    const timer = setInterval(() => {
      incrementMinSpent(0.1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Generate bubble wrap list
  const regenerate = () => {
    const total = gridSize.rows * gridSize.cols;
    const items: Bubble[] = [];
    for (let i = 0; i < total; i++) {
      items.push({
        id: i,
        popped: false,
        wiggle: false
      });
    }
    setBubbles(items);
    setSessionCount(0);
  };

  useEffect(() => {
    regenerate();
  }, [gridSize]);

  // Pop interactive function
  const handlePop = (id: number) => {
    const targetBubble = bubbles.find(b => b.id === id);
    if (!targetBubble || targetBubble.popped) return;

    // Trigger sound click
    if (soundEnabled) {
      // Add random minor pitch variations for acoustic realism
      const randFreq = 0.85 + Math.random() * 0.3;
      audio.playPop(randFreq);
    }
    
    // Add to Zustand state + update session pops
    addBubblePops(1);
    setSessionCount(s => s + 1);

    setBubbles(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, popped: true };
      }
      return b;
    }));
  };

  // Quick gesture swipe popper
  const handlePointerOver = (e: React.PointerEvent, id: number) => {
    // If dragging or drawing with standard pressure/clicks down, pop bubbles on hover
    if (e.buttons === 1) {
      handlePop(id);
    }
  };

  return (
    <div className="flex flex-col h-full" id="bubble-wrap-popper">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-900/40 border-b border-slate-900 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-900">
            <Grid className={`w-5 h-5 ${selectedColor.textClass}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Bubble Wrap Popper</h2>
            <p className="text-xs text-slate-400">Repetitive pop mechanics for frantic stress venting</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-950/60 rounded-lg text-xs border border-slate-900">
            <span className="text-slate-400 mr-1.5 font-sans">Session:</span>
            <span className={`font-bold ${selectedColor.textClass} font-mono`}>{sessionCount}</span>
            <span className="text-slate-700 mx-2">|</span>
            <span className="text-slate-400 mr-1.5 font-sans">Lifetime:</span>
            <span className={`font-bold ${selectedColor.textClass} font-mono`}>{bubblePops}</span>
          </div>

          <button
            onClick={regenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer opacity-90 hover:opacity-100"
            style={{ backgroundColor: selectedColor.hex }}
          >
            <RefreshCcw className="w-3.5 h-3.5" /> New Sheet
          </button>
        </div>
      </div>

      {/* Bubble Wrap sheet workspace */}
      <div className="relative p-6 bg-slate-950 border-x border-b border-slate-900 rounded-b-2xl overflow-y-auto max-h-[380px] lg:max-h-[440px] flex items-center justify-center">
        <div 
          className="grid gap-2 border border-slate-900/60 p-4 rounded-2xl bg-slate-905 select-none touch-none"
          style={{ gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))` }}
        >
          {bubbles.map(bubble => (
            <div
              key={bubble.id}
              role="button"
              onPointerDown={() => handlePop(bubble.id)}
              onPointerOver={(e) => handlePointerOver(e, bubble.id)}
              className="relative w-8 h-8 sm:w-10 sm:h-10 cursor-pointer select-none outline-none focus:outline-none"
            >
              {/* Glossy Active Bubble */}
              {!bubble.popped ? (
                <div
                  className={`w-full h-full rounded-full border ${selectedColor.borderClass} transition-all duration-100 select-none active:scale-90`}
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${selectedColor.glowColor} 0%, ${selectedColor.coreColor} 60%, rgba(13, 148, 136, 0.05) 100%)`,
                    boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.6), 2px 2px 4px ${selectedColor.shadowColor}`,
                  }}
                >
                  {/* Specular Highlight glare */}
                  <div className="absolute w-2 h-1.5 bg-white/60 rounded-full left-[25%] top-[25%] transform rotate-[-30deg]" />
                </div>
              ) : (
                /* Deflated Popped bubble */
                <div
                  className="w-full h-full rounded-full transition-all duration-300 flex items-center justify-center border border-slate-900"
                  style={{
                    background: 'radial-gradient(circle, rgba(15, 23, 42, 0.65) 0%, rgba(2, 6, 23, 0.95) 100%)',
                    boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.85)',
                  }}
                >
                  {/* Little central ring indicating burst point in thin custom pop theme color */}
                  <div 
                    className="w-1.5 h-1.5 rounded-full border transition-colors duration-350" 
                    style={{ borderColor: `${selectedColor.hex}45` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Swipe instructions helper overlay */}
        <div className="absolute bottom-4 left-4 flex gap-1 items-center px-1.5 py-0.5 pointer-events-none bg-slate-950/75 rounded text-[9px] text-slate-400 tracking-wide select-none uppercase font-mono border border-slate-900">
          <Info className={`w-3 h-3 ${selectedColor.textClass}`} />
          Click to pop individual bubbles | Click and hold click to drag-swipe across sheets!
        </div>
      </div>

      {/* Bubble Pop Color Customizer shelf */}
      <div className="mt-4 p-5 bg-slate-950/50 border border-slate-900/60 rounded-2xl">
        <span className="block text-xs font-semibold text-slate-300 mb-3 tracking-wide uppercase font-sans border-b border-slate-900 pb-1.5 flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${selectedColor.textClass}`} /> Select Bubble Color Theme
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {BUBBLE_COLORS.map(color => (
            <button
              key={color.id}
              onClick={() => setSelectedColor(color)}
              className={`group flex items-center gap-2 p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                selectedColor.id === color.id
                  ? 'bg-slate-900/80 border-slate-700 shadow-inner text-white font-bold'
                  : 'bg-slate-900/20 border-slate-900/60 hover:border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/30 shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-[11px] truncate group-hover:text-white">
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Badges / Achievements Panel */}
      <div className="mt-4 p-5 bg-slate-950/50 border border-slate-900/60 rounded-2xl flex flex-col gap-3">
        <span className="block text-xs font-semibold text-slate-300 tracking-wide uppercase font-sans">
          CAS Wellness Achievements
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Badge 1 */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
            unlockedFivePop ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-950/40 border-slate-900 opacity-45'
          }`}>
            <div className={`p-2 rounded-lg ${unlockedFivePop ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-slate-100 font-sans">
                Stressbuster (50 Pops)
              </span>
              <span className="block text-[9px] text-slate-400 font-sans leading-tight">
                {unlockedFivePop ? 'Unlocked! EE panic successfully contained.' : 'Incomplete'}
              </span>
            </div>
          </div>

          {/* Badge 2 */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
            unlockedHundredPop ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-950/40 border-slate-900 opacity-45'
          }`}>
            <div className={`p-2 rounded-lg ${unlockedHundredPop ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-slate-100 font-sans">
                TOK Thinker (100 Pops)
              </span>
              <span className="block text-[9px] text-slate-400 font-sans leading-tight">
                {unlockedHundredPop ? 'Unlocked! Absolute philosophical relief.' : 'Incomplete'}
              </span>
            </div>
          </div>

          {/* Badge 3 */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
            unlockedFiveHundredPop ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-950/40 border-slate-900 opacity-45'
          }`}>
            <div className={`p-2 rounded-lg ${unlockedFiveHundredPop ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-slate-100 font-sans">
                Supreme CAS Master (500)
              </span>
              <span className="block text-[9px] text-slate-400 font-sans leading-tight">
                {unlockedFiveHundredPop ? 'Unlocked! Divine zen master status attained.' : 'Incomplete'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
