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
import ShaderBackground from './components/ShaderBackground';
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
    { id: 'home', name: 'Home', icon: Home },
    { id: 'slime', name: 'Slime', icon: Sparkles },
    { id: 'sand', name: 'Zen Sand', icon: Compass },
    { id: 'bubble', name: 'Bubble Pop', icon: Grid },
    { id: 'fluid', name: 'Fluid Art', icon: Waves },
    { id: 'pebble', name: 'Pebbles', icon: Layers },
  ];

  return (
    <div id="mindspace-app" className="min-h-screen flex flex-col text-slate-100 font-sans antialiased">
      <ShaderBackground />

      {/* Floating glass app bar */}
      <header className="sticky top-4 z-40 mx-4 lg:mx-8 mt-4 px-4 lg:px-6 py-3.5 flex items-center justify-between rounded-[1.75rem] glass-strong">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('home')}>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-400/90 to-violet-500/90 shadow-[0_2px_10px_-2px_rgba(99,102,241,0.6)]">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-sans">
              <span className="text-[15px] font-semibold tracking-tight text-white leading-none">
                MindSpace
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/8 border border-white/10 text-indigo-200/90 font-semibold select-none uppercase tracking-widest">
                Meditation
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 leading-none mt-1">A mental wellness playground</p>
          </div>
        </div>

        <button
          onClick={() => toggleSound()}
          className={`p-2.5 rounded-full transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-white/10 border border-white/14 text-indigo-200 hover:bg-white/16'
              : 'bg-white/4 border border-white/8 text-slate-500 hover:bg-white/8'
          }`}
          title={soundEnabled ? 'Sfx Enabled' : 'Sfx Muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row gap-6">

        {/* Navigation rail */}
        <nav className="w-full md:w-[210px] shrink-0 self-start p-2 rounded-[1.75rem] glass">
          <div className="flex md:flex-col flex-wrap gap-1">
            {menuItems.map(item => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`relative flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium rounded-2xl text-left select-none w-full cursor-pointer ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-2xl bg-white/12 border border-white/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
                    />
                  )}
                  <IconComponent className="relative w-4 h-4 shrink-0" />
                  <span className="relative truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Workspace Active screen context */}
        <div className="flex-1 flex flex-col justify-between min-h-0 bg-transparent relative overflow-visible">

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="h-full"
              >
                {renderActiveWidget()}
              </motion.div>
            </AnimatePresence>
          </div>

          <Footer />
        </div>

      </main>
    </div>
  );
}
