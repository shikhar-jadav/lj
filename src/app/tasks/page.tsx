"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/shared/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Clock, Gift, Plus, ChevronRight, MessageSquare } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore";
import { useSoulAuth } from "@/hooks/use-soul-auth";

export default function TasksPage() {
  const { user, partner } = useSoulAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [reward, setReward] = useState(10);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"));
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  const createTask = async () => {
    if (!title || !user || !partner) return;
    await addDoc(collection(db, "tasks"), {
      title,
      reward: Number(reward),
      status: "pending",
      assignedTo: partner,
      assignedBy: user,
      timestamp: serverTimestamp(),
    });
    setTitle("");
    setIsAdding(false);
  };

  const completeTask = async (taskId: string, rewardValue: number, assignedTo: string) => {
    await updateDoc(doc(db, "tasks", taskId), { status: "completed" });
    await updateDoc(doc(db, "users", assignedTo), { points: increment(rewardValue) });
    // Also record transaction
    await addDoc(collection(db, "transactions"), {
      user: assignedTo,
      amount: rewardValue,
      type: "task_reward",
      timestamp: serverTimestamp(),
    });
  };

  return (
    <div className="min-h-screen pb-32 p-6 bg-background space-y-8">
      <div className="pt-4 text-center space-y-2">
        <h1 className="text-4xl font-headline text-primary font-bold">Partner Missions</h1>
        <p className="text-muted-foreground italic">Challenge me, reward me, love me</p>
      </div>

      <AnimatePresence>
        {isAdding ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass p-6 rounded-3xl space-y-4"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Assign to {partner}</h3>
            <Input 
              placeholder="What's the mission?" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-primary/20"
            />
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-muted-foreground">Reward Points:</span>
              <Input 
                type="number" 
                value={reward} 
                onChange={(e) => setReward(Number(e.target.value))}
                className="w-24 bg-transparent border-primary/20"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setIsAdding(false)} variant="ghost" className="flex-1">Cancel</Button>
              <Button onClick={createTask} className="flex-1 bg-primary">Assign Mission</Button>
            </div>
          </motion.div>
        ) : (
          <Button onClick={() => setIsAdding(true)} className="w-full h-14 rounded-2xl bg-accent text-accent-foreground font-bold shadow-lg shadow-accent/20">
             <Plus className="mr-2" /> New Mission for {partner}
          </Button>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {tasks.map((task) => (
          <motion.div 
            key={task.id}
            layout
            className={`glass p-5 rounded-3xl flex items-center gap-4 border-2 transition-all ${task.status === 'completed' ? 'border-green-500/20 opacity-60' : 'border-primary/10'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${task.status === 'completed' ? 'bg-green-500/10' : 'bg-primary/10'}`}>
               {task.status === 'completed' ? <CheckCircle2 className="text-green-500" /> : <Clock className="text-primary animate-pulse" />}
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-lg leading-tight">{task.title}</h4>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                 <Gift className="w-3 h-3 text-accent" /> {task.reward} Points • For: {task.assignedTo}
              </div>
            </div>
            {task.status !== 'completed' && task.assignedTo === user && (
              <Button 
                onClick={() => completeTask(task.id, task.reward, task.assignedTo)}
                size="sm"
                className="bg-accent rounded-full text-accent-foreground px-4"
              >
                Claim
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
