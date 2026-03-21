"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/shared/BottomNav";
import { Heart, Star, TrendingUp, History, Trophy } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, orderBy } from "firebase/firestore";
import { useSoulAuth } from "@/hooks/use-soul-auth";

export default function PointsPage() {
  const { user, partner } = useSoulAuth();
  const [balance, setBalance] = useState(0);
  const [partnerBalance, setPartnerBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubUser = onSnapshot(doc(db, "users", user), (doc) => setBalance(doc.data()?.points || 0));
    const unsubPartner = onSnapshot(doc(db, "users", partner), (doc) => setPartnerBalance(doc.data()?.points || 0));
    
    const hQuery = query(collection(db, "transactions"), where("user", "in", [user, partner]), orderBy("timestamp", "desc"));
    const unsubHistory = onSnapshot(hQuery, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUser();
      unsubPartner();
      unsubHistory();
    };
  }, [user, partner]);

  return (
    <div className="min-h-screen pb-32 p-6 bg-background space-y-8">
      <div className="pt-4 text-center space-y-2">
        <h1 className="text-4xl font-headline text-primary font-bold">Love Bank</h1>
        <p className="text-muted-foreground italic">Our investment in each other</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass p-6 rounded-3xl text-center space-y-2 border-primary/20 rose-glow"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Star className="text-primary w-5 h-5 fill-primary" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Points</span>
          <p className="text-4xl font-headline text-white font-bold">{balance}</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass p-6 rounded-3xl text-center space-y-2 border-accent/20 accent-glow"
        >
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Star className="text-accent w-5 h-5 fill-accent" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{partner}'s Points</span>
          <p className="text-4xl font-headline text-white font-bold">{partnerBalance}</p>
        </motion.div>
      </div>

      <div className="glass p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Love Ledger</h3>
        </div>
        <div className="space-y-4">
          {history.length > 0 ? history.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.user === user ? 'bg-primary/20' : 'bg-accent/20'}`}>
                    <Trophy className={`w-4 h-4 ${tx.user === user ? 'text-primary' : 'text-accent'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.user === user ? 'I' : partner} earned a reward</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{tx.timestamp?.toDate().toLocaleDateString()}</p>
                  </div>
               </div>
               <span className={`font-bold ${tx.user === user ? 'text-primary' : 'text-accent'}`}>+{tx.amount}</span>
            </div>
          )) : (
            <p className="text-center text-muted-foreground italic py-4">No transactions yet. Challenge each other!</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
