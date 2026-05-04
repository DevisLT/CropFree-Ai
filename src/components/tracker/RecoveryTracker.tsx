import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Plus, Search, Calendar, ChevronRight, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { OperationType, handleFirestoreError } from "../../lib/errorHandlers";

export default function RecoveryTracker() {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      if (!auth.currentUser) return;
      const path = "crops";
      try {
        const q = query(
          collection(db, path),
          where("userId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setCrops(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path, auth);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Consulting records...</span>
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
         <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-2 block">Botanical Monitoring</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">Recovery Tracker.</h2>
            <p className="text-neutral-500 text-sm md:text-lg font-medium max-w-lg mt-2">
              Every leaf counts. Monitor the healing journey of your affected crops with precision and empathy.
            </p>
         </div>
         <button className="w-fit bg-neutral-900 text-white px-8 py-4 rounded-2xl md:rounded-[28px] font-black shadow-2xl shadow-neutral-900/10 flex items-center gap-3 hover:translate-y-[-2px] transition-all btn-press text-xs md:text-sm uppercase tracking-widest">
            <Plus className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" /> Start New Session
         </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {crops.length > 0 ? crops.map((crop, i) => (
          <motion.div 
            key={crop.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className={`premium-card group border-0 bg-white/40 backdrop-blur-md rounded-[44px] shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden flex flex-col hover:bg-white/80 ring-1 ring-white/60 ${
              i % 3 === 1 ? 'md:mt-12' : ''
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden p-3 pb-0">
               <img src={crop.imageUrl} className="w-full h-full object-cover rounded-[36px] group-hover:scale-110 transition-transform duration-1000" alt={crop.name} referrerPolicy="no-referrer" />
               <div className="absolute top-8 left-8">
                  <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xl shadow-2xl border border-white/40 flex items-center gap-2 ${
                    crop.status === 'Recovered' ? 'bg-emerald-500/80 text-white' : 
                    crop.status === 'Improving' ? 'bg-sky-500/80 text-white' : 
                    'bg-rose-500/80 text-white shadow-rose-500/20'
                  }`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    {crop.status}
                  </div>
               </div>
            </div>
            
            <div className="p-6 md:p-10 pt-6 md:pt-8 flex-1 flex flex-col justify-between">
               <div>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-xl md:text-3xl font-black text-neutral-900 tracking-tighter">{crop.name}</h4>
                    <TrendingUp className={`w-4 h-4 md:w-5 md:h-5 ${crop.progress > 50 ? 'text-emerald-500' : 'text-sky-500'}`} />
                  </div>
                  <p className="text-[10px] md:text-sm text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-6 md:mb-8">
                     <AlertCircle className="w-3 md:w-3.5 h-3 md:h-3.5 text-rose-400" /> {crop.disease}
                  </p>
                  
                  <div className="space-y-3 md:space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest">Growth in Vitality</span>
                        <span className="text-base md:text-lg font-black text-neutral-900">{crop.progress}%</span>
                     </div>
                     <div className="w-full bg-neutral-100/50 h-2 md:h-3 rounded-full overflow-hidden p-0.5 border border-white">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${crop.progress}%` }}
                          className={`h-full rounded-full transition-all duration-1000 ${
                            crop.status === 'Recovered' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 
                            'bg-gradient-to-r from-sky-400 to-brand shadow-[0_0_8px_rgba(79,70,229,0.3)]'
                          }`}
                        />
                     </div>
                     <p className="text-[9px] md:text-[10px] font-bold text-neutral-400 italic">
                        {crop.progress === 100 ? "Plant has fully regained its strength." : "Progressing towards full recovery."}
                     </p>
                  </div>
               </div>

               <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-neutral-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-neutral-50 rounded-xl">
                       <Calendar className="w-4 h-4 text-neutral-400" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Registry Date</span>
                        <span className="text-xs font-black text-neutral-900">{format(crop.createdAt.toDate(), "MMM dd, yyyy")}</span>
                     </div>
                  </div>
                  <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-neutral-900 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-neutral-900/10">
                     <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
               </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full glass p-10 md:p-24 text-center flex flex-col items-center rounded-[32px] md:rounded-[60px] border-emerald-100 shadow-2xl relative overflow-hidden">
             {/* Decorative Background for Empty State */}
             <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-50 rounded-full blur-[80px]" />
             
             <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-50 rounded-2xl md:rounded-[40px] flex items-center justify-center mb-6 md:mb-10 rotate-12 shadow-inner border border-emerald-100 group hover:rotate-0 transition-transform duration-500">
                <Leaf className="w-12 h-12 md:w-16 md:h-16 text-emerald-400" />
             </div>
             <h3 className="text-2xl md:text-4xl font-black mb-4 tracking-tighter">Your field journal is waiting.</h3>
             <p className="text-neutral-500 text-sm md:text-lg font-medium mb-8 md:mb-12 max-w-md mx-auto leading-relaxed italic">
               "Healing takes time, but monitoring makes it manageable. Start tracking your first patient to see progress in real-time."
             </p>
             <button className="w-full sm:w-auto px-10 py-5 bg-neutral-900 text-white rounded-2xl md:rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-neutral-900/20 btn-press">
                Begin Recovery Process
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
