
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/shared/Navigation";
import { DailyQuote } from "@/components/home/DailyQuote";
import { DailyQuestion } from "@/components/home/DailyQuestion";
import { FloatingHearts } from "@/components/shared/FloatingHearts";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { Heart, Flame, Trophy, Sparkles, Camera, ArrowRight, BookHeart, Image as ImageIcon } from "lucide-react";

export default function HomePage() {
  const { user, loading, partner } = useSoulAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [streakData, setStreakData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // Listen to user profile
      const unsubUser = onSnapshot(doc(db, "userProfiles", user), (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
      });

      // Listen to streak
      const unsubStreak = onSnapshot(doc(db, "appMetadata", "appActivityStreak"), (doc) => {
        if (doc.exists()) {
          setStreakData(doc.data());
        } else {
          // Initialize streak if it doesn't exist
          setDoc(doc(db, "appMetadata", "appActivityStreak"), {
            id: "appActivityStreak",
            currentStreak: 1,
            longestStreak: 1,
            lastActivityDate: new Date().toISOString().split('T')[0],
            updatedAt: serverTimestamp()
          });
        }
      });

      return () => {
        unsubUser();
        unsubStreak();
      };
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <FloatingHearts />
      <Navigation />
      
      <div className="relative z-10 flex flex-col px-6 pt-24 space-y-8 max-w-2xl mx-auto">
        {/* Welcome Header */}
        <header className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2"
          >
            <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-accent text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12} /> Our Private Sanctuary
            </span>
          </motion.div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tight">
            Hi, {user}
          </h1>
          <p className="text-rose-300/60 text-sm mt-2 flex items-center justify-center gap-2 font-medium">
            Connected with <span className="text-rose-400 font-bold">{partner}</span> <Heart size={14} fill="currentColor" className="text-rose-500 animate-pulse" />
          </p>
        </header>

        {/* Hero Heart / Profile Section */}
        <section className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            {/* Pulsing Outer Ring */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl"
            />
            
            <div className="w-52 h-52 md:w-64 md:h-64 rounded-full p-2 bg-gradient-to-tr from-primary via-accent to-rose-400 shadow-[0_0_50px_rgba(204,51,153,0.3)] relative z-10">
              <div className="w-full h-full rounded-full border-4 border-background overflow-hidden relative bg-muted flex items-center justify-center">
                {userData?.profileImageUrl ? (
                  <img src={userData.profileImageUrl} alt="My Love" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-rose-200/20" size={64} />
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('/gallery')}
              className="absolute -bottom-2 -right-2 bg-white text-primary p-4 rounded-full shadow-2xl z-20 hover:bg-rose-50 transition-colors"
            >
              <Heart size={28} fill="currentColor" />
            </motion.button>
          </motion.div>
        </section>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="glass p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Flame size={40} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-1">
              <Flame size={24} />
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">{streakData?.currentStreak || 1}</p>
              <p className="text-[10px] uppercase tracking-widest text-rose-300/40 font-bold">Days in Love</p>
            </div>
          </motion.div>

          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/points')}
            className="glass p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 border-white/5 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy size={40} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-1">
              <Trophy size={24} />
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">{userData?.points || 0}</p>
              <p className="text-[10px] uppercase tracking-widest text-rose-300/40 font-bold">Heart Points</p>
            </div>
          </motion.div>
        </div>

        {/* AI Inspiration Sections */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest">Daily Connection</h3>
            <div className="h-px flex-1 bg-white/5 mx-4" />
          </div>
          <DailyQuote />
          <DailyQuestion />
        </section>

        {/* Quick Access Menu */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { icon: ImageIcon, label: "Gallery", path: "/gallery", color: "text-blue-400" },
            { icon: BookHeart, label: "Diary", path: "/diary", color: "text-rose-400" },
            { icon: Trophy, label: "Tasks", path: "/tasks", color: "text-amber-400" },
          ].map((item, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(item.path)}
              className="glass p-4 rounded-3xl flex flex-col items-center gap-2 border-white/5 hover:bg-white/5 transition-colors"
            >
              <item.icon size={20} className={item.color} />
              <span className="text-[10px] font-bold text-white/40 uppercase">{item.label}</span>
            </motion.button>
          ))}
        </section>

        {/* Footer Note */}
        <footer className="pt-8 pb-12 text-center">
          <motion.p 
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="text-rose-300/20 font-serif italic text-sm"
          >
            Crafted with love for Snow & Shikhar
          </motion.p>
        </footer>
      </div>
    </div>
  );
}
