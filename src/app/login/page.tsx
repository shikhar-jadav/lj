
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { useRouter } from "next/navigation";

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
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-rose-100 via-pink-100 to-red-50"
    >
      <motion.div 
        className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-white/60"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        <div className="text-center mb-8">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block text-6xl mb-4"
          >
            ❤️
          </motion.div>
          <h1 className="text-2xl font-bold text-rose-800 font-serif">Welcome Love</h1>
          <p className="text-rose-600/70 text-sm mt-2">Enter our secret name</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hint: s..."
            className="w-full px-6 py-4 rounded-xl bg-white border-2 border-rose-100 focus:border-rose-400 outline-none text-rose-900 placeholder-rose-300 transition-all text-center text-lg min-h-[56px]"
          />
          
          <button 
            type="submit"
            className="w-full px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:shadow-pink-300/50 active:scale-95 touch-manipulation min-h-[44px]"
          >
            Unlock My Heart
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: [0, -10, 10, -5, 5, 0] }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-center mt-4 font-medium"
            >
              Wrong name 😢 try again
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
