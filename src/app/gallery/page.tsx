"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Plus, Heart, Upload, X } from "lucide-react";
import { BottomNav } from "@/components/shared/BottomNav";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { db, storage } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useSoulAuth } from "@/hooks/use-soul-auth";

export default function GalleryPage() {
  const { user } = useSoulAuth();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const rotateY = useMotionValue(0);
  const springRotateY = useSpring(rotateY, { stiffness: 60, damping: 20 });
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImages(docs.length > 0 ? docs : PlaceHolderImages.map(p => ({ ...p, url: p.imageUrl })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isInteracting) return;
    const interval = setInterval(() => {
      rotateY.set(rotateY.get() + 0.5);
    }, 50);
    return () => clearInterval(interval);
  }, [isInteracting]);

  const handleDrag = (event: any, info: any) => {
    rotateY.set(rotateY.get() + info.delta.x * 0.5);
  };

  const radius = typeof window !== 'undefined' && window.innerWidth < 640 ? 250 : 450;
  const count = images.length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, "gallery"), {
        url,
        uploadedBy: user,
        timestamp: serverTimestamp(),
        favorites: []
      });
      setUploadOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col items-center justify-center relative select-none">
      <div className="absolute top-10 text-center z-10">
        <h1 className="text-3xl font-headline text-primary">Memory Wheel</h1>
        <p className="text-muted-foreground text-sm">Spin our moments through time</p>
      </div>

      <motion.div 
        ref={containerRef}
        className="perspective-stage w-full h-[60vh] flex items-center justify-center cursor-grab active:cursor-grabbing"
        drag="x"
        onDragStart={() => setIsInteracting(true)}
        onDragEnd={() => setIsInteracting(false)}
        onDrag={handleDrag}
      >
        <motion.div 
          className="rotating-ring relative flex items-center justify-center"
          style={{ rotateY: springRotateY }}
        >
          {images.map((img, i) => {
            const angle = (360 / count) * i;
            return (
              <motion.div
                key={img.id || i}
                className="absolute w-48 h-64 sm:w-64 sm:h-80 rounded-2xl overflow-hidden glass rose-glow border-2 border-primary/20"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: "hidden"
                }}
              >
                <img src={img.url} className="w-full h-full object-cover pointer-events-none" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                        {img.uploadedBy || "SoulCanvas"}
                     </span>
                     <Heart className="w-5 h-5 text-primary fill-primary" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-32 z-10">
        <Button 
          onClick={() => setUploadOpen(true)}
          className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-2xl rose-glow"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      {uploadOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          <div className="glass p-8 rounded-3xl w-full max-w-sm space-y-6 relative">
            <button onClick={() => setUploadOpen(false)} className="absolute top-4 right-4 text-muted-foreground">
               <X className="w-6 h-6" />
            </button>
            <div className="text-center space-y-2">
              <Upload className="w-12 h-12 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-headline">New Memory</h2>
              <p className="text-sm text-muted-foreground">Add a snapshot to our story</p>
            </div>
            <label className="block w-full h-32 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors">
              <span className="text-primary font-bold">{loading ? "Uploading..." : "Choose Photo"}</span>
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={loading} accept="image/*" />
            </label>
          </div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
}
