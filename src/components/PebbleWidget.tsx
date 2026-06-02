/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, RotateCcw, Award, Info, Trash2, ArrowDown } from 'lucide-react';
import { useStore } from '../store';
import { audio } from '../utils/audio';

interface StackedStone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  highlight: string;
  rotation: number;
  type: string;
  rxPoints: { x: number; y: number }[]; // custom organic stone silhouette
}

interface SpawningStone {
  id: string;
  name: string;
  width: number;
  height: number;
  color: string;
  highlight: string;
  type: string;
}

const STONE_TEMPLATES: SpawningStone[] = [
  { id: 'slate', name: 'Volcanic Slate', width: 90, height: 42, color: '#334155', highlight: '#475569', type: 'flat' },
  { id: 'quartz', name: 'River Quartz', width: 75, height: 48, color: '#d4d4d8', highlight: '#f4f4f5', type: 'round' },
  { id: 'jade', name: 'Tranquil Jade', width: 80, height: 38, color: '#14532d', highlight: '#166534', type: 'sleek' },
  { id: 'sandstone', name: 'Sun Sandstone', width: 85, height: 44, color: '#b45309', highlight: '#d97706', type: 'rough' },
  { id: 'basalt', name: 'Deep Basalt', width: 70, height: 52, color: '#1e293b', highlight: '#334155', type: 'heavy' },
];

