import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Shield, Zap, CloudOff, ArrowRight, CheckCircle, Sparkles, Globe } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";

export default function Onboarding() {
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
    <div className="h-screen w-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#FCFAF7] grain">
      {/* Background blobs for depth */}
      <div className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[100px]" />

      <AnimatePresence mode="wait">
        {step < 3 ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-xl w-full glass p-16 text-center rounded-[60px] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500 opacity-20" />
            
            {step === 0 && (
              <div className="space-y-10">
                <div className="w-24 h-24 bg-neutral-900 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-500">
                  <Leaf className="text-emerald-400 w-12 h-12" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand mb-4 block">Agricultural Intelligence</span>
                  <h1 className="text-6xl font-black mb-6 tracking-tighter leading-none">CropFree.</h1>
                  <p className="text-neutral-500 text-xl font-medium leading-relaxed italic max-w-sm mx-auto">
                    "Bridging the gap between ancient wisdom and artificial intelligence."
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-2 block">Our Methodology</span>
                  <h2 className="text-4xl font-black tracking-tighter">How we heal.</h2>
                </div>
                <div className="space-y-6 text-left max-w-sm mx-auto">
                  {[
                    { text: "Snap a high-fidelity photo", sub: "Identify symptoms in 500ms" },
                    { text: "AI Diagnostic matching", sub: "Compared against 10M datasets" },
                    { text: "Dynamic treatment plans", sub: "Step-by-step restoration guides" },
                    { text: "Recovery monitoring", sub: "Watch your yield grow back" }
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-white/40 rounded-2xl border border-white hover:bg-white/80 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-black text-neutral-900 tracking-tight">{item.text}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{item.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mb-2 block">Standard of Excellence</span>
                  <h2 className="text-4xl font-black tracking-tighter">Trusted worldwide.</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-8 bg-white/60 backdrop-blur-md rounded-[32px] border border-white text-center shadow-lg hover:translate-y-[-4px] transition-transform">
                    <Sparkles className="w-10 h-10 text-brand mx-auto mb-4" />
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-800">Precision AI</span>
                  </div>
                  <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 text-center shadow-lg hover:translate-y-[-4px] transition-transform">
                    <Globe className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-800">Global Reach</span>
                  </div>
                  <div className="p-10 bg-neutral-900 rounded-[40px] text-center col-span-2 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h4 className="text-white text-xl font-black tracking-tight mb-2">Maximum Yield. Zero Loss.</h4>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest italic">The ultimate farming companion.</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={next}
              className="mt-12 w-full py-6 bg-neutral-900 text-white rounded-[28px] font-black shadow-2xl shadow-neutral-900/10 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group btn-press uppercase tracking-[0.2em] text-sm"
            >
              Continue Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>

            {/* Pagination dots */}
            <div className="mt-8 flex justify-center gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? "w-8 bg-brand" : "w-1.5 bg-neutral-200"}`} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full glass p-20 text-center rounded-[60px] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500 opacity-20" />
            <div className="w-20 h-20 bg-emerald-50 rounded-[30px] flex items-center justify-center mx-auto mb-10 shadow-inner">
               <Shield className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-5xl font-black mb-4 tracking-tighter">Your field, secured.</h2>
            <p className="text-neutral-500 text-lg font-medium mb-12 italic leading-relaxed">
              "Create your secure identity as a CropFree farmer and activate your complimentary <span className="text-brand font-black">60-day full-access trial</span>."
            </p>
            
            <button
              onClick={handleLogin}
              className="w-full py-5 bg-white border-2 border-neutral-100 rounded-[28px] font-black flex items-center justify-center gap-4 hover:border-brand transition-all mb-6 group btn-press shadow-xl"
            >
              <img src="https://www.google.com/favicon.ico" className="w-6 h-6 group-hover:scale-125 transition-transform" alt="Google" />
              Sign in with Google
            </button>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest max-w-xs mx-auto">
              By proceeding, you agree to our <span className="text-neutral-900 underline underline-offset-4 cursor-pointer">Protocol terms</span> & <span className="text-neutral-900 underline underline-offset-4 cursor-pointer">Privacy data handling</span>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
