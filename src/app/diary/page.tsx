"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/shared/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { Send, Plus, Smile, Heart, Coffee, Moon, Sun } from "lucide-react";

const moods = [
  { icon: Heart, label: "Loved", color: "text-red-400" },
  { icon: Smile, label: "Happy", color: "text-yellow-400" },
  { icon: Coffee, label: "Cozy", color: "text-orange-400" },
  { icon: Moon, label: "Peaceful", color: "text-indigo-400" },
  { icon: Sun, label: "Radiant", color: "text-amber-400" },
];

export default function DiaryPage() {
  const { user } = useSoulAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState(moods[0]);
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "diary"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const saveEntry = async () => {
    if (!newEntry.trim() || !user) return;
    await addDoc(collection(db, "diary"), {
      text: newEntry,
      author: user,
      mood: selectedMood.label,
      timestamp: serverTimestamp(),
    });
    setNewEntry("");
    setIsWriting(false);
  };

  return (
    <div className="min-h-screen pb-32 p-6 bg-background space-y-8">
      <div className="pt-4 text-center space-y-2">
        <h1 className="text-4xl font-headline text-primary font-bold">Our Shared Diary</h1>
        <p className="text-muted-foreground italic">Words only for us to read</p>
      </div>

      <AnimatePresence>
        {isWriting ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass p-6 rounded-3xl space-y-4 shadow-2xl rose-glow border-primary/20"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold uppercase tracking-widest text-primary">How are you feeling?</span>
              <div className="flex gap-2">
                {moods.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setSelectedMood(m)}
                    className={`p-1.5 rounded-lg transition-all ${selectedMood.label === m.label ? 'bg-primary/20 scale-110' : 'opacity-40'}`}
                  >
                    <m.icon className={`w-5 h-5 ${m.color}`} />
                  </button>
                ))}
              </div>
            </div>
            <Textarea 
              placeholder="What's on your heart?"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              className="min-h-[150px] bg-transparent border-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/40 leading-relaxed"
            />
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setIsWriting(false)} variant="ghost" className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={saveEntry} className="flex-1 bg-primary hover:bg-primary/90 rounded-xl shadow-lg">
                <Send className="w-4 h-4 mr-2" /> Whisper
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button 
            onClick={() => setIsWriting(true)}
            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-headline shadow-xl border-t border-white/10"
          >
            <Plus className="mr-2" /> Write a new entry
          </Button>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {entries.map((entry) => (
          <motion.div 
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`glass p-6 rounded-[2rem] relative overflow-hidden group border-l-4 ${entry.author === user ? 'border-primary' : 'border-accent'}`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Heart className="w-16 h-16 text-primary" fill="currentColor" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h4 className={`text-sm font-bold uppercase tracking-widest ${entry.author === user ? 'text-primary' : 'text-accent'}`}>
                  {entry.author}
                </h4>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">
                  {entry.timestamp?.toDate().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="glass px-2 py-1 rounded-full text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                 Mood: {entry.mood || "None"}
              </div>
            </div>
            <p className="text-lg leading-relaxed text-foreground/90 font-serif">
              {entry.text}
            </p>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
