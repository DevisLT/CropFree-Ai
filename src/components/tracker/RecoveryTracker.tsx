import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Plus, Search, Calendar, ChevronRight, TrendingUp, AlertCircle, CheckCircle2, Trash2, ArrowLeft, CheckCircle, Camera, RefreshCcw, X, ShieldCheck } from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { format } from "date-fns";
import { OperationType, handleFirestoreError } from "../../lib/errorHandlers";
import toast from "react-hot-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { aiService } from "../../services/aiService";

export default function RecoveryTracker() {
  const { t, locale } = useLanguage();
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [revalidationResult, setRevalidationResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUpdatingStep, setIsUpdatingStep] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleDelete = async (id: string | null) => {
    if (!id) return;
    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, "crops", id));
      toast.success(t("crop_removed_toast") || "Crop record purged from terminal.");
      setCrops(prev => prev.filter(c => c.id !== id));
      if (selectedCrop?.id === id) setSelectedCrop(null);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error("Protocol failure: Failed to purge record.");
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleStep = async (cropId: string, stepIndex: number) => {
    const crop = crops.find(c => c.id === cropId);
    if (!crop || isUpdatingStep !== null) return;

    // Sequential check: cannot complete step if previous isn't done
    if (stepIndex > 0 && !crop.recoverySteps[stepIndex - 1].completed) {
      toast.error(t("step_sequential_error") || "Biological sequence error: Complete previous phase first.");
      return;
    }

    // Cannot undo a step if the next one is already completed
    if (crop.recoverySteps[stepIndex].completed && stepIndex < crop.recoverySteps.length - 1 && crop.recoverySteps[stepIndex + 1].completed) {
      toast.error(t("step_undo_error") || "Cannot revert: Dependent subsequent phases are already active.");
      return;
    }

    setIsUpdatingStep(stepIndex);
    const newSteps = [...crop.recoverySteps];
    const isCompleting = !newSteps[stepIndex].completed;
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      completed: isCompleting,
      completedAt: isCompleting ? new Date().toISOString() : null
    };

    const completedCount = newSteps.filter(s => s.completed).length;
    const progress = Math.round((completedCount / newSteps.length) * 100);
    const status = progress === 100 ? "Ready for Validation" : progress > 0 ? "Improving" : "Inspecting";

    try {
      await updateDoc(doc(db, "crops", cropId), {
        recoverySteps: newSteps,
        progress,
        status,
        updatedAt: serverTimestamp()
      });
      
      setLastSaved(new Date());
      // Update local state
      setCrops(prev => prev.map(c => c.id === cropId ? { ...c, recoverySteps: newSteps, progress, status } : c));
      if (selectedCrop?.id === cropId) {
        setSelectedCrop({ ...selectedCrop, recoverySteps: newSteps, progress, status });
      }
      
      if (isCompleting) {
        toast.success(t("step_completed_toast") || "Molecular protocol phase documented.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Telemetry sync failed.");
    } finally {
      setIsUpdatingStep(null);
    }
  };

  const handleRevalidate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCrop) return;

    setIsRevalidating(true);
    setRevalidationResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const diagnosis = await aiService.diagnoseCrop(base64, "image/jpeg", locale);
        
        // Logical check: if same disease is found with high/medium severity, it's still infected
        const isHealthy = diagnosis.severity === "Low" || diagnosis.mostLikelyDiagnosis.toLowerCase().includes("healthy");
        
        setRevalidationResult({
          isHealthy,
          diagnosis: diagnosis.mostLikelyDiagnosis,
          severity: diagnosis.severity,
          explanation: diagnosis.explanation
        });

        if (isHealthy) {
          await updateDoc(doc(db, "crops", selectedCrop.id), {
            status: "Recovered",
            updatedAt: serverTimestamp()
          });
          toast.success(t("recovery_confirmed") || "Great news! Your crop is back to health.");
        } else {
          toast.error(t("recovery_still_infected") || "Crop still shows signs of infection.");
        }

        fetchCrops(); // Refresh listing
      } catch (error) {
        console.error(error);
        toast.error("Revalidation failed.");
      } finally {
        setIsRevalidating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Consulting records...</span>
    </div>
  );

  if (selectedCrop) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => { setSelectedCrop(null); setRevalidationResult(null); }}
          className="flex items-center gap-2 text-slate-500 hover:text-brand font-black uppercase tracking-widest text-xs transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t("back_to_list") || "Back to Journal"}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Crop Info Card */}
          <div className="space-y-8">
            <div className="relative aspect-video rounded-[48px] overflow-hidden shadow-2xl shadow-slate-900/20 group">
               <img src={selectedCrop.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt={selectedCrop.name} />
               <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent">
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{selectedCrop.name}</h2>
                  <p className="text-brand font-black uppercase tracking-[0.4em] text-[10px] flex items-center gap-3 mt-4">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full" /> {selectedCrop.disease}
                  </p>
               </div>
            </div>

            <div className="p-10 bg-white rounded-[48px] shadow-2xl shadow-brand/5 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex-1">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 block">Vitality Matrix</span>
                 <div className="flex items-baseline gap-4">
                   <h3 className="text-7xl font-black text-slate-950 tracking-tighter">{selectedCrop.progress}</h3>
                   <span className="text-xl font-black text-slate-300">%</span>
                 </div>
               </div>
               <div className="w-full md:w-2/3 space-y-4">
                 <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedCrop.progress}%` }}
                      className="h-full bg-brand rounded-full shadow-[0_0_20px_rgba(5,150,105,0.4)] transition-all duration-1000"
                    />
                 </div>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-right">
                    {selectedCrop.status === 'Recovered' ? "Life force restored." : selectedCrop.progress > 0 ? "Biological improvement detected." : "Infection parameters established."}
                 </p>
               </div>
            </div>

            {selectedCrop.progress === 100 && selectedCrop.status !== 'Recovered' && (
              <div className="p-10 bg-slate-950 rounded-[48px] text-white shadow-2xl relative overflow-hidden group border-none">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-[100px]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-2 block">Resolution</span>
                 <h4 className="text-3xl font-black mb-6 tracking-tighter">Final Validation Protocol</h4>
                 <p className="text-slate-400 text-base mb-10 leading-relaxed max-w-md">
                    "System has logged all recovery milestones. An ultra-high resolution scan is required to confirm full biological eradication of the pathogen."
                 </p>
                 
                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleRevalidate} />
                 
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isRevalidating}
                   className="w-full py-6 bg-white text-slate-950 rounded-[28px] font-black shadow-2xl flex items-center justify-center gap-4 group/btn hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                 >
                   {isRevalidating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Camera className="w-6 h-6 text-brand" />}
                   Initialize Verification
                 </button>

                 {revalidationResult && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-6 rounded-3xl border ${revalidationResult.isHealthy ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}
                   >
                     <div className="flex items-center gap-3 mb-2">
                        {revalidationResult.isHealthy ? <CheckCircle className="text-brand w-6 h-6" /> : <AlertCircle className="text-rose-500 w-6 h-6" />}
                        <p className="font-black text-sm uppercase tracking-widest">{revalidationResult.isHealthy ? "Healthy" : "Infection Detected"}</p>
                     </div>
                     <p className="text-xs font-bold text-slate-300 opacity-80">
                        {revalidationResult.explanation}
                     </p>
                   </motion.div>
                 )}
              </div>
            )}
          </div>

          {/* Recovery Checklist */}
          <div className="space-y-6">
             <div className="bg-slate-50 p-8 md:p-12 rounded-[48px] border border-slate-100 flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <AnimatePresence>
                    {lastSaved && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-100"
                      >
                        <ShieldCheck className="w-3 h-3" /> Encrypted & Synced
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mb-10">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 block">Healing Protocol</span>
                   <h3 className="text-3xl font-black text-slate-950 tracking-tighter">Bio-Directives.</h3>
                </div>
 
                <div className="space-y-4 flex-1">
                  {selectedCrop.recoverySteps?.map((step: any, i: number) => {
                    const isLocked = i > 0 && !selectedCrop.recoverySteps[i - 1].completed;
                    const isNext = i === 0 || (selectedCrop.recoverySteps[i - 1].completed && !step.completed);
                    
                    return (
                      <div 
                        key={i}
                        onClick={() => !isLocked && toggleStep(selectedCrop.id, i)}
                        className={`group flex items-start gap-5 p-6 rounded-[32px] border transition-all duration-500 scale-100 ${
                          step.completed 
                          ? "bg-slate-950 border-slate-950 text-slate-500" 
                          : isLocked
                          ? "bg-slate-100/50 border-slate-100 opacity-40 grayscale cursor-not-allowed"
                          : isNext
                          ? "bg-white border-brand shadow-xl shadow-brand/10 ring-4 ring-brand/5 cursor-pointer hover:scale-[1.02]"
                          : "bg-white border-slate-100 hover:border-slate-200 cursor-pointer"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-all duration-500 ${
                          step.completed ? "bg-brand text-white shadow-lg shadow-brand/20" : isLocked ? "bg-slate-200 text-slate-400" : isNext ? "bg-brand/10 text-brand animate-pulse" : "bg-slate-50 text-slate-400"
                        }`}>
                          {isUpdatingStep === i ? (
                            <RefreshCcw className="w-5 h-5 animate-spin" />
                          ) : step.completed ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <span className="">{i + 1}</span>
                          )}
                        </div>
                        <div className="pt-2 flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <p className={`text-base font-black leading-tight tracking-tight ${step.completed ? 'text-slate-400 line-through decoration-brand decoration-2' : 'text-slate-950'}`}>
                                {step.text}
                             </p>
                             {step.type && (
                               <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${step.type === 'practice' ? 'bg-indigo-100 text-indigo-600' : 'bg-brand/10 text-brand'}`}>
                                 {step.type === 'practice' ? 'Protocol' : 'Directive'}
                               </span>
                             )}
                           </div>
                           {step.completed && (
                             <p className="text-[9px] font-black text-brand uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                               <div className="w-1 h-1 bg-brand rounded-full" /> {format(new Date(step.completedAt), "MMM dd, hh:mm a")}
                             </p>
                           )}
                           {isNext && !step.completed && (
                             <p className="text-[9px] font-black text-brand uppercase tracking-[0.2em] mt-2">Active Phase: Implementation required</p>
                           )}
                           {isLocked && (
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Locked: Sequential dependency</p>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
 
                <div className="mt-12 p-8 bg-slate-950 text-white rounded-[32px] flex items-center gap-6 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-[40px] pointer-events-none" />
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 relative z-10">
                      <TrendingUp className="w-6 h-6 text-brand" />
                   </div>
                   <div className="relative z-10">
                      <p className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-1">Telemetry Status</p>
                      <p className="text-sm font-black text-white">
                        {selectedCrop.status === 'Recovered' ? "Life force successfully restored." : selectedCrop.progress > 0 ? "Biological improvement detected." : "Strict linear progression enforced for maximum efficacy."}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
         <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-2 block">Botanical Monitoring</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight text-slate-950">Recovery Tracker.</h2>
            <p className="text-slate-500 text-sm md:text-lg font-medium max-w-lg mt-2">
              Every leaf counts. Monitor the healing journey of your affected crops with precision and heart.
            </p>
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {crops.length > 0 ? crops.map((crop, i) => (
          <motion.div 
            key={crop.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            onClick={() => setSelectedCrop(crop)}
            className={`premium-card group border-none bg-white p-4 rounded-[48px] shadow-2xl shadow-slate-900/5 transition-all duration-700 cursor-pointer flex flex-col hover:shadow-brand/20 ${
              i % 3 === 1 ? 'md:translate-y-12' : ''
            }`}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] mb-8">
               <img src={crop.imageUrl} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={crop.name} referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <div className="absolute top-6 left-6">
                  <div className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-xl shadow-2xl border border-white/20 flex items-center gap-3 ${
                    crop.status === 'Recovered' ? 'bg-brand/90 text-white' : 
                    crop.status === 'Ready for Validation' ? 'bg-amber-500/90 text-white' : 
                    'bg-slate-950/90 text-white'
                  }`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    {crop.status}
                  </div>
               </div>
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   setConfirmDeleteId(crop.id);
                 }}
                 className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-2xl"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
            </div>
            
            <AnimatePresence>
               {confirmDeleteId === crop.id && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md rounded-[36px] flex flex-col items-center justify-center p-8 text-center"
                   onClick={(e) => e.stopPropagation()}
                 >
                   <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                   <h5 className="text-white font-black text-xl tracking-tighter mb-2">Purge Record?</h5>
                   <p className="text-slate-400 text-[10px] font-medium mb-8 leading-relaxed uppercase tracking-widest">Permanent biological erasure.</p>
                   <div className="flex gap-3 w-full">
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all"
                      >
                        Abort
                      </button>
                      <button 
                        onClick={() => handleDelete(crop.id)}
                        disabled={isDeleting === crop.id}
                        className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/40"
                      >
                        {isDeleting === crop.id ? "Purging..." : "Purge"}
                      </button>
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>
            
            <div className="px-6 pb-10 flex-1 flex flex-col justify-between">
               <div>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-3xl font-black text-slate-950 tracking-tighter">{crop.name}</h4>
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-brand transition-colors">
                      <TrendingUp className={`w-5 h-5 ${crop.progress > 50 ? 'text-brand group-hover:text-white' : 'text-slate-300 group-hover:text-white'}`} />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-10">
                     <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> {crop.disease}
                  </p>
                  
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Growth Matrix</span>
                        <span className="text-2xl font-black text-slate-950">{crop.progress}%</span>
                     </div>
                     <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-100">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${crop.progress}%` }}
                          className="h-full rounded-full transition-all duration-1000 bg-brand shadow-[0_0_12px_rgba(5,150,105,0.3)]"
                        />
                     </div>
                  </div>
               </div>

               <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-50 rounded-[20px] flex items-center justify-center border border-slate-100">
                       <Calendar className="w-5 h-5 text-slate-300" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Diagnosed</span>
                        <span className="text-xs font-black text-slate-950 uppercase">{format(crop.createdAt.toDate(), "MMM dd, yyyy")}</span>
                     </div>
                  </div>
                  <button className="w-14 h-14 rounded-[24px] bg-slate-950 text-white flex items-center justify-center hover:bg-brand active:scale-90 transition-all shadow-2xl shadow-slate-950/20">
                     <ChevronRight className="w-6 h-6" />
                  </button>
               </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full glass p-10 md:p-24 text-center flex flex-col items-center rounded-[32px] md:rounded-[60px] border-emerald-100 shadow-2xl relative overflow-hidden">
             <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-50 rounded-full blur-[80px]" />
             <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-2xl md:rounded-[40px] flex items-center justify-center mb-6 md:mb-10 rotate-12 shadow-inner border border-slate-100 group hover:rotate-0 transition-transform duration-500">
                <Leaf className="w-12 h-12 md:w-16 md:h-16 text-brand" />
             </div>
             <h3 className="text-2xl md:text-4xl font-black mb-4 tracking-tighter text-slate-950">Field journal empty.</h3>
             <p className="text-slate-500 text-sm md:text-lg font-medium mb-8 md:mb-12 max-w-md mx-auto leading-relaxed">
               "Begin monitoring an infected crop to see its healing journey recorded here."
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
