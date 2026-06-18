import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Shield, Zap, CloudOff, ArrowRight, CheckCircle, Sparkles, Globe, Activity, Camera } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useLanguage, supportedLanguages } from "../../contexts/LanguageContext";

export default function Onboarding() {
  const { locale, setLocale, t } = useLanguage();
  const [step, setStep] = useState(0);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const next = () => setStep(s => Math.min(s + 1, 3));

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 md:p-12 relative overflow-hidden bg-white text-slate-900 font-sans">
      {/* Floating Language Selector */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
        <div className="relative flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-1.5 shadow-soft rounded-lg">
          <Globe className="w-3.5 h-3.5 text-brand" />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as any)}
            className="bg-transparent border-none outline-none text-slate-850 text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code} className="text-slate-800 font-bold bg-white normal-case">
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2664&auto=format&fit=crop" 
          className="w-full h-full object-cover"
          alt="Agriculture Field"
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent md:bg-gradient-to-r md:from-white md:via-white/70 md:to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content - Hero Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="hidden lg:block space-y-10 text-left"
        >
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-brand rounded-none flex items-center justify-center shadow-2xl shadow-brand/20 animate-pulse">
                <Leaf className="text-white w-10 h-10" />
             </div>
             <div>
                <h1 className="text-5xl font-black text-slate-950 tracking-tighter">{t('onboarding_logo_sub') || "CropFree."}</h1>
                <p className="text-brand font-black uppercase tracking-[0.3em] text-[10px]">{t('onboarding_logo_sub_desc') || "Precision Intelligence"}</p>
             </div>
          </div>
          <h2 className="text-6xl font-black text-slate-950 leading-[1.05] tracking-tighter max-w-lg text-balance">
            {t('onboarding_hero_title') || "Empowering your Harvest."}
          </h2>
          <p className="text-slate-600 text-lg max-w-md leading-relaxed font-semibold">
            {t('onboarding_hero_desc') || "Instantly diagnose diseases, track recovery metrics, and protect your yields with our advanced AI companion."}
          </p>
          <div className="flex items-center gap-10 pt-4">
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-950">{t('onboarding_stat_accuracy') || "98%"}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('onboarding_stat_accuracy_lbl') || "Accuracy Rate"}</span>
             </div>
             <div className="w-px h-12 bg-slate-200" />
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-950">{t('onboarding_stat_support') || "24/7"}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('onboarding_stat_support_lbl') || "Global Support"}</span>
             </div>
          </div>
        </motion.div>

        {/* Right Content - Onboarding Card */}
        <AnimatePresence mode="wait">
          {step < 3 ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              className="w-full bg-white/95 backdrop-blur-2xl p-8 md:p-14 text-center md:text-left rounded-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white"
            >
              <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
                <div className="w-10 h-10 bg-brand rounded-none flex items-center justify-center">
                  <Leaf className="text-white w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black text-slate-950 tracking-tighter">{t('onboarding_logo_sub') || "CropFree."}</h1>
              </div>

              {step === 0 && (
                <div className="space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-4 block">{t('onboarding_step1_label') || "01 / The Mission"}</span>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none">{t('onboarding_step1_title') || "Guardians of the Soil."}</h2>
                  <p className="text-slate-500 text-lg font-semibold leading-relaxed">
                    {t('onboarding_step1_desc') || '"We bridge the gap between ancient agricultural wisdom and next-generation diagnostic tools."'}
                  </p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-4 block">{t('onboarding_step2_label') || "02 / Innovation"}</span>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none">{t('onboarding_step2_title') || "Guided Restoration."}</h2>
                  <div className="grid grid-cols-1 gap-4 pt-4 text-left">
                     {[
                       { icon: Camera, title: t('onboarding_step2_scan_lbl') || "Diagnostic Scan", sub: t('onboarding_step2_scan_desc') || "Identify symptoms in 500ms" },
                       { icon: Activity, title: t('onboarding_step2_journal_lbl') || "Recovery Journal", sub: t('onboarding_step2_journal_desc') || "Step-by-step healing protocols" }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-5 p-5 bg-slate-50 rounded-none border border-slate-100 group hover:border-brand/30 transition-colors">
                           <div className="w-14 h-14 bg-white rounded-none flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <item.icon className="w-7 h-7 text-brand" />
                           </div>
                           <div>
                             <p className="font-black text-slate-950 leading-none mb-1 text-lg">{item.title}</p>
                             <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">{item.sub}</p>
                           </div>
                       </div>
                     ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-4 block">{t('onboarding_step3_label') || "03 / Reliability"}</span>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none">{t('onboarding_step3_title') || "Global Standard."}</h2>
                  <div className="p-8 bg-slate-950 rounded-none text-white relative overflow-hidden group shadow-2xl text-left">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-none blur-3xl group-hover:scale-125 transition-transform" />
                     <Sparkles className="text-brand w-12 h-12 mb-4" />
                     <p className="text-xl font-black mb-2">{t('onboarding_step3_eco_lbl') || "Sustainable Ecosystems"}</p>
                     <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">{t('onboarding_step3_eco_desc') || "Helping farmers protect biodiversity while maximizing output safely."}</p>
                  </div>
                </div>
              )}

              <button
                onClick={next}
                type="button"
                className="mt-12 w-full py-6 bg-slate-950 text-white rounded-none font-black shadow-2xl shadow-slate-950/20 flex items-center justify-center gap-4 hover:bg-brand hover:text-slate-950 transition-all group btn-press text-xs uppercase tracking-[0.2em]"
              >
                {t('onboarding_continue_btn') || "Continue Journey"} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform text-brand" />
              </button>

              <div className="mt-10 flex justify-between items-center px-4">
                  <div className="flex gap-2">
                     {[0, 1, 2].map(i => (
                       <div key={i} className={`h-1.5 rounded-none transition-all duration-700 ${step === i ? "w-10 bg-brand" : "w-1.5 bg-slate-100"}`} />
                     ))}
                  </div>
                  <button type="button" onClick={() => setStep(3)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors">{t('onboarding_skip_btn') || "Skip"}</button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white/95 backdrop-blur-2xl p-8 md:p-16 text-center rounded-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-none flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100 rotate-3 animate-bounce">
                 <Shield className="w-10 h-10 text-brand" />
              </div>
              <h2 className="text-5xl font-black text-slate-950 mb-4 tracking-tighter">{t('onboarding_secure_field_lbl') || "Secure Field."}</h2>
              <p className="text-slate-500 text-lg font-semibold mb-12 leading-relaxed max-w-xs mx-auto">
                {t('onboarding_secure_field_desc') || "Verify your identity to unlock personalized monitoring and premium access."}
              </p>
              
              <button
                type="button"
                onClick={handleLogin}
                className="w-full py-5 bg-white border-2 border-slate-150 rounded-none font-black text-slate-950 flex items-center justify-center gap-4 hover:border-brand transition-all mb-8 group btn-press shadow-xl"
              >
                <img src="https://www.google.com/favicon.ico" className="w-6 h-6 group-hover:scale-125 transition-transform" alt="Google" referrerPolicy="no-referrer" />
                {t('onboarding_google_signin') || "Sign in with Google"}
              </button>
              
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                <span>{t('onboarding_agreement_prefix')}<span className="text-slate-950 underline underline-offset-4 cursor-pointer">{t('onboarding_terms')}</span>{t('and')}<span className="text-slate-950 underline underline-offset-4 cursor-pointer">{t('onboarding_privacy')}</span>{t('onboarding_agreement_suffix')}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
