"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { generateDailyRomanticQuote, type GenerateDailyRomanticQuoteOutput } from "@/ai/flows/generate-daily-romantic-quote";

export function DailyQuote() {
  const [data, setData] = useState<GenerateDailyRomanticQuoteOutput | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const result = await generateDailyRomanticQuote({});
        setData(result);
      } catch (err) {
        console.error("Quote fetch error:", err);
      }
    };
    fetchQuote();
  }, []);

  if (!data) return <div className="h-24 animate-pulse bg-muted/20 rounded-2xl" />;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-6 rounded-3xl relative overflow-hidden"
    >
      <div className="absolute top-2 left-2 opacity-5">
        <Quote className="w-12 h-12 text-primary" fill="currentColor" />
      </div>
      <p className="text-xl font-headline text-center italic leading-relaxed text-foreground/90">
        "{data.quote}"
      </p>
      <p className="text-right text-sm text-primary/70 mt-4 font-medium">— {data.author || "Unknown"}</p>
    </motion.div>
  );
}
