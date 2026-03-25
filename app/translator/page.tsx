"use client";

import { useState, useEffect, useCallback } from "react";
import { translateText } from "@/app/actions/translate";

export default function TranslatorPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState<"en-to-pt" | "pt-to-en">("en-to-pt");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- AUDIO LOGIC ---
  const speakPortuguese = useCallback((text: string) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-PT"; 
    
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang === "pt-PT" || v.lang === "pt_PT");
    if (ptVoice) utterance.voice = ptVoice;
    
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inputText.trim().length > 2) {
        setIsTranslating(true);
        try {
          const result = await translateText(inputText, mode);
          setOutputText(result);
        } catch (error) {
          console.error("Translation error:", error);
        } finally {
          setIsTranslating(false);
        }
      } else {
        setOutputText("");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [inputText, mode]);

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swapLanguages = () => {
    setMode(prev => prev === "en-to-pt" ? "pt-to-en" : "en-to-pt");
    if (outputText) setInputText(outputText);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        
        {/* HEADER SECTION - Simplified (Back button removed) */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">AI Translator</h1>
          <p className="text-gray-500 font-medium">European Portuguese (PT-PT) Specialist</p>
        </div>

        {/* Language Switcher */}
        <div className="mb-10 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'en-to-pt' ? 'bg-purple-50 text-purple-600' : 'text-gray-300'}`}>
              English
            </div>
            <button 
              onClick={swapLanguages}
              className="p-3 bg-gray-50 rounded-full hover:bg-purple-600 hover:text-white transition-all duration-300 text-sm"
            >
              🔄
            </button>
            <div className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'pt-to-en' ? 'bg-purple-50 text-purple-600' : 'text-gray-300'}`}>
              Português
            </div>
          </div>
        </div>

        {/* Translation Area */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="group relative">
            <textarea
              placeholder={mode === "en-to-pt" ? "Type English..." : "Escreva em Português..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-80 rounded-[2.5rem] border-2 border-transparent bg-white p-8 text-2xl font-bold outline-none shadow-xl focus:border-purple-100 transition-all resize-none placeholder:text-gray-200 text-black"
            />
            {mode === "pt-to-en" && inputText && (
              <button 
                onClick={() => speakPortuguese(inputText)}
                className="absolute top-6 right-6 text-2xl p-2 bg-gray-50 rounded-xl hover:scale-110 transition-all opacity-60 hover:opacity-100"
              >
                🔊
              </button>
            )}
          </div>

          <div className="relative">
            <div className={`w-full h-80 rounded-[2.5rem] border border-gray-100 p-8 text-2xl font-bold shadow-xl transition-all flex flex-col justify-between ${isTranslating ? 'bg-purple-50/30 text-purple-300' : 'bg-white text-gray-900'}`}>
              <div className="overflow-y-auto">
                {outputText || (isTranslating ? "Translating..." : "...")}
              </div>
              
              <div className="flex justify-between items-center pt-4">
                {(mode === "en-to-pt" && outputText && !isTranslating) ? (
                  <button 
                    onClick={() => speakPortuguese(outputText)}
                    className="text-2xl p-2 bg-purple-50 rounded-xl hover:scale-110 transition-all"
                  >
                    🔊
                  </button>
                ) : <div />}

                {outputText && !isTranslating && (
                  <button 
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-all"
                  >
                    {copied ? "Copied! ✅" : "Copy Translation"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}