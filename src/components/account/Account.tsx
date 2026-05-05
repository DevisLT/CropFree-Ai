import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Smartphone, CheckCircle, ArrowRight, ShieldCheck, Zap, Clock, Info } from "lucide-react";
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
    // Simulate payment flow
    setTimeout(() => {
      alert("This would initiate a Stripe or Mobile Money payment request in production.");
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-8">
          <div className="premium-card p-10 text-center bg-white shadow-2xl shadow-slate-900/5 group border-none">
             <div className="w-24 h-24 bg-brand/10 text-brand rounded-[32px] flex items-center justify-center mx-auto mb-8 text-4xl font-black shadow-inner border border-brand/5 group-hover:scale-110 transition-transform">
                {profile?.fullName[0]}
             </div>
             <h3 className="text-2xl font-black text-slate-950 tracking-tighter">{profile?.fullName}</h3>
             <p className="text-sm font-medium text-slate-400 mt-2 mb-10">{profile?.email}</p>
             <div className="pt-8 border-t border-slate-50">
                <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${isTrialExpired ? 'bg-error text-white' : 'bg-brand/10 text-brand'}`}>
                   {profile?.subscriptionStatus === "trial" ? "Bio-Trial Phase" : "Neural Network Tier"}
                </span>
             </div>
          </div>

          <div className="premium-card p-10 bg-white border-none shadow-premium">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8">Node Settings</h4>
             <div className="space-y-4">
               <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest text-slate-950">
                  Language <span className="text-brand">English</span>
               </button>
               <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest text-slate-950">
                  Registry <span className="text-brand">Global</span>
               </button>
             </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="md:col-span-2">
           <div className="premium-card p-12 bg-slate-950 text-white relative overflow-hidden border-none shadow-2xl shadow-slate-950/20">
              <div className="absolute top-0 right-0 p-12 opacity-10 blur-[2px] rotate-12 scale-150">
                 <Zap className="w-64 h-64 text-brand" />
              </div>
              
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-4 block">Biological Advancement</span>
                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Tier-2 Upgrade.</h2>
                <p className="text-slate-400 mb-12 max-w-sm text-lg font-medium leading-relaxed">
                  "Unlock unrestricted diagnostic throughput, holographic crop timelines, and neural coaching protocols."
                </p>

                <div className="flex items-baseline gap-4 mb-14">
                   <span className="text-7xl font-black tracking-tighter text-white font-mono">$2.99</span>
                   <span className="text-white/30 font-black uppercase tracking-widest text-xs">/ Cycle</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-14">
                   <FeatureItem text="Unlimited Biological Probes" />
                   <FeatureItem text="Real-time Lifecycle Sync" />
                   <FeatureItem text="Direct Neural Coach Uplink" />
                   <FeatureItem text="Advanced Weather Synthesis" />
                </div>

                <div className="bg-white/5 rounded-[40px] p-10 border border-white/10 mb-12 backdrop-blur-md">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-8">Currency Protocol</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <button 
                         onClick={() => setPaymentMethod("card")}
                         className={`p-6 rounded-[28px] border-2 flex items-center gap-4 transition-all duration-500 ${
                           paymentMethod === 'card' ? 'border-brand bg-white text-slate-950 shadow-2xl' : 'border-white/5 hover:border-white/10 text-white/60'
                         }`}
                      >
                         <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-brand' : 'text-white/20'}`} />
                         <span className="font-black text-xs uppercase tracking-widest">Global Credit</span>
                      </button>
                      <button 
                         onClick={() => setPaymentMethod("momo")}
                         className={`p-6 rounded-[28px] border-2 flex items-center gap-4 transition-all duration-500 ${
                           paymentMethod === 'momo' ? 'border-brand bg-white text-slate-950 shadow-2xl' : 'border-white/5 hover:border-white/10 text-white/60'
                         }`}
                      >
                         <Smartphone className={`w-6 h-6 ${paymentMethod === 'momo' ? 'text-brand' : 'text-white/20'}`} />
                         <span className="font-black text-xs uppercase tracking-widest">Mobile Logic</span>
                      </button>
                   </div>
                </div>

                <button 
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="w-full py-6 bg-brand text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                >
                  {isProcessing ? "Protocol Syncing..." : "Initialize Upgrade"} 
                  {!isProcessing && <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />}
                </button>
                
                <div className="mt-10 flex items-center justify-center gap-10 opacity-30">
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                      <ShieldCheck className="w-5 h-5" /> SSL Secured
                   </div>
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                      <Clock className="w-5 h-5" /> Perpetual Access
                   </div>
                </div>
              </div>
           </div>
           
           {isTrialExpired && (
             <div className="mt-8 p-10 bg-rose-50 rounded-[40px] border border-rose-100 flex items-start gap-6">
                <Info className="w-8 h-8 text-rose-600 flex-shrink-0" />
                <p className="text-sm text-rose-900 font-bold leading-relaxed">
                  Your trial has expired. Access to key diagnosis and tracking features is currently restricted. Upgrade now to restore full access.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
         <CheckCircle className="w-3.5 h-3.5 text-success" />
      </div>
      <span className="text-sm font-medium text-neutral-700">{text}</span>
    </div>
  );
}
