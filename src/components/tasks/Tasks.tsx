import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle, ListTodo, Archive, ArrowRight, Activity, Plus, X, AlertTriangle, ChevronDown, Terminal, Zap, Shield } from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

type Priority = "High" | "Medium" | "Low";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  isCompleted: boolean;
  userId: string;
}

const priorityOrder: Record<Priority, number> = {
  High: 3,
  Medium: 2,
  Low: 1
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("Medium");

  const fetchTasks = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, "tasks"), where("userId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      const fetchedTasks = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
      
      fetchedTasks.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setTasks(fetchedTasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "tasks", id), { isCompleted: !currentStatus });
      setTasks(prev => {
        const updated = prev.map(t => t.id === id ? { ...t, isCompleted: !currentStatus } : t);
        return updated.sort((a, b) => {
          if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      });
      toast.success(currentStatus ? "Task Re-initialized" : "Directive Successfully Executed");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const taskData = {
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        isCompleted: false,
        userId: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "tasks"), taskData);
      const newTask = { id: docRef.id, ...taskData } as Task;
      
      setTasks(prev => [newTask, ...prev].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }));

      setNewTitle("");
      setNewDesc("");
      setNewPriority("Medium");
      setIsAdding(false);
      toast.success("Neurological protocol documented.");
    } catch (e) {
      console.error(e);
      toast.error("Sub-system telemetry failure.");
    }
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-12">
      <div className="w-40 h-2 bg-brand/10 rounded-full overflow-hidden">
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-1/2 h-full bg-brand"
        />
      </div>
      <span className="text-[11px] font-black uppercase tracking-[0.6em] text-brand">Synchronizing Core Directives...</span>
    </div>
  );

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-20 py-12 px-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12">
         <div className="space-y-4">
            <div className="flex items-center gap-6 mb-6">
              <div className="h-[2px] w-16 bg-brand/30" />
              <span className="text-[12px] font-black uppercase tracking-[0.7em] text-brand">Bio-Management Nexus</span>
            </div>
            <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-deep-green leading-none drop-shadow-sm">Directives.</h2>
            <p className="text-slate-500 text-xl md:text-3xl font-medium mt-10 leading-relaxed max-w-4xl">
              "Mapping structural imperatives for the biological optimization of agricultural assets."
            </p>
         </div>
         <button 
           onClick={() => setIsAdding(!isAdding)}
           className={`w-28 h-28 rounded-[40px] transition-all flex items-center justify-center shadow-2xl relative group ${isAdding ? 'bg-rose-500 text-white rotate-45 border-4 border-white' : 'bg-deep-green text-white shadow-[0_25px_50px_rgba(8,28,21,0.25)] hover:scale-110 active:scale-95 border-4 border-white'}`}
         >
           <Plus className="w-12 h-12 relative z-10" />
         </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            onSubmit={handleAddTask}
            className="premium-card p-16 md:p-24 bg-white/40 border border-white scroll-mt-20 backdrop-blur-3xl shadow-2xl relative overflow-hidden rounded-[80px] group border-4"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
               <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-brand rounded-full animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-[0.6em] text-brand block">Input Parameters</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="PROTOCOL IDENTIFIER" 
                    className="w-full bg-white/60 border border-slate-200 rounded-[32px] p-8 font-black text-3xl md:text-4xl text-deep-green placeholder:text-slate-300 focus:ring-2 focus:ring-brand focus:bg-white transition-all uppercase tracking-tighter shadow-inner"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                  />
                  <textarea 
                    placeholder="Provide phenotypic specific identifiers and biological constraints..." 
                    className="w-full bg-white/60 border border-slate-200 rounded-[32px] p-8 font-medium text-xl md:text-2xl text-slate-500 placeholder:text-slate-300 focus:ring-2 focus:ring-brand focus:bg-white transition-all min-h-[200px] leading-relaxed shadow-inner"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                  />
               </div>
               <div className="space-y-12 flex flex-col justify-between">
                  <div className="space-y-8">
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 block">Relative Urgency Matrix</span>
                    <div className="grid grid-cols-3 gap-6">
                      {(["High", "Medium", "Low"] as Priority[]).map(p => {
                        const Icon = p === "High" ? AlertTriangle : p === "Medium" ? Zap : Shield;
                        const colors = {
                          High: "hover:border-rose-200 text-rose-500 bg-rose-50/50",
                          Medium: "hover:border-accent/40 text-accent bg-accent/5",
                          Low: "hover:border-slate-200 text-slate-400 bg-slate-50/50"
                        };
                        const activeColors = {
                          High: "bg-rose-500 text-white border-rose-500 shadow-[0_15px_30px_rgba(244,63,94,0.3)]",
                          Medium: "bg-accent text-white border-accent shadow-[0_15px_30px_rgba(212,163,115,0.3)]",
                          Low: "bg-deep-green text-white border-deep-green shadow-[0_15px_30px_rgba(8,28,21,0.2)]"
                        };

                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setNewPriority(p)}
                            className={`py-8 rounded-[40px] text-[11px] font-black uppercase tracking-[0.4em] border-4 transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden group/btn ${
                              newPriority === p 
                                ? `${activeColors[p]} scale-105` 
                                : `bg-white border-slate-100 ${colors[p]}`
                            }`}
                          >
                            <Icon className={`w-6 h-6 transition-transform group-hover/btn:scale-110 ${newPriority === p ? 'text-white' : ''}`} />
                            <span className="relative z-10">{p}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="p-10 bg-brand/5 border border-brand/10 rounded-[48px] flex items-start gap-8 relative overflow-hidden group shadow-inner">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[50px] pointer-events-none" />
                    <AlertTriangle className="w-10 h-10 text-brand flex-shrink-0 mt-2" />
                    <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-[0.2em]">
                      "Strategic priority mapping ensures peak computational efficiency during bio-restoration sequences."
                    </p>
                  </div>
                  <div className="flex justify-end gap-8 pt-8">
                    <button 
                      type="button" 
                      onClick={() => setIsAdding(false)}
                      className="px-12 py-6 text-sm font-black uppercase tracking-[0.5em] text-slate-400 hover:text-rose-500 transition-all underline underline-offset-8"
                    >
                      ABORT
                    </button>
                    <button 
                      type="submit"
                      className="px-20 py-8 bg-deep-green text-white rounded-full font-black text-sm md:text-lg uppercase tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all text-center border-4 border-white"
                    >
                      LOG DIRECTIVE
                    </button>
                  </div>
               </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Progress Card */}
      <div className="premium-card p-16 md:p-24 flex flex-col xl:flex-row items-center justify-between gap-16 md:gap-24 shadow-2xl relative overflow-hidden rounded-[80px] border border-white/60 bg-white/40 backdrop-blur-3xl group">
         <div className="absolute top-0 right-0 w-[50%] h-full bg-brand/5 rounded-full blur-[150px] transition-all duration-[4s] group-hover:bg-brand/10" />
         
         <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
            <div className={`w-48 h-48 md:w-56 md:h-56 rounded-[64px] border-4 border-white flex items-center justify-center relative flex-shrink-0 bg-white shadow-2xl overflow-hidden`}>
               <svg className="w-48 h-48 md:w-56 md:h-56 rotate-[-90deg] absolute inset-0">
                  <circle 
                    cx={isAdding ? 112 : 96} cy={isAdding ? 112 : 96} r={isAdding ? 100 : 84}
                    // Adjusting for actual size
                    ref={(el) => {
                       if (el) {
                         const parent = el.closest('svg');
                         if (parent) {
                           const size = parent.clientWidth / 2;
                           el.setAttribute('cx', String(size));
                           el.setAttribute('cy', String(size));
                           el.setAttribute('r', String(size * 0.85));
                         }
                       }
                    }}
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    className="text-slate-100" 
                  />
                  <motion.circle 
                    // Dynamics will handle cx, cy, r
                    ref={(el) => {
                       if (el) {
                         const parent = el.closest('svg');
                         if (parent) {
                           const size = parent.clientWidth / 2;
                           const radius = size * 0.85;
                           const circ = 2 * Math.PI * radius;
                           el.setAttribute('cx', String(size));
                           el.setAttribute('cy', String(size));
                           el.setAttribute('r', String(radius));
                           el.style.strokeDasharray = String(circ);
                           el.style.strokeDashoffset = String(circ - (circ * progress / 100));
                         }
                       }
                    }}
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    className="text-brand drop-shadow-[0_0_20px_rgba(45,106,79,0.3)]" 
                  />
               </svg>
                <span className="relative z-10 font-black text-6xl md:text-8xl tracking-tighter text-deep-green leading-none">{Math.round(progress)}%</span>
            </div>
            <div className="text-center md:text-left space-y-6">
               <div className="flex items-center justify-center md:justify-start gap-4">
                 <Shield className="w-6 h-6 text-brand" />
                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.7em] block">Biosphere Efficiency Level</span>
               </div>
               <h3 className="text-5xl md:text-8xl font-black text-deep-green tracking-tighter leading-none">Integrity Protocol.</h3>
               <p className="text-brand text-sm font-black uppercase tracking-[0.4em] mt-8 flex items-center justify-center md:justify-start gap-6 border-b-2 border-brand/10 pb-4 w-fit mx-auto md:mx-0">
                 <Zap className="w-5 h-5 animate-pulse" /> {completedCount} Units Integrated <span className="opacity-20">/</span> {tasks.length} Directives
               </p>
            </div>
         </div>

         <div className="relative z-10 flex flex-col items-center xl:items-end">
            <div className="px-8 py-3 bg-white border border-slate-100 rounded-full mb-6 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">Real-time Telemetry Uplink</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-3 h-3 bg-brand rounded-full shadow-[0_0_15px_#00ff88]" />
               <p className="text-[12px] font-black text-deep-green uppercase tracking-[0.6em] leading-none pt-0.5">V-CORE ONLINE</p>
            </div>
         </div>
      </div>

      {/* Task List */}
      <div className="space-y-12 pb-32">
         {tasks.length > 0 ? tasks.map((task, i) => (
           <motion.div 
             key={task.id}
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
             className={`p-12 md:p-16 flex flex-col md:flex-row items-center gap-12 group transition-all border-4 relative overflow-hidden rounded-[64px] shadow-2xl ${
               task.isCompleted 
                 ? 'bg-slate-50 border-slate-100 grayscale-[0.8] opacity-50' 
                 : 'bg-white border-white hover:border-brand shadow-[0_30px_60px_rgba(0,0,0,0.05)]'
             }`}
           >
              <div 
                onClick={() => toggleTask(task.id, task.isCompleted)}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-[32px] flex items-center justify-center transition-all cursor-pointer border-4 flex-shrink-0 shadow-2xl group-hover:scale-110 active:scale-90 ${
                  task.isCompleted 
                    ? 'bg-brand text-white border-brand shadow-[0_0_30px_rgba(45,106,79,0.3)]' 
                    : 'bg-slate-50 border-slate-50 text-slate-300 hover:bg-brand/10 hover:text-brand hover:border-brand/10'
                }`}
              >
                 {task.isCompleted ? <CheckCircle2 className="w-12 h-12" /> : <Shield className="w-8 h-8 opacity-40 group-hover:rotate-12 transition-transform" />}
              </div>
              
               <div className="flex-1 min-w-0 text-center md:text-left" onClick={() => !task.isCompleted && toggleTask(task.id, task.isCompleted)}>
                 <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
                    <h4 className={`text-4xl md:text-5xl font-black tracking-tighter transition-all leading-none ${task.isCompleted ? 'text-slate-400 line-through' : 'text-deep-green'}`}>
                      {task.title}
                    </h4>
                    {!task.isCompleted && (
                      <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border-2 shadow-sm w-fit mx-auto md:mx-0 backdrop-blur-md transition-all group-hover:shadow-glow ${
                        task.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                        task.priority === 'Medium' ? 'bg-accent/10 text-accent border-accent/20' : 
                        'bg-slate-100/50 text-slate-400 border-slate-200'
                      }`}>
                         {task.priority === 'High' && <AlertTriangle className="w-4 h-4 animate-pulse" />}
                         {task.priority === 'Medium' && <Zap className="w-4 h-4" />}
                         {task.priority === 'Low' && <Shield className="w-4 h-4 opacity-40" />}
                         <span className="text-[10px] font-black uppercase tracking-[0.4em]">{task.priority}</span>
                      </div>
                    )}
                 </div>
                 <p className="text-xl md:text-3xl font-bold text-slate-400 leading-relaxed max-w-4xl line-clamp-2 md:line-clamp-none mx-auto md:mx-0">
                   "{task.description}"
                 </p>
              </div>

              {!task.isCompleted && (
                <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-[32px] border-4 border-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all duration-700 shadow-xl group-hover:shadow-[0_20px_40px_rgba(45,106,79,0.2)]">
                  <ArrowRight className="w-10 h-10 group-hover:translate-x-3 transition-transform" />
                </div>
              )}
           </motion.div>
         )) : (
            <div className="py-48 text-center flex flex-col items-center premium-card rounded-[80px] border border-white bg-white/40 backdrop-blur-3xl shadow-2xl group relative overflow-hidden md:mx-12">
               <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 blur-[120px] pointer-events-none" />
               <div className="w-40 h-40 bg-white rounded-[56px] flex items-center justify-center mb-16 border border-slate-100 rotate-12 transition-transform duration-1000 group-hover:rotate-0 shadow-2xl">
                  <ListTodo className="w-20 h-20 text-slate-100" />
               </div>
               <div className="space-y-4 mb-10">
                 <span className="text-[11px] font-black text-brand uppercase tracking-[0.7em] block">Intelligence Queue Empty</span>
                 <h3 className="text-6xl md:text-8xl font-black text-deep-green tracking-tighter uppercase leading-none">Protocols Nom.</h3>
               </div>
               <p className="text-slate-400 text-xl md:text-3xl font-medium max-w-xl mx-auto leading-relaxed px-8">
                 "No active directives identified. Biological status is currently within projected neural parameters."
               </p>
               <div className="mt-16 flex gap-6">
                 <div className="w-3 h-3 rounded-full bg-brand animate-pulse" />
                 <div className="w-3 h-3 rounded-full bg-slate-100" />
                 <div className="w-3 h-3 rounded-full bg-slate-50" />
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
