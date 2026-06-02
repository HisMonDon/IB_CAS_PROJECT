/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Maximize2, Minimize2, RotateCcw, Volume2, Info, Sparkles, Sliders } from 'lucide-react';
import { useStore } from '../store';
import { audio } from '../utils/audio';

// Slime colors dictionary
const SLIME_COLORS = [
  { id: 'lavender', name: 'Lavender Gel', primary: '#a78bfa', secondary: '#7c3aed', specular: '#e0e7ff', glitter: ['#f472b6', '#60a5fa', '#ffffff'] },
  { id: 'cosmic', name: 'Cosmic Pearl', primary: '#f472b6', secondary: '#db2777', specular: '#ffe4e6', glitter: ['#fef08a', '#38bdf8', '#ffffff'] },
  { id: 'mint', name: 'Mint Sparkle', primary: '#34d399', secondary: '#059669', specular: '#ecfdf5', glitter: ['#fbbf24', '#c084fc', '#ffffff'] },
  { id: 'rose', name: 'Holographic Rose', primary: '#fb7185', secondary: '#e11d48', specular: '#fff1f2', glitter: ['#a78bfa', '#f472b6', '#38bdf8'] },
  { id: 'neon', name: 'Neon Slime', primary: '#a3e635', secondary: '#4d7c0f', specular: '#f7fee7', glitter: ['#38bdf8', '#fb7185', '#ffffff'] }
];

// Textures
const TEXTURES = [
  { id: 'glossy', name: 'Glossy Finish', desc: 'Sleek, high wetness shine' },
  { id: 'glitter', name: 'Glitter Shimmer', desc: 'Sparkly shimmering flakes' },
  { id: 'metallic', name: 'Metallic Chrome', desc: 'Heavy molten liquid chrome' },
  { id: 'transparent', name: 'Transparent Gel', desc: 'Ghostly see-through slime' }
];

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number; // Resting X relative to center
  oy: number; // Resting Y relative to center
  angle: number;
}

