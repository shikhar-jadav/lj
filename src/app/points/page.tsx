"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { ChevronLeft, Coins, Trophy, Plus, ArrowRightLeft, Sparkles } from "lucide-react";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection } from "firebase/firestore";

export default function PointsPage() {
  const { user } = useSoulAuth();
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const unsubPoints = onSnapshot(doc(db, "userProfiles", user), (doc) => {
      if (doc.exists()) {
        setPoints(doc.data()?.points || 0);
      }
    });

    const transactionsRef = collection(db, "userProfiles", user, "pointTransactions");
    const unsubTransactions = onSnapshot(transactionsRef, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      txs.sort((a: any, b: any) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });

      setTransactions(txs);
    });

    return () => {
      unsubPoints();
      unsubTransactions();
    };
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
            <h3 className="font-bold text-white/40 text-xs uppercase tracking-[0.2em]">Recent Activity</h3>
            <div className="h-px flex-1 bg-white/5 ml-6" />
          </div>
          
          <div className="space-y-4">
            {transactions.map((t, idx) => (
              <motion.div 
                key={t.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="glass p-5 rounded-3xl border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${t.amount >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {t.amount >= 0 ? <Plus size={20} /> : <ArrowRightLeft size={20} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{t.description || t.type}</p>
                    <p className="text-[10px] text-rose-300/30 uppercase font-bold tracking-widest mt-0.5">
                      {t.timestamp?.toDate ? t.timestamp.toDate().toLocaleDateString() : (t.timestamp ? "Just now" : "Processing...")}
                    </p>
                  </div>
                </div>
                <div className={`font-black text-xl ${t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.amount >= 0 ? '+' : ''}{t.amount}
                </div>
              </motion.div>
            ))}

            {transactions.length === 0 && (
              <div className="text-center py-20 glass rounded-[2.5rem] border-dashed border-white/5 flex flex-col items-center gap-4">
                <Trophy size={48} className="text-white/5" />
                <div className="space-y-1">
                   <p className="text-white/40 font-bold text-sm">No activity recorded yet</p>
                   <p className="text-white/20 text-xs italic">Start tasks to earn heart points</p>
                </div>
                <button 
                  onClick={() => router.push('/tasks')}
                  className="mt-2 text-primary font-bold text-xs uppercase tracking-widest hover:text-accent transition-colors"
                >
                  View Tasks
                </button>
              </div>
            )}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
