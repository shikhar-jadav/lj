
"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export function FloatingHearts() {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100 + 100,
      size: Math.random() * 30 + 10,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 10,
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ y: "110vh", x: `${heart.x}vw`, opacity: 0, scale: 0.5 }}
          animate={{
            y: "-20vh",
            opacity: [0, 0.3, 0.3, 0],
            scale: [0.5, 1, 1, 0.5],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "linear",
          }}
          className="absolute text-primary/10"
          style={{ width: heart.size, height: heart.size }}
        >
          <Heart fill="currentColor" stroke="none" />
        </motion.div>
      ))}
    </div>
  );
}
