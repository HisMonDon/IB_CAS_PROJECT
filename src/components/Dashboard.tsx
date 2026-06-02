/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Layers, 
  Compass, 
  Grid, 
  Waves, 
  Smile, 
  RotateCcw, 
  Clock, 
  BarChart2, 
  X, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Zap,
  Users,
  ExternalLink
} from 'lucide-react';
import { useStore, TabType } from '../store';
import { audio } from '../utils/audio';

export default function Dashboard() {
  const {
    visitsCount,
    minutesSpent,
    favoriteWidget,
    completedBreaks,
    setActiveTab,
    incrementCompletedBreaks,
    resetAllStats,
    soundEnabled,
    toggleSound
  } = useStore();

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodRecommendation, setMoodRecommendation] = useState<{ name: string; id: TabType; desc: string } | null>(null);

  // Fallback for team portrait image errors before they are uploaded
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Calming active break timer state
  const [breakActive, setBreakActive] = useState(false);
  const [breakTimer, setBreakTimer] = useState(60);
  const [breakPhase, setBreakPhase] = useState('Inhale deeply...');
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showBreakSuccess, setShowBreakSuccess] = useState(false);

  // Incremental visits count on mound
  useEffect(() => {
    // We increment visits only once per layout session
    const visited = sessionStorage.getItem('mindspace_session_visited');
    if (!visited) {
      useStore.getState().incrementVisits();
      sessionStorage.setItem('mindspace_session_visited', 'true');
    }
  }, []);

  // Mood recommendations engine
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    if (soundEnabled) audio.playPop(1.1);

    switch (mood) {
      case 'Stressed':
        setMoodRecommendation({ 
          name: 'Slime Simulator', 
          id: 'slime', 
          desc: 'Knead and stretch thick gel to absorb physical muscle tensions.' 
        });
        break;
      case 'Overwhelmed':
        setMoodRecommendation({ 
          name: 'Zen Sand Garden', 
          id: 'sand', 
          desc: 'Rake parallel sand pathways slowly to restore internal cosmic clarity.' 
        });
        break;
      case 'Anxious':
        setMoodRecommendation({ 
          name: 'Fluid Color Playground', 
          id: 'fluid', 
          desc: 'Watch fluid liquids flow of pure glowing sunset and neon gradients.' 
        });
        break;
      case 'Frustrated':
        setMoodRecommendation({ 
          name: 'Bubble Wrap Popper', 
          id: 'bubble', 
          desc: 'Pop hundreds of 3D bubbles to discharge stress constructively.' 
        });
        break;
      case 'Tired':
        setMoodRecommendation({ 
          name: 'Digital Pebble Stacker', 
          id: 'pebble', 
          desc: 'Carefully stack organic stones onto each other to train focus.' 
        });
        break;
      default:
        setMoodRecommendation({ 
          name: 'Fluid Color Playground', 
          id: 'fluid', 
          desc: 'Let smooth liquid-paint currents wash away miscellaneous thoughts!' 
        });
        break;
    }
  };

  // 60 seconds breacking helper
  useEffect(() => {
    let intervalId: any;
    if (breakActive && breakTimer > 0) {
      intervalId = setInterval(() => {
        setBreakTimer(t => t - 1);
      }, 1000);
    } else if (breakTimer === 0 && breakActive) {
      // Completed calming break!
      incrementCompletedBreaks();
      setBreakActive(false);
      setBreakTimer(60);
      if (soundEnabled) {
        audio.playPebbleStack(1.5);
      }
      setShowBreakSuccess(true);
    }

    return () => clearInterval(intervalId);
  }, [breakActive, breakTimer]);

  // Handle breathing phase cue updates based on timer
  useEffect(() => {
    if (!breakActive) return;

    // Phase breathing cycle cues
    if (breakTimer % 8 === 0 || breakTimer % 8 === 7 || breakTimer % 8 === 6 || breakTimer % 8 === 5) {
      setBreakPhase('Inhale slowly...');
    } else if (breakTimer % 8 === 4 || breakTimer % 8 === 3) {
      setBreakPhase('Hold focus...');
    } else {
      setBreakPhase('Exhale gently...');
    }

    // Dynamic sensory prompts during session
    if (breakTimer === 45) {
      setBreakPhase('Feel your shoulders dropping...');
    } else if (breakTimer === 30) {
      setBreakPhase('Empty your thoughts of coursework...');
    } else if (breakTimer === 15) {
      setBreakPhase('Almost there, reset complete...');
    }
  }, [breakTimer, breakActive]);

  const startCalmingBreak = () => {
    setBreakTimer(60);
    setBreakPhase('Inhale slowly and settle your mind...');
    setBreakActive(true);
    if (soundEnabled) audio.playPop(0.9);
  };

  return (
    <div className="flex flex-col gap-10 font-sans" id="dashboard-main">
      {/* 1. Hero Header Panel */}
      <div className="relative overflow-hidden p-8 md:p-12 rounded-3xl bg-slate-900/40 border border-slate-900/80 shadow-2xl text-slate-100">
        {/* Background flares */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-[110px] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            {/* Tag */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/80 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-900/50 select-none">
              <Sparkles className="w-3 h-3 text-indigo-400 fill-indigo-950" /> Official IB CAS Project
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-4">
              MindSpace
            </h1>
            
            {/* Subtitle */}
            <p className="text-sm md:text-md text-indigo-250/90 font-semibold tracking-tight mt-2 pb-1">
              Interactive tools for IB students who need a mental reset.
            </p>

            {/* Short paragraph explaining that this was created for IB CAS */}
            <p className="text-xs text-slate-300 leading-relaxed mt-4 max-w-lg">
              This interactive playground was constructed as a student-led <strong>IB CAS Initiative</strong>. Navigating Theory of Knowledge, Extended Essays, IA due-dates, and exams is strenuous. Taking brief, highly tactical sensory downtime breaks can significantly lower cortisol levels and revive critical focus.
            </p>

            <button
              onClick={startCalmingBreak}
              className="mt-6 flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-full text-xs font-bold font-sans shadow-lg shadow-indigo-950/50 cursor-pointer hover:scale-102 transition-all active:scale-98"
            >
              <Clock className="w-4 h-4" /> Start a calming break
            </button>
          </div>

          {/* Quick Stats side panel */}
          <div className="bg-slate-950/60 backdrop-blur-md p-6 rounded-2xl border border-slate-900 min-w-[240px] shrink-0 self-start lg:self-center shadow-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-4 tracking-wider uppercase font-sans border-b border-slate-800/80 pb-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" /> Stress Tracker Stats
            </div>

            <div className="flex flex-col gap-3 font-sans text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Total Visits</span>
                <span className="font-bold text-slate-205 font-mono">{visitsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Relaxation Log</span>
                <span className="font-bold text-slate-205 font-mono">{minutesSpent} mins</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Favorite Toy</span>
                <span className="font-bold text-indigo-400 truncate max-w-[140px]" title={favoriteWidget}>
                  {favoriteWidget}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Complete Breaks</span>
                <span className="font-bold text-emerald-400 font-mono">{completedBreaks}</span>
              </div>
            </div>

            {/* Reset button inside dashboard */}
            {showResetConfirm ? (
              <div className="mt-5 bg-rose-950/20 border border-rose-900/50 p-3 rounded-xl flex flex-col gap-2">
                <span className="text-[10px] text-rose-300 font-bold leading-normal">
                  Are you sure? This deletes all relaxation logs.
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      resetAllStats();
                      setShowResetConfirm(false);
                    }}
                    className="px-2 py-1 bg-rose-600 text-[9px] font-black uppercase text-white rounded-md hover:bg-rose-500 cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 bg-slate-900 text-[9px] font-bold uppercase text-slate-300 rounded-md hover:bg-slate-800 cursor-pointer border border-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="mt-5 text-[9px] uppercase tracking-wider text-rose-450 hover:text-rose-400 flex items-center gap-1 hover:underline cursor-pointer font-bold select-none"
              >
                <RotateCcw className="w-3 h-3" /> Reset all statistics
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Mood Check-In Segment */}
      <div className="p-6 bg-slate-900/40 border border-slate-900 shadow-xl rounded-3xl text-slate-100">
        <h3 className="text-lg font-bold text-slate-100 tracking-tight font-sans">
          How are you feeling right now?
        </h3>
        <p className="text-xs text-slate-400 mt-1">Select an emotional state to match your chemical resonance with a calming toy:</p>

        {/* Mood options grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mt-4">
          {[
            { id: 'Stressed', emoji: '🤯', color: 'border-rose-950/45 text-rose-300 bg-rose-950/20 hover:bg-rose-900/30' },
            { id: 'Overwhelmed', emoji: '😵‍💫', color: 'border-amber-950/45 text-amber-400 bg-amber-950/20 hover:bg-amber-900/30' },
            { id: 'Anxious', emoji: '🥺', color: 'border-cyan-950/45 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/30' },
            { id: 'Tired', emoji: '🥱', color: 'border-indigo-950/45 text-indigo-300 bg-indigo-950/20 hover:bg-indigo-900/30' },
            { id: 'Frustrated', emoji: '😡', color: 'border-orange-950/45 text-orange-400 bg-orange-950/20 hover:bg-orange-900/30' },
            { id: 'Fine', emoji: '😌', color: 'border-emerald-950/45 text-emerald-300 bg-emerald-950/20 hover:bg-emerald-900/30' },
          ].map(moodOption => (
            <button
              key={moodOption.id}
              onClick={() => handleMoodSelect(moodOption.id)}
              className={`p-3.5 border rounded-xl flex items-center justify-center gap-2 hover:scale-102 transition-all cursor-pointer ${
                selectedMood === moodOption.id 
                  ? 'border-indigo-550 ring-2 ring-indigo-950/80 font-bold shadow bg-indigo-600 text-white' 
                  : `${moodOption.color}`
              }`}
            >
              <span className="text-lg select-none">{moodOption.emoji}</span>
              <span className="text-xs font-semibold">{moodOption.id}</span>
            </button>
          ))}
        </div>

        {/* Recommendations popup card */}
        <AnimatePresence>
          {selectedMood && moodRecommendation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-5 bg-indigo-950/30 border border-indigo-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <span className="block text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">
                  Tactical recommendation:
                </span>
                <span className="block text-sm font-bold text-indigo-300 mt-1">
                  Try the {moodRecommendation.name}
                </span>
                <span className="block text-xs text-slate-400 font-medium mt-0.5 leading-relaxed">
                  {moodRecommendation.desc}
                </span>
              </div>

              <button
                onClick={() => setActiveTab(moodRecommendation.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold rounded-full cursor-pointer shrink-0 shadow-md self-start sm:self-center transition-all hover:scale-102"
              >
                Launch Widget <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Five sensory widgets grid */}
      <div className="flex flex-col gap-4">
        <h3 className="text-md font-extrabold text-[#94a3b8] uppercase tracking-wider font-sans">
          Calming sensory playgrounds
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Slime */}
          <div 
            onClick={() => setActiveTab('slime')}
            className="group bg-pink-950/15 hover:bg-pink-950/30 rounded-[2.2rem] p-6 flex flex-col justify-between border-2 border-pink-900/20 hover:border-pink-500/30 shadow-md hover:scale-101 transition-all cursor-pointer relative overflow-hidden min-h-[225px]"
          >
            <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-pink-400/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
            <div className="z-10 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-pink-400 tracking-wider">STRETCH &amp; POKE</span>
                <div className="p-2 bg-pink-950/40 rounded-xl text-pink-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-pink-300 uppercase tracking-tight mt-1 animate-pulse">
                Digital Slime
              </h4>
              <p className="text-xs text-pink-200/80 leading-relaxed font-sans mt-1">
                Knead, stretch, and deform highly responsive gel pathways. Pop micro sparkles directly under your touch triggers!
              </p>
            </div>
            <div className="z-10 bg-slate-900 w-fit px-4 py-1.5 rounded-full text-[10px] font-bold text-pink-400 border border-pink-900/50 uppercase mt-4">
              Launch Playground
            </div>
          </div>

          {/* Card Sand */}
          <div 
            onClick={() => setActiveTab('sand')}
            className="group bg-amber-955/15 hover:bg-amber-950/20 rounded-[2.2rem] p-6 flex flex-col justify-between border-2 border-amber-900/20 hover:border-amber-500/30 shadow-md hover:scale-101 transition-all cursor-pointer relative overflow-hidden min-h-[225px]"
          >
            <div className="absolute bottom-[-10px] right-[-10px] w-28 h-28 bg-amber-400/10 rounded-full blur-xl group-hover:scale-110 transition-transform" />
            <div className="z-10 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-amber-400 tracking-wider">RAKE &amp; REFOCUS</span>
                <div className="p-2 bg-amber-950/40 rounded-xl text-amber-400">
                  <Compass className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-amber-300 uppercase tracking-tight mt-1">
                Zen Garden
              </h4>
              <p className="text-xs text-amber-200/80 leading-relaxed font-sans mt-1">
                Rake custom parallel sand pathways slowly to restore internal cosmic clarity around physical pebbles.
              </p>
            </div>
            <div className="z-10 bg-amber-600 text-white w-fit px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-amber-550 transition-colors mt-4">
              Enter Garden
            </div>
          </div>

          {/* Card Bubble Wrap */}
          <div 
            onClick={() => setActiveTab('bubble')}
            className="group bg-sky-950/15 hover:bg-sky-950/30 rounded-[2.2rem] p-6 flex flex-col justify-between border-2 border-sky-900/20 hover:border-sky-500/30 shadow-md hover:scale-101 transition-all cursor-pointer relative overflow-hidden min-h-[225px]"
          >
            <div className="z-10 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-sky-400 tracking-wider">POP THE STRESS</span>
                <div className="p-2 bg-sky-950/40 rounded-xl text-sky-450">
                  <Grid className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-sky-305 uppercase tracking-tight mt-1">
                Bubble Wrap
              </h4>
              <p className="text-xs text-sky-200/80 leading-relaxed font-sans mt-1">
                Demolish virtual grids of bubble sheets for instant pressure discharge. Track active bubble pops and climb student rankings.
              </p>
            </div>
            <div className="z-10 bg-slate-900 w-full py-2 rounded-2xl text-center text-[10px] font-bold text-sky-405 border border-sky-900/50 uppercase mt-4">
              Get Popping
            </div>
          </div>

          {/* Card Fluid */}
          <div 
            onClick={() => setActiveTab('fluid')}
            className="group bg-indigo-950/30 rounded-[2.2rem] p-6 flex flex-col justify-between border-2 border-indigo-900/20 hover:border-indigo-500/30 shadow-md hover:scale-101 transition-all cursor-pointer relative overflow-hidden min-h-[225px] text-white"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-25 group-hover:opacity-40 transition-opacity" />
            <div className="z-10 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-400 tracking-wider">LIQUID DREAMS</span>
                <div className="p-2 bg-indigo-950/40 rounded-xl text-indigo-400">
                  <Waves className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-indigo-300 uppercase tracking-tight mt-1">
                Fluid Flow
              </h4>
              <p className="text-xs text-indigo-200/80 leading-relaxed font-sans mt-1">
                Swirl waves of gorgeous fluid canvas paintings with custom viscosity, speeds, and auroral models.
              </p>
            </div>
            <div className="z-10 bg-indigo-600 hover:bg-indigo-550 w-fit px-4 py-1.5 rounded-full text-[10px] font-bold text-white uppercase mt-4">
              Paint Vortex
            </div>
          </div>

          {/* Card Pebble Stacker */}
          <div 
            onClick={() => setActiveTab('pebble')}
            className="group bg-stone-900/30 rounded-[2.2rem] p-6 flex flex-col justify-between border-2 border-stone-800 hover:border-stone-500/30 shadow-md hover:scale-101 transition-all cursor-pointer relative overflow-hidden min-h-[225px]"
          >
            <div className="absolute bottom-[-10px] right-[-10px] w-24 h-24 bg-stone-400/5 rounded-full blur-xl group-hover:scale-110 transition-transform" />
            <div className="z-10 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-stone-400 tracking-wider">PATIENCE &amp; POISE</span>
                <div className="p-2 bg-stone-950/50 rounded-xl text-stone-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-stone-300 uppercase tracking-tight mt-1">
                Stone Stack
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed font-sans mt-1">
                Calmly stack physical river rocks on top of an altar with realistic gravity centers and wind offsets.
              </p>
            </div>
            <div className="z-10 text-center text-[10px] font-bold text-stone-400 uppercase mt-4 bg-slate-900 border border-stone-800 py-1.5 rounded-xl">
              Patience Game
            </div>
          </div>

        </div>
      </div>

      {/* 4. Built for IB Students Informational Banner block */}
      <div className="p-8 bg-slate-900/40 border border-slate-900/60 shadow-xl rounded-3xl" id="built-for-ib-students">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-indigo-400 fill-indigo-950" />
          <h3 className="text-base font-extrabold text-indigo-400 tracking-tight font-sans uppercase">
            Built for IB Students
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-4xl">
          Studying for the International Baccalaureate requires serious grit. Between polishing Extended Essay drafts, compiling TOK presentations, prepping for internal IA samples, and maintaining sports practices for CAS, cognitive fatigue develops rapidly. Studies prove that short, non-scholastic tactile pauses (like stretching slime or raking gravel) bypass heavy semantic processing in the brain, allowing active recovery so you can resume study sessions with clean cognitive capabilities.
        </p>
      </div>

      {/* 4.5 Meet the Team Block */}
      <div className="p-8 bg-slate-900/40 border border-slate-900/60 shadow-xl rounded-3xl" id="meet-the-team">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-extrabold text-indigo-400 tracking-tight font-sans uppercase">
            Meet the Team
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-6 max-w-4xl font-sans">
          The developer team behind MindSpace representing Chenyu Studios. These individuals designed, researched, and compiled the cognitive playground's sensory widgets.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            {
              id: 'chenyu_lu',
              name: 'Chenyu Lu',
              role: 'Lead Developer & Coder',
              img: '/portrait_images/chenyu_lu.jpg',
              initials: 'CL',
              gradient: 'from-indigo-900/40 to-indigo-950/90',
              text: 'text-indigo-400',
              border: 'border-indigo-500/20',
              website: 'https://chenyulu.dev',
            },
            {
              id: 'benjamin_lam',
              name: 'Benjamin Lam',
              role: 'Psychological Researcher',
              img: '/portrait_images/benjamin_lam.jpg',
              initials: 'BL',
              gradient: 'from-purple-900/40 to-purple-950/90',
              text: 'text-purple-400',
              border: 'border-purple-500/20',
            },
            {
              id: 'ken_zhong',
              name: 'Ken Zhong',
              role: 'Playground Thinker (came up with slime, zen sand, e.t.c)',
              img: '/portrait_images/ken_zhong.jpg',
              initials: 'KZ',
              gradient: 'from-amber-900/40 to-amber-950/90',
              text: 'text-amber-400',
              border: 'border-amber-500/20',
            },
            {
              id: 'oliver_miao',
              name: 'Oliver Miao',
              role: 'Code Reviewer/Debugger',
              img: '/portrait_images/oliver_miao.jpg',
              initials: 'OM',
              gradient: 'from-emerald-900/40 to-emerald-950/90',
              text: 'text-emerald-400',
              border: 'border-emerald-500/20',
            },
            {
              id: 'bryan_he',
              name: 'Bryan He',
              role: 'Playground Thinker (came up with slime, zen sand, e.t.c)',
              img: '/portrait_images/bryan_he.jpg',
              initials: 'BH',
              gradient: 'from-pink-900/40 to-pink-950/90',
              text: 'text-pink-400',
              border: 'border-pink-500/20',
            },
          ].map(member => (
            <div 
              key={member.id} 
              className="bg-slate-950/40 rounded-2xl p-4 border border-slate-900/80 hover:border-slate-800 transition-all flex flex-col items-center text-center shadow-lg group relative overflow-hidden"
              id={`team-card-${member.id}`}
            >
              {/* Portrait Frame */}
              <div 
                className={`w-full aspect-[4/5] rounded-xl border ${member.border} bg-gradient-to-b ${member.gradient} relative overflow-hidden mb-4 flex items-center justify-center`}
              >
                {!failedImages[member.id] ? (
                  <img
                    src={member.img}
                    alt={`${member.name} Portrait`}
                    referrerPolicy="no-referrer"
                    onError={() => setFailedImages(prev => ({ ...prev, [member.id]: true }))}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  /* Elegant elegant fallback profile icon indicating user initials */
                  <div className="flex flex-col items-center justify-center select-none text-center p-3">
                    <span className={`text-3xl font-black ${member.text} mb-1 tracking-wider`}>
                      {member.initials}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                      Await Image
                    </span>
                  </div>
                )}
                
                {/* Soft specular light shine highlight reflection gloss */}
                <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              </div>

              {/* Info Frame */}
              <div className="flex-1 flex flex-col items-center justify-between w-full">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 tracking-tight">
                    {member.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1.5 font-sans font-medium px-1">
                    {member.role}
                  </p>
                </div>

                {member.website && (
                  <a
                    href={member.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 text-[10px] font-bold rounded-lg transition-all shadow-md group-hover:scale-102 cursor-pointer"
                  >
                    Visit website <ExternalLink className="w-3 h-3 text-indigo-400" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Interactive Calming Break overlay modal */}
      <AnimatePresence>
        {breakActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 min-h-screen z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none"
          >
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center gap-6 text-center shadow-2xl">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-indigo-405 font-black tracking-widest uppercase">
                  ACTIVE CAS WELLNESS BREATHING
                </span>
                <button
                  onClick={() => setBreakActive(false)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-705 text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Glowing breathing ring visualizer */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Outward respiration wave ring */}
                <motion.div
                  animate={{ scale: [1, 1.45, 1], opacity: [0.3, 0.05, 0.3] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full bg-indigo-550/10 border-2 border-indigo-500/20"
                />
                
                {/* Core ring */}
                <div className="absolute w-28 h-28 rounded-full bg-linear-to-tr from-indigo-500 to-indigo-650 shadow-xl shadow-indigo-950 flex flex-col items-center justify-center">
                  <span className="text-3.5xl font-black text-white font-mono leading-none">
                    {breakTimer}
                  </span>
                  <span className="text-[9px] text-indigo-100 uppercase tracking-widest mt-1">
                    seconds
                  </span>
                </div>
              </div>

              {/* Prompt message */}
              <div className="flex flex-col gap-1 min-h-[50px]">
                <h4 className="text-base font-bold text-white">
                  {breakPhase}
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  Follow the rhythm of the breathing expanding wave. Settle your pulse.
                </p>
              </div>

              {/* Direct exit hint */}
              <span className="text-[10px] text-indigo-405 font-bold tracking-widest uppercase font-mono">
                RELAXATION CREDITS INTEGRATE SECURELY
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break Success Celebration Modal */}
      <AnimatePresence>
        {showBreakSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 min-h-screen z-[101] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none"
          >
            <div className="max-w-md w-full bg-slate-900 border border-indigo-500/30 p-8 rounded-[2.5rem] flex flex-col items-center gap-6 text-center shadow-2xl relative overflow-hidden" id="break-success-modal">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
              
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl animate-bounce">
                ✨
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase">
                  RELAXATION SESSION COMPLETED
                </span>
                <h4 className="text-2xl font-black text-white tracking-tight">
                  Excellent Job!
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  You spent 1 full meditative minute focusing on deep diaphragmatic breathing. Your Stress Stats have been updated with extra relaxation credits!
                </p>
              </div>

              <button
                id="dismiss-success-modal"
                onClick={() => setShowBreakSuccess(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-550 text-white rounded-full text-xs font-bold shadow-lg cursor-pointer hover:scale-102 transition-transform uppercase tracking-wider"
              >
                Heck Yeah, Proceed!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