export default function SlimeWidget() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { soundEnabled, incrementMinSpent } = useStore();
  const [selectedColor, setSelectedColor] = useState(SLIME_COLORS[0]);
  const [selectedTexture, setSelectedTexture] = useState('glossy');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [squishFactor, setSquishFactor] = useState({ x: 1, y: 1 });
  const [pokeForce, setPokeForce] = useState(0.5); // Slime responsiveness

  // Spring physics constants
  const stiffness = 0.08;
  const damping = 0.82;
  const slimeRadius = 130;
  const numPoints = 26;

  // Track pointers
  const pointsRef = useRef<Point[]>([]);
  const slimeCenter = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, grabIndex: -1, lastX: 0, lastY: 0 });
  const glittersRef = useRef<{ r: number; theta: number; size: number; color: string; speed: number; phase: number }[]>([]);

  // Track relaxation time
  useEffect(() => {
    const timer = setInterval(() => {
      incrementMinSpent(0.1); // Add 6 seconds of relaxation per 6 seconds active
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Set up points and initial shape placement
  const initSlime = (width: number, height: number) => {
    slimeCenter.current = { x: width / 2, y: height / 2 };
    const points: Point[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const ox = Math.cos(angle) * slimeRadius;
      const oy = Math.sin(angle) * slimeRadius;
      points.push({
        x: slimeCenter.current.x + ox,
        y: slimeCenter.current.y + oy,
        vx: 0,
        vy: 0,
        ox,
        oy,
        angle
      });
    }
    pointsRef.current = points;

    // Glitter flakes scattered inside
    const glitters = [];
    for (let i = 0; i < 45; i++) {
      // Pick random radius within slime boundary
      const r = Math.random() * (slimeRadius - 15);
      const theta = Math.random() * Math.PI * 2;
      const glitterColors = selectedColor.glitter;
      glitters.push({
        r,
        theta,
        size: 2 + Math.random() * 4,
        color: glitterColors[Math.floor(Math.random() * glitterColors.length)],
        speed: 0.005 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2
      });
    }
    glittersRef.current = glitters;
  };

  // Resize canvas handler
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const targetWidth = containerRef.current.clientWidth;
      const targetHeight = isFullscreen ? window.innerHeight - 150 : 480;
      
      canvasRef.current.width = targetWidth;
      canvasRef.current.height = targetHeight;

      if (pointsRef.current.length === 0) {
        initSlime(targetWidth, targetHeight);
      } else {
        // Move slime center to new midpoint
        const dx = targetWidth / 2 - slimeCenter.current.x;
        const dy = targetHeight / 2 - slimeCenter.current.y;
        slimeCenter.current = { x: targetWidth / 2, y: targetHeight / 2 };
        pointsRef.current.forEach(pt => {
          pt.x += dx;
          pt.y += dy;
        });
      }
    };

    window.addEventListener('resize', handleResize);
    // Let layout settle
    setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  // Handle color change (regenerate glittering accents)
  useEffect(() => {
    if (canvasRef.current) {
      initSlime(canvasRef.current.width, canvasRef.current.height);
    }
  }, [selectedColor]);

  // Main game animation loop
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

      // Clear with elegant soft mesh or dark transparency
      ctx.clearRect(0, 0, w, h);

      const points = pointsRef.current;
      const center = slimeCenter.current;
      const mouse = mouseRef.current;

      // 1. Move slime center gently towards mouse when grabbing or return to resting center
      if (mouse.isDown && mouse.grabIndex === -2) {
        // Dragging center itself
        center.x += (mouse.x - center.x) * 0.1;
        center.y += (mouse.y - center.y) * 0.1;
      } else {
        // Return center to center of canvas
        center.x += (w / 2 - center.x) * 0.05;
        center.y += (h / 2 - center.y) * 0.05;
      }

      // Constrain center
      center.x = Math.max(slimeRadius + 20, Math.min(w - slimeRadius - 20, center.x));
      center.y = Math.max(slimeRadius + 20, Math.min(h - slimeRadius - 20, center.y));

      // 2. Physics on outer boundary points
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];

        // Resting position calculation
        const targetX = center.x + pt.ox * squishFactor.x;
        const targetY = center.y + pt.oy * squishFactor.y;

        // Force pulling to target
        const fx = (targetX - pt.x) * stiffness;
        const fy = (targetY - pt.y) * stiffness;

        pt.vx += fx;
        pt.vy += fy;

        // Handle interaction forces (mouse push/pull)
        if (mouse.isDown) {
          const dx = mouse.x - pt.x;
          const dy = mouse.y - pt.y;
          const dist = Math.hypot(dx, dy);

          if (mouse.grabIndex === i) {
            // Dragging this point
            pt.x += (mouse.x - pt.x) * 0.35;
            pt.y += (mouse.y - pt.y) * 0.35;
            pt.vx = 0;
            pt.vy = 0;
          } else if (dist < 110) {
            // Poking/pushing boundary nearby
            const pokeFactor = (110 - dist) / 110;
            const pushX = (dx / dist) * -35 * pokeForce * pokeFactor;
            const pushY = (dy / dist) * -35 * pokeForce * pokeFactor;
            pt.vx += pushX;
            pt.vy += pushY;
          }
        }

        // Apply friction/damping
        pt.vx *= damping;
        pt.vy *= damping;

        // Mutate position
        pt.x += pt.vx;
        pt.y += pt.vy;

        // Keep slime inside canvas bounds
        pt.x = Math.max(10, Math.min(w - 10, pt.x));
        pt.y = Math.max(10, Math.min(h - 10, pt.y));
      }

      // 3. Draw Slime Path with smooth closed curves
      ctx.beginPath();
      if (points.length > 0) {
        let xc1 = (points[points.length - 1].x + points[0].x) / 2;
        let yc1 = (points[points.length - 1].y + points[0].y) / 2;
        ctx.moveTo(xc1, yc1);

        for (let i = 0; i < points.length; i++) {
          const nextIndex = (i + 1) % points.length;
          const xc2 = (points[i].x + points[nextIndex].x) / 2;
          const yc2 = (points[i].y + points[nextIndex].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc2, yc2);
        }
      }
      ctx.closePath();

      // Setup gradients based on color and texture
      const grad = ctx.createRadialGradient(
        center.x - 30, center.y - 30, 10,
        center.x, center.y, slimeRadius * 1.5
      );

      // Rendering styles
      if (selectedTexture === 'metallic') {
        // High specular chrome effect with multiple banding
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, selectedColor.primary);
        grad.addColorStop(0.5, selectedColor.secondary);
        grad.addColorStop(0.8, '#1e1b4b');
        grad.addColorStop(1, selectedColor.primary);
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 24;
      } else if (selectedTexture === 'transparent') {
        // Ghostly see-through appearance
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(0.5, `rgba(${hexToRgb(selectedColor.primary)}, 0.25)`);
        grad.addColorStop(1, `rgba(${hexToRgb(selectedColor.secondary)}, 0.45)`);
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 12;
      } else {
        // Glossy or Glitter (uses glossy gradient + overlays)
        grad.addColorStop(0, selectedColor.primary);
        grad.addColorStop(0.6, selectedColor.secondary);
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 18;
      }

      ctx.fill();

      // Slime Outline/Stroke for liquid thickness
      ctx.strokeStyle = selectedColor.primary;
      ctx.lineWidth = selectedTexture === 'transparent' ? 5 : 2;
      ctx.stroke();

      // Reset shadow for drawing inside slime
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // 4. Draw Glitter layer
      if (selectedTexture === 'glitter') {
        ctx.save();
        ctx.clip(); // Constrain glitter to inside the slime
        
        glittersRef.current.forEach(flk => {
          // Compute position from polar coordinates mapping to current center
          flk.phase += flk.speed;
          const shim = Math.sin(flk.phase) * 6; // Shimmer drift
          const currentRadius = flk.r + shim;
          
          const gx = center.x + Math.cos(flk.theta) * currentRadius;
          const gy = center.y + Math.sin(flk.theta) * currentRadius;

          // Draw shining star/flake
          ctx.beginPath();
          ctx.fillStyle = flk.color;
          ctx.globalAlpha = 0.5 + Math.sin(flk.phase) * 0.5; // Shimmer intensity

          // Draw little diamond/star
          ctx.arc(gx, gy, flk.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
        ctx.globalAlpha = 1.0;
      }

      // 5. Draw Gloss shines (White highlights overlay)
      ctx.save();
      ctx.clip(); // Highlight within boundary
      
      // Specular highlight top-left
      ctx.beginPath();
      // Secondary highlights
      ctx.arc(center.x - 45, center.y - 45, 30, 0, Math.PI * 2);
      const splashGrad = ctx.createRadialGradient(
        center.x - 50, center.y - 50, 2,
        center.x - 45, center.y - 45, 30
      );
      splashGrad.addColorStop(0, '#ffffff');
      splashGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = splashGrad;
      ctx.globalAlpha = 0.65;
      ctx.fill();

      // High specular gleam crescent curve
      ctx.beginPath();
      ctx.ellipse(center.x - 60, center.y - 65, 45, 12, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.25;
      ctx.fill();

      // Bottom glow-reflected lights
      ctx.beginPath();
      ctx.ellipse(center.x + 40, center.y + 40, 60, 20, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fillStyle = selectedColor.primary;
      ctx.globalAlpha = 0.15;
      ctx.fill();

      ctx.restore();
      ctx.globalAlpha = 1.0;

      // Reset squish factor slowly
      setSquishFactor(prev => ({
        x: prev.x + (1 - prev.x) * 0.05,
        y: prev.y + (1 - prev.y) * 0.05
      }));

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [selectedColor, selectedTexture, squishFactor, pokeForce]);

  // Helper function to turn Hex to RGB
  const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  };

  // Click & Touch events mapped to canvas elements
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);

    mouseRef.current.x = px;
    mouseRef.current.y = py;
    mouseRef.current.isDown = true;
    mouseRef.current.lastX = px;
    mouseRef.current.lastY = py;

    // Trigger procedural slime sound
    if (soundEnabled) {
      audio.playSlimeSplat(0.8);
    }

    // Determine what node we are grabbing, if any
    const points = pointsRef.current;
    let closestIndex = -1;
    let minDist = 65; // Expanded, comfortable grab threshold

    for (let i = 0; i < points.length; i++) {
      const dist = Math.hypot(points[i].x - px, points[i].y - py);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }

    if (closestIndex !== -1) {
      mouseRef.current.grabIndex = closestIndex;
    } else {
      // If we clicked inside the general slime body
      const distToCenter = Math.hypot(slimeCenter.current.x - px, slimeCenter.current.y - py);
      if (distToCenter < slimeRadius + 30) {
        mouseRef.current.grabIndex = -2; // Dragging center
      } else {
        mouseRef.current.grabIndex = -1; // Poke
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !mouseRef.current.isDown) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);

    const dx = px - mouseRef.current.lastX;
    const dy = py - mouseRef.current.lastY;

    mouseRef.current.x = px;
    mouseRef.current.y = py;
    mouseRef.current.lastX = px;
    mouseRef.current.lastY = py;

    // Splat effect for high speed drag
    if (soundEnabled && Math.random() < 0.08 && Math.hypot(dx, dy) > 15) {
      audio.playSlimeSplat(0.4);
    }
  };

  const handlePointerUp = () => {
    mouseRef.current.isDown = false;
    mouseRef.current.grabIndex = -1;
  };

  // Stress-squish actions
  const squish = (dir: 'horizontal' | 'vertical') => {
    if (soundEnabled) audio.playSlimeSplat(1.2);
    if (dir === 'horizontal') {
      setSquishFactor({ x: 1.8, y: 0.5 });
    } else {
      setSquishFactor({ x: 0.5, y: 1.8 });
    }
  };

  return (
    <div className="flex flex-col h-full font-sans" id="slime-simulator">
      {/* Tab Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-900/40 border-b border-slate-900 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-550/10 rounded-xl">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Interactive Slime</h2>
            <p className="text-xs text-slate-400">Satisfying tactile stretch &amp; deform dynamics with active sparkles</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => squish('horizontal')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 hover:bg-slate-900/80 text-xs text-slate-205 font-bold rounded-lg transition-colors border border-slate-900 cursor-pointer"
            title="Stretch horizontally"
          >
            ↔ Squish X
          </button>
          <button
            onClick={() => squish('vertical')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 hover:bg-slate-900/80 text-xs text-slate-205 font-bold rounded-lg transition-colors border border-slate-900 cursor-pointer"
            title="Stretch vertically"
          >
            ↕ Squish Y
          </button>
          <button
            onClick={() => {
              if (canvasRef.current) initSlime(canvasRef.current.width, canvasRef.current.height);
            }}
            className="p-1.5 bg-slate-950/60 hover:bg-slate-900/80 text-slate-300 rounded-lg transition-all border border-slate-900 cursor-pointer"
            title="Reset position"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-violet-600 hover:bg-violet-555 text-white rounded-lg transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Playground"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main interactive area */}
      <div 
        ref={containerRef}
        className={`relative bg-radial from-slate-950 to-slate-900 overflow-hidden select-none transition-all flex items-center justify-center ${
          isFullscreen 
            ? 'fixed inset-4 z-50 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md'
            : 'rounded-b-2xl border-x border-b border-slate-900 min-h-[350px] lg:min-h-[440px]'
        }`}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="cursor-pointer cursor-grab active:cursor-grabbing w-full block h-full select-none touch-none"
        />

        {/* Small interaction guidelines Overlay */}
        <div className="absolute top-4 left-4 flex gap-1 items-center px-1.5 py-0.5 pointer-events-none bg-slate-950/75 rounded text-[9px] text-slate-400 tracking-wide select-none uppercase font-mono border border-slate-900">
          <Info className="w-3 h-3 text-violet-405" />
          Drag border to stretch | Poke boundary to dent | Drag center to move
        </div>

        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-[10px] uppercase font-bold tracking-widest text-white rounded-lg shadow-md font-sans cursor-pointer transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" /> Close Play Mode
          </button>
        )}
      </div>

      {/* Customization controls bottom panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4 p-5 bg-slate-950/50 border border-slate-900/60 rounded-2xl animate-fade-in">
        {/* Slime Types Select */}
        <div>
          <span className="block text-xs font-semibold text-slate-300 mb-3 tracking-wide uppercase font-sans border-b border-slate-900 pb-1.5">
            1. Choose Slime Formula
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
            {SLIME_COLORS.map(color => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color)}
                className={`group flex items-center gap-2 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  selectedColor.id === color.id
                    ? 'bg-violet-950/40 border-violet-550 shadow-inner text-white'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-705 text-slate-300'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/30 shadow-sm"
                  style={{ backgroundColor: color.primary }}
                />
                <span className="text-[11px] font-bold truncate group-hover:text-white">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Texture Select & Settings */}
        <div>
          <span className="block text-xs font-semibold text-slate-300 mb-3 tracking-wide uppercase font-sans border-b border-slate-900 pb-1.5">
            2. Material Viscosity Texture
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TEXTURES.map(tex => (
              <button
                key={tex.id}
                onClick={() => setSelectedTexture(tex.id)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedTexture === tex.id
                    ? 'bg-violet-955 border-violet-500 shadow-inner'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-705'
                }`}
              >
                <span className="block text-[11px] font-bold text-slate-100 capitalize">
                  {tex.name.split(' ')[0]}
                </span>
                <span className="block text-[9px] text-slate-400 mt-0.5 truncate">
                  {tex.name.split(' ')[1]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
