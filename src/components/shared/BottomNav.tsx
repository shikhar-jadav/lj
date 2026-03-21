"use client";

import { motion } from "framer-motion";
import { Home, Image as ImageIcon, Book, CheckSquare, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/gallery", icon: ImageIcon, label: "Gallery" },
  { href: "/diary", icon: Book, label: "Diary" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/points", icon: Star, label: "Points" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <div className="glass px-6 py-4 rounded-[2rem] flex justify-between items-center shadow-2xl backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-full transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary/50"
                }`}
              >
                <item.icon className="w-6 h-6" />
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
