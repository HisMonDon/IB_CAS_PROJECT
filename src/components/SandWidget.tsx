/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Compass, Sliders, Volume2, VolumeX, Eye, Info } from 'lucide-react';
import { useStore } from '../store';
import { audio } from '../utils/audio';

interface ZenRock {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  highlight: string;
  name: string;
}

const RAKE_TYPES = [
  { id: 'standard', name: 'Standard Comb', prongs: 4, spacing: 8, label: 'Traditional combing lines' },
  { id: 'broad', name: 'Broad Rake', prongs: 3, spacing: 14, label: 'Thick tranquil pathways' },
  { id: 'ripple', name: 'Ripple Ring', prongs: 5, spacing: 6, label: 'Expanding energy wave circles' },
  { id: 'zen_v', name: 'Deep Groove', prongs: 2, spacing: 20, label: 'Heavy meditative marks' }
];

export default function SandWidget() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sandBufferRef = useRef<HTMLCanvasElement | null>(null); // Stores the raked grooves
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { theme, soundEnabled, ambientEnabled, toggleAmbient, incrementMinSpent } = useStore();
  const [activeRake, setActiveRake] = useState(RAKE_TYPES[0]);
  const [stones, setStones] = useState<ZenRock[]>([
    { id: 'stone-1', x: 200, y: 150, radius: 26, color: '#3f3f46', highlight: '#71717a', name: 'Patience Pebble' },
    { id: 'stone-2', x: 450, y: 260, radius: 34, color: '#27272a', highlight: '#52525b', name: 'Energy Stepping Rock' },
    { id: 'stone-3', x: 620, y: 130, radius: 22, color: '#18181b', highlight: '#3f3f46', name: 'Mindfulness Stone' },
  ]);

  const [activeStone, setActiveStone] = useState<string | null>(null);
  const rakeCoords = useRef<{ x: number; y: number } | null>(null);

  // Sync minute spent
  useEffect(() => {
    const timer = setInterval(() => {
      incrementMinSpent(0.1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Initialize sand textures & buffer canvases
  const initSand = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    // Create persistent offscreen buffer for the combed lines
    const buffer = sandBufferRef.current || document.createElement('canvas');
    buffer.width = w;
    buffer.height = h;
    sandBufferRef.current = buffer;

    const bctx = buffer.getContext('2d');
    if (bctx) {
      bctx.fillStyle = theme === 'dark' ? '#38383e' : '#eadbc0';
      bctx.fillRect(0, 0, w, h);

      // Draw standard sand grain texture: stipple tiny grains initially
      bctx.fillStyle = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.035)';
      for (let i = 0; i < 4000; i++) {
        bctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      }

      // Draw initial decorative combed lines
      bctx.shadowBlur = 1.5;
      bctx.shadowColor = theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.4)';
      bctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.055)';
      bctx.lineWidth = 1.5;
      
      // Horizontal sand patterns
      for (let y = 30; y < h; y += 14) {
        bctx.beginPath();
        bctx.moveTo(0, y);
        bctx.lineTo(w, y);
        bctx.stroke();
      }
    }
    draw();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const buffer = sandBufferRef.current;
    if (!ctx || !buffer) return;

    // Clear primary view & fill sand base color to prevent seam artifacts or flashes at borders
    ctx.fillStyle = theme === 'dark' ? '#38383e' : '#eadbc0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw sand buffer with beautiful organic water ripple wave displacement
    const time = Date.now() * 0.0022;
    const sliceH = 2.5; // highly optimized height of slices
    const w = canvas.width;
    const h = canvas.height;
    
    for (let y = 0; y < h; y += sliceH) {
      // Create a gorgeous composite wave: a slow deep wave + a fast shallow ripple
      const dx = Math.sin(y * 0.035 - time) * 2.2 + Math.cos(y * 0.07 + time * 1.4) * 0.8;
      const dy = Math.sin(y * 0.018 + time * 0.95) * 0.6;
      
      // Draw slice from sand buffer to main canvas
      ctx.drawImage(
        buffer, 
        0, y, w, sliceH, 
        dx, y + dy, w, sliceH
      );
    }

    // 2. Draw Rocks with deep drop shadows, concentric sandbox dustings, and active radiating ripples
    stones.forEach(rock => {
      ctx.save();
      
      // Dynamic flowing concentric water rings propagating around each stone island
      const numWaves = 4;
      for (let i = 0; i < numWaves; i++) {
        const phase = (time * 14 + i * 25) % 85; // ranges 0 to 85
        const radius = rock.radius + 6 + phase;
        
        // Opacity fades gracefully as the wave expands outwards
        const opacity = Math.max(0, 1 - (phase / 85)) * 0.12;
        
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = theme === 'dark' 
          ? `rgba(255, 255, 255, ${opacity})` 
          : `rgba(0, 0, 0, ${opacity * 1.15})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Realistic sand displacement circles under rock
      ctx.beginPath();
      ctx.arc(rock.x, rock.y, rock.radius + 14, 0, Math.PI * 2);
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.04)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rock shadow
      ctx.beginPath();
      ctx.arc(rock.x + 3, rock.y + 4, rock.radius - 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.filter = 'blur(6px)';
      ctx.fill();

      // Rock body
      ctx.beginPath();
      ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
      ctx.fillStyle = rock.color;
      ctx.filter = 'none';
      ctx.fill();

      // Rock highlight (inner shine for tactile 3D effect)
      const grad = ctx.createRadialGradient(
        rock.x - rock.radius / 3, rock.y - rock.radius / 3, 2,
        rock.x, rock.y, rock.radius
      );
      grad.addColorStop(0, rock.highlight);
      grad.addColorStop(1, rock.color);
      ctx.fillStyle = grad;
      ctx.fill();

      // Stippled texture on the rock itself (deterministic to avoid animation loop flickering)
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let i = 0; i < 60; i++) {
        const pseudoRandAngle = (i * 2.3) % (Math.PI * 2);
        const pseudoRandRadius = ((i * 17) % 100) / 100 * rock.radius;
        ctx.fillRect(
          rock.x + Math.cos(pseudoRandAngle) * pseudoRandRadius,
          rock.y + Math.sin(pseudoRandAngle) * pseudoRandRadius,
          1.5, 1.5
        );
      }

      ctx.restore();
    });
  };

  useEffect(() => {
    initSand();
  }, [theme]);

  // Continuous animation loop for water ripple wave motion
  useEffect(() => {
    let animId: number;
    const tick = () => {
      draw();
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [stones, theme]);

  // Adjust canvas parameters on container resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const targetWidth = containerRef.current.clientWidth;
      const targetHeight = 440;
      
      canvasRef.current.width = targetWidth;
      canvasRef.current.height = targetHeight;
      initSand();
    };
    
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Combing function
  const rakeDragTo = (x: number, y: number) => {
    const buffer = sandBufferRef.current;
    if (!buffer) return;
    const bctx = buffer.getContext('2d');
    if (!bctx || !rakeCoords.current) return;

    const startX = rakeCoords.current.x;
    const startY = rakeCoords.current.y;
    const dx = x - startX;
    const dy = y - startY;
    const dist = Math.hypot(dx, dy);

    if (dist < 4) return;

    bctx.save();
    
    // Smooth raking rendering properties
    bctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.085)';
    bctx.shadowColor = theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.3)';
    bctx.shadowBlur = 1.8;
    bctx.lineWidth = 2.0;

    // Dual stroke effect representing displacement (shadow & depth)
    const deepStrokeStyle = theme === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.18)';

    // Compute unit normal vectors (tangents orthogonal lines)
    const nx = -dy / dist;
    const ny = dx / dist;

    // Rake layout prongs drawing
    const numProngs = activeRake.prongs;
    const spacing = activeRake.spacing;

    for (let p = 0; p < numProngs; p++) {
      // Offset calculation for prong spacing
      const offset = (p - (numProngs - 1) / 2) * spacing;
      
      const prongStartX = startX + nx * offset;
      const prongStartY = startY + ny * offset;
      const prongEndX = x + nx * offset;
      const prongEndY = y + ny * offset;

      // Draw shadowed groove
      bctx.beginPath();
      bctx.strokeStyle = deepStrokeStyle;
      bctx.lineWidth = activeRake.id === 'broad' ? 4 : 2;
      bctx.moveTo(prongStartX + 1, prongStartY + 1);
      bctx.lineTo(prongEndX + 1, prongEndY + 1);
      bctx.stroke();

      // Draw highlight groove
      bctx.beginPath();
      bctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.075)';
      bctx.moveTo(prongStartX, prongStartY);
      bctx.lineTo(prongEndX, prongEndY);
      bctx.stroke();
    }

    bctx.restore();

    // Trigger sand rake sweep procedural sound
    if (soundEnabled && Math.random() < 0.35) {
      audio.playRakeScratch(0.12, 0.4);
    }

    rakeCoords.current = { x, y };
    draw();
  };

  // Click & Touch controls
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check if clicked near stone
    let rockIndex = -1;
    for (let i = 0; i < stones.length; i++) {
      const dist = Math.hypot(stones[i].x - px, stones[i].y - py);
      if (dist < stones[i].radius + 10) {
        rockIndex = i;
        break;
      }
    }

    if (rockIndex !== -1) {
      setActiveStone(stones[rockIndex].id);
      if (soundEnabled) audio.playRakeScratch(0.08, 0.6); // slight rock scrape sound
    } else {
      setActiveStone(null);
      // Raking starts
      rakeCoords.current = { x: px, y: py };
      if (activeRake.id === 'ripple') {
        // Concentric ripples around mouse
        drawRippleRings(px, py);
      }
    }
  };

  const drawRippleRings = (cx: number, cy: number) => {
    const buffer = sandBufferRef.current;
    if (!buffer) return;
    const bctx = buffer.getContext('2d');
    if (!bctx) return;

    bctx.save();
    bctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.05)';
    bctx.shadowBlur = 1.5;
    bctx.shadowColor = theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)';
    bctx.lineWidth = 1.8;

    const radii = [28, 42, 56, 70, 84];
    radii.forEach(r => {
      bctx.beginPath();
      bctx.arc(cx, cy, r, 0, Math.PI * 2);
      bctx.stroke();
    });

    bctx.restore();
    if (soundEnabled) audio.playRakeScratch(0.35, 0.8);
    draw();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (activeStone) {
      // Dragging stone around Karesansui layout
      setStones(prev => prev.map(stone => {
        if (stone.id === activeStone) {
          return {
            ...stone,
            x: Math.max(stone.radius + 10, Math.min(canvas.width - stone.radius - 10, px)),
            y: Math.max(stone.radius + 10, Math.min(canvas.height - stone.radius - 10, py))
          };
        }
        return stone;
      }));
      draw();
    } else if (rakeCoords.current) {
      rakeDragTo(px, py);
    }
  };

  const handlePointerUp = () => {
    setActiveStone(null);
    rakeCoords.current = null;
  };

  // Re-rake sand flat
  const handleReset = () => {
    initSand();
    if (soundEnabled) audio.playRakeScratch(0.6, 1.0);
  };

  return (
    <div className="flex flex-col h-full font-sans" id="zen-sand-garden">
      {/* Header Info Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-900/40 border-b border-slate-900 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-550/10 rounded-xl">
            <Compass className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Zen Sand Garden</h2>
            <p className="text-xs text-slate-400">Rake patterns to comb positive flow around heavy rocks</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2">
          {/* Sound toggle button */}
          <button
            onClick={() => toggleAmbient()}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              ambientEnabled
                ? 'bg-amber-600/20 text-amber-400 border-amber-500/40 shadow-inner'
                : 'bg-slate-950/60 text-slate-300 border-slate-900 hover:bg-slate-900/80'
            }`}
          >
            {ambientEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            {ambientEnabled ? 'Waves: On' : 'Nature Sound'}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 hover:bg-slate-900/80 text-slate-200 text-xs font-semibold rounded-lg border border-slate-900 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-550" /> Reset Bed
          </button>
        </div>
      </div>

      {/* Rake interactive Sand Stage */}
      <div 
        ref={containerRef}
        className="relative bg-slate-950 rounded-b-2xl overflow-hidden select-none border-x border-b border-slate-900 h-[410px] flex items-center justify-center cursor-crosshair touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full block"
        />

        {/* Sand Garden instructions Overlay */}
        <div className="absolute bottom-4 left-4 flex gap-1 items-center px-2 py-0.5 pointer-events-none bg-slate-950/75 rounded text-[9px] text-slate-450 tracking-wide select-none uppercase font-mono border border-slate-900">
          <Info className="w-3.5 h-3.5 text-amber-550" />
          Click Stone to drag | Drag sand to rake grooves | Waves play synthesized sea wind &amp; water sounds
        </div>
      </div>

      {/* Rake Selection Bottom Drawer */}
      <div className="mt-4 p-5 bg-slate-950/50 border border-slate-900/60 rounded-2xl">
        <span className="block text-xs font-semibold text-slate-300 mb-3 tracking-wide uppercase font-sans">
          Select Meditative Combing Tool
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RAKE_TYPES.map(rake => (
            <button
              key={rake.id}
              onClick={() => setActiveRake(rake)}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                activeRake.id === rake.id
                  ? 'bg-amber-600/10 border-amber-550'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="block text-[11px] font-bold text-slate-100 mb-0.5">
                {rake.name}
              </span>
              <span className="block text-[9px] text-slate-400 font-sans leading-tight">
                {rake.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
