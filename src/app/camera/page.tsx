
"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, RefreshCw, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { storage, db } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useSoulAuth();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const saveProfile = async () => {
    if (!capturedImage || !user) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `profiles/${user}.jpg`);
      await uploadString(storageRef, capturedImage, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      
      await setDoc(doc(db, "userProfiles", user), {
        id: user,
        name: user,
        profileImageUrl: downloadURL,
        points: 0,
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      router.push("/");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-background">
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-3xl font-headline text-primary">A Smile for Me</h2>
        <p className="text-muted-foreground">Capture your profile picture</p>
      </div>

      <div className="relative w-full max-w-sm aspect-square rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl rose-glow">
        {!capturedImage ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mb-12 w-full max-w-xs space-y-4">
        {!capturedImage ? (
          <Button 
            onClick={takePhoto}
            className="w-full h-16 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl"
          >
            <Camera className="mr-2" /> Capture
          </Button>
        ) : (
          <div className="flex gap-4">
            <Button 
              onClick={retake}
              variant="outline"
              className="flex-1 h-14 rounded-full border-primary/20"
            >
              <RefreshCw className="mr-2" /> Retake
            </Button>
            <Button 
              onClick={saveProfile}
              disabled={loading}
              className="flex-1 h-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl"
            >
              {loading ? "Saving..." : <><Check className="mr-2" /> Save</>}
            </Button>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          onClick={() => router.push("/")}
          className="w-full text-muted-foreground"
        >
          Skip for now <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
