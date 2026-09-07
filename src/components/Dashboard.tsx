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
  Zap,
  Users,
  ExternalLink
} from 'lucide-react';
import { useStore, TabType } from '../store';
import { audio } from '../utils/audio';

const publicAsset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export default function Dashboard() {
  const {
    visitsCount,
    minutesSpent,
    favoriteWidget,
    completedBreaks,
    setActiveTab,
    incrementCompletedBreaks,
    resetAllStats,
    soundEnabled
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

  const moodOptions: { id: string; emoji: string; accent: string }[] = [
    { id: 'Stressed', emoji: '🤯', accent: 'text-rose-300' },
    { id: 'Overwhelmed', emoji: '😵‍💫', accent: 'text-amber-300' },
    { id: 'Anxious', emoji: '🥺', accent: 'text-cyan-300' },
    { id: 'Tired', emoji: '🥱', accent: 'text-indigo-300' },
    { id: 'Frustrated', emoji: '😡', accent: 'text-orange-300' },
    { id: 'Fine', emoji: '😌', accent: 'text-emerald-300' },
  ];

  const widgetCards: {
    id: TabType;
    eyebrow: string;
    title: string;
    desc: string;
    cta: string;
    icon: React.ElementType;
    accent: string;
    glow: string;
  }[] = [
    {
      id: 'slime',
      eyebrow: 'Stretch & poke',
      title: 'Digital Slime',
      desc: 'Knead, stretch, and deform highly responsive gel pathways with sparkles under your touch.',
      cta: 'Launch playground',
      icon: Sparkles,
      accent: 'text-pink-300',
      glow: 'from-pink-400/25',
    },
    {
      id: 'sand',
      eyebrow: 'Rake & refocus',
      title: 'Zen Garden',
      desc: 'Rake parallel sand pathways slowly to restore internal clarity around river pebbles.',
      cta: 'Enter garden',
      icon: Compass,
      accent: 'text-amber-300',
      glow: 'from-amber-400/25',
    },
    {
      id: 'bubble',
      eyebrow: 'Pop the stress',
      title: 'Bubble Wrap',
      desc: 'Demolish virtual bubble sheets for instant pressure discharge and track your streak.',
      cta: 'Get popping',
      icon: Grid,
      accent: 'text-sky-300',
      glow: 'from-sky-400/25',
    },
    {
      id: 'fluid',
      eyebrow: 'Liquid dreams',
      title: 'Fluid Flow',
      desc: 'Swirl gorgeous fluid-canvas paintings with custom viscosity, speed, and aurora hues.',
      cta: 'Paint vortex',
      icon: Waves,
      accent: 'text-indigo-300',
      glow: 'from-indigo-400/25',
    },
    {
      id: 'pebble',
      eyebrow: 'Patience & poise',
      title: 'Stone Stack',
      desc: 'Calmly stack river rocks with realistic gravity and gentle wind offsets.',
      cta: 'Patience game',
      icon: Layers,
      accent: 'text-stone-300',
      glow: 'from-stone-400/20',
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans" id="dashboard-main">
      {/* 1. Hero Header Panel */}
      <div className="relative overflow-hidden p-8 md:p-10 rounded-[2rem] glass-strong">
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/8 text-indigo-200 rounded-full text-[10px] font-semibold uppercase tracking-widest border border-white/12 select-none">
              <Sparkles className="w-3 h-3 text-indigo-300" /> Official IB CAS Project
            </span>

            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mt-4">
              MindSpace
            </h1>

            <p className="text-sm md:text-base text-slate-300 font-medium tracking-tight mt-2 pb-1">
              Interactive tools for IB students who need a mental reset.
            </p>

            <p className="text-[13px] text-slate-400 leading-relaxed mt-4 max-w-lg">
              This interactive playground was built as a student-led <span className="text-slate-300 font-medium">IB CAS Initiative</span>. Navigating Theory of Knowledge, Extended Essays, IA due-dates, and exams is strenuous. Brief, tactile sensory breaks can lower cortisol and revive focus.
            </p>

            <button
              onClick={startCalmingBreak}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-white/12 hover:bg-white/18 border border-white/16 text-white rounded-full text-[13px] font-semibold shadow-lg shadow-black/20 cursor-pointer transition-all active:scale-98"
            >
              <Clock className="w-4 h-4" /> Start a calming break
            </button>
          </div>

          {/* Quick Stats side panel */}
          <div className="glass p-6 rounded-[1.5rem] min-w-[240px] shrink-0 self-start lg:self-center">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-semibold mb-4 tracking-wider uppercase border-b border-white/8 pb-3">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-300" /> Stress Tracker Stats
            </div>

            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Total Visits</span>
                <span className="font-semibold text-slate-100 font-mono">{visitsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Relaxation Log</span>
                <span className="font-semibold text-slate-100 font-mono">{minutesSpent} mins</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Favorite Toy</span>
                <span className="font-semibold text-indigo-300 truncate max-w-[140px]" title={favoriteWidget}>
                  {favoriteWidget}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Complete Breaks</span>
                <span className="font-semibold text-emerald-300 font-mono">{completedBreaks}</span>
              </div>
            </div>

            {/* Reset button inside dashboard */}
            {showResetConfirm ? (
              <div className="mt-5 bg-rose-500/10 border border-rose-400/25 p-3 rounded-xl flex flex-col gap-2">
                <span className="text-[10px] text-rose-200 font-semibold leading-normal">
                  Are you sure? This deletes all relaxation logs.
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      resetAllStats();
                      setShowResetConfirm(false);
                    }}
                    className="px-2.5 py-1 bg-rose-500/80 text-[9px] font-bold uppercase text-white rounded-md hover:bg-rose-500 cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1 bg-white/8 text-[9px] font-bold uppercase text-slate-300 rounded-md hover:bg-white/14 cursor-pointer border border-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="mt-5 text-[10px] uppercase tracking-wider text-rose-300/80 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer font-semibold select-none"
              >
                <RotateCcw className="w-3 h-3" /> Reset all statistics
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Mood Check-In Segment */}
      <div className="p-6 rounded-[2rem] glass">
        <h3 className="text-lg font-semibold text-slate-100 tracking-tight">
          How are you feeling right now?
        </h3>
        <p className="text-[13px] text-slate-400 mt-1">Select an emotional state to match it with a calming toy:</p>

        {/* Mood options grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mt-4">
          {moodOptions.map(moodOption => (
            <button
              key={moodOption.id}
              onClick={() => handleMoodSelect(moodOption.id)}
              className={`p-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border ${selectedMood === moodOption.id
                ? 'border-white/25 bg-white/16 text-white font-semibold shadow-inner'
                : 'border-white/8 bg-white/4 hover:bg-white/8 text-slate-300'
                }`}
            >
              <span className="text-base select-none">{moodOption.emoji}</span>
              <span className={`text-xs font-medium ${selectedMood === moodOption.id ? 'text-white' : moodOption.accent}`}>{moodOption.id}</span>
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
              className="mt-4 p-5 rounded-2xl glass-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <span className="block text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                  Tactical recommendation
                </span>
                <span className="block text-sm font-semibold text-slate-100 mt-1">
                  Try the {moodRecommendation.name}
                </span>
                <span className="block text-xs text-slate-400 font-medium mt-0.5 leading-relaxed">
                  {moodRecommendation.desc}
                </span>
              </div>

              <button
                onClick={() => setActiveTab(moodRecommendation.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/12 hover:bg-white/18 border border-white/16 text-white text-xs font-semibold rounded-full cursor-pointer shrink-0 self-start sm:self-center transition-all"
              >
                Launch widget <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Five sensory widgets grid */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Calming sensory playgrounds
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {widgetCards.map(card => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className="group glass rounded-[1.75rem] p-6 flex flex-col justify-between hover:bg-white/9 transition-all cursor-pointer relative overflow-hidden min-h-[210px]"
              >
                <div className={`absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-gradient-to-br ${card.glow} to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition-opacity`} />
                <div className="z-10 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">{card.eyebrow}</span>
                    <div className={`p-2 bg-white/8 rounded-xl ${card.accent}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-white tracking-tight mt-1">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    {card.desc}
                  </p>
                </div>
                <div className={`z-10 w-fit px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mt-4 border border-white/10 bg-white/6 ${card.accent}`}>
                  {card.cta}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Built for IB Students Informational Banner block */}
      <div className="p-8 rounded-[2rem] glass" id="built-for-ib-students">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-indigo-300" />
          <h3 className="text-sm font-semibold text-indigo-200 tracking-tight uppercase">
            Built for IB Students
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          Studying for the International Baccalaureate requires serious grit. Between polishing Extended Essay drafts, compiling TOK presentations, prepping for internal IA samples, and maintaining sports practices for CAS, cognitive fatigue develops rapidly. Studies show short, non-scholastic tactile pauses (like stretching slime or raking gravel) bypass heavy semantic processing, allowing active recovery so you can resume study sessions with a clear head.
        </p>
      </div>

      {/* 4.5 Meet the Team Block */}
      <div className="p-8 rounded-[2rem] glass" id="meet-the-team">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-indigo-300" />
          <h3 className="text-sm font-semibold text-indigo-200 tracking-tight uppercase">
            Meet the Team
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-6 max-w-4xl">
          The developer team behind MindSpace representing Chenyu Studios. These individuals designed, researched, and compiled the cognitive playground's sensory widgets.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {[
            {
              id: 'chenyu_lu',
              name: 'Chenyu Lu',
              role: 'Lead Developer & Coder',
              img: publicAsset('/portrait_images/chenyu_lu.jpg'),
              initials: 'CL',
              text: 'text-indigo-300',
              website: 'https://chenyulu.dev',
            },
            {
              id: 'benjamin_lam',
              name: 'Benjamin Lam',
              role: 'Psychological Researcher',
              img: publicAsset('/portrait_images/benjamin_lam.jpg'),
              initials: 'BL',
              text: 'text-purple-300',
            },
            {
              id: 'lucas',
              name: 'Lucas',
              role: 'Playground Thinker (came up with slime, zen sand, e.t.c)',
              img: publicAsset('/portrait_images/lucas.jpg'),
              initials: 'L',
              text: 'text-amber-300',
            },
            {
              id: 'oliver_miao',
              name: 'Oliver Miao',
              role: 'Code Reviewer, Outreach/Social Media',
              img: publicAsset('/portrait_images/oliver_miao.jpg'),
              initials: 'OM',
              text: 'text-emerald-300',
            },
          ].map(member => (
            <div
              key={member.id}
              className="glass-subtle rounded-2xl p-4 hover:bg-white/8 transition-all flex flex-col items-center text-center group relative overflow-hidden"
              id={`team-card-${member.id}`}
            >
              {/* Portrait Frame */}
              <div className="w-full aspect-[4/5] rounded-xl border border-white/10 bg-white/5 relative overflow-hidden mb-4 flex items-center justify-center">
                {!failedImages[member.id] ? (
                  <img
                    src={member.img}
                    alt={`${member.name} Portrait`}
                    referrerPolicy="no-referrer"
                    onError={() => setFailedImages(prev => ({ ...prev, [member.id]: true }))}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center select-none text-center p-3">
                    <span className={`text-3xl font-bold ${member.text} mb-1 tracking-wider`}>
                      {member.initials}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest font-mono">
                      Await Image
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/8 to-transparent pointer-events-none" />
              </div>

              {/* Info Frame */}
              <div className="flex-1 flex flex-col items-center justify-between w-full">
                <div>
                  <h4 className="text-xs font-semibold text-slate-100 tracking-tight">
                    {member.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1.5 font-medium px-1">
                    {member.role}
                  </p>
                </div>

                {member.website && (
                  <a
                    href={member.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/8 hover:bg-white/14 border border-white/12 text-indigo-200 hover:text-indigo-100 text-[10px] font-semibold rounded-lg transition-all cursor-pointer"
                  >
                    Visit website <ExternalLink className="w-3 h-3" />
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
            className="fixed inset-0 min-h-screen z-[100] bg-black/50 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none"
          >
            <div className="max-w-md w-full glass-strong p-8 rounded-[2.5rem] flex flex-col items-center gap-6 text-center">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase">
                  Active CAS wellness breathing
                </span>
                <button
                  onClick={() => setBreakActive(false)}
                  className="p-1 rounded-lg bg-white/8 hover:bg-white/16 text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Glowing breathing ring visualizer */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.45, 1], opacity: [0.3, 0.05, 0.3] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full bg-indigo-400/10 border-2 border-indigo-300/20"
                />

                <div className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-400/90 to-violet-500/90 shadow-xl shadow-black/30 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white font-mono leading-none">
                    {breakTimer}
                  </span>
                  <span className="text-[9px] text-indigo-100 uppercase tracking-widest mt-1">
                    seconds
                  </span>
                </div>
              </div>

              {/* Prompt message */}
              <div className="flex flex-col gap-1 min-h-[50px]">
                <h4 className="text-base font-semibold text-white">
                  {breakPhase}
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  Follow the rhythm of the breathing expanding wave. Settle your pulse.
                </p>
              </div>

              <span className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase font-mono">
                Relaxation credits integrate securely
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
            className="fixed inset-0 min-h-screen z-[101] bg-black/55 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none"
          >
            <div className="max-w-md w-full glass-strong p-8 rounded-[2.5rem] flex flex-col items-center gap-6 text-center relative overflow-hidden" id="break-success-modal">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-emerald-400/10 blur-[80px] pointer-events-none" />

              <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-300/25 flex items-center justify-center text-emerald-300 text-3xl">
                ✨
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-emerald-300 font-bold tracking-widest uppercase">
                  Relaxation session completed
                </span>
                <h4 className="text-2xl font-bold text-white tracking-tight">
                  Excellent Job!
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  You spent 1 full meditative minute focusing on deep diaphragmatic breathing. Your Stress Stats have been updated with extra relaxation credits!
                </p>
              </div>

              <button
                id="dismiss-success-modal"
                onClick={() => setShowBreakSuccess(false)}
                className="w-full py-3 bg-white/12 hover:bg-white/18 border border-white/16 text-white rounded-full text-xs font-semibold cursor-pointer transition-colors uppercase tracking-wider"
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
