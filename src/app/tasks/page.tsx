"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
import { FloatingHearts } from "@/components/shared/FloatingHearts";
import { 
  CheckCircle, 
  Trophy, 
  Plus, 
  X, 
  Coins, 
  User, 
  ChevronLeft, 
  Upload,
  Image as ImageIcon,
  Film,
  Music,
  FileIcon,
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { useSoulAuth } from "@/hooks/use-soul-auth";
import { db, storage } from "@/lib/firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  increment 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  addDocumentNonBlocking, 
  updateDocumentNonBlocking 
} from "@/firebase/non-blocking-updates";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

export default function TasksPage() {
  const { user, partner } = useSoulAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filter, setFilter] = useState<'mine' | 'assigned'>('mine');
  const [points, setPoints] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reward, setReward] = useState(50);
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const demoFileInputRef = useRef<HTMLInputElement>(null);

  const [proof, setProof] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, "tasks"));
    const unsubTasks = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubPoints = onSnapshot(doc(db, "userProfiles", user), (doc) => {
      if (doc.exists()) {
        setPoints(doc.data()?.points || 0);
      }
    });

    return () => {
      unsubTasks();
      unsubPoints();
    };
  }, [user]);

  const handleCreate = async () => {
    if (!title || !desc || !user || !partner) return;
    
    const isSnow = user.toLowerCase() === 'snow';
    if (isSnow && points < 1000) {
      toast({
        variant: "destructive",
        title: "Insufficient Points",
        description: "You need 1000 points to assign a task.",
      });
      return;
    }

    setIsUploading(true);
    let demoUrl = "";

    try {
      if (demoFile) {
        const fileRef = ref(storage, `tasks/demos/${Date.now()}_${demoFile.name}`);
        const snapshot = await uploadBytes(fileRef, demoFile);
        demoUrl = await getDownloadURL(snapshot.ref);
      }

      if (isSnow) {
        const userRef = doc(db, "userProfiles", user);
        updateDocumentNonBlocking(userRef, { 
          points: increment(-1000),
          updatedAt: new Date().toISOString()
        });
        addDocumentNonBlocking(collection(db, "userProfiles", user, "pointTransactions"), {
          userId: user,
          amount: -1000,
          type: "task_assignment_fee",
          description: `Assigned task: ${title}`,
          timestamp: serverTimestamp()
        });
      }

      const taskData = {
        title,
        description: desc,
        rewardPoints: isSnow ? 0 : Number(reward),
        assignedById: user,
        assignedToId: partner,
        status: "pending",
        demoMediaUrl: demoUrl,
        assignedAt: new Date().toISOString(),
        createdAt: serverTimestamp()
      };

      addDocumentNonBlocking(collection(db, "tasks"), taskData);
      setView('list');
      setTitle(''); 
      setDesc('');
      setDemoFile(null);
      toast({ title: "Task Assigned!" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedTask || !user) return;
    setIsUploading(true);
    let mediaUrl = "";
    try {
      if (selectedFile) {
        const fileRef = ref(storage, `tasks/completions/${selectedTask.id}/${Date.now()}_${selectedFile.name}`);
        const snapshot = await uploadBytes(fileRef, selectedFile);
        mediaUrl = await getDownloadURL(snapshot.ref);
      }
      const taskRef = doc(db, "tasks", selectedTask.id);
      const userRef = doc(db, "userProfiles", user);
      updateDocumentNonBlocking(taskRef, {
        status: "completed",
        submissionText: proof,
        submissionImageUrl: mediaUrl,
        completedAt: new Date().toISOString()
      });
      updateDocumentNonBlocking(userRef, { 
        points: increment(selectedTask.rewardPoints),
        updatedAt: new Date().toISOString()
      });
      addDocumentNonBlocking(collection(db, "userProfiles", user, "pointTransactions"), {
        userId: user,
        amount: selectedTask.rewardPoints,
        type: "task_reward",
        description: `Completed: ${selectedTask.title}`,
        relatedTaskId: selectedTask.id,
        timestamp: serverTimestamp()
      });
      toast({ title: "Task Completed!", description: `+${selectedTask.rewardPoints} points` });
      setView('list');
      setProof('');
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const displayedTasks = tasks.filter(t => filter === 'mine' ? t.assignedToId === user : t.assignedById === user);
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon size={24} />;
    if (file.type.startsWith('video/')) return <Film size={24} />;
    if (file.type.startsWith('audio/')) return <Music size={24} />;
    return <FileIcon size={24} />;
  };

  const renderMedia = (url: string) => {
    if (!url) return null;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('video')) {
      return <video src={url} controls className="w-full rounded-2xl mt-4 bg-black aspect-video shadow-2xl" />;
    }
    if (lowerUrl.includes('.mp3') || lowerUrl.includes('.wav') || lowerUrl.includes('audio')) {
      return <audio src={url} controls className="w-full mt-4 glass p-4 rounded-2xl" />;
    }
    return <img src={url} alt="Media" className="w-full rounded-2xl mt-4 object-cover shadow-2xl border border-white/10" />;
  };

  const canCreateTask = user?.toLowerCase() === 'shikhar' || (user?.toLowerCase() === 'snow' && points >= 1000);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col">
      <FloatingHearts />
      {view === 'list' && (
        <>
          <Navigation />
          <div className="pt-20 px-6 pb-28 flex flex-col z-10 max-w-2xl mx-auto w-full">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-headline font-bold text-white">Challenges</h1>
                <p className="text-rose-300/40 text-[10px] font-bold uppercase tracking-widest mt-1">Our small goals</p>
              </div>
              <Link href="/points" className="glass px-6 py-3 rounded-2xl flex flex-col items-center border-white/5 shadow-xl hover:bg-white/5 transition-colors">
                <span className="text-2xl font-black text-yellow-400 flex items-center gap-1.5 leading-none">
                  {points} <Trophy size={18} className="text-yellow-400/50" />
                </span>
                <span className="text-[8px] font-bold text-rose-300/40 uppercase tracking-widest mt-2">Your Balance</span>
              </Link>
            </header>

            <div className="flex glass p-1.5 rounded-2xl border-white/5 mb-8">
              <button 
                onClick={() => setFilter('mine')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all uppercase tracking-widest ${filter === 'mine' ? 'bg-primary text-white shadow-lg' : 'text-white/40'}`}
              >
                For Me
              </button>
              <button 
                onClick={() => setFilter('assigned')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all uppercase tracking-widest ${filter === 'assigned' ? 'bg-primary text-white shadow-lg' : 'text-white/40'}`}
              >
                From Me
              </button>
            </div>

            <div className="space-y-4">
              {displayedTasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedTask(task); setView('detail'); }}
                  className={`glass rounded-[2rem] p-6 shadow-2xl border-l-[8px] cursor-pointer flex flex-col gap-3 relative overflow-hidden group hover:bg-white/5 transition-colors ${task.status === 'completed' ? 'border-emerald-500/50' : 'border-orange-500/50'}`}
                >
                  <div className="flex justify-between items-start relative z-10">
                    <h4 className="font-headline font-bold text-white text-xl leading-tight">{task.title}</h4>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {task.status}
                    </div>
                  </div>
                  <p className="text-sm text-white/50 line-clamp-2 leading-relaxed italic relative z-10">"{task.description}"</p>
                  
                  <div className="flex justify-between items-center mt-3 pt-4 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      <User size={14} className="text-rose-400" /> From {task.assignedById}
                    </div>
                    <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-1.5 rounded-full font-black text-xs">
                      <Trophy size={14} className="opacity-50" /> {task.rewardPoints} PTS
                    </div>
                  </div>
                </motion.div>
              ))}
              {displayedTasks.length === 0 && (
                <div className="text-center py-32 text-white/10 italic text-sm">No tasks found in this category.</div>
              )}
            </div>

            {canCreateTask && (
              <motion.button 
                 whileTap={{ scale: 0.9 }}
                 onClick={() => setView('create')}
                 className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center z-50 border border-white/20 hover:bg-accent transition-colors"
              >
                <Plus size={32} />
              </motion.button>
            )}
          </div>
        </>
      )}

      {view === 'create' && (
        <div className="flex flex-col h-full z-10 max-w-2xl mx-auto w-full px-6 pt-20 pb-24">
          <header className="flex justify-between items-center mb-8">
             <h2 className="text-3xl font-headline font-bold text-white">New Challenge</h2>
             <button onClick={() => setView('list')} className="p-3 glass rounded-2xl text-white/40 hover:text-white"><X size={24} /></button>
          </header>

          <div className="space-y-8 overflow-y-auto pb-8">
            {user?.toLowerCase() === 'snow' && (
              <div className="glass bg-rose-500/10 border-rose-500/20 p-6 rounded-[2rem] flex items-start gap-4">
                <AlertCircle className="text-rose-400 shrink-0" size={24} />
                <p className="text-sm text-rose-200/80 leading-relaxed italic">
                  Assigning this challenge costs <strong className="text-rose-300">1000 points</strong>. Prove your love is worth the price!
                </p>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-rose-300/40 uppercase tracking-[0.3em] ml-2">Challenge Title</label>
              <input 
                className="w-full p-6 rounded-[2rem] glass border-white/5 focus:border-primary focus:bg-white/5 outline-none transition-all text-white placeholder:text-white/10" 
                placeholder="What should they do?" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-rose-300/40 uppercase tracking-[0.3em] ml-2">Description</label>
              <textarea 
                className="w-full p-6 rounded-[2rem] glass border-white/5 focus:border-primary focus:bg-white/5 outline-none h-40 text-white placeholder:text-white/10 resize-none" 
                placeholder="Add more details about the challenge..." 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-rose-300/40 uppercase tracking-[0.3em] ml-2">Reference Media (Optional)</label>
              <input 
                type="file" 
                ref={demoFileInputRef} 
                className="hidden" 
                onChange={(e) => setDemoFile(e.target.files?.[0] || null)}
              />
              <button 
                onClick={() => demoFileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-white/20 hover:bg-white/5 hover:border-white/20 transition-all"
              >
                {demoFile ? (
                  <div className="flex flex-col items-center gap-3 text-rose-400">
                    {getFileIcon(demoFile)}
                    <span className="text-xs font-bold truncate max-w-[200px]">{demoFile.name}</span>
                  </div>
                ) : (
                  <>
                    <div className="p-4 glass rounded-3xl text-rose-500/30">
                      <ImageIcon size={32} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Add Reference File</span>
                  </>
                )}
              </button>
            </div>

            {user?.toLowerCase() !== 'snow' && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-rose-300/40 uppercase tracking-[0.3em] ml-2">Bounty (Points)</label>
                <div className="relative">
                   <input 
                    type="number" 
                    className="w-full p-6 rounded-[2rem] glass border-white/5 focus:border-primary focus:bg-white/5 outline-none text-white font-black text-2xl pl-16" 
                    value={reward} 
                    onChange={e => setReward(Number(e.target.value))} 
                  />
                  <Coins className="absolute left-6 top-1/2 -translate-y-1/2 text-yellow-500/40" size={24} />
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/5 mt-auto">
            <button 
              onClick={handleCreate} 
              disabled={isUploading || !title || !desc}
              className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl hover:bg-accent disabled:opacity-30 transition-all flex items-center justify-center gap-3"
            >
              {isUploading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              {isUploading ? "Assigning..." : (user?.toLowerCase() === 'snow' ? "Assign (-1000 pts)" : "Send Challenge")}
            </button>
          </div>
        </div>
      )}

      {view === 'detail' && selectedTask && (
        <div className="flex flex-col h-full z-10 max-w-2xl mx-auto w-full px-6 pt-20 pb-24">
          <header className="flex items-center gap-4 mb-8">
            <button onClick={() => setView('list')} className="p-3 glass rounded-2xl text-rose-400 hover:text-white transition-colors"><ChevronLeft size={24} /></button>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-headline font-bold text-white truncate">{selectedTask.title}</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-[8px] font-black uppercase tracking-widest">{selectedTask.rewardPoints} Bounty</div>
                <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">From {selectedTask.assignedById}</div>
              </div>
            </div>
          </header>

          <div className="space-y-8 overflow-y-auto pb-8">
            <div className="glass rounded-[2.5rem] p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 text-white/5">
                  <BookHeart size={80} />
               </div>
               <h3 className="text-[10px] font-bold text-rose-300/40 uppercase tracking-widest mb-4">The Challenge</h3>
               <p className="text-white/90 leading-relaxed font-serif text-lg italic">"{selectedTask.description}"</p>
               {selectedTask.demoMediaUrl && (
                 <div className="mt-8 pt-8 border-t border-white/5">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Reference Material</h4>
                    {renderMedia(selectedTask.demoMediaUrl)}
                 </div>
               )}
            </div>
            
            {selectedTask.status === 'completed' && (
               <div className="glass rounded-[2.5rem] p-8 border-emerald-500/10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 text-emerald-500/5">
                    <CheckCircle size={80} />
                 </div>
                 <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4">Mission Accomplished</h3>
                 <p className="text-white/70 italic text-sm leading-relaxed mb-6">"{selectedTask.submissionText}"</p>
                 {renderMedia(selectedTask.submissionImageUrl)}
               </div>
            )}

            {selectedTask.status === 'pending' && selectedTask.assignedToId === user && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-rose-300/40 uppercase tracking-widest ml-4 flex items-center gap-2">
                    <Upload size={14} className="text-primary"/> Proof of completion
                  </h3>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-white/20 hover:bg-white/5 hover:border-white/20 transition-all"
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-3 text-emerald-400">
                        {getFileIcon(selectedFile)}
                        <span className="text-xs font-bold truncate max-w-[200px]">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 glass rounded-3xl text-emerald-500/30">
                          <ImageIcon size={32} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Upload your proof</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-rose-300/40 uppercase tracking-widest ml-4">Sweet Note</h3>
                  <textarea 
                    className="w-full p-6 glass rounded-[2rem] border-white/5 focus:border-primary focus:bg-white/5 outline-none min-h-[160px] text-white placeholder:text-white/10 resize-none italic font-serif" 
                    placeholder="Write a little something for your love..." 
                    value={proof} 
                    onChange={e => setProof(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {selectedTask.status === 'pending' && selectedTask.assignedToId === user && (
            <div className="pt-6 border-t border-white/5 mt-auto">
              <button 
                onClick={handleComplete} 
                disabled={isUploading || !proof}
                className="w-full bg-emerald-500 text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-600 disabled:opacity-30 transition-all flex items-center justify-center gap-3"
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                {isUploading ? "Uploading..." : "Submit & Claim Bounty"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}