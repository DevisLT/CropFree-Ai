import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Camera, Search, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, RefreshCcw, Info, Activity, X } from "lucide-react";
import { aiService, CropDiagnosis } from "../../services/aiService";
import { db, auth } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { OperationType, handleFirestoreError } from "../../lib/errorHandlers";
import { useLanguage } from "../../contexts/LanguageContext";
import toast from "react-hot-toast";

interface CropDoctorProps {
  onNavigate?: (tab: string) => void;
}

export default function CropDoctor({ onNavigate }: CropDoctorProps) {
  const { t, locale } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CropDiagnosis | null>(null);
  const [showGuided, setShowGuided] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Str = reader.result as string;
      const compressedStr = await compressImage(base64Str);
      setImage(compressedStr);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const diagnosis = await aiService.diagnoseCrop(image, "image/jpeg", locale);
      setResult(diagnosis);
    } catch (error) {
      console.error(error);
      toast.error(t('analysis_failed') || "Oops, something went wrong with the AI analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveDiagnosisToHistory = async () => {
    if (!result || !image || isSaving) return;
    setIsSaving(true);
    const path = "diagnoses";
    try {
      await addDoc(collection(db, path), {
        ...result,
        userId: auth.currentUser?.uid,
        imageUrl: image,
        createdAt: serverTimestamp(),
      });
      toast.success(t("diagnosis_saved") || "Diagnosis saved to your history successfully.");
      setResult(null);
      setImage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path, auth);
    } finally {
      setIsSaving(false);
    }
  };

  const saveToTracker = async () => {
    if (!result || !image || isSaving) return;
    setIsSaving(true);
    
    const path = "crops";
    try {
      const defaultPractices = [
        t("default_practice_1"),
        t("default_practice_2"),
        t("default_practice_3"),
        t("default_practice_4"),
        t("default_practice_5")
      ];

      const recoverySteps = [
        ...result.recommendedActions.map(text => ({ text, type: "directive" })),
        ...defaultPractices.map(text => ({ text, type: "practice" }))
      ].map(step => ({
        ...step,
        completed: false,
        completedAt: null
      }));

      await addDoc(collection(db, path), {
        userId: auth.currentUser?.uid,
        name: result.cropName,
        disease: result.mostLikelyDiagnosis,
        imageUrl: image,
        status: "Inspecting",
        progress: 0,
        recoverySteps: recoverySteps,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      toast.success(t("crop_saved") || "Crop moved to your recovery tracker.");
      setResult(null);
      setImage(null);
      if (onNavigate) {
        onNavigate("tracker");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path, auth);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 relative min-h-[75vh] flex flex-col justify-center font-sans text-left">
      {!result && !isAnalyzing ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 w-full px-1"
        >
          {/* Header instructions */}
          <div className="text-center space-y-2 max-w-2xl mx-auto mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {t('crop_scan_diagnosis')}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {t('crop_scan_intro')}
            </p>
          </div>

          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`bg-white border-2 rounded-xl p-8 text-center relative transition-all shadow-soft leading-normal ${
              dragActive ? "border-brand bg-brand/5" : "border-dashed border-[#EAEFED]"
            }`}
          >
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={cameraInputRef} 
              onChange={handleImageUpload} 
            />
            
            {image ? (
              <div className="relative group mx-auto w-full max-w-md">
                <img src={image} className="max-h-[300px] sm:max-h-[360px] w-full mx-auto rounded-lg object-cover border border-[#EAEFED] shadow-soft" alt="Selected Preview" referrerPolicy="no-referrer" />
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => cameraInputRef.current?.click()} 
                    type="button"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> {t('take_new_card')}
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    type="button"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> {t('upload_different')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
                  {/* Take Photo Button */}
                  <button 
                    onClick={() => cameraInputRef.current?.click()}
                    type="button"
                    className="w-full sm:w-1/2 p-6 bg-slate-50 hover:bg-slate-100 border border-[#EAEFED] rounded-xl flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-brand/10 text-brand rounded-lg flex items-center justify-center mb-3">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 mb-1">{t('take_photo')}</span>
                    <span className="text-xs text-slate-400 font-medium">{t('use_camera')}</span>
                  </button>

                  {/* Upload Photo Button */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    className="w-full sm:w-1/2 p-6 bg-slate-50 hover:bg-slate-100 border border-[#EAEFED] rounded-xl flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-slate-200/50 text-slate-505 rounded-lg flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 mb-1">{t('upload_file')}</span>
                    <span className="text-xs text-slate-400 font-medium">{t('pick_picture')}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {t('drag_drop_text')}
                </p>
              </div>
            )}

            {image && (
              <div className="mt-8 max-w-md mx-auto">
                <button 
                  onClick={analyze}
                  type="button"
                  className="w-full py-3 bg-brand text-white rounded-lg font-semibold text-sm transition-colors hover:bg-brand-deep shadow-soft flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" /> {t('start_ai_analysis')}
                </button>
              </div>
            )}
          </div>
          
          {/* Diagnostic Tips Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-[#EAEFED] rounded-xl flex gap-4 shadow-soft">
               <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4" />
               </div>
               <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide mb-1">{t('photography_tips')}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{t('photography_tips_desc')}</p>
               </div>
            </div>
            <div className="p-5 bg-white border border-[#EAEFED] rounded-xl flex gap-4 shadow-soft">
               <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4" />
               </div>
               <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide mb-1">{t('precision_db')}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{t('precision_db_desc')}</p>
               </div>
            </div>
          </div>
        </motion.div>
      ) : isAnalyzing ? (
        <div className="bg-white border border-[#EAEFED] rounded-xl p-12 text-center flex flex-col items-center shadow-soft">
           <div className="w-40 h-40 relative mb-8 rounded-lg overflow-hidden border border-[#EAEFED]">
              <div className="absolute inset-0 bg-brand/5 animate-pulse" />
              {image && <img src={image} className="w-full h-full object-cover opacity-65" alt="Scanning preview" referrerPolicy="no-referrer" />}
              <div className="absolute inset-0 border-t-2 border-brand/40 animate-spin" />
           </div>
           
           <h3 className="text-xl font-bold mb-2 text-slate-950">{t('analyzing_tissue')}</h3>
           <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto leading-relaxed mb-6">
             {t('analyzing_tissue_desc')}
           </p>

           <div className="flex gap-1.5 justify-center">
             {[0, 1, 2].map(i => (
               <motion.div 
                 key={i}
                 animate={{ scale: [1, 1.3, 1], backgroundColor: ["#C2D1C9", "#1F6B52", "#C2D1C9"] }}
                 transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                 className="w-2.5 h-2.5 rounded-full"
               />
             ))}
           </div>
        </div>
      ) : result && (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 w-full px-1 text-left"
        >
          {/* Main Result Card */}
          <div className="bg-white border border-[#EAEFED] rounded-xl overflow-hidden shadow-soft">
            <div className={`p-6 border-b border-[#EAEFED] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              result.severity === 'Critical' ? 'bg-rose-50/20' : 'bg-brand/5'
            }`}>
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    result.severity === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-brand/10 text-brand border border-brand/20'
                  }`}>
                     {result.severity === 'Critical' ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">{t('diagnose_result')}</span>
                    <h3 className="text-xl font-bold text-slate-900 capitalize">{result.mostLikelyDiagnosis}</h3>
                  </div>
               </div>
               <div className="flex flex-col sm:items-end gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('ai_confidence_level')}: {result.confidenceLevel}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                    result.severity === 'High' || result.severity === 'Critical' 
                      ? 'bg-rose-100 text-rose-700 border-rose-200' 
                      : 'bg-brand/10 text-brand border-brand/20'
                  }`}>
                    {result.severity === 'Critical' 
                      ? t('severity_critical') 
                      : result.severity === 'High' 
                      ? t('severity_high') 
                      : result.severity === 'Moderate'
                      ? t('severity_moderate')
                      : t('severity_low')} {t('severity_label')}
                  </span>
               </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Interpretation explanation block */}
                <div className="p-4 bg-slate-50 border border-[#EAEFED] rounded-lg">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">{t('observations')}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                    "{result.interpretation}"
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('medical_analysis')}</h4>
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed text-left border-l-2 border-brand pl-3">
                    {result.explanation}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                   {/* Left columns symptoms and previews */}
                   <div className="space-y-6">
                     <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t('symptoms_found_leaves')}</h4>
                       <div className="space-y-2">
                           {result.observedSymptoms.map((s, i) => (
                             <div key={i} className="text-xs font-semibold text-slate-600 flex items-start gap-2.5 p-3 bg-slate-50 hover:bg-slate-100 transition-colors rounded-lg border border-slate-100">
                                <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" /> 
                                <span>{s}</span>
                             </div>
                           ))}
                       </div>
                     </div>
                     
                     <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t('other_conditions_considered')}</h4>
                       <div className="flex flex-wrap gap-2">
                         {result.possibleConditions.map((c, i) => (
                           <span key={i} className="px-2.5 py-1 bg-white border border-[#EAEFED] rounded text-xs font-semibold text-slate-750">
                             {c}
                           </span>
                         ))}
                       </div>
                     </div>
                   </div>

                   {/* Right columns treatments */}
                   <div className="bg-[#18211D] text-white rounded-xl p-5 border border-white/5 relative overflow-hidden flex flex-col justify-between">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-2xl pointer-events-none" />
                     <div className="relative z-10 space-y-4">
                       <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C8A96B]">{t('treatment_guide')}</h4>
                       <div className="space-y-3">
                           {result.recommendedActions.slice(0, 3).map((step, i) => (
                             <div key={i} className="flex gap-3 items-start">
                                <div className="w-5 h-5 bg-white/10 text-[#8FBFA8] rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 border border-white/5">
                                   {i + 1}
                                </div>
                                <p className="text-xs text-white/85 font-medium leading-relaxed">{step}</p>
                             </div>
                           ))}
                       </div>
                     </div>
                     
                     <div className="mt-6 flex flex-col gap-2 relative z-10">
                       <button 
                         onClick={() => setShowGuided(true)}
                         type="button"
                         className="w-full py-2 bg-white text-slate-950 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                       >
                         {t('read_action_details')} <ArrowRight className="w-3.5 h-3.5" />
                       </button>
                     </div>
                   </div>
                </div>
            </div>
            
            {/* Quick Action footer to move into Database / Trackers */}
            <div className="px-6 py-4 bg-slate-50 border-t border-[#EAEFED] flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                     <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{t('recovery_monitor_journal')}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{t('sync_plant_planner')}</p>
                  </div>
               </div>
               <button 
                 onClick={saveToTracker}
                 type="button"
                 className="w-full sm:w-auto px-5 py-2 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand-deep transition-colors"
               >
                 {t("start_monitoring")}
               </button>
            </div>
          </div>

          {/* New Diagnostic / Archive Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
               onClick={() => { setResult(null); setImage(null); }}
               type="button"
               className="py-4 bg-white/50 border border-dashed border-slate-300 hover:border-brand/50 hover:bg-white text-slate-500 hover:text-brand font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
               <RefreshCcw className="w-4 h-4 text-slate-400" /> {t('start_new_diagnosis')}
            </button>

            <button 
               onClick={saveDiagnosisToHistory}
               disabled={isSaving}
               type="button"
               className="py-4 bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-soft"
            >
               {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-brand" />} 
               {t('save_to_history')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Guided Treatment Flow Modal */}
      <AnimatePresence>
        {showGuided && result && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowGuided(false)}
               className="fixed inset-0 bg-[#081C15]/45 backdrop-blur-md"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="relative bg-white w-full max-w-lg rounded-xl shadow-premium overflow-hidden border border-[#EAEFED]"
            >
               <div className="p-6">
                 <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EAEFED]">
                   <div>
                     <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">{t('treatment_sequences')}</span>
                     <h3 className="text-base font-bold text-slate-950">{t('active_action_list')}</h3>
                   </div>
                   <button type="button" onClick={() => setShowGuided(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                     <X className="w-4 h-4" />
                   </button>
                 </div>
                 
                 <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1 text-left">
                   {result.recommendedActions.map((step, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="w-6 h-6 bg-brand/10 text-brand rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 border border-brand/5">
                           {i + 1}
                        </div>
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed pt-0.5">{step}</p>
                      </div>
                   ))}
                 </div>

                 <button 
                    onClick={() => setShowGuided(false)}
                    type="button"
                    className="w-full mt-6 py-2.5 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand-deep transition-colors"
                 >
                    {t('acknowledge_back')}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