export default function PebbleWidget() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { highPebbleStack, updateHighPebbleStack, soundEnabled, incrementMinSpent } = useStore();
  const [stackedStones, setStackedStones] = useState<StackedStone[]>([]);
  const [activeGrabId, setActiveGrabId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Floating temporary rock that is being held or positioned
  const [heldStone, setHeldStone] = useState<StackedStone | null>(null);
  const [isFalling, setIsFalling] = useState(false);
  const [stability, setStability] = useState(100);
  const [isTumbling, setIsTumbling] = useState(false);
  
  // Track relaxation timing
  useEffect(() => {
    const timer = setInterval(() => {
      incrementMinSpent(0.1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Compute stability rating based on average offset center of masses in the pile
  const calculateStability = (stack: StackedStone[]) => {
    if (stack.length <= 1) return 100;
    
    let cumulativeTilt = 0;
    // Walk bottom-up, checking how much each stone sits off-center relative to the support rock
    for (let i = 1; i < stack.length; i++) {
      const lower = stack[i - 1];
      const upper = stack[i];
      const offset = upper.x - lower.x;
      // Normal tolerance based on rock's width
      const maxTolerable = lower.width * 0.35;
      const deviation = Math.abs(offset) / maxTolerable;
      cumulativeTilt += deviation * deviation;
    }

    const averageDeviation = cumulativeTilt / (stack.length - 1);
    // Stability is on a scale of 0 to 100
    const rating = Math.max(0, Math.min(100, Math.round(100 - (averageDeviation * 35))));
    return rating;
  };

  // Generate organic stone geometry
  const createStoneGeometry = (w: number, h: number, type: string) => {
    const pts = [];
    const segments = 12;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // Perturb radius based on stone type to make them look distinct
      let noiseFactor = 0.08;
      if (type === 'rough') noiseFactor = 0.16;
      if (type === 'sleek') noiseFactor = 0.04;

      const rNoise = 1 - noiseFactor + Math.random() * (noiseFactor * 2);
      const rx = (Math.cos(angle) * (w / 2)) * rNoise;
      const ry = (Math.sin(angle) * (h / 2)) * rNoise;
      pts.push({ x: rx, y: ry });
    }
    return pts;
  };

  // Stack a stone onto the altar
  const spawnStone = (tmpl: SpawningStone) => {
    if (isTumbling || heldStone) return;

    const canvas = canvasRef.current;
    const initialX = canvas ? canvas.width / 2 : 250;

    // Place a new stone initially suspended at top center, ready to stack
    const geom = createStoneGeometry(tmpl.width, tmpl.height, tmpl.type);
    const newStone: StackedStone = {
      id: `stone-${Date.now()}`,
      x: initialX, // Initial coordinates center
      y: 65, // Comfortable high aiming zone
      width: tmpl.width,
      height: tmpl.height,
      color: tmpl.color,
      highlight: tmpl.highlight,
      rotation: (Math.random() - 0.5) * 0.05, // minor organic angle
      type: tmpl.type,
      rxPoints: geom
    };

    setHeldStone(newStone);
    setIsFalling(false);
    if (soundEnabled) audio.playPebbleStack(1.2);
  };

  // Check collision fall loop
  useEffect(() => {
    if (!heldStone || !isFalling || isTumbling) return;

    let animId: number;
    let currentY = heldStone.y;
    const fallSpeed = 5.0; // Perfect falling physics feel

    const fallTick = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Platform Altar line baseline is y = 345
      const altarY = 345;
      
      // Calculate target Y coordinate (colliding with top of previous stone or altar)
      let targetLandingY = altarY - heldStone.height / 2;

      if (stackedStones.length > 0) {
        // Top stacked stone
        const topStone = stackedStones[stackedStones.length - 1];
        // If horizontal bounds overlap
        const isOverlapping = Math.abs(heldStone.x - topStone.x) < (heldStone.width / 2 + topStone.width / 2) * 0.75;
        
        if (isOverlapping) {
          targetLandingY = topStone.y - topStone.height / 2 - heldStone.height / 2;
        }
      }

      if (currentY >= targetLandingY) {
        // Rest landing!
        const finalStone = {
          ...heldStone,
          y: targetLandingY,
          rotation: (Math.random() - 0.5) * 0.08
        };

        const nextStack = [...stackedStones, finalStone];
        setStackedStones(nextStack);
        setHeldStone(null);
        setIsFalling(false);

        // Compute new stability
        const nextStability = calculateStability(nextStack);
        setStability(nextStability);

        if (soundEnabled) {
          // Play click chime sound
          audio.playPebbleStack(0.8 + nextStack.length * 0.1);
        }

        // Trigger balance failure tumble cascade if unstable
        if (nextStability <= 25 && nextStack.length > 1) {
          triggerTumble(nextStack);
        } else {
          // Update height record count
          updateHighPebbleStack(nextStack.length);
        }
        return;
      }

      currentY += fallSpeed;
      setHeldStone(prev => prev ? { ...prev, y: currentY } : null);
      animId = requestAnimationFrame(fallTick);
    };

    animId = requestAnimationFrame(fallTick);
    return () => cancelAnimationFrame(animId);
  }, [heldStone, isFalling, stackedStones, isTumbling]);

  // Trigger simulated cascade tumble toppling
  const triggerTumble = (stack: StackedStone[]) => {
    setIsTumbling(true);
    setStability(0);

    let frames = 45;
    
    // Tumble sequence animator
    const tumbleLoop = () => {
      if (frames <= 0) {
        setStackedStones([]);
        setIsTumbling(false);
        setStability(100);
        return;
      }

      // Scatter rocks downwards with random rotations
      setStackedStones(prev => prev.map((st, idx) => {
        // Higher rocks slide off more aggressively
        const slide = (idx + 1) * (idx % 2 === 0 ? 3.8 : -3.8);
        const fall = 8.5;
        return {
          ...st,
          x: st.x + slide,
          y: st.y + fall,
          rotation: st.rotation + (idx % 2 === 0 ? 0.08 : -0.08)
        };
      }));

      // Play continuous tumbling rock clatters
      if (soundEnabled && frames % 8 === 0) {
        audio.playPebbleStack(0.5 + Math.random() * 0.4);
      }

      frames--;
      requestAnimationFrame(tumbleLoop);
    };

    requestAnimationFrame(tumbleLoop);
  };

  // Render Loop on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw calming sunset Zen mountain background silhoutte
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0a0d14'); // Darkest indigo sky
    bgGrad.addColorStop(0.5, '#200e31'); // deep slate-violet
    bgGrad.addColorStop(0.75, '#5d1b70'); // purple evening
    bgGrad.addColorStop(1, '#9d174d'); // sunset glow reflecting water
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Draw peaceful mountain ranges silhouettes
    ctx.fillStyle = 'rgba(15, 7, 28, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.quadraticCurveTo(w * 0.3, h * 0.45, w * 0.55, h * 0.75);
    ctx.quadraticCurveTo(w * 0.75, h * 0.5, w, h * 0.68);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    ctx.fillStyle = 'rgba(8, 3, 16, 0.75)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.8);
    ctx.quadraticCurveTo(w * 0.25, h * 0.65, w * 0.45, h * 0.85);
    ctx.quadraticCurveTo(w * 0.7, h * 0.58, w, h * 0.75);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // 2. Draw Altar wood base platform at y = 350
    ctx.fillStyle = '#2d1502'; // deep mahogany redwood
    ctx.fillRect(w / 2 - 130, 345, 260, 20);
    ctx.fillStyle = '#632505'; // polished bronze lining
    ctx.fillRect(w / 2 - 130, 345, 260, 4);

    // 3. Draw Stacked stones
    stackedStones.forEach(stone => {
      drawOrganicStone(ctx, stone);
    });

    // 4. Draw Floating stone if active
    if (heldStone) {
      drawOrganicStone(ctx, heldStone);
      
      // Draw aiming bounds bounding zone guide lines
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([3, 4]);
      if (isFalling) {
        ctx.strokeStyle = 'rgba(219, 39, 119, 0.4)';
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      }
      ctx.lineWidth = 1.2;
      ctx.moveTo(heldStone.x, heldStone.y);
      ctx.lineTo(heldStone.x, 345);
      ctx.stroke();
      ctx.restore();
    }

  }, [stackedStones, heldStone, isFalling]);

  const drawOrganicStone = (ctx: CanvasRenderingContext2D, stone: StackedStone) => {
    ctx.save();
    ctx.translate(stone.x, stone.y);
    ctx.rotate(stone.rotation);

    // Draw customized detailed drop shadow
    ctx.beginPath();
    ctx.ellipse(2, 6, stone.width / 2, stone.height / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    // Draw custom organic vertices path
    ctx.beginPath();
    if (stone.rxPoints && stone.rxPoints.length > 0) {
      ctx.moveTo(stone.rxPoints[0].x, stone.rxPoints[0].y);
      for (let i = 1; i < stone.rxPoints.length; i++) {
        ctx.lineTo(stone.rxPoints[i].x, stone.rxPoints[i].y);
      }
    } else {
      ctx.ellipse(0, 0, stone.width / 2, stone.height / 2, 0, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.fillStyle = stone.color;
    ctx.fill();

    // Shine / Overlay highlight
    const stoneGrad = ctx.createRadialGradient(
      -stone.width / 6, -stone.height / 6, 2,
      0, 0, stone.width / 2
    );
    stoneGrad.addColorStop(0, stone.highlight);
    stoneGrad.addColorStop(1, stone.color);
    ctx.fillStyle = stoneGrad;
    ctx.fill();

    // Outline highlight
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.stroke();

    ctx.restore();
  };

  // Adjust canvas size on startup
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = 380;
    };
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer dragging behavior to arrange the held stone
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!heldStone || isTumbling || isFalling) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);

    // If click is near the suspended held stone, grab it!
    const distToHeld = Math.hypot(heldStone.x - px, heldStone.y - py);
    if (distToHeld < 70) {
      setActiveGrabId(heldStone.id);
      setDragOffset({ x: heldStone.x - px, y: heldStone.y - py });
    } else {
      // Tapping elsewhere on the canvas triggers a direct DROP release!
      setIsFalling(true);
      if (soundEnabled) audio.playPop(0.8);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!heldStone || isTumbling || isFalling) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);

    if (activeGrabId) {
      // Constrain inside Screen bounds comfortably
      const nextX = Math.max(heldStone.width / 2, Math.min(canvas.width - heldStone.width / 2, px + dragOffset.x));
      setHeldStone(st => st ? { ...st, x: nextX } : null);
    } else {
      // Smoothly track cursor horizontally even without grabbing
      const nextX = Math.max(heldStone.width / 2, Math.min(canvas.width - heldStone.width / 2, px));
      setHeldStone(st => st ? { ...st, x: nextX } : null);
    }
  };

  const handlePointerUp = () => {
    setActiveGrabId(null);
  };

  const triggerDirectDrop = () => {
    if (!heldStone || isFalling || isTumbling) return;
    setIsFalling(true);
    if (soundEnabled) audio.playPop(0.85);
  };

  const clearAltar = () => {
    setStackedStones([]);
    setHeldStone(null);
    setIsFalling(false);
    setStability(100);
  };

  return (
    <div className="flex flex-col h-full" id="pebble-stacker">
      {/* Header controls & stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-900/40 border-b border-slate-900 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl">
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Pebble Stacker</h2>
            <p className="text-xs text-slate-400">Position stone horizontally, then tap canvas to release &amp; balance precisely</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="px-3 py-1 bg-slate-950/60 text-[11px] font-medium border border-slate-900 rounded-lg flex items-center gap-2 text-slate-200">
            <Award className="w-3.5 h-3.5 text-yellow-400" /> Record stack: <span className="font-bold text-emerald-400 font-mono">{highPebbleStack} stones</span>
          </div>

          <button
            onClick={clearAltar}
            disabled={isTumbling}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 hover:bg-slate-900/80 text-neutral-200 text-xs font-semibold rounded-lg border border-slate-900 transition-colors cursor-pointer disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Stack
          </button>
        </div>
      </div>

      {/* Physics Stage Frame */}
      <div 
        ref={containerRef}
        className="relative bg-neutral-950 rounded-b-2xl overflow-hidden select-none border-x border-b border-slate-900 h-[360px] flex items-center justify-center cursor-move touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full block"
        />

        {/* Floating Stability indicators */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none p-3.5 bg-slate-950/90 rounded-xl border border-slate-900 min-w-[130px] shadow-2xl">
          <span className="text-[10px] text-slate-400 font-sans uppercase tracking-widest leading-none">
            Stack Stability
          </span>
          <div className="flex items-center gap-2">
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  stability > 70 ? 'bg-emerald-500' : stability > 45 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                }`}
                style={{ width: `${stability}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-100 font-mono">{stability}%</span>
          </div>
          <span className="text-[9px] text-slate-450 font-sans leading-none mt-1">
            Current Count: <strong className="text-slate-250 font-mono">{stackedStones.length} stones</strong>
          </span>
        </div>

        {/* Action Release Indicator Button Overlay */}
        {heldStone && !isFalling && (
          <button
            onClick={triggerDirectDrop}
            className="absolute bottom-16 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-full text-xs font-bold border border-indigo-500 shadow-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-103 animate-bounce"
          >
            <ArrowDown className="w-4 h-4" /> Drop Active Pebble
          </button>
        )}

        {/* Small stacker instructions overlay */}
        <div className="absolute bottom-4 left-4 flex gap-1 items-center px-1.5 py-0.5 pointer-events-none bg-slate-950/75 rounded text-[9px] text-slate-400 tracking-wide select-none uppercase font-mono border border-slate-900">
          <Info className="w-3 h-3 text-emerald-400" />
          Move mouse/finger to align | Tap anywhere to drop &amp; stack precisely!
        </div>
      </div>

      {/* Rock Spawn Altar Tray Bottom Panel */}
      <div className="mt-4 p-5 bg-slate-950/50 border border-slate-900/60 rounded-2xl flex flex-col gap-3">
        <span className="block text-xs font-semibold text-slate-300 tracking-wide uppercase font-sans">
          Select Stone Geometry to stack
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {STONE_TEMPLATES.map(tmpl => (
            <button
              key={tmpl.id}
              onClick={() => spawnStone(tmpl)}
              disabled={heldStone !== null || isTumbling}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group py-4 ${
                heldStone ? 'opacity-40 cursor-not-allowed bg-slate-950/20 border-slate-950' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80 cursor-pointer'
              }`}
            >
              {/* Pebble Mini Shape Vector preview */}
              <div 
                className="rounded-full shadow-md shrink-0 border border-black/40 border-t-white/10"
                style={{
                  width: `${tmpl.width * 0.45}px`,
                  height: `${tmpl.height * 0.45}px`,
                  backgroundColor: tmpl.color,
                  backgroundImage: `radial-gradient(circle at 35% 35%, ${tmpl.highlight} 0%, ${tmpl.color} 80%)`
                }}
              />
              <span className="text-[10px] font-bold text-neutral-300 group-hover:text-white capitalize">
                {tmpl.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
