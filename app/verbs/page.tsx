"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link'; // Added Link import

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VerbExplorer() {
  const [search, setSearch] = useState('');
  const [verbs, setVerbs] = useState<any[]>([]);
  const [selectedVerb, setSelectedVerb] = useState<any>(null);
  const [activeTense, setActiveTense] = useState('presente');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const pronouns = ['Eu', 'Tu', 'Ele/Ela', 'Nós', 'Vós', 'Eles/Elas'];

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT';
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const fetchVerbs = async () => {
      const { data } = await supabase
        .from('verb_reference')
        .select('*')
        .or(`infinitive.ilike.${search}%,english_infinitive.ilike.%${search}%`)
        .limit(5);
      if (data) setVerbs(data);
    };
    if (search.length > 1) fetchVerbs();
    else setVerbs([]);
  }, [search]);

  const getDisplayConjugations = () => {
    if (!selectedVerb?.conjugations) return [];
    const rawData = selectedVerb.conjugations[activeTense] || 
                    selectedVerb.conjugations[activeTense.replace('preterito_', '')] || [];
    return Array.isArray(rawData) ? rawData : Object.values(rawData);
  };

  const currentConjugations = getDisplayConjugations();

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8 font-sans">
      
      {/* HEADER SECTION WITH QUIZ LINK */}
      <header className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Verb Explorer</h1>
          <p className="text-slate-500 font-medium">Master Portuguese Conjugations</p>
        </div>

        {/* THE NEW QUIZ LINK */}
        <Link 
          href="/verb_quiz"
          className="group flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-amber-200 transition-all hover:-translate-y-1 active:translate-y-0"
        >
          <span>📝 Start Quiz</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs group-hover:bg-white/30 transition-colors">NEW</span>
        </Link>
      </header>

      {/* SEARCH BAR */}
      <div className="relative max-w-lg mx-auto">
        <input
          type="text"
          placeholder="Try 'Speak' or 'Falar'..."
          className="w-full p-4 text-lg border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none shadow-md bg-white text-slate-900 transition-all placeholder:text-slate-400"
          value={search}
          onChange={(e) => { 
            setSearch(e.target.value); 
            setSelectedVerb(null); 
          }}
        />
        
        {verbs.length > 0 && !selectedVerb && (
          <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
            {verbs.map(v => (
              <button
                key={v.id}
                onClick={() => { 
                  setSelectedVerb(v); 
                  setSearch(v.infinitive);
                  setEditValue(v.english_infinitive || '');
                }}
                className="w-full text-left p-4 hover:bg-blue-50 flex justify-between items-center border-b last:border-0"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 capitalize">{v.infinitive}</span>
                  <span className="text-slate-400 text-sm italic">{v.english_infinitive || 'no translation'}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ... (rest of the component remains the same) */}
      {selectedVerb && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
           {/* Verb Card Content Here */}
           <div className="p-8 border-b border-slate-100 bg-white">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-4 flex-wrap">
                  <h2 className="text-4xl font-bold capitalize text-slate-900">{selectedVerb.infinitive}</h2>
                  <button 
                    onClick={() => speak(selectedVerb.infinitive)}
                    className="p-2 bg-slate-100 hover:bg-blue-100 rounded-full transition-colors text-blue-600"
                  >
                    🔊
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex bg-slate-50/50 p-1 gap-1 border-b border-slate-100 overflow-x-auto">
            {['presente', 'preterito_perfeito', 'preterito_imperfeito', 'futuro'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTense(t)}
                className={`flex-1 min-w-[100px] py-3 rounded-xl text-xs font-bold uppercase transition-all ${
                  activeTense === t 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                    : 'text-slate-400 hover:bg-white/50'
                }`}
              >
                {t.replace('preterito_', 'Past ').replace('presente', 'Present').replace('futuro', 'Future')}
              </button>
            ))}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
            {currentConjugations.map((word: string, i: number) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer"
                onClick={() => speak(word)}
              >
                <div className="flex items-center">
                  <span className="w-20 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-400">
                    {pronouns[i]}
                  </span>
                  <span className="text-xl font-semibold text-slate-800">
                    {word}
                  </span>
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">🔊</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}