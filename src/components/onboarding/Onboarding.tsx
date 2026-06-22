import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Shield, Zap, CloudOff, ArrowRight, CheckCircle, Sparkles, Globe, Activity, Camera, Phone, Key, RefreshCw } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useLanguage, supportedLanguages } from "../../contexts/LanguageContext";
import toast from "react-hot-toast";

export default function Onboarding() {
  const { locale, setLocale, t } = useLanguage();
  const [step, setStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("+250");
  const [verificationCode, setVerificationCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Set up invisible reCAPTCHA verifier
  const initRecaptchaVerifier = () => {
    setErrorMsg("");
    try {
      if ((window as any).recaptchaVerifier) {
        return (window as any).recaptchaVerifier;
      }
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response: any) => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          setErrorMsg(t('recaptcha_expired') || "reCAPTCHA expired. Please request the code again.");
        }
      });
      (window as any).recaptchaVerifier = verifier;
      return verifier;
    } catch (error: any) {
      console.error("reCAPTCHA creation failed", error);
      setErrorMsg(t('recaptcha_failed') || "Failed to initialize security verifier.");
      return null;
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!phoneNumber || phoneNumber.trim() === "+" || phoneNumber.trim().length < 6) {
      setErrorMsg(t('phone_required') || "Please enter a valid phone number including country code (e.g., +250 788 000 000)");
      return;
    }
    
    setIsSendingCode(true);
    try {
      const verifier = initRecaptchaVerifier();
      if (!verifier) {
        setIsSendingCode(false);
        return;
      }
      
      const formattedNum = phoneNumber.trim();
      const result = await signInWithPhoneNumber(auth, formattedNum, verifier);
      setConfirmationResult(result);
      setSmsSent(true);
      toast.success(t('verification_sent') || "Verification code dispatched via SMS!");
    } catch (error: any) {
      console.error("SMS Dispatch failed", error);
      if (error.code === "auth/invalid-phone-number") {
        setErrorMsg(t('invalid_phone_format') || "The phone number format is invalid. Ensure you start with + followed by country code.");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMsg(t('too_many_sms_requests') || "Too many SMS requests. Please wait a moment or use test credentials.");
      } else {
        setErrorMsg(error.message || "Failed to dispatch SMS verification code.");
      }
      // Clean reCAPTCHA in case of failure so it can re-draw
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (clearErr) {
          console.warn("reCAPTCHA clear failed", clearErr);
        }
        (window as any).recaptchaVerifier = undefined;
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMsg(t('code_6_digits') || "SMS code must be exactly 6 digits.");
      return;
    }
    if (!confirmationResult) {
      setErrorMsg(t('no_confirmation_state') || "No active verification state. Please send the code again.");
      return;
    }

    setIsVerifyingCode(true);
    try {
      await confirmationResult.confirm(verificationCode.trim());
      toast.success(t('signin_success') || "Successfully verified! Logging into your dashboard...");
    } catch (error: any) {
      console.error("Verification confirmation failed", error);
      if (error.code === "auth/invalid-verification-code") {
        setErrorMsg(t('invalid_sms_code') || "The verification code is incorrect or expired.");
      } else {
        setErrorMsg(error.message || "Verification code matching failed.");
      }
    } finally {
      setIsVerifyingCode(false);
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
              className="w-full bg-white/95 backdrop-blur-2xl p-8 md:p-14 text-center rounded-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white space-y-6"
            >
              {/* Hidden reCAPTCHA anchor */}
              <div id="recaptcha-container" className="hidden"></div>

              <div className="w-16 h-16 bg-slate-50 rounded-none flex items-center justify-center mx-auto shadow-inner border border-slate-100 rotate-3">
                 <Shield className="w-8 h-8 text-brand animate-pulse" />
              </div>

              {!smsSent ? (
                <form onSubmit={handleSendCode} className="space-y-6 text-left">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">
                      {t('onboarding_secure_field_lbl') || "Secure Field."}
                    </h2>
                    <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                      {t('phone_auth_instructions') || "Enter your telephone number to receive an SMS verification code for instant dashboard access."}
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold leading-relaxed flex items-start gap-3">
                      <Shield className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">
                      {t('telephone_number') || "Telephone Number"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
                        <Phone className="w-4 h-4 text-brand" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setErrorMsg("");
                        }}
                        placeholder="+250 788 000 000"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none pl-11 pr-4 py-4 focus:ring-1 focus:ring-brand focus:border-brand font-mono text-base font-black outline-none transition-all"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                      {t('phone_format_hint') || "Standard international format starting with country prefix (e.g. +250 or +1)."}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingCode}
                    className="w-full py-5 bg-slate-950 text-white rounded-none font-black flex items-center justify-center gap-4 hover:bg-brand hover:text-slate-950 transition-all group disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-[11px]"
                  >
                    {isSendingCode ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Phone className="w-4 h-4 group-hover:scale-110 transition-transform text-brand" />
                    )}
                    {isSendingCode ? "Dispatching SMS..." : (t('send_sms_btn') || "Send Verification Code")}
                  </button>

                  {/* Dev Sandbox Guide */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-none text-left text-[11px] leading-relaxed select-all space-y-1">
                    <span className="font-extrabold text-slate-700 block text-[10px] uppercase tracking-wider">
                      💡 Developer Sandbox Access:
                    </span>
                    <p className="text-slate-500 font-semibold">
                      For instant local review inside the web sandbox, you can authenticate using our configured test lines:
                    </p>
                    <div className="font-mono mt-2 pt-2 border-t border-slate-200/60 flex justify-between text-slate-750 font-bold">
                      <span>Phone: <b className="text-brand font-black">+1 650-555-3434</b></span>
                      <span>Code: <b className="text-slate-950 font-black">123456</b></span>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-6 text-left">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">
                      {t('enter_sms_code') || "Enter Code."}
                    </h2>
                    <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                      {t('sms_sent_to') || "SMS code has been dispatched. Enter the 6-digit verification code sent to:"} <strong className="text-slate-950 font-bold block mt-1 font-mono">{phoneNumber}</strong>
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold leading-relaxed flex items-start gap-3">
                      <Shield className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">
                      {t('sms_code_label') || "6-Digit SMS Verification Code"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Key className="w-4 h-4 text-brand" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={verificationCode}
                        onChange={(e) => {
                          setVerificationCode(e.target.value.replace(/[^0-9]/g, ""));
                          setErrorMsg("");
                        }}
                        placeholder="123456"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none pl-11 pr-4 py-4 focus:ring-1 focus:ring-brand focus:border-brand font-mono text-center text-xl tracking-[0.5em] font-black outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isVerifyingCode}
                      className="w-full py-5 bg-slate-950 text-white hover:bg-brand hover:text-slate-950 transition-all font-black flex items-center justify-center gap-4 group disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-[11px]"
                    >
                      {isVerifyingCode ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform text-brand" />
                      )}
                      {isVerifyingCode ? "Verifying Credentials..." : (t('verify_btn') || "Verify & Access Dashboard")}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSmsSent(false);
                        setVerificationCode("");
                        setErrorMsg("");
                      }}
                      className="w-full py-3 bg-white text-slate-500 border border-slate-200 hover:border-slate-300 rounded-none transition-all uppercase tracking-widest text-[9px] font-black"
                    >
                      {t('back_to_phone_btn') || "Change Phone Number"}
                    </button>
                  </div>
                </form>
              )}
              
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed pt-2">
                <span>{t('onboarding_agreement_prefix')}<span className="text-slate-950 underline underline-offset-4 cursor-pointer">{t('onboarding_terms')}</span>{t('and')}<span className="text-slate-950 underline underline-offset-4 cursor-pointer">{t('onboarding_privacy')}</span>{t('onboarding_agreement_suffix')}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
