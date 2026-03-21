
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { ChevronLeft, Coins, Trophy, Plus, ArrowRightLeft } from "lucide-react";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";

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

    // Subscribing to transactions if they exist in the schema
    const q = query(
      collection(db, "userProfiles", user, "pointTransactions"),
      orderBy("timestamp", "desc")
    );
    
    const unsubTransactions = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn("Transactions listener error (expected if collection is empty):", error);
    });

    return () => {
      unsubPoints();
      unsubTransactions();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Explicit Back Button in Header */}
      <div className="bg-white p-4 sticky top-0 border-b border-rose-100 flex items-center gap-3 z-10 shadow-sm">
        <button 
          onClick={() => router.push('/tasks')} 
          className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
          aria-label="Go back to tasks"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-lg text-slate-800">Points History</span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-white shadow-xl shadow-orange-200 mb-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-yellow-100 font-medium mb-1 text-sm tracking-wide uppercase">Current Balance</p>
            <h1 className="text-6xl font-bold tracking-tight">{points}</h1>
            <span className="text-lg opacity-80 font-medium">Total Points</span>
          </div>
          <Coins className="absolute -right-6 -bottom-6 w-48 h-48 opacity-20 rotate-12" />
        </motion.div>

        <h3 className="font-bold text-slate-800 mb-4 px-1">Recent Activity</h3>
        
        <div className="space-y-3 pb-8">
          {transactions.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full shrink-0 ${t.amount >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {t.amount >= 0 ? <Plus size={18} /> : <ArrowRightLeft size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-700 text-sm truncate pr-2">{t.description || t.type}</p>
                  <p className="text-xs text-slate-400">
                    {t.timestamp?.toDate ? t.timestamp.toDate().toLocaleDateString() : (t.timestamp || "Recently")}
                  </p>
                </div>
              </div>
              <span className={`font-bold text-lg whitespace-nowrap ${t.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {t.amount >= 0 ? '+' : ''}{t.amount}
              </span>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center gap-3">
              <Trophy size={48} className="text-slate-100" />
              <p className="text-slate-400 font-medium">No activity yet. Start earning points!</p>
              <button 
                onClick={() => router.push('/tasks')}
                className="text-rose-500 font-bold text-sm hover:underline"
              >
                View Tasks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
