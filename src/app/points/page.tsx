
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
      setPoints(doc.data()?.points || 0);
    });

    // In a real app we'd have a subcollection of transactions
    // For now we'll mock or just show points as we don't have a transaction collection defined in backend.json yet
    return () => unsubPoints();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white p-4 sticky top-0 border-b border-rose-100 flex items-center gap-3 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-lg">Points History</span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-white shadow-xl shadow-orange-200 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-yellow-100 font-medium mb-1 text-sm tracking-wide uppercase">Current Balance</p>
            <h1 className="text-6xl font-bold tracking-tight">{points}</h1>
            <span className="text-lg opacity-80 font-medium">Total Points</span>
          </div>
          <Coins className="absolute -right-6 -bottom-6 w-48 h-48 opacity-20 rotate-12" />
        </div>

        <h3 className="font-bold text-slate-800 mb-4 px-1">Recent Activity</h3>
        <div className="space-y-3 pb-8 text-center text-slate-400 py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          No history yet. Start earning points!
        </div>
      </div>
    </div>
  );
}
