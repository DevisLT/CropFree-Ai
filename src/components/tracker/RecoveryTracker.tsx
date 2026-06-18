import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Search, Calendar, ChevronRight, TrendingUp, AlertCircle, CheckCircle2, Trash2, ArrowLeft, CheckCircle, Camera, RefreshCcw, X, ShieldCheck, Activity } from "lucide-react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { format } from "date-fns";
import { OperationType, handleFirestoreError } from "../../lib/errorHandlers";
import toast from "react-hot-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { aiService } from "../../services/aiService";

export default function RecoveryTracker() {
  const { t, locale, isRTL } = useLanguage();
  const [crops, setCrops] = useState<any[]>([]);

  const getTranslatedStatus = (statusString: string) => {
    const s = statusString ? statusString.toLowerCase() : "";
    if (s === "validating" || s === "isuzuma") return t("status_validating");
    if (s === "in recovery" || s === "gukira" || s === "birimo kuvurwa") return t("status_in_recovery");
    if (s === "diagnosed" || s === "yapimwe") return t("status_diagnosed");
    if (s === "recovered" || s === "yakize") return t("status_recovered");
    if (s === "inspecting" || s === "irakurikiranwa") return t("status_inspecting");
    return statusString;
  };
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.disease.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleDelete = async (id: string | null) => {
    if (!id) return;
    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, "crops", id));
      toast.success(t("toast_crop_removed_tracker") || "Crop removed from tracker.");
      setCrops(prev => prev.filter(c => c.id !== id));
      if (selectedCrop?.id === id) setSelectedCrop(null);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error(t("toast_crop_delete_failed") || "Failed to delete crop record. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleStep = async (cropId: string, stepIndex: number) => {
    const crop = crops.find(c => c.id === cropId);
    if (!crop || isUpdatingStep !== null) return;

    if (stepIndex > 0 && !crop.recoverySteps[stepIndex - 1].completed) {
      toast.error(t("toast_complete_previous") || "Please complete the previous treatment step first.");
      return;
    }

    if (crop.recoverySteps[stepIndex].completed && stepIndex < crop.recoverySteps.length - 1 && crop.recoverySteps[stepIndex + 1].completed) {
      toast.error(t("toast_cannot_undo") || "Cannot undo this step because later steps are already completed.");
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
    const status = progress === 100 ? "Validating" : progress > 0 ? "In Recovery" : "Diagnosed";

    try {
      await updateDoc(doc(db, "crops", cropId), {
        recoverySteps: newSteps,
        progress,
        status,
        updatedAt: serverTimestamp()
      });
      
      setLastSaved(new Date());
      setCrops(prev => prev.map(c => c.id === cropId ? { ...c, recoverySteps: newSteps, progress, status } : c));
      if (selectedCrop?.id === cropId) {
        setSelectedCrop({ ...selectedCrop, recoverySteps: newSteps, progress, status });
      }
      
      if (isCompleting) {
        toast.success(t("toast_step_completed") || "Treatment step completed successfully.");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("toast_failed_update_step") || "Failed to update step.");
    } finally {
      setIsUpdatingStep(null);
    }
  };

  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedBase64);
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleRevalidate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCrop) return;

    setIsRevalidating(true);
    setRevalidationResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const originalBase64 = reader.result as string;
      const base64 = await compressImage(originalBase64);
      try {
        const diagnosis = await aiService.diagnoseCrop(base64, "image/jpeg", locale);
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
            progress: 100,
            updatedAt: serverTimestamp()
          });
          toast.success(t("toast_recovery_confirmed") || "Great news! Plant recovery confirmed.");
        } else {
          toast.error(t("toast_disease_remains") || "Notice: Plant shows signs of disease. Keep following treatment guide.");
        }

        fetchCrops();
      } catch (error) {
        console.error(error);
        toast.error(t("toast_verification_error") || "Verification process error. Please try again.");
      } finally {
        setIsRevalidating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-6 text-left">
      <div className="w-24 h-1 bg-brand/10 rounded-full overflow-hidden">
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-1/2 h-full bg-brand"
        />
      </div>
      <p className="font-semibold text-slate-505 text-xs">
        {t("loading_crop_tracker") || "Loading crop tracker..."}
      </p>
    </div>
  );

  if (selectedCrop) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4 px-2 font-sans text-left">
        <button 
          onClick={() => { setSelectedCrop(null); setRevalidationResult(null); }}
          type="button"
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-wider text-[10px] transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          {t('back_to_list')}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-soft border border-[#EAEFED]">
               <img src={selectedCrop.imageUrl} className="w-full h-full object-cover" alt={selectedCrop.name} referrerPolicy="no-referrer" />
               <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8FBFA8] mb-1">{t('active_treatment_plan')}</span>
                  <h3 className="text-lg font-bold truncate">{selectedCrop.name}</h3>
               </div>
            </div>

            <div className="premium-card p-5 rounded-xl bg-white border border-[#EAEFED] shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t('crop_diagnosis') || "Crop Diagnosis"}</span>
              <p className="text-sm font-bold text-slate-900 leading-normal mb-1">{selectedCrop.disease}</p>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wide">
                {t('tracked_since') || "Tracked since "} {format(new Date(selectedCrop.createdAt.toDate()), "MMM dd, yyyy")}
              </span>
            </div>

            <div className="premium-card p-5 rounded-xl bg-white border border-[#EAEFED] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
               <div>
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">{t('recovery_progress_label')}</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-3xl font-extrabold text-brand leading-none">{selectedCrop.progress}</span>
                   <span className="text-xs font-bold text-slate-400">%</span>
                 </div>
               </div>
               <div className="w-full sm:w-[50%] space-y-2">
                 <div className="w-full h-2 bg-slate-150 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${selectedCrop.progress}%` }}
                       className="h-full bg-brand rounded-full transition-all duration-1000"
                     />
                 </div>
                 <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider text-right">
                    {selectedCrop.status === 'Recovered' || selectedCrop.status === 'Yakize' 
                      ? t('plant_fully_cured') 
                      : t('keep_completing_steps')}
                 </p>
               </div>
            </div>

            {selectedCrop.progress === 100 && selectedCrop.status !== 'Recovered' && selectedCrop.status !== 'Yakize' && (
              <div className="premium-card p-5 rounded-xl bg-white text-slate-900 border border-brand/20 shadow-soft relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4 text-brand">
                     <AlertCircle className="w-5 h-5" />
                     <span className="text-[10px] font-bold uppercase tracking-wider">{t('health_check_needed')}</span>
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-2">
                    {t('check_if_crop_cured')}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">
                     {t('check_crop_cured_desc')}
                  </p>
                  
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleRevalidate} />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRevalidating}
                    type="button"
                    className="w-full py-2 bg-brand text-white rounded-lg font-semibold text-xs transition-colors hover:bg-brand-deep flex items-center justify-center gap-2"
                  >
                    {isRevalidating ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-4 h-4" />}
                    {t('upload_health_check_btn')}
                  </button>

                  {revalidationResult && (
                    <motion.div 
                     initial={{ opacity: 0, y: 15 }}
                     animate={{ opacity: 1, y: 0 }}
                     className={`mt-4 p-3 rounded-lg border shadow-soft ${revalidationResult.isHealthy ? 'bg-brand/5 border-brand/10' : 'bg-rose-50 border-rose-100'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                         {revalidationResult.isHealthy ? (
                           <CheckCircle className="w-4 h-4 text-brand" />
                         ) : (
                           <AlertCircle className="w-4 h-4 text-rose-500" />
                         )}
                         <p className="text-xs font-bold text-slate-900 capitalize">
                           {revalidationResult.isHealthy ? t('verified_healthy') : t('infection_remains')}
                         </p>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500 leading-normal">
                         {revalidationResult.explanation}
                      </p>
                    </motion.div>
                  )}
              </div>
            )}
          </div>

          {/* Recovery Checklist list */}
          <div className="space-y-4">
              <div className="premium-card p-5 bg-white border border-[#EAEFED] rounded-xl shadow-soft">
                 <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t('treatment_plan_hub')}
                    </span>
                    <h3 className="text-sm font-bold text-slate-950 uppercase tracking-tight">{t('curing_checklist_title')}</h3>
                 </div>
    
                 <div className="space-y-3">
                   {selectedCrop.recoverySteps?.map((step: any, i: number) => {
                     const isLocked = i > 0 && !selectedCrop.recoverySteps[i - 1].completed;
                     const isNext = i === 0 || (selectedCrop.recoverySteps[i - 1].completed && !step.completed);
                     
                     return (
                       <div 
                         key={i}
                         onClick={() => !isLocked && toggleStep(selectedCrop.id, i)}
                         className={`flex gap-3 p-3 rounded-lg border transition-all relative overflow-hidden ${
                           step.completed 
                           ? "bg-slate-50 border-slate-100 opacity-60 cursor-pointer" 
                           : isLocked
                           ? "bg-white border-slate-100 opacity-40 cursor-not-allowed"
                           : isNext
                           ? "bg-white border-brand shadow-soft cursor-pointer"
                           : "bg-white border-[#EAEFED] cursor-pointer"
                         }`}
                       >
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
                           step.completed 
                             ? "bg-slate-100 text-slate-400 border-slate-200" 
                             : isLocked 
                             ? "bg-slate-50 text-slate-305 border-slate-155" 
                             : isNext 
                             ? "bg-brand text-white border-white animate-pulse" 
                             : "bg-white text-slate-50D border-slate-200"
                         }`}>
                           {isUpdatingStep === i ? (
                             <RefreshCcw className="w-3 h-3 animate-spin" />
                           ) : step.completed ? (
                             <CheckCircle2 className="w-3.5 h-3.5" />
                           ) : (
                             <span>{i + 1}</span>
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex flex-wrap items-center gap-2">
                             <p className={`text-xs font-bold leading-normal ${step.completed ? 'text-slate-450 line-through' : 'text-slate-800'}`}>
                                {step.text}
                             </p>
                             {step.type && (
                               <span className={`text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                                 step.type === 'practice' ? 'bg-[#C8A96B]/5 text-[#C8A96B] border-[#C8A96B]/10' : 'bg-brand/5 text-brand border-brand/10'
                               }`}>
                                 {step.type === 'practice' ? t('checklist_badge_tip') : t('checklist_badge_task')}
                               </span>
                             )}
                           </div>
                           {isNext && !step.completed && (
                             <p className="text-[9px] font-bold text-brand uppercase tracking-wider mt-1 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> {t('next_to_accomplish')}
                             </p>
                           )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
              </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 px-2 font-sans text-left">
      <header className="space-y-1 mb-2">
         <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
           {t('agriculture_progress')}
         </span>
         <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t('active_recovery_tracker')}</h2>
         <p className="text-sm text-slate-500 font-medium">
           {t('tracker_intro_desc')}
         </p>
      </header>

      {/* Search Input */}
      <div className="relative max-w-md">
         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
         </div>
         <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder') || "Search crop or disease name..."}
            className="block w-full pl-9 pr-8 py-2 bg-white border border-[#EAEFED] rounded-lg text-sm text-slate-950 focus:ring-1 focus:ring-brand focus:border-brand transition-all shadow-soft"
         />
         {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
         )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.length > 0 ? filteredCrops.map((crop, i) => (
          <motion.div 
            key={crop.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            onClick={() => setSelectedCrop(crop)}
            className="premium-card p-4 bg-white border border-[#EAEFED] rounded-xl shadow-soft cursor-pointer flex flex-col justify-between group relative text-left"
          >
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4 border border-slate-105 group">
                 <img src={crop.imageUrl} className="w-full h-full object-cover" alt={crop.name} referrerPolicy="no-referrer" />
                 <div className="absolute top-2.5 left-2.5">
                    <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-white border border-[#EAEFED] text-slate-705 flex items-center gap-1.5 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                      {getTranslatedStatus(crop.status)}
                    </div>
                 </div>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setConfirmDeleteId(crop.id);
                   }}
                   type="button"
                   className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/95 text-slate-400 hover:text-rose-500 border border-[#EAEFED] rounded-md flex items-center justify-center transition-colors shadow-sm"
                 >
                   <Trash2 className="w-3.5 h-3.5" />
                 </button>
              </div>
              
              <AnimatePresence>
                 {confirmDeleteId === crop.id && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute inset-0 z-50 bg-[#081C15]/95 rounded-xl flex flex-col items-center justify-center p-4 text-center text-white"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <AlertCircle className="w-10 h-10 text-rose-500 mb-3 animate-pulse" />
                     <h4 className="font-bold text-sm mb-1">{t('delete_tracker_confirm')}</h4>
                     <p className="text-[10px] text-white/70 font-semibold mb-4 uppercase tracking-wide">{t('cannot_be_undone')}</p>
                     
                     <div className="flex gap-2 w-full justify-center">
                        <button 
                          onClick={() => handleDelete(crop.id)}
                          disabled={isDeleting === crop.id}
                          type="button"
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded text-[10px] font-bold uppercase tracking-wider"
                        >
                          {isDeleting === crop.id ? t('deleting') : t('delete_btn')}
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(null)}
                          type="button"
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold uppercase tracking-wider"
                        >
                          {t('cancel')}
                        </button>
                     </div>
                   </motion.div>
                 )}
              </AnimatePresence>
              
              <div className="space-y-1 mb-4">
                 <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors truncate">{crop.name}</h4>
                 <p className="text-[10.5px] font-semibold text-slate-400 block truncate">{crop.disease}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                 <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span>{t('restoration_label')}</span>
                    <span>{crop.progress}%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${crop.progress}%` }}
                      className="h-full rounded-full bg-brand"
                    />
                 </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EAEFED] flex items-center justify-between">
               <span className="text-[9px] font-semibold text-slate-400">
                 {t('saved_label_date') || "Saved"} {format(crop.createdAt.toDate(), "MMM dd, yyyy")}
               </span>
               <div className="flex items-center gap-1 text-[10px] font-bold text-brand group-hover:underline">
                  {t('view_tasks_link')} <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
               </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-12 text-center border-dashed border border-slate-250 bg-white rounded-xl">
             <div className="w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center rounded-lg mx-auto mb-3">
                <Leaf className="w-5 h-5 text-brand" />
              </div>
             <h4 className="text-base font-bold mb-1 text-slate-900">{t('tracker_empty_title')}</h4>
             <p className="text-slate-505 text-xs font-semibold max-w-xs mx-auto mb-4 leading-normal">
               {t('tracker_empty_desc')}
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
