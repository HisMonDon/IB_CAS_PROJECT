/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Smile, Users, PlusCircle, Trash2, Heart, MessageSquare } from 'lucide-react';
import { useStore } from '../store';

export default function CasSection() {
  const { reflections, addReflection, deleteReflection, soundEnabled } = useStore();
  const [notes, setNotes] = useState('');
  const [moodBefore, setMoodBefore] = useState('Stressed');
  const [moodAfter, setMoodAfter] = useState('Fine');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    addReflection(notes.trim(), moodBefore, moodAfter);
    setNotes('');
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-6" id="cas-connection-page">
      {/* Page Title & Mission */}
      <div className="p-8 bg-linear-to-r from-violet-950/40 via-neutral-900/40 to-indigo-950/40 border border-neutral-200/5 rounded-2xl">
        <h2 className="text-2xl font-black text-white tracking-tight font-sans">IB CAS connection</h2>
        <p className="text-xs text-neutral-400 mt-2 max-w-2xl font-sans leading-relaxed">
          The International Baccalaureate (IB) Diploma Programme places <strong>Creativity, Activity, and Service (CAS)</strong> at the heart of student growth. MindSpace serves as a dedicated digital CAS project designed to alleviate exam anxiety and support mental welfare inside our school community.
        </p>
      </div>

      {/* Creativity, Activity, Service Triple Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Creativity */}
        <div className="p-6 bg-neutral-900/30 border border-neutral-200/5 rounded-2xl flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-400/10 flex items-center justify-center text-violet-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-100 font-sans">Creativity</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Designing and structuring tactile digital toys using math-based vector springs and canvas shaders. This required exploring user interface layouts, custom audio-synthesis, and organic UX principles to construct soothing interactive fidget tools.
          </p>
        </div>

        {/* Activity */}
        <div className="p-6 bg-neutral-900/30 border border-neutral-200/5 rounded-2xl flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-100 font-sans">Activity</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Promoting active stress regulation and emotional pause cycles. By taking intentional 2-minute mindful breaks, students learn to physicalize and relieve tension, developing vital self-care habits during hectic academic schedules.
          </p>
        </div>

        {/* Service */}
        <div className="p-6 bg-neutral-900/30 border border-neutral-200/5 rounded-2xl flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-100 font-sans">Service</h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Supporting mental wellness directly within the student body. Offering free, easily-accessible, offline sensory relief to peers struggling with Extended Essay, Theory of Knowledge (TOK), internal assessments, and exam deadlines.
          </p>
        </div>
      </div>

      {/* Personal CAS reflection workspace */}
      <div className="p-6 bg-neutral-900/20 border border-neutral-200/5 rounded-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-100 font-sans">CAS Reflexive Journal</h3>
              <p className="text-xs text-neutral-400">Log evaluations and track your state of mind before and after breaks</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> {showForm ? 'Cancel Journal' : 'Write Reflection'}
          </button>
        </div>

        {/* Journal interactive input form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="p-5 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col gap-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mood before selection */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 font-sans">
                    Mood Before Break
                  </label>
                  <select
                    value={moodBefore}
                    onChange={(e) => setMoodBefore(e.target.value)}
                    className="w-full p-2 bg-neutral-900 border border-neutral-850 rounded-lg text-xs font-medium text-neutral-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Stressed">Stressed</option>
                    <option value="Overwhelmed">Overwhelmed</option>
                    <option value="Anxious">Anxious</option>
                    <option value="Tired">Tired</option>
                    <option value="Frustrated">Frustrated</option>
                    <option value="Fine">Fine</option>
                  </select>
                </div>

                {/* Mood after selection */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 font-sans">
                    Expected Mood After
                  </label>
                  <select
                    value={moodAfter}
                    onChange={(e) => setMoodAfter(e.target.value)}
                    className="w-full p-2 bg-neutral-900 border border-neutral-850 rounded-lg text-xs font-medium text-neutral-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Fine">Fine / Relieved</option>
                    <option value="Calm">Calm &amp; Cozy</option>
                    <option value="Focused">Refreshed &amp; Focused</option>
                    <option value="Balanced">Mindful &amp; Balanced</option>
                  </select>
                </div>
              </div>

              {/* Reflection text notes */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 font-sans">
                  Reflection / Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What sensory actions helped? Write structural learning takeaways (e.g., 'Stacking pebbles required immense patience, allowing me to fully dissociate from the TOK essay outline.')"
                  className="w-full p-3 bg-neutral-900 border border-neutral-850 rounded-lg text-xs font-sans text-neutral-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none placeholder:text-neutral-600"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Existing reflections log list */}
        <div className="flex flex-col gap-3">
          {reflections.length === 0 ? (
            <div className="text-center p-8 bg-neutral-950/20 rounded-xl border border-dashed border-neutral-800">
              <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400 font-bold">No reflection records logged yet.</p>
              <p className="text-[10px] text-neutral-600 mt-1 max-w-sm mx-auto">
                After taking calming breaks, click Write Reflection above to document your development for CAS portfolio checks!
              </p>
            </div>
          ) : (
            reflections.map((ref) => (
              <div 
                key={ref.id}
                className="p-4 bg-neutral-950/60 border border-neutral-850 rounded-xl flex items-start justify-between gap-4 relative group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-neutral-500 font-mono font-medium">{ref.date}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-400 select-none uppercase tracking-wider">
                      Before: {ref.moodBefore}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 select-none uppercase tracking-wider">
                      After: {ref.moodAfter}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 font-sans leading-relaxed whitespace-pre-wrap">
                    {ref.notes}
                  </p>
                </div>

                <button
                  onClick={() => deleteReflection(ref.id)}
                  className="p-1 px-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 rounded transition-all shrink-0 cursor-pointer"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
