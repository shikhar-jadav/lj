
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/shared/Navigation";
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
  Loader2,
  AlertCircle,
  Sparkles,
  BookHeart
} from "lucide-react";
import { useSoulAuth } from "@/hooks/use-soul-auth";
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
  const [proof, setProof] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const storedTasks = JSON.parse(localStorage.getItem("soul-tasks") || "[]");
    setTasks(storedTasks);
    
    const profiles = JSON.parse(localStorage.getItem("soul-profiles") || "{}");
    setPoints(profiles[user]?.points || 0);
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

    setIsProcessing(true);
    const profiles = JSON.parse(localStorage.getItem("soul-profiles") || "{}");

    if (isSnow) {
      profiles[user].points -= 1000;
      localStorage.setItem("soul-profiles", JSON.stringify(profiles));
      setPoints(profiles[user].points);
    }

    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description: desc,
      rewardPoints: isSnow ? 0 : Number(reward),
      assignedById: user,
      assignedToId: partner,
      status: "pending",
      assignedAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, newTask];
    localStorage.setItem("soul-tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
    
    setView('list');
    setTitle(''); 
    setDesc('');
    setIsProcessing(false);
    toast({ title: "Task Assigned!" });
  };

  const handleComplete = async () => {
    if (!selectedTask || !user) return;
    setIsProcessing(true);
    
    const updatedTasks = tasks.map(t => 
      t.id === selectedTask.id ? { ...t, status: "completed", submissionText: proof, completedAt: new Date().toISOString() } : t
    );
    localStorage.setItem("soul-tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);

    const profiles = JSON.parse(localStorage.getItem("soul-profiles") || "{}");
    profiles[user].points += selectedTask.rewardPoints;
    localStorage.setItem("soul-profiles", JSON.stringify(profiles));
    setPoints(profiles[user].points);

    toast({ title: "Task Completed!", description: `+${selectedTask.rewardPoints} points` });
    setView('list');
    setProof('');
    setIsProcessing(false);
  };

  const displayedTasks = tasks.filter(t => filter === 'mine' ? t.assignedToId === user : t.assignedById === user);

  const canCreateTask = user?.toLowerCase() === 'shikhar' || (user?.toLowerCase() === 'snow' && points >= 1000);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1"
          >
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
                    initial={{ opacity: 0, scale: 0.98 }}
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
          </motion.div>
        )}

        {view === 'create' && (
          <motion.div 
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full z-10 max-w-2xl mx-auto w-full px-6 pt-20 pb-24"
          >
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
                disabled={isProcessing || !title || !desc}
                className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl hover:bg-accent disabled:opacity-30 transition-all flex items-center justify-center gap-3"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {isProcessing ? "Assigning..." : (user?.toLowerCase() === 'snow' ? "Assign (-1000 pts)" : "Send Challenge")}
              </button>
            </div>
          </motion.div>
        )}

        {view === 'detail' && selectedTask && (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full z-10 max-w-2xl mx-auto w-full px-6 pt-20 pb-24"
          >
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
              </div>
              
              {selectedTask.status === 'completed' && (
                 <div className="glass rounded-[2.5rem] p-8 border-emerald-500/10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 text-emerald-500/5">
                      <CheckCircle size={80} />
                   </div>
                   <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4">Mission Accomplished</h3>
                   <p className="text-white/70 italic text-sm leading-relaxed mb-6">"{selectedTask.submissionText}"</p>
                 </div>
              )}

              {selectedTask.status === 'pending' && selectedTask.assignedToId === user && (
                <div className="space-y-8">
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
                  disabled={isProcessing || !proof}
                  className="w-full bg-emerald-500 text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-600 disabled:opacity-30 transition-all flex items-center justify-center gap-3"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                  {isProcessing ? "Processing..." : "Submit & Claim Bounty"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
