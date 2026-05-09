import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Smartphone, CheckCircle, ArrowRight, ShieldCheck, Zap, Clock, Info, User, Terminal, Layout, Globe, ChevronRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { differenceInDays, parseISO } from "date-fns";

export default function Account() {
  const { profile } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const trialDaysLeft = profile ? differenceInDays(parseISO(profile.trialEndDate), new Date()) : 0;
  const isTrialExpired = trialDaysLeft <= 0 && profile?.subscriptionStatus === "trial";

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      alert("This would initiate a secure payment protocol in a production environment.");
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Profile Column */}
        <div className="lg:col-span-1 space-y-16">
          <div className="premium-card p-16 text-center rounded-[64px] border border-white bg-white/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-32 h-32 bg-brand/5 blur-[40px] pointer-events-none" />
             <div className="w-40 h-40 bg-deep-green text-white rounded-[56px] flex items-center justify-center mx-auto mb-12 text-6xl font-black shadow-2xl group-hover:scale-110 transition-transform duration-1000 border-4 border-white">
                {profile?.fullName[0]}
             </div>
             <h3 className="text-4xl font-black text-deep-green tracking-tighter">{profile?.fullName}</h3>
             <p className="text-sm font-bold text-slate-400 mt-4 mb-14 uppercase tracking-[0.4em]">{profile?.email}</p>
             
             <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-8">
                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-300 block">Biological Status</span>
                <div className={`px-12 py-4 rounded-full text-[12px] font-black uppercase tracking-[0.3em] shadow-xl border-2 ${isTrialExpired ? 'bg-rose-500 text-white border-rose-600' : 'bg-brand text-white border-brand-dark'}`}>
                   {profile?.subscriptionStatus === "trial" ? "Trial Node" : "Neural Master Node"}
                </div>
             </div>
          </div>

          <div className="premium-card p-12 md:p-16 rounded-[48px] bg-white/40 border border-white shadow-2xl backdrop-blur-3xl">
             <div className="flex items-center gap-6 mb-12">
                <Layout className="w-6 h-6 text-brand" />
                <h4 className="text-[12px] font-black uppercase tracking-[0.6em] text-deep-green">Interface Protocols</h4>
             </div>
             <div className="space-y-6">
               {[
                 { label: "Language", value: "English", icon: Globe },
                 { label: "Station Region", value: "Global-KE", icon: Globe }
               ].map((item, i) => (
                 <button key={i} className="w-full flex items-center justify-between p-8 bg-white/60 hover:bg-white rounded-[32px] transition-all duration-700 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-deep-green border border-slate-100 hover:border-brand shadow-sm group">
                    <div className="flex items-center gap-6">
                      <item.icon className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </div>
                    <span className="text-brand flex items-center gap-4">
                       {item.value} <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 translate-x-3 transition-all" />
                    </span>
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Subscription Column */}
        <div className="lg:col-span-2">
           <div className="premium-card p-16 md:p-32 bg-deep-green text-white relative overflow-hidden rounded-[80px] border border-white/5 shadow-2xl group">
              <div className="absolute top-0 right-0 w-[90%] h-full bg-brand/5 blur-[150px] pointer-events-none transition-all duration-[4s] group-hover:bg-brand/10" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-10">
                   <div className="h-[2px] w-16 bg-brand/30" />
                   <span className="text-[12px] font-black uppercase tracking-[0.7em] text-brand">Strategic Augmentation</span>
                </div>
                <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-black mb-12 tracking-tighter leading-none drop-shadow-xl uppercase">Supreme Tier.</h2>
                <p className="text-white/60 mb-20 max-w-2xl text-2xl md:text-3xl font-medium leading-relaxed">
                  "Unlock unrestricted diagnostic bandwidth, deep neural timeline synthesis, and direct biosensor experts routing."
                </p>

                <div className="flex items-baseline gap-8 mb-24">
                   <span className="text-8xl md:text-[10rem] lg:text-[12rem] font-black tracking-tighter text-white drop-shadow-2xl">$2.99</span>
                   <div className="flex flex-col">
                      <span className="text-slate-400 font-black uppercase tracking-[0.5em] text-sm md:text-lg">per binary cycle</span>
                      <span className="text-brand font-black text-xs uppercase tracking-[0.3em] mt-2 shadow-glow">Limited Access.</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 bg-white/5 p-16 rounded-[64px] border border-white/5 backdrop-blur-3xl shadow-inner">
                   <FeatureItem text="Unlimited diagnostic scans." />
                   <FeatureItem text="Real-time biological sync." />
                   <FeatureItem text="Direct expert uplink v9.4." />
                   <FeatureItem text="Atmospheric synthesis." />
                </div>

                <div className="space-y-12 mb-20">
                   <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white/30 block mb-6 px-4">CURRENCY GATEWAY STRATEGY</span>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <button 
                         onClick={() => setPaymentMethod("card")}
                         className={`p-12 rounded-[40px] border-4 flex items-center justify-center gap-8 transition-all duration-1000 relative overflow-hidden group ${
                           paymentMethod === 'card' ? 'border-brand bg-brand text-deep-green shadow-2xl' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'
                         }`}
                      >
                         <CreditCard className={`w-12 h-12 ${paymentMethod === 'card' ? 'text-deep-green' : 'text-white/10'}`} />
                         <span className="font-black text-sm uppercase tracking-[0.5em]">Global Credit</span>
                      </button>
                      <button 
                         onClick={() => setPaymentMethod("momo")}
                         className={`p-12 rounded-[40px] border-4 flex items-center justify-center gap-8 transition-all duration-1000 relative overflow-hidden group ${
                           paymentMethod === 'momo' ? 'border-brand bg-brand text-deep-green shadow-2xl' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'
                         }`}
                      >
                         <Smartphone className={`w-12 h-12 ${paymentMethod === 'momo' ? 'text-deep-green' : 'text-white/10'}`} />
                         <span className="font-black text-sm uppercase tracking-[0.5em]">Mobile Logic</span>
                      </button>
                   </div>
                </div>

                <button 
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="w-full py-12 bg-white text-deep-green rounded-full font-black text-sm md:text-xl uppercase tracking-[0.5em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-10 group relative overflow-hidden border-4 border-white hover:border-brand"
                >
                  <div className="absolute inset-0 bg-brand opacity-0 group-hover:opacity-10 transition-opacity" />
                  {isProcessing ? "Synchronizing Matrix Hub..." : "Initialize Transformation Sequence"} 
                  {!isProcessing && <ArrowRight className="w-10 h-10 group-hover:translate-x-6 transition-all duration-1000 group-hover:scale-125" />}
                </button>
                
                <div className="mt-20 flex items-center justify-center gap-24">
                   <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.6em] text-white/20">
                      <ShieldCheck className="w-8 h-8 text-brand/30" /> NODE SECURED
                   </div>
                   <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.6em] text-white/20">
                      <Clock className="w-8 h-8 text-brand/30" /> 24/7 TERMINAL
                   </div>
                </div>
              </div>
           </div>
           
           {isTrialExpired && (
             <motion.div 
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-16 p-16 bg-rose-500/5 rounded-[64px] border-4 border-rose-500/20 flex flex-col md:flex-row items-center md:items-start gap-12 shadow-2xl backdrop-blur-3xl"
             >
                <div className="w-28 h-28 bg-rose-500/10 rounded-[40px] flex items-center justify-center flex-shrink-0 border-4 border-rose-500/20 animate-pulse shadow-xl">
                  <Terminal className="w-14 h-14 text-rose-500" />
                </div>
                <div className="text-center md:text-left">
                   <h5 className="text-white font-black text-4xl lg:text-6xl tracking-tighter mb-6 uppercase leading-none">Neural Link Severed.</h5>
                   <p className="text-white/40 text-xl lg:text-2xl font-medium leading-relaxed max-w-4xl">
                     Your preliminary evaluation phase has concluded. Root-level access to diagnostic clusters and real-time biometric tracking is currently restricted within the matrix. Upgrade required for continued biological expansion.
                   </p>
                </div>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-8 group cursor-default">
      <div className="w-10 h-10 rounded-[18px] bg-brand/10 flex items-center justify-center border-2 border-brand/20 group-hover:bg-brand group-hover:scale-125 transition-all duration-700">
         <CheckCircle className="w-6 h-6 text-brand group-hover:text-deep-green transition-colors" />
      </div>
      <span className="text-xl md:text-2xl font-black text-white/40 group-hover:text-white transition-all duration-700 tracking-tight">{text}</span>
    </div>
  );
}
