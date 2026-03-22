
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { BookHeart, PenLine, Save, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useSoulAuth } from "@/hooks/use-soul-auth";

interface DiaryEntry {
  id: string;
  text: string;
  author: string;
  date: string;
  isEditor?: boolean;
}

export default function DiaryPage() {
  const { user } = useSoulAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [newText, setNewText] = useState("");
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("soul-diary") || "[]");
    setEntries(stored);
    const totalSheets = Math.ceil((stored.length + 1) / 2);
    setCurrentSheetIndex(Math.max(0, totalSheets - 1));

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSave = async () => {
    if (!newText.trim() || !user) return;
    setIsSaving(true);
    
    const newEntry: DiaryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      text: newText,
      author: user,
      date: new Date().toLocaleDateString()
    };

    const updated = [...entries, newEntry];
    localStorage.setItem("soul-diary", JSON.stringify(updated));
    setEntries(updated);
    setNewText("");
    setIsSaving(false);
  };

  const contentList: DiaryEntry[] = [
    ...entries, 
    { id: 'editor', isEditor: true, text: '', author: '', date: '' }
  ];

  const sheets = [];
  for (let i = 0; i < contentList.length; i += 2) {
    sheets.push({
      front: contentList[i],
      back: contentList[i + 1] || null 
    });
  }

  const isMobile = windowWidth < 768;
  const bookHeight = isMobile ? 500 : 550;

  const renderPage = (content: DiaryEntry) => {
    if (content.isEditor) {
      return (
        <div className="flex flex-col h-full">
          <h3 className="text-xl font-serif text-rose-800/60 mb-2 flex items-center gap-2">
            <PenLine size={18} /> Dear Diary...
          </h3>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1 w-full bg-transparent resize-none outline-none text-rose-900 placeholder-rose-300/50 leading-loose font-serif text-lg p-1"
            placeholder="Write something beautiful..."
          />
          <div className="flex justify-between items-end mt-2">
              <span className="font-handwriting text-rose-400 text-lg">~ {user}</span>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-rose-500 text-white px-3 py-1.5 rounded-xl text-sm shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Sign & Save"} <Save size={14} />
              </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col h-full">
          <div className="text-right text-xs text-rose-400 font-serif mb-2 flex justify-end gap-2 items-center">
             {content.date} <Heart size={10} className="fill-rose-300 text-rose-300"/>
          </div>
          <p className="flex-1 font-serif text-rose-900 text-lg leading-loose whitespace-pre-wrap overflow-y-auto pr-1">
            {content.text}
          </p>
          <div className="mt-2 text-right">
            <span className="font-handwriting text-rose-500 text-xl italic">~ {content.author}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-20 relative overflow-hidden">
      <Navigation />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center min-h-[85vh] w-full px-6 relative z-10"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-headline text-white mb-2 flex items-center gap-3 font-bold"
        >
          Our Diary <BookHeart className="w-8 h-8 text-primary" />
        </motion.h2>
        <p className="text-rose-300/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-12">Whispers of our journey</p>

        <div 
          className="relative flex justify-center items-center"
          style={{ 
            width: '100%',
            height: `${bookHeight * (isMobile ? 0.8 : 1)}px`, 
            perspective: '2000px' 
          }}
        >
          <div className="relative w-[700px] h-[500px] scale-[0.5] sm:scale-[0.7] md:scale-100 lg:scale-110">
            <button 
              onClick={() => setCurrentSheetIndex(p => Math.max(0, p - 1))} 
              className="absolute -left-16 top-1/2 -translate-y-1/2 z-50 p-4 glass rounded-2xl shadow-2xl text-rose-400 disabled:opacity-10 transition-all hover:text-white"
              disabled={currentSheetIndex === 0}
            >
              <ChevronLeft size={32} />
            </button>
            
            <button 
              onClick={() => setCurrentSheetIndex(p => Math.min(sheets.length, p + 1))} 
              className="absolute -right-16 top-1/2 -translate-y-1/2 z-50 p-4 glass rounded-2xl shadow-2xl text-rose-400 disabled:opacity-10 transition-all hover:text-white"
              disabled={currentSheetIndex >= sheets.length}
            >
              <ChevronRight size={32} />
            </button>

            <div className="relative w-full h-full flex justify-center group">
               <div className="absolute inset-0 bg-rose-950 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] transform scale-x-[1.03] scale-y-[1.04] border border-white/5" />
               <div className="absolute inset-0 bg-[#fdfbf7] rounded-xl border-2 border-[#e3dccb] flex overflow-hidden shadow-inner">
                  <div className="w-1/2 h-full border-r border-black/10 bg-gradient-to-r from-transparent to-black/5" />
                  <div className="w-1/2 h-full border-l border-black/10 bg-gradient-to-l from-transparent to-black/5" />
               </div>

               <div className="relative w-full h-full" style={{ perspective: '2000px' }}>
                  {sheets.map((sheet, index) => {
                    const isFlipped = index < currentSheetIndex;
                    const zIndex = 20 + (isFlipped ? index : (sheets.length - index));

                    return (
                      <motion.div
                        key={index}
                        initial={false}
                        animate={{ rotateY: isFlipped ? -180 : 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        style={{ 
                          transformOrigin: 'left center',
                          transformStyle: 'preserve-3d',
                          zIndex: zIndex,
                          position: 'absolute',
                          top: 0, left: '50%', width: '50%', height: '100%'
                        }}
                      >
                        <div 
                          className="absolute inset-0 bg-[#fffbf0] rounded-r-xl shadow-2xl p-6 md:p-10 overflow-hidden border-l border-black/5"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          {renderPage(sheet.front)}
                          <div className="absolute bottom-6 right-8 text-[10px] font-bold text-rose-200 uppercase tracking-widest">Page {index * 2 + 1}</div>
                        </div>

                        <div 
                          className="absolute inset-0 bg-[#fffbf0] rounded-l-xl shadow-2xl p-6 md:p-10 overflow-hidden border-r border-black/5"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          {sheet.back && renderPage(sheet.back)}
                          <div className="absolute bottom-6 left-8 text-[10px] font-bold text-rose-200 uppercase tracking-widest">Page {index * 2 + 2}</div>
                        </div>
                      </motion.div>
                    );
                  })}
               </div>
               <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/5 z-50 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
