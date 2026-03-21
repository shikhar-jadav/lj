
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { FloatingHearts } from "@/components/shared/FloatingHearts";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState(false);
  const { login } = useSoulAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(false);
    
    const success = await login(name);
    
    if (success) {
      router.push("/");
    } else {
      setError(true);
      setIsLoggingIn(false);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <FloatingHearts />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl w-full max-w-sm z-10 space-y-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Heart className="w-20 h-20 text-primary" fill="currentColor" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline text-primary font-bold">SoulCanvas</h1>
          <p className="text-muted-foreground italic">Our private digital sanctuary</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoggingIn}
              className="bg-background/40 border-primary/20 focus:border-primary text-center h-12 rounded-xl"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-destructive text-sm text-center"
              >
                That's not one of us, darling.
              </motion.p>
            )}
          </AnimatePresence>

          <Button 
            type="submit" 
            disabled={isLoggingIn || !name.trim()}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all transform active:scale-95 shadow-lg shadow-primary/20"
          >
            {isLoggingIn ? <Loader2 className="animate-spin" /> : "Enter Our World"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
