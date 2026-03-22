
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { ChevronLeft, Coins, Trophy, Sparkles } from "lucide-react";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { useRouter } from "next/navigation";

export default function PointsPage() {
  const { user } = useSoulAuth();
  const router = useRouter();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (!user) return;
    const profiles = JSON.parse(localStorage.getItem("soul-profiles") || "{}");
    setPoints(profiles[user]?.points || 0);
  }, [user]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col text-white relative overflow-hidden">
      <Navigation />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="pt-20 px-6 pb-24 flex-1 overflow-y-auto z-10 max-w-2xl mx-auto w-full"
      >
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/tasks')} 
            className="p-3 glass rounded-2xl text-rose-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-headline font-bold">Heart Balance</h1>
            <p className="text-rose-300/40 text-[10px] font-bold uppercase tracking-widest">Our Shared Economy</p>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden mb-12"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={120} />
          </div>
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-primary/20 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <Coins size={32} />
            </div>
            <p className="text-rose-300/40 font-bold mb-2 text-xs tracking-[0.2em] uppercase">Available Points</p>
            <h2 className="text-7xl font-black tracking-tighter mb-2 text-white drop-shadow-2xl">
              {points}
            </h2>
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-rose-300/60 text-[10px] font-bold uppercase tracking-widest">
              Keep the love flowing
            </div>
          </div>
        </motion.div>

        <section className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white/40 text-xs uppercase tracking-[0.2em]">Summary</h3>
            <div className="h-px flex-1 bg-white/5 ml-6" />
          </div>
          
          <div className="text-center py-20 glass rounded-[2.5rem] border-dashed border-white/5 flex flex-col items-center gap-4">
            <Trophy size={48} className="text-white/5" />
            <div className="space-y-1">
               <p className="text-white/40 font-bold text-sm">All points are local</p>
               <p className="text-white/20 text-xs italic">Earn more by completing tasks for your partner</p>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
