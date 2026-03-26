"use client";
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VerbExplorer() {
  const [search, setSearch] = useState('');
  const [verbs, setVerbs] = useState<any[]>([]);
  const [selectedVerb, setSelectedVerb] = useState<any>(null);
  const [activeTense, setActiveTense] = useState('presente');
  
  // Filters
  const [onlyIrregular, setOnlyIrregular] = useState(false);
  const [onlyReflexive, setOnlyReflexive] = useState(false);

  const pronouns = ['Eu', 'Tu', 'Ele/Ela', 'Nós', 'Vós', 'Eles/Elas'];

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang === 'pt-PT' || v.lang === 'pt_PT');
    if (ptVoice) utterance.voice = ptVoice;
    utterance.lang = 'pt-PT';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const fetchVerbs = async () => {
      if (search.length <= 1 && !onlyIrregular && !onlyReflexive) {
        setVerbs([]);
        return;
      }

      let query = supabase.from('verb_reference').select('*');
      
      if (search.length > 1) {
        query = query.or(`infinitive.ilike.${search}%,english_infinitive.ilike.%${search}%`);
      }

      if (onlyIrregular) query = query.eq('is_irregular', true);
      if (onlyReflexive) query = query.eq('is_reflexive', true);

      const { data } = await query.limit(20).order('infinitive', { ascending: true });
      if (data) setVerbs(data);
    };

    fetchVerbs();
  }, [search, onlyIrregular, onlyReflexive]);

  const currentConjugations = useMemo(() => {
    if (!selectedVerb?.conjugations) return [];
    const rawData = selectedVerb.conjugations[activeTense] || [];
    return Array.isArray(rawData) ? rawData : [];
  }, [selectedVerb, activeTense]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8 font-sans">
      <header className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Verb Explorer</h1>
          <p className="text-slate-500 font-medium mt-2">Master Portuguese Conjugations</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center">
          {/* NEW: Link to Verb Quiz */}
          <Link 
            href="/verb_quiz" 
            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 bg-slate-900 border-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200 mr-2"
          >
            📝 Quiz Mode
          </Link>

          <button 
            onClick={() => { setOnlyIrregular(!onlyIrregular); setSelectedVerb(null); }}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
              onlyIrregular ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            ★ Irregular
          </button>

          <button 
            onClick={() => { setOnlyReflexive(!onlyReflexive); setSelectedVerb(null); }}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
              onlyReflexive ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            • Reflexive
          </button>
        </div>
      </header>

      <div className="relative max-w-lg mx-auto">
        <input
          type="text"
          placeholder={onlyReflexive ? "Showing reflexive verbs..." : onlyIrregular ? "Showing irregular verbs..." : "Search verbs..."}
          className="w-full p-5 border-2 border-slate-200 rounded-2xl shadow-md bg-white text-slate-900 font-medium outline-none focus:border-blue-500 transition-all"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedVerb(null); }}
        />
        
        {verbs.length > 0 && !selectedVerb && (
          <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {verbs.map(v => (
              <button
                key={v.id}
                onClick={() => { setSelectedVerb(v); setSearch(v.infinitive); }}
                className="w-full text-left p-4 hover:bg-slate-50 flex justify-between items-center border-b last:border-0 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 capitalize flex items-center gap-1">
                    {v.infinitive}
                    {v.is_irregular && <span className="text-amber-500">*</span>}
                    {v.is_reflexive && <span className="text-blue-500">•</span>}
                  </span>
                  <span className="text-slate-400 text-sm italic">{v.english_infinitive || 'no translation'}</span>
                </div>
                <span className="text-slate-300 text-xs">→</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedVerb && (
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
           <div className="p-10 border-b border-slate-100 bg-white">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-5">
                  <h2 className="text-5xl font-black capitalize text-slate-900 tracking-tighter italic flex items-start gap-1">
                    {selectedVerb.infinitive}
                    {selectedVerb.is_irregular && <span className="text-amber-500 text-3xl">*</span>}
                    {selectedVerb.is_reflexive && <span className="text-blue-500 text-3xl">•</span>}
                  </h2>
                  <button 
                    onClick={() => speak(selectedVerb.infinitive)}
                    className="w-12 h-12 flex items-center justify-center bg-blue-50 hover:bg-blue-100 rounded-full transition-all text-blue-600 shadow-sm active:scale-95"
                  >
                    🔊
                  </button>
                </div>
                <p className="text-slate-400 text-xl font-medium">"{selectedVerb.english_infinitive}"</p>
              </div>
              <div className="flex gap-2">
                {selectedVerb.is_irregular && <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-200">Irregular</span>}
                {selectedVerb.is_reflexive && <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-200">Reflexive</span>}
              </div>
            </div>
          </div>

          <div className="flex bg-slate-50/50 p-2 gap-2 border-b border-slate-100 overflow-x-auto">
            {['presente', 'preterito_perfeito', 'preterito_imperfeito', 'futuro'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTense(t)}
                className={`flex-1 min-w-[120px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTense === t 
                    ? 'bg-white text-blue-600 shadow-md border border-slate-200 translate-y-[-1px]' 
                    : 'text-slate-400 hover:bg-white/50'
                }`}
              >
                {t === 'presente' ? 'Present' : t === 'preterito_perfeito' ? 'Past Perfect' : t === 'preterito_imperfeito' ? 'Past Imperfect' : 'Future'}
              </button>
            ))}
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
            {currentConjugations.map((word: string, i: number) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all group cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => speak(word)}
              >
                <div className="flex items-center">
                  <span className="w-20 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-blue-400 transition-colors">
                    {pronouns[i]}
                  </span>
                  <span className="text-2xl font-black text-slate-800 tracking-tight">
                    {word}
                  </span>
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-all text-blue-400">🔊</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}