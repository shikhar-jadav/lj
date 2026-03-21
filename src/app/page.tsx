
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/shared/Navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Heart } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useSoulAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "userProfiles", user), (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
      });
      return () => unsub();
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="flex flex-col items-center justify-center min-h-[85vh] relative px-6 pt-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="relative"
        >
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full p-2 bg-gradient-to-tr from-pink-400 via-rose-300 to-red-400 shadow-[0_0_40px_rgba(251,113,133,0.6)] animate-pulse-slow">
            <div className="w-full h-full rounded-full border-4 border-white overflow-hidden relative bg-white">
              {userData?.profileImageUrl ? (
                <img src={userData.profileImageUrl} alt="My Love" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-rose-200">
                  <Heart size={80} fill="currentColor" />
                </div>
              )}
            </div>
          </div>

          <motion.button
            onClick={() => router.push('/gallery')}
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute -bottom-4 -right-4 bg-white p-4 rounded-full shadow-xl z-20 cursor-pointer active:scale-95"
          >
            <Heart className="w-8 h-8 md:w-10 md:h-10 text-rose-500 fill-rose-500" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center max-w-sm"
        >
          <p className="text-rose-900 font-serif italic text-lg leading-relaxed">
            "You are the finest, loveliest, tenderest, and most beautiful person I have ever known."
          </p>
          <div className="mt-4 text-xs font-bold text-rose-300 uppercase tracking-widest">
            Welcome Home, {user}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
