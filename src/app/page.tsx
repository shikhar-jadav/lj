
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/shared/Navigation";
import { Heart, Trophy, Sparkles, Camera, BookHeart, Image as ImageIcon } from "lucide-react";

export default function HomePage() {
  const { user, loading, partner } = useSoulAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const profiles = JSON.parse(localStorage.getItem("soul-profiles") || "{}");
      setUserData(profiles[user] || null);
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden pb-24">
      <Navigation />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex flex-col px-6 pt-24 space-y-12 max-w-2xl mx-auto"
      >
        <header className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-accent text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12} /> Our Private Sanctuary
            </span>
          </motion.div>
          <h1 className="text-5xl font-headline font-bold text-white tracking-tight">
            Hi, {user}
          </h1>
          <p className="text-rose-300/60 text-base mt-3 flex items-center justify-center gap-2 font-medium">
            Connected with <span className="text-rose-400 font-bold">{partner}</span> <Heart size={16} fill="currentColor" className="text-rose-500 animate-pulse" />
          </p>
        </header>

        <section className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative"
          >
            <motion.div 
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -inset-6 bg-primary/20 rounded-full blur-3xl"
            />
            
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full p-2 bg-gradient-to-tr from-primary via-accent to-rose-400 shadow-[0_0_60px_rgba(204,51,153,0.3)] relative z-10">
              <div className="w-full h-full rounded-full border-4 border-[#1d161b] overflow-hidden relative bg-muted flex items-center justify-center">
                {userData?.profileImageUrl ? (
                  <img src={userData.profileImageUrl} alt="My Love" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-rose-200/20" size={80} />
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('/gallery')}
              className="absolute -bottom-4 -right-4 bg-white text-primary p-5 rounded-full shadow-2xl z-20 hover:bg-rose-50 transition-colors"
            >
              <Heart size={32} fill="currentColor" />
            </motion.button>
          </motion.div>
        </section>

        <section className="grid grid-cols-3 gap-4 md:gap-6 pt-4">
          {[
            { icon: ImageIcon, label: "Gallery", path: "/gallery", color: "text-blue-400" },
            { icon: BookHeart, label: "Diary", path: "/diary", color: "text-rose-400" },
            { icon: Trophy, label: "Tasks", path: "/tasks", color: "text-amber-400" },
          ].map((item, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(item.path)}
              className="glass p-5 md:p-6 rounded-[2rem] flex flex-col items-center gap-3 border-white/5 hover:bg-white/10 transition-all group shadow-xl"
            >
              <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                <item.icon size={24} className={item.color} />
              </div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.label}</span>
            </motion.button>
          ))}
        </section>

        <footer className="pt-8 pb-12 text-center">
          <motion.p 
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="text-rose-300/20 font-serif italic text-sm"
          >
            Crafted with love for Snow & Shikhar
          </motion.p>
        </footer>
      </motion.div>
    </div>
  );
}
