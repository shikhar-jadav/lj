
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { useRouter } from "next/navigation";
import { FloatingHearts } from "@/components/shared/FloatingHearts";
import { Sparkles, Heart } from "lucide-react";

export default function LoginPage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const { login } = useSoulAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(input);
    
    if (success) {
      router.push("/camera");
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <FloatingHearts />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 md:p-12 rounded-[3rem] shadow-2xl w-full max-w-md border-white/10 relative z-10 text-center"
      >
        <div className="mb-8">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border border-primary/20 text-rose-400 mb-6 shadow-[0_0_30px_rgba(204,51,153,0.3)]"
          >
            <Heart size={48} fill="currentColor" />
          </motion.div>
          
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2">
              <Sparkles size={12} /> Private Sanctuary
            </span>
            <h1 className="text-4xl font-headline font-bold text-white tracking-tight">Welcome Love</h1>
            <p className="text-rose-300/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Enter our secret name</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hint: s..."
              className="w-full px-8 py-5 rounded-[2rem] glass border-white/5 focus:border-primary focus:bg-white/5 outline-none text-white placeholder-white/10 transition-all text-center text-xl font-medium tracking-wide shadow-inner"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full px-8 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(204,51,153,0.3)] bg-gradient-to-r from-primary to-accent text-white hover:scale-[1.02] active:scale-95 touch-manipulation text-sm"
          >
            Unlock My Heart
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, x: [0, -5, 5, -5, 5, 0] }}
              exit={{ opacity: 0 }}
              className="text-rose-400 text-xs mt-6 font-bold uppercase tracking-widest italic"
            >
              Wrong name 😢 Try again
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-rose-300/20 font-serif italic text-xs">
            A beautiful, private digital world for two.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
