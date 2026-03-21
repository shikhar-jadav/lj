"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Menu, 
  X, 
  Home, 
  BookHeart, 
  CheckCircle, 
  Image as ImageIcon,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSoulAuth } from "@/hooks/use-soul-auth";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useSoulAuth();

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/tasks", label: "Tasks", icon: CheckCircle },
    { href: "/gallery", label: "Gallery", icon: Heart },
    { href: "/diary", label: "Diary", icon: BookHeart },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 glass border-b border-white/5 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsOpen(true)} 
            className="p-2 -ml-2 rounded-xl text-rose-400 hover:bg-white/5 transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-headline font-bold text-white capitalize text-xl tracking-tight">
            {pathname === "/" ? "Love Hub" : pathname.replace("/", "")}
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(204,51,153,0.2)]">
          <Heart size={18} fill="currentColor" />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-[#1a1418] z-50 shadow-2xl flex flex-col border-r border-white/10"
            >
              <div className="p-8 pt-16 bg-gradient-to-br from-primary/10 to-transparent border-b border-white/5 relative">
                <h3 className="text-3xl font-headline font-bold text-white">SoulCanvas</h3>
                <p className="text-rose-300/40 text-xs font-bold uppercase tracking-widest mt-1">Our Private Space</p>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-3 flex-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${
                      pathname === item.href 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon size={22} className={pathname === item.href ? "text-white" : "text-rose-400 group-hover:text-rose-300"} />
                    <span className="font-bold tracking-tight">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t border-white/5">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <LogOut size={20} />
                  <span className="font-bold text-sm uppercase tracking-widest">Lock Sanctuary</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}