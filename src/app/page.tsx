
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { useRouter } from "next/navigation";
import { FloatingHearts } from "@/components/shared/FloatingHearts";
import { BottomNav } from "@/components/shared/BottomNav";
import { DailyQuote } from "@/components/home/DailyQuote";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Image as ImageIcon } from "lucide-react";
import { generateDailyRomanticQuestion } from "@/ai/flows/generate-daily-romantic-question";

export default function HomePage() {
  const { user, partner, loading } = useSoulAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [dailyQuestion, setDailyQuestion] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      const unsubUser = onSnapshot(doc(db, "userProfiles", user), (doc) => setUserData(doc.data()));
      const unsubPartner = onSnapshot(doc(db, "userProfiles", partner), (doc) => setPartnerData(doc.data()));
      
      const fetchQuestion = async () => {
        try {
          const res = await generateDailyRomanticQuestion();
          setDailyQuestion(res.question);
        } catch (e) {
          console.error("AI Question Error:", e);
        }
      };
      fetchQuestion();

      return () => {
        unsubUser();
        unsubPartner();
      };
    }
  }, [user, partner]);

  if (loading || !user) return null;

  return (
    <div className="pb-32 min-h-screen relative">
      <FloatingHearts />
      
      <div className="p-6 space-y-8 relative z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-headline text-primary font-bold">Hello, {user}</h1>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-1 glass px-3 py-1 rounded-full text-xs text-accent-foreground bg-accent/20"
          >
            <Heart className="w-3 h-3 text-accent fill-accent" />
            <span className="font-bold">Happy Together</span>
          </motion.div>
        </div>

        <div className="flex justify-center items-center gap-6 py-4">
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-24 h-24 rounded-full border-4 border-primary p-1 rose-glow"
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={userData?.profileImageUrl} className="object-cover" />
                <AvatarFallback className="bg-muted text-primary">{user[0]}</AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 glass px-2 py-0.5 rounded-full text-[10px] font-bold">YOU</div>
          </div>

          <div className="flex flex-col items-center">
            <Heart className="w-8 h-8 text-primary animate-pulse fill-primary/20" />
          </div>

          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.05, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="w-24 h-24 rounded-full border-4 border-accent p-1 accent-glow"
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={partnerData?.profileImageUrl} className="object-cover" />
                <AvatarFallback className="bg-muted text-accent">{partner[0]}</AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 glass px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{partner}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Daily Inspiration</h3>
          <DailyQuote />
        </div>

        <div className="glass p-6 rounded-3xl space-y-4 border-accent/20">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-accent" />
            <span className="text-sm font-bold uppercase tracking-widest text-accent">Daily Question</span>
          </div>
          <p className="text-lg text-foreground/90 font-medium">{dailyQuestion || "Loading question..."}</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
