"use client";

import { useEffect, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { FloatingHearts } from "@/components/shared/FloatingHearts";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function GalleryPage() {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
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
      <FloatingHearts />
      <Navigation />
      
      <div className="flex flex-col items-center justify-center min-h-[80vh] overflow-hidden w-full relative z-10 px-6">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-headline text-white mb-4 z-10 font-bold tracking-tight text-center"
        >
          Heart Gallery
        </motion.h2>
        <p className="text-rose-300/40 text-xs font-bold uppercase tracking-[0.2em] mb-12 text-center">Our frozen moments in time</p>
        
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
                  <div className="w-full h-full rounded-2xl glass p-1.5 shadow-2xl border border-white/10 overflow-hidden flex items-center justify-center group">
                    <img
                      src={img.url || img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-xl pointer-events-none transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none rounded-xl" />
                    {img.caption && (
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <p className="text-white text-xs font-medium italic opacity-0 group-hover:opacity-100 transition-opacity duration-300">{img.caption}</p>
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
          transition={{ delay: 1 }}
          className="text-rose-300/30 mt-12 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-4 z-10 glass px-6 py-2 rounded-full border-white/5"
        >
          <span>swipe to explore</span>
        </motion.div>
      </div>
    </div>
  );
}