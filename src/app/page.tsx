"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/shared/Navigation";
import { DailyQuote } from "@/components/home/DailyQuote";
import { DailyQuestion } from "@/components/home/DailyQuestion";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { Heart, Flame, Calendar, Camera } from "lucide-react";

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
    <div className="min-h-screen bg-background pb-24">
      <Navigation />
      
      <div className="flex flex-col px-6 pt-24 space-y-8">
        {/* Hero Section */}
        <section className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full p-1.5 bg-gradient-to-tr from-primary via-accent to-rose-400 shadow-[0_0_30px_rgba(204,51,153,0.4)]">
              <div className="w-full h-full rounded-full border-4 border-background overflow-hidden relative bg-muted flex items-center justify-center">
                {userData?.profileImageUrl ? (
                  <img src={userData.profileImageUrl} alt="My Love" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-rose-200/30" size={48} />
                )}
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-full shadow-lg z-20 cursor-pointer"
              onClick={() => router.push('/gallery')}
            >
              <Heart size={24} fill="currentColor" />
            </motion.div>
          </motion.div>

          <div className="mt-6 text-center">
            <h1 className="text-2xl font-headline font-bold text-white">
              Hello, {user}
            </h1>
            <p className="text-rose-300/60 text-sm mt-1 flex items-center justify-center gap-2">
              Connected with {partner} <Heart size={12} fill="currentColor" className="text-rose-500" />
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="glass p-4 rounded-3xl flex flex-col items-center justify-center gap-2 border-white/5"
          >
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
              <Flame size={20} />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{streakData?.currentStreak || 1}</p>
              <p className="text-[10px] uppercase tracking-tighter text-rose-300/40 font-bold">Days of Love</p>
            </div>
          </motion.div>

          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/points')}
            className="glass p-4 rounded-3xl flex flex-col items-center justify-center gap-2 border-white/5"
          >
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
              <Calendar size={20} />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{userData?.points || 0}</p>
              <p className="text-[10px] uppercase tracking-tighter text-rose-300/40 font-bold">Heart Points</p>
            </div>
          </motion.div>
        </div>

        {/* AI Content Sections */}
        <section className="space-y-6">
          <DailyQuote />
          <DailyQuestion />
        </section>

        {/* Footer Note */}
        <footer className="pt-8 pb-4 text-center">
          <p className="text-rose-300/20 font-serif italic text-sm">
            Our private digital sanctuary
          </p>
        </footer>
      </div>
    </div>
  );
}
