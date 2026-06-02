/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Layers, 
  Compass, 
  Grid, 
  Waves, 
  Volume2, 
  VolumeX, 
  Home 
} from 'lucide-react';
import { useStore, TabType } from './store';
import Dashboard from './components/Dashboard';
import SlimeWidget from './components/SlimeWidget';
import SandWidget from './components/SandWidget';
import BubbleWidget from './components/BubbleWidget';
import FluidWidget from './components/FluidWidget';
import PebbleWidget from './components/PebbleWidget';
import Footer from './components/Footer';

export default function App() {
  const { activeTab, setActiveTab, soundEnabled, toggleSound } = useStore();

  const renderActiveWidget = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'slime':
        return <SlimeWidget />;
      case 'sand':
        return <SandWidget />;
      case 'bubble':
        return <BubbleWidget />;
      case 'fluid':
        return <FluidWidget />;
      case 'pebble':
        return <PebbleWidget />;
      default:
        return <Dashboard />;
    }
  };

  const menuItems = [
    { id: 'home', name: 'Home', icon: Home, color: 'text-sky-400 bg-sky-500/5' },
    { id: 'slime', name: 'Slime', icon: Sparkles, color: 'text-violet-400 bg-violet-500/5' },
    { id: 'sand', name: 'Zen Sand', icon: Compass, color: 'text-amber-500 bg-amber-500/5' },
    { id: 'bubble', name: 'Bubble Pop', icon: Grid, color: 'text-pink-400 bg-pink-500/5' },
    { id: 'fluid', name: 'Fluid Art', icon: Waves, color: 'text-cyan-400 bg-cyan-500/5' },
    { id: 'pebble', name: 'Pebbles', icon: Layers, color: 'text-emerald-400 bg-emerald-500/5' },
  ];

  return (
    <div id="mindspace-app" className="min-h-screen flex flex-col bg-[#05070c] text-slate-100 font-sans antialiased">
      
      {/* Dynamic Header App Bar designed with elegant Vibrant Palette theme */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('home')}>
          {/* Main App Icon in Vibrant Palette theme style */}
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-950/50">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-sans">
              <span className="text-xl font-bold tracking-tight text-slate-100 leading-none">
                MindSpace
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-950/85 border border-indigo-900/65 text-indigo-300 font-bold select-none uppercase tracking-widest font-mono">
                MEDITATION
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 leading-none mt-1">A Mental Wellness Playground</p>
          </div>
        </div>

        {/* Global Toolbar actions */}
        <div className="flex items-center gap-6 font-sans">
          {/* Sounds effect triggers */}
          <button
            onClick={() => toggleSound()}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-950/60 border-indigo-900/50 text-indigo-400 hover:bg-indigo-900/65'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-850'
            }`}
            title={soundEnabled ? "Sfx Enabled" : "Sfx Muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Navigation Rail for large screens & mobile overlay list */}
        <nav className="w-full md:w-[220px] shrink-0 self-start p-2.5 bg-slate-950/60 border border-slate-900/80 shadow-md rounded-3xl">
          <div className="flex md:flex-col flex-wrap gap-1.5">
            {menuItems.map(item => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`flex items-center gap-3.5 px-4 py-3 text-xs font-bold rounded-xl text-left select-none transition-all w-full scale-100 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 shrink-0`} />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Workspace Active screen context */}
        <div className="flex-1 flex flex-col justify-between min-h-0 bg-transparent relative overflow-visible">
          
          {/* Active section transition wrap */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="h-full"
              >
                {renderActiveWidget()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Shared design copyright text rendered at bottom of website for EVERY single tab */}
          <Footer />
        </div>

      </main>
    </div>
  );
}
