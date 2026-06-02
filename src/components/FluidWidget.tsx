/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Waves, Sparkles, Camera, Info, Sliders } from 'lucide-react';
import { useStore } from '../store';
import { audio } from '../utils/audio';

interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const PALETTES = [
  { id: 'ocean', name: 'Ocean Currents', colors: ['#0369a1', '#06b6d4', '#2dd4bf', '#059669', '#0ea5e9'] },
  { id: 'sunset', name: 'Sunset Warmth', colors: ['#e11d48', '#f97316', '#fbbf24', '#db2777', '#f43f5e'] },
  { id: 'aurora', name: 'Aurora Borealis', colors: ['#10b981', '#059669', '#84cc16', '#6366f1', '#a855f7'] },
  { id: 'galaxy', name: 'Galaxy Nebula', colors: ['#c084fc', '#e11d48', '#ec4899', '#6366f1', '#1e1b4b'] }
];

export default function FluidWidget() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { incrementMinSpent, soundEnabled } = useStore();
  const [activePalette, setActivePalette] = useState(PALETTES[0]);
  const [viscosity, setViscosity] = useState(0.94); // High viscosity = low damping. 0.9 = syrup, 0.98 = watery
  const [clearTimer, setClearTimer] = useState(true); // Fades out slowly or leaves trails

  const particlesRef = useRef<FluidParticle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, isDown: false });

  // Session stats tracking
  useEffect(() => {
    const timer = setInterval(() => {
      incrementMinSpent(0.1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = 440;
    };
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation Loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Draw backdrop fade: gives continuous ghost-like stream trails
      ctx.fillStyle = clearTimer ? 'rgba(10, 10, 12, 0.08)' : 'rgba(10, 10, 12, 0.015)';
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // 1. If mouse is dragging, inject fluid vortex forces and spawn particles
      if (mouse.isDown) {
        const dx = mouse.x - mouse.px;
        const dy = mouse.y - mouse.py;
        const speed = Math.hypot(dx, dy);

        if (speed > 1) {
          // Play fluid procedural swoosh sound periodically during active drags
          if (soundEnabled && Math.random() < 0.25) {
            audio.playRakeScratch(0.18, 0.3);
          }

          // Spawn particles along the drag path
          const steps = Math.min(12, Math.floor(speed / 4) + 1);
          for (let s = 0; s < steps; s++) {
            const ratio = s / steps;
            const rx = mouse.px + dx * ratio;
            const ry = mouse.py + dy * ratio;

            // Spawn multiple particles per segment
            for (let i = 0; i < 3; i++) {
              const hueIndex = Math.floor(Math.random() * activePalette.colors.length);
              const color = activePalette.colors[hueIndex];

              // Slightly randomized velocity matching drag vector plus radial scatter
              const theta = Math.random() * Math.PI * 2;
              const scatter = 1.2;
              const pvx = dx * 0.45 + Math.cos(theta) * scatter;
              const pvy = dy * 0.45 + Math.sin(theta) * scatter;
              const size = 3 + Math.random() * 14;

              particles.push({
                x: rx,
                y: ry,
                vx: pvx,
                vy: pvy,
                life: 1.0,
                maxLife: 0.015 + Math.random() * 0.025, // slower or faster fade rate
                color,
                size
              });
            }
          }
        }
      }

      // Update mouse previous positions
      mouse.px = mouse.x;
      mouse.py = mouse.y;

      // 2. Physics on particles & rendering
      ctx.save();
      // Enable screen compositing for neon liquid style glow
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply friction based on Viscosity slider
        p.vx *= viscosity;
        p.vy *= viscosity;

        // Give basic flow-field drifting noise
        p.vx += Math.sin(p.y * 0.01 + i) * 0.04;
        p.vy += Math.cos(p.x * 0.01 + i) * 0.04;

        // Move position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce/Constrain bounds
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Age particle
        p.life -= p.maxLife;

        // Draw particle trail lines/glows
        ctx.beginPath();
        // Inner glowing core
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.35, `rgba(${hexToRgb(p.color)}, ${p.life * 0.75})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Remove dead particles
        if (p.life <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }
      ctx.restore();

      // Enforce maximum buffer cap for performance safety
      if (particles.length > 900) {
        particlesRef.current = particles.slice(particles.length - 800);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [activePalette, viscosity, clearTimer]);

  const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  };

  // Click / Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    mouseRef.current.x = px;
    mouseRef.current.y = py;
    mouseRef.current.px = px;
    mouseRef.current.py = py;
    mouseRef.current.isDown = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    mouseRef.current.x = px;
    mouseRef.current.y = py;
  };

  const handlePointerUp = () => {
    mouseRef.current.isDown = false;
  };

  // Capture canvas output screenshot
  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (soundEnabled) {
      audio.playPop(1.5); // snap shutter auditory alert
    }

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `MindSpace-Fluid-${activePalette.id}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="flex flex-col h-full" id="fluid-color-playground">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-neutral-900/45 border-b border-neutral-200/5 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl">
            <Waves className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-100 tracking-tight">Fluid Playground</h2>
            <p className="text-xs text-neutral-400">Drag vectors to swirl glowing streams of liquid paint</p>
          </div>
        </div>

        <button
          onClick={handleCapture}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
        >
          <Camera className="w-3.5 h-3.5" /> Save Wallpaper
        </button>
      </div>

      {/* Main Canvas Area */}
      <div 
        ref={containerRef}
        className="relative bg-[#0a0a0c] rounded-b-2xl overflow-hidden select-none border-x border-b border-neutral-200/5 h-[410px] flex items-center justify-center cursor-crosshair touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full block"
        />

        {/* Dynamic Canvas statistics overlay */}
        <div className="absolute top-4 left-4 flex gap-1 items-center px-1.5 py-0.5 pointer-events-none bg-neutral-900/60 rounded text-[9px] text-neutral-400 tracking-wide select-none uppercase font-mono">
          <Info className="w-3 h-3 text-cyan-400" />
          Swirl circles to activate turbulence | Change viscosity via slider below
        </div>
      </div>

      {/* Viscosity Controls and Palette Select Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4 p-5 bg-neutral-900/30 border border-neutral-200/5 rounded-2xl">
        {/* Palette choosing */}
        <div>
          <span className="block text-xs font-semibold text-neutral-300 mb-3 tracking-wide uppercase font-sans">
            1. Select Cosmic Plasma Palette
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PALETTES.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePalette(p);
                  // Quick flash of color particles inside
                  particlesRef.current = [];
                }}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  activePalette.id === p.id
                    ? 'bg-cyan-500/10 border-cyan-500 shadow'
                    : 'bg-neutral-900/40 border-neutral-800 hover:bg-neutral-850 hover:border-neutral-700'
                }`}
              >
                <span className="text-[11px] font-bold text-neutral-100">
                  {p.name}
                </span>
                <div className="flex gap-1">
                  {p.colors.slice(0, 3).map((col, idx) => (
                    <span 
                      key={idx} 
                      className="w-2.5 h-2.5 rounded-full border border-black/20"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Viscosity Damping Tuning */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-neutral-300 tracking-wide uppercase font-sans">
              2. Thickness / Viscosity Rating
            </span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">
              {viscosity < 0.92 ? 'Thick Molasses' : viscosity > 0.96 ? 'Water Waves' : 'Standard Plasma'}
            </span>
          </div>

          <div className="flex flex-col gap-2 p-3 bg-neutral-950/40 rounded-xl border border-neutral-800">
            <input
              type="range"
              min="0.88"
              max="0.99"
              step="0.01"
              value={viscosity}
              onChange={(e) => setViscosity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] text-neutral-400 uppercase tracking-widest font-mono">
              <span>Thick Gel / High drag</span>
              <span>Liquid/ Low Drag</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
