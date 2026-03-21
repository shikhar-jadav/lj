
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { BookHeart, PenLine, Save, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

interface DiaryEntry {
  id: string;
  text: string;
  author: string;
  date?: string;
  timestamp?: any;
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
    const q = query(collection(db, "diaryEntries"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiaryEntry));
      setEntries(docs);
      const totalSheets = Math.ceil((docs.length + 1) / 2);
      setCurrentSheetIndex(Math.max(0, totalSheets - 1));
    });

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      unsub();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSave = async () => {
    if (!newText.trim() || !user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "diaryEntries"), {
        text: newText,
        author: user,
        timestamp: serverTimestamp(),
      });
      setNewText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const contentList: DiaryEntry[] = [
    ...entries, 
    { id: 'editor', isEditor: true, text: '', author: '' }
  ];

  const sheets = [];
  for (let i = 0; i < contentList.length; i += 2) {
    sheets.push({
      front: contentList[i],
      back: contentList[i + 1] || null 
    });
  }

  const isMobile = windowWidth < 768;
  const bookScale = isMobile ? (windowWidth / 800) : 1;
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
                className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-sm shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50"
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
             {content.timestamp?.toDate().toLocaleDateString() || "Today"} <Heart size={10} className="fill-rose-300 text-rose-300"/>
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
    <div className="min-h-screen bg-slate-50 pt-16 overflow-hidden">
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-[85vh] w-full px-4">
        <h2 className="text-2xl font-serif text-rose-800 mb-8 flex items-center gap-2">
          Our Diary <BookHeart className="w-6 h-6" />
        </h2>

        <div 
          className="relative flex justify-center items-center transition-transform duration-300"
          style={{ 
            width: '100%',
            height: `${bookHeight * (isMobile ? 0.8 : 1)}px`, 
            perspective: '2000px' 
          }}
        >
          <div style={{ transform: `scale(${Math.max(0.5, Math.min(1, bookScale * 1.8))})` }} className="relative w-[700px] h-[500px]">
            <button 
              onClick={() => setCurrentSheetIndex(p => Math.max(0, p - 1))} 
              className="absolute -left-12 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/80 rounded-full shadow-lg text-rose-600 disabled:opacity-30"
              disabled={currentSheetIndex === 0}
            >
              <ChevronLeft />
            </button>
            
            <button 
              onClick={() => setCurrentSheetIndex(p => Math.min(sheets.length, p + 1))} 
              className="absolute -right-12 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/80 rounded-full shadow-lg text-rose-600 disabled:opacity-30"
              disabled={currentSheetIndex >= sheets.length}
            >
              <ChevronRight />
            </button>

            <div className="relative w-full h-full flex justify-center">
               <div className="absolute inset-0 bg-amber-900 rounded-lg shadow-2xl transform scale-x-[1.02] scale-y-[1.03]" />
               <div className="absolute inset-0 bg-[#fdfbf7] rounded-lg border-2 border-[#e3dccb] flex overflow-hidden">
                  <div className="w-1/2 h-full border-r border-black/5 bg-gradient-to-r from-transparent to-black/5" />
                  <div className="w-1/2 h-full border-l border-black/5 bg-gradient-to-l from-transparent to-black/5" />
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
                        transition={{ duration: 0.8 }}
                        style={{ 
                          transformOrigin: 'left center',
                          transformStyle: 'preserve-3d',
                          zIndex: zIndex,
                          position: 'absolute',
                          top: 0, left: '50%', width: '50%', height: '100%'
                        }}
                      >
                        <div 
                          className="absolute inset-0 bg-[#fffbf0] rounded-r-lg shadow-md p-8 overflow-hidden border-l border-rose-100"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          {renderPage(sheet.front)}
                          <div className="absolute bottom-4 right-6 text-xs text-rose-300">Page {index * 2 + 1}</div>
                        </div>

                        <div 
                          className="absolute inset-0 bg-[#fffbf0] rounded-l-lg shadow-md p-8 overflow-hidden border-r border-rose-100"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          {sheet.back && renderPage(sheet.back)}
                          <div className="absolute bottom-4 left-6 text-xs text-rose-300">Page {index * 2 + 2}</div>
                        </div>
                      </motion.div>
                    );
                  })}
               </div>
               <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/10 z-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
