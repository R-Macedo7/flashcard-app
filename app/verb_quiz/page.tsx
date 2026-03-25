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

export default function VerbQuiz() {
  const [selectedTense, setSelectedTense] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT';
    window.speechSynthesis.speak(utterance);
  };

  const startQuiz = async (tense: any) => {
    setLoading(true);
    setSelectedTense(tense);
    
    try {
      // Fetch total count for random offset
      const { count } = await supabase.from('verb_reference').select('*', { count: 'exact', head: true });
      const totalVerbs = count || 500;
      const randomOffset = Math.max(0, Math.floor(Math.random() * (totalVerbs - 20)));

      const { data, error } = await supabase
        .from('verb_reference')
        .select('*')
        .range(randomOffset, randomOffset + 19);

      if (error) throw error;

      if (data) {
        const syncedQuestions = data.map(verb => {
          const pIndex = Math.floor(Math.random() * 6);
          // Safety check for conjugation path
          const answer = verb.conjugations?.[tense.id]?.[pIndex] || "error";
          return {
            verb,
            personIndex: pIndex,
            correctAnswer: answer
          };
        });
        setQuestions(syncedQuestions.sort(() => Math.random() - 0.5));
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
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setUserInput('');
    setCurrentIndex(prev => prev + 1);
  };

  // 1. TENSE SELECTION SCREEN
  if (!selectedTense && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Focus Training</h1>
            <p className="text-slate-500 text-lg font-medium">Pick a tense to drill today.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TENSES.map((t) => (
              <button
                key={t.id}
                onClick={() => startQuiz(t)}
                className={`group p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] ${t.hover} hover:shadow-xl transition-all text-left flex items-center gap-6`}
              >
                {/* Removed icon span to prevent errors */}
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{t.label}</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Conjugate all forms</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. LOADING STATE
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-slate-400 uppercase tracking-widest text-center px-4">Preparing {selectedTense?.label} Drill...</p>
    </div>
  );

  // 3. FINAL SCORE SCREEN
  if (questions.length > 0 && currentIndex >= questions.length) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-slate-100">
        <span className="text-7xl mb-6 block">⭐</span>
        <h2 className="text-4xl font-black mb-2 text-slate-900 tracking-tighter">Session Complete!</h2>
        <p className="text-slate-500 mb-8 font-medium italic text-lg">You mastered {score} verbs in the {selectedTense?.label}!</p>
        <button 
          onClick={() => window.location.reload()} 
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all shadow-lg"
        >
          Try Another Tense
        </button>
      </div>
    </div>
  );

  const current = questions[currentIndex];

  // 4. THE QUIZ ENGINE
  if (!current) return null; // Final safety check

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-xl w-full space-y-6">
        
        <div className="flex justify-between items-center px-4">
          <button onClick={() => window.location.reload()} className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
            ← Switch Tense
          </button>
          <div className="text-right">
             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Drill Score</p>
             <p className="text-lg font-black text-emerald-600 leading-none">{score}</p>
          </div>
        </div>

        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative">
          <div className="text-center space-y-2 mb-10">
            <div className={`inline-block px-4 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-tighter ${selectedTense?.color}`}>
              {selectedTense?.label}
            </div>
            <h2 className="text-6xl font-black text-slate-900 capitalize tracking-tighter leading-none pt-2">
              {current.verb.infinitive}
            </h2>
            <p className="text-slate-400 text-lg font-medium italic">"{current.verb.english_infinitive}"</p>
          </div>

          <form onSubmit={handleCheck} className="space-y-6">
            <div className="flex items-center p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 relative group focus-within:border-blue-400 transition-all">
              <span className="absolute left-6 text-2xl font-black text-slate-300 pointer-events-none">
                {PRONOUNS[current.personIndex]}
              </span>
              <input 
                autoFocus
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={feedback !== null}
                placeholder="conjugate here..."
                className={`w-full bg-transparent pl-36 text-2xl font-bold outline-none ${feedback === 'correct' ? 'text-emerald-600' : feedback === 'wrong' ? 'text-red-600' : 'text-slate-900'}`}
              />
            </div>

            {feedback === null ? (
              <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all">
                Check Answer
              </button>
            ) : (
              <div className="space-y-4">
                {feedback === 'wrong' && (
                  <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-center">
                    <p className="text-red-400 text-[10px] font-black uppercase mb-1">Correct Conjugation:</p>
                    <p className="text-red-600 text-3xl font-black">{current.correctAnswer}</p>
                  </div>
                )}
                {feedback === 'correct' && (
                   <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                    <p className="text-emerald-600 text-xl font-black">Boa! Continue assim! 🇵🇹</p>
                  </div>
                )}
                <button type="button" onClick={nextQuestion} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 shadow-lg">
                  Next Question →
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}