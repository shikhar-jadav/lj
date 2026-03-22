
"use client";

import { useEffect, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Sparkles } from "lucide-react";

export default function GalleryPage() {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    // Fetch images from Firestore
    const q = query(collection(db, "galleryImages"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImages(docs.length > 0 ? docs : PlaceHolderImages.map(p => ({ url: p.imageUrl, ...p })));
    });

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => {
      unsub();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Continuous auto-rotation when not dragging
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      if (!isDragging) {
        setRotation(prev => prev - 0.2); 
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    if (!isDragging) animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging]);

  const handlePan = (_: any, info: PanInfo) => {
    setRotation(prev => prev + info.delta.x * 0.5);
  };

  const isMobile = windowWidth < 768;
  const radius = isMobile ? 180 : 280;
  const cardWidth = isMobile ? 160 : 220;
  const cardHeight = isMobile ? 240 : 320;

  return (
    <div className="min-h-screen bg-transparent pt-16 relative overflow-hidden">
      <Navigation />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center min-h-[80vh] overflow-hidden w-full relative z-10 px-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2 mb-4">
            <Sparkles size={12} /> Our Shared Moments
          </span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tighter">Heart Gallery</h1>
        </motion.div>
        
        <div 
          className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ perspective: '2000px' }}
        >
          <motion.div
            className="relative w-0 h-0"
            style={{
              transformStyle: "preserve-3d",
              rotateY: rotation, 
            }}
            onPanStart={() => setIsDragging(true)}
            onPan={handlePan}
            onPanEnd={() => setIsDragging(false)}
          >
            {images.map((img, i) => {
              const angle = (360 / images.length) * i;
              return (
                <motion.div
                  key={img.id || i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    marginLeft: `-${cardWidth / 2}px`, 
                    marginTop: `-${cardHeight / 2}px`, 
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="w-full h-full rounded-[2.5rem] glass p-2 shadow-2xl border border-white/10 overflow-hidden flex items-center justify-center group relative">
                    <img
                      src={img.url || img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-[2rem] pointer-events-none transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none rounded-[2rem]" />
                    {img.caption && (
                      <div className="absolute bottom-6 left-6 right-6 z-10">
                        <p className="text-white text-sm font-medium italic opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 tracking-wide font-serif">
                          "{img.caption}"
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-rose-300/20 mt-16 text-[10px] uppercase tracking-[0.4em] font-black flex items-center gap-4 z-10 glass px-8 py-3 rounded-full border-white/5"
        >
          <span>swipe to travel through time</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
