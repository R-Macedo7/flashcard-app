"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PRONOUNS = ['Eu', 'Tu', 'Ele/Ela', 'Nós', 'Vós', 'Eles/Elas'];
const TENSES = [
  { id: 'presente', label: 'Present', color: 'bg-blue-600', hover: 'hover:border-blue-400'},
  { id: 'preterito_perfeito', label: 'Past (Finished)', color: 'bg-emerald-600', hover: 'hover:border-emerald-400'},
  { id: 'preterito_imperfeito', label: 'Past (Ongoing)', color: 'bg-purple-600', hover: 'hover:border-purple-400'},
  { id: 'futuro', label: 'Future', color: 'bg-amber-600', hover: 'hover:border-amber-400'}
];

const VERB_TYPES = [
  { id: 'all', label: 'All Verbs' },
  { id: 'regular', label: 'Regular' },
  { id: 'irregular', label: 'Irregular' },
  { id: 'reflexive', label: 'Reflexive' }
];

export default function VerbQuiz() {
  const [selectedTense, setSelectedTense] = useState<any>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  // STRICT PT-PT VOICE SELECTION
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Specifically looking for Portugal (pt-PT) and excluding Brazil (pt-BR)
    const ptPtVoice = voices.find(v => 
      (v.lang === 'pt-PT' || v.lang === 'pt_PT') || 
      (v.lang.startsWith('pt') && v.name.toLowerCase().includes('portugal'))
    );

    if (ptPtVoice) {
      utterance.voice = ptPtVoice;
      utterance.lang = 'pt-PT';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Strict pt-PT voice not found. Please check macOS Spoken Content settings.");
    }
  };

  // Ensure voices are loaded into memory
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const startQuiz = async (tense: any) => {
    setLoading(true);
    setSelectedTense(tense);
    
    try {
      let countQuery = supabase.from('verb_reference').select('*', { count: 'exact', head: true });
      if (selectedType === 'irregular') countQuery = countQuery.eq('is_irregular', true);
      if (selectedType === 'reflexive') countQuery = countQuery.eq('is_reflexive', true);
      if (selectedType === 'regular') countQuery = countQuery.eq('is_irregular', false).eq('is_reflexive', false);

      const { count } = await countQuery;
      const totalVerbs = count || 20;
      const randomOffset = Math.max(0, Math.floor(Math.random() * (totalVerbs - 20)));

      let query = supabase.from('verb_reference').select('*');
      if (selectedType === 'irregular') query = query.eq('is_irregular', true);
      if (selectedType === 'reflexive') query = query.eq('is_reflexive', true);
      if (selectedType === 'regular') query = query.eq('is_irregular', false).eq('is_reflexive', false);

      const { data, error } = await query.range(randomOffset, randomOffset + 19);

      if (error) throw error;

      if (data && data.length > 0) {
        const syncedQuestions = data.map(verb => {
          const pIndex = Math.floor(Math.random() * 6);
          const answer = verb.conjugations?.[tense.id]?.[pIndex] || "error";
          return {
            verb,
            personIndex: pIndex,
            correctAnswer: answer
          };
        });
        setQuestions(syncedQuestions.sort(() => Math.random() - 0.5));
      } else {
        alert("No verbs found! Try a different filter.");
        setSelectedTense(null);
      }
    } catch (err) {
      console.error("Quiz Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== null || !userInput.trim()) return;

    const current = questions[currentIndex];
    const isCorrect = userInput.trim().toLowerCase() === current.correctAnswer.toLowerCase();
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 1);
      speak(current.correctAnswer);
    } else {
      setFeedback('wrong');
      // Shuffle back into the deck
      setQuestions(prev => [...prev, current]);
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setUserInput('');
    setCurrentIndex(prev => prev + 1);
  };

  if (!selectedTense && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center font-sans">
        <div className="max-w-2xl w-full space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic">Focus Training</h1>
            <p className="text-slate-500 text-lg font-medium">Customise your drill session.</p>
          </div>

          <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-slate-200 max-w-md mx-auto">
            {VERB_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex-1 py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedType === type.id 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TENSES.map((t) => (
              <button
                key={t.id}
                onClick={() => startQuiz(t)}
                className={`group p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] ${t.hover} hover:shadow-xl transition-all text-left relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-slate-900">{t.label}</h3>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-2">
                    {selectedType} mode
                  </p>
                </div>
                <div className={`absolute right-[-20px] bottom-[-20px] w-24 h-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 ${t.color}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-slate-400 uppercase tracking-widest text-center px-4 tracking-tighter text-sm">Shuffling random verbs...</p>
    </div>
  );

  if (questions.length > 0 && currentIndex >= questions.length) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-slate-100">
        <span className="text-7xl mb-6 block">🏆</span>
        <h2 className="text-4xl font-black mb-2 text-slate-900 tracking-tighter">Session Over!</h2>
        <p className="text-slate-500 mb-8 font-medium text-lg">You mastered all verbs in {selectedTense?.label} mode.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all shadow-lg"
        >
          Try Another Drill
        </button>
      </div>
    </div>
  );

  const current = questions[currentIndex];
  if (!current) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-xl w-full space-y-6">
        
        <div className="flex justify-between items-center px-4">
          <button onClick={() => window.location.reload()} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
            ← Abort Drill
          </button>
          <div className="text-right">
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Progress</p>
             <p className="text-2xl font-black text-emerald-600 leading-none">{currentIndex + 1} / {questions.length}</p>
          </div>
        </div>

        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
          <div className="bg-emerald-500 h-full transition-all duration-700 ease-out" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-8 right-8 flex gap-2">
            {current.verb.is_irregular && <span className="text-amber-500 font-black text-xl">*</span>}
            {current.verb.is_reflexive && <span className="text-blue-500 font-black text-xl">•</span>}
          </div>

          <div className="text-center space-y-2 mb-10">
            <div className={`inline-block px-4 py-1.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest ${selectedTense?.color}`}>
              {selectedTense?.label}
            </div>
            <h2 className="text-6xl font-black text-slate-900 capitalize tracking-tighter leading-none pt-4">
              {current.verb.infinitive}
            </h2>
            <p className="text-slate-400 text-lg font-medium italic">"{current.verb.english_infinitive}"</p>
          </div>

          <form onSubmit={handleCheck} className="space-y-6">
            <div className="flex items-center p-7 bg-slate-50 rounded-3xl border-2 border-slate-100 relative group focus-within:border-blue-400 transition-all">
              <span className="absolute left-8 text-2xl font-black text-slate-300 pointer-events-none uppercase tracking-tighter">
                {PRONOUNS[current.personIndex]}
              </span>
              <input 
                autoFocus
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={feedback !== null}
                placeholder="..."
                autoComplete="off"
                className={`w-full bg-transparent pl-36 text-2xl font-black outline-none ${feedback === 'correct' ? 'text-emerald-600' : feedback === 'wrong' ? 'text-red-600' : 'text-slate-900'}`}
              />
            </div>

            {feedback === null ? (
              <button className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                Submit Answer
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                {feedback === 'wrong' && (
                  <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl text-center">
                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">The Correct Answer was:</p>
                    <p className="text-red-600 text-4xl font-black tracking-tight">{current.correctAnswer}</p>
                    <p className="text-red-400 text-[9px] font-black uppercase mt-3 italic">Re-shuffled into deck</p>
                  </div>
                )}
                {feedback === 'correct' && (
                   <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl text-center">
                    <p className="text-emerald-600 text-2xl font-black tracking-tighter italic">Excelente trabalho!</p>
                  </div>
                )}
                <button type="button" onClick={nextQuestion} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl hover:bg-blue-700 shadow-xl transition-all">
                  Next Verb →
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}