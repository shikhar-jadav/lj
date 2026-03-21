"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircleHeart, Sparkles } from "lucide-react";
import { generateDailyRomanticQuestion, type GenerateDailyRomanticQuestionOutput } from "@/ai/flows/generate-daily-romantic-question";

export function DailyQuestion() {
  const [data, setData] = useState<GenerateDailyRomanticQuestionOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const result = await generateDailyRomanticQuestion();
        setData(result);
      } catch (err) {
        console.error("Question fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, []);

  if (loading) return (
    <div className="h-32 animate-pulse bg-white/5 rounded-2xl flex items-center justify-center">
      <Sparkles className="text-rose-300 animate-spin" />
    </div>
  );

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 rounded-3xl border-rose-100/20 relative overflow-hidden group"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400">
          <MessageCircleHeart size={20} />
        </div>
        <h3 className="font-headline text-rose-200 text-lg">Today's Question</h3>
      </div>
      
      <p className="text-lg text-white/90 font-serif leading-relaxed italic">
        "{data.question}"
      </p>
      
      <div className="mt-4 flex justify-end">
        <span className="text-[10px] uppercase tracking-widest text-rose-400 font-bold opacity-50 group-hover:opacity-100 transition-opacity">
          Tap to discuss with your love
        </span>
      </div>
    </motion.div>
  );
}
