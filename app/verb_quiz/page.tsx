"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PRONOUNS = ['Eu', 'Tu', 'Ele/Ela', 'Nós', 'Vós', 'Eles/Elas'];
const TENSES = [
  { id: 'presente', label: 'Present' },
  { id: 'preterito_perfeito', label: 'Past (Perfeito)' },
  { id: 'preterito_imperfeito', label: 'Past (Imperfeito)' },
  { id: 'futuro', label: 'Future' }
];

export default function VerbQuiz() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang === 'pt-PT') || voices.find(v => v.lang.includes('pt'));
    if (ptVoice) utterance.voice = ptVoice;
    utterance.lang = 'pt-PT';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    
    // 1. Get total count to pick a random starting point
    const { count } = await supabase.from('verb_reference').select('*', { count: 'exact', head: true });
    const randomOffset = Math.max(0, Math.floor(Math.random() * (count || 500) - 20));

    // 2. Fetch 20 verbs from that random starting point
    const { data } = await supabase
      .from('verb_reference')
      .select('*')
      .range(randomOffset, randomOffset + 19);

    if (data) {
      const formatted = data.map(verb => {
        const randomTense = TENSES[Math.floor(Math.random() * TENSES.length)];
        const personIndex = Math.floor(Math.random() * 6);
        return {
          verb,
          tense: randomTense,
          personIndex,
          correctAnswer: verb.conjugations[randomTense.id][personIndex]
        };
      });
      // 3. Shuffle the result so it's not alphabetical
      setQuestions(formatted.sort(() => Math.random() - 0.5));
    }
    setLoading(false);
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== null) return;

    const current = questions[currentIndex];
    const isRight = userInput.trim().toLowerCase() === current.correctAnswer.toLowerCase();
    
    if (isRight) {
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center animate-pulse">
        <span className="text-4xl">⏳</span>
        <p className="mt-4 font-bold text-slate-400">Shuffling the deck...</p>
      </div>
    </div>
  );

  if (currentIndex >= questions.length) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-slate-100">
        <span className="text-6xl mb-6 block">🏆</span>
        <h2 className="text-4xl font-black mb-2 text-slate-900">Quiz Complete!</h2>
        <p className="text-slate-500 mb-8 text-lg font-medium">You got <span className="text-emerald-500 font-bold">{score}</span> out of {questions.length} correct.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl"
        >
          Play Again
        </button>
      </div>
    </div>
  );

  const current = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-xl w-full space-y-6">
        
        {/* PROGRESS HEADER */}
        <div className="flex justify-between items-end px-2">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Progress</p>
            <p className="text-sm font-bold text-slate-900">{currentIndex + 1} / {questions.length}</p>
          </div>
          <div className="text-right space-y-1">
             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Score</p>
             <p className="text-sm font-bold text-emerald-600">{score}</p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
          <div 
            className="bg-emerald-500 h-full transition-all duration-700 ease-out" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* MAIN CARD */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center space-y-2 mb-10">
            <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
              <span className="text-[10px] font-black uppercase tracking-tighter text-amber-600">
                {current.tense.label}
              </span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 capitalize tracking-tight">
              {current.verb.infinitive}
            </h2>
            <p className="text-slate-400 text-lg italic">"{current.verb.english_infinitive}"</p>
          </div>

          <form onSubmit={handleCheck} className="space-y-6">
            {/* INPUT CONTAINER WITH FIXED OVERLAP FIX */}
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
                className={`w-full bg-transparent pl-32 sm:pl-36 text-2xl font-bold outline-none transition-colors ${
                  feedback === 'correct' ? 'text-emerald-600' : 
                  feedback === 'wrong' ? 'text-red-600' : 'text-slate-900'
                }`}
              />
            </div>

            {feedback === null ? (
              <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all shadow-lg hover:-translate-y-1 active:translate-y-0">
                Check Answer
              </button>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                {feedback === 'wrong' && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center">
                    <p className="text-red-400 text-xs font-bold uppercase mb-1">Correct Answer:</p>
                    <p className="text-red-600 text-2xl font-black">{current.correctAnswer}</p>
                  </div>
                )}
                {feedback === 'correct' && (
                   <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                    <p className="text-emerald-600 text-xl font-black">Bem feito! ✨</p>
                  </div>
                )}
                <button 
                  type="button"
                  onClick={nextQuestion} 
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-lg"
                >
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