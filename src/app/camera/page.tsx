"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { storage, db } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { CameraOff, Heart, Camera, Sparkles, Loader2, RefreshCw } from "lucide-react";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const router = useRouter();
  const { user } = useSoulAuth();

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(false);
    } catch (err) {
      console.warn("Camera access denied or unavailable", err);
      setCameraError(true);
    }
  };

  const captureImage = () => {
    if (cameraError) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1d161b';
        ctx.fillRect(0, 0, 400, 400);
        const gradient = ctx.createRadialGradient(200, 200, 50, 200, 200, 200);
        gradient.addColorStop(0, 'rgba(204, 51, 153, 0.4)');
        gradient.addColorStop(1, 'rgba(29, 22, 27, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#fb7185';
        ctx.font = '120px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❤️', 200, 200);
      }
      setCaptured(canvas.toDataURL('image/jpeg'));
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.translate(canvas.width, 0);
      context?.scale(-1, 1);
      context?.drawImage(video, 0, 0);
      setCaptured(canvas.toDataURL('image/jpeg'));
    }
  };

  const handleSave = async () => {
    if (!captured || !user) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `profiles/${user}.jpg`);
      await uploadString(storageRef, captured, 'data_url');
      const url = await getDownloadURL(storageRef);
      
      await setDoc(doc(db, "userProfiles", user), {
        id: user,
        name: user,
        profileImageUrl: url,
        updatedAt: serverTimestamp()
      }, { merge: true });

      router.push("/");
    } catch (err) {
      console.error("Failed to save profile image:", err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden bg-background">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col flex-1"
      >
        <header className="relative z-10 flex flex-col items-center text-center mb-8 pt-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2 mb-2">
            <Sparkles size={12} /> Identify Your Soul
          </span>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight">Profile Capture</h1>
        </header>

        <div className="flex-1 relative z-10 max-w-md mx-auto w-full aspect-[4/5] rounded-[3rem] overflow-hidden glass border-white/10 shadow-2xl mb-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {captured ? (
              <motion.img 
                key="captured"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={captured} 
                alt="Captured" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <motion.div 
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full relative"
              >
                <canvas ref={canvasRef} className="hidden" />
                {!cameraError ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover transform -scale-x-100" 
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(204,51,153,0.3)] mb-6 text-rose-400">
                      <Heart size={48} fill="currentColor" />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-3">Camera Unavailable</h3>
                    <p className="text-rose-300/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
                      No camera detected, but you can still continue with a heart!
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pb-12 relative z-10 max-w-md mx-auto w-full px-4">
          {!captured ? (
            <div className="flex flex-col items-center gap-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={captureImage}
                className="w-24 h-24 bg-white/5 rounded-full border-4 border-white/10 flex items-center justify-center shadow-2xl relative group"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full border-2 border-white/20 flex items-center justify-center text-white relative z-10">
                  {cameraError ? <Heart size={36} fill="currentColor" /> : <Camera size={36} />}
                </div>
              </motion.button>
              <p className="text-rose-300/20 text-[10px] uppercase tracking-[0.4em] font-black">
                {cameraError ? "Tap heart to continue" : "Snap your beauty"}
              </p>
            </div>
          ) : (
            <div className="flex gap-4">
              <button 
                onClick={() => setCaptured(null)}
                className="flex-1 px-8 py-5 rounded-[2rem] glass text-rose-400 font-black uppercase tracking-widest text-xs border-white/5 hover:bg-white/5 transition-all"
              >
                <RefreshCw size={16} className="inline mr-2" />
                {cameraError ? "Back" : "Retake"}
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs bg-gradient-to-r from-primary to-accent text-white shadow-[0_10px_30px_rgba(204,51,153,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {loading ? "Saving..." : "Enter Sanctuary"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
