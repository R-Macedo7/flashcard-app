"use client";

import { useRef } from "react";
import * as pdfjs from "pdfjs-dist";

// CRITICAL FIX: The version here (5.5.207) MUST match your package.json version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs`;

interface PdfUploaderProps {
  onTextExtracted: (text: string) => void;
  loading: boolean;
}

export function PdfUploader({ onTextExtracted, loading }: PdfUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
        const loadingTask = pdfjs.getDocument({ data: typedArray });
        const pdf = await loadingTask.promise;
        
        let fullText = "";
        const maxPages = Math.min(pdf.numPages, 10); 
        
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          fullText += strings.join(" ") + "\n";
        }

        onTextExtracted(fullText);
      } catch (error) {
        console.error("PDF Parsing Error:", error);
        alert("Could not read PDF. Ensure it's not a password-protected or image-only scan.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="rounded-[2.5rem] bg-white p-12 shadow-xl border-2 border-dashed border-purple-100 text-center hover:border-purple-300 transition-all">
      <div className="mb-6 text-5xl">📄</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Lesson PDF</h2>
      <p className="mb-8 text-gray-500">Extracting text locally in your browser...</p>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className={`w-full rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
          loading ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        {loading ? "AI is thinking..." : "Select PDF File"}
      </button>
    </div>
  );
}